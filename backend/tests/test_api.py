import hashlib
import hmac
import json
from datetime import timedelta
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.config import DEFAULT_PROJECT
from app.main import create_app
from app.models import utc_now
from app.routers import deployments, pipeline
from app.services.github_service import PUBLIC_OWNER_LABEL, GitHubService, normalize_run


class StubGitHub:
    def repositories(self):
        return [
            {"full_name": DEFAULT_PROJECT, "name": "cdd_minorproj", "default_branch": "main",
             "html_url": f"https://github.com/{DEFAULT_PROJECT}"},
            {"full_name": "Shwetankjais/DevOps_Lab", "name": "DevOps_Lab", "default_branch": "main",
             "html_url": "https://github.com/Shwetankjais/DevOps_Lab"},
        ]

    def commit_estimates(self, project):
        return []

    def runs(self, project):
        if project == DEFAULT_PROJECT:
            return []
        return [normalize_run({
            "id": 22, "status": "in_progress", "created_at": "2025-01-02T12:00:00Z",
            "head_branch": "feature/git", "display_title": "Build release",
        }, project)]

    def jobs(self, project, run_id, attempt):
        return [{"name": "build", "steps": [
            {"name": "Checkout", "conclusion": "success"},
            *[{"name": "Compile", "conclusion": "success"} for _ in range(4)],
            {"name": "Bundle"},
        ]}]


@pytest.fixture
def client(tmp_path):
    app = create_app(f"sqlite:///{tmp_path / 'test.db'}", github=StubGitHub())
    with TestClient(app) as client:
        yield client


def test_health_projects_and_seeded_history(client):
    assert client.get("/api/health").json() == {"status": "ok", "database": "sqlite"}
    project = client.get("/api/projects").json()[0]
    assert project["id"] == DEFAULT_PROJECT
    assert project["displayName"] == "cdd_minorproj"
    assert project["isCurrent"]
    assert project["lastAuthor"] == PUBLIC_OWNER_LABEL
    assert {item["name"] for item in client.get("/api/projects").json()} == {"cdd_minorproj", "DevOps_Lab"}
    summary = client.get("/api/pipeline/summary").json()
    assert summary["total_runs"] == 10
    runs = client.get("/api/pipeline/runs", params={"status": "failure", "search": "login"}).json()
    assert len(runs) == 1
    assert runs[0]["source"] == "seed"
    assert "log" not in runs[0]
    explanation = client.get(f"/api/pipeline/error-summary/{runs[0]['id']}").json()
    assert explanation["failed_stage"] == "Test"
    assert "401" in explanation["plain_english_reason"]


def test_live_history_replaces_demo_rows(client, monkeypatch):
    github = client.app.state.github
    external = github.runs("test/demo")[0]
    monkeypatch.setattr(github, "runs", lambda project: [{**external, "project": project}])
    runs = client.get("/api/pipeline/runs").json()
    assert len(runs) == 1
    assert {run["source"] for run in runs} == {"github"}


def test_live_github_progress_and_project_validation(client):
    result = client.get("/api/pipeline/live", params={"project": "test/demo"}).json()
    assert result["progress"] == 45
    assert result["handoff_alert"]["to_team"] == "QA Testing Team"
    assert client.get("/api/pipeline/runs", params={"project": "../private"}).status_code == 422


def test_simulation_walks_through_handoffs(client, monkeypatch):
    start = utc_now()
    monkeypatch.setattr(pipeline, "utc_now", lambda: start)
    response = client.post("/api/pipeline/simulate", json={"interval_seconds": 1})
    assert response.status_code == 201
    assert response.json()["progress"] == 0
    for seconds, percent, team in [(2, 20, "CI Team"), (5, 45, "QA Testing Team"),
                                   (8, 75, "CD Release Team"), (11, 100, None)]:
        monkeypatch.setattr(pipeline, "utc_now", lambda: start + timedelta(seconds=seconds))
        live = client.get("/api/pipeline/live").json()
        assert live["id"] == response.json()["id"]
        assert live["progress"] == percent
        alert = live["handoff_alert"]
        assert (alert["to_team"] if alert else None) == team
    assert live["conclusion"] == "success"


def test_deployment_filters_and_signed_webhook(client, monkeypatch):
    def count(hours):
        return len(client.get("/api/deployments", params={"hours": hours}).json())

    assert 0 < count(1) < count(2) < count(24) < count("all")
    assert client.get("/api/deployments?hours=invalid").status_code == 422

    monkeypatch.setattr(deployments, "WEBHOOK_SECRET", "test-secret")
    body = json.dumps({
        "repository": {"full_name": DEFAULT_PROJECT}, "run_id": "42", "run_attempt": "1",
        "sha": "0123456789abcdef",
    }).encode()
    headers = {"X-GitHub-Event": "devpulse_verification"}
    assert client.post("/api/webhooks/github", content=body, headers=headers).status_code == 401
    digest = hmac.new(b"test-secret", body, hashlib.sha256).hexdigest()
    headers["X-Hub-Signature-256"] = f"sha256={digest}"
    original = count("all")
    for _ in range(2):
        assert client.post("/api/webhooks/github", content=body, headers=headers).status_code == 200
    assert count("all") == original + 1


def test_seed_is_idempotent(tmp_path):
    database = f"sqlite:///{tmp_path / 'test.db'}"
    app = create_app(database, github=StubGitHub())
    with TestClient(app) as client:
        before = client.get("/api/pipeline/runs").json()
    with TestClient(app) as client:
        assert client.get("/api/pipeline/runs").json() == before


def test_git_writes_require_configuration(client, monkeypatch):
    from app.routers import git_control

    monkeypatch.setattr(git_control, "GIT_WRITE_TOKEN", None)
    body = {"files": ["app.py"], "message": "Update app"}
    assert client.post("/api/git/commit-push", json=body).status_code == 503
    monkeypatch.setattr(git_control, "GIT_WRITE_TOKEN", "test-token")
    assert client.post("/api/git/commit-push", json=body).status_code == 401


def test_docker_fallback(client, monkeypatch):
    from app.routers import docker_monitor

    def unavailable(*args, **kwargs):
        raise FileNotFoundError

    monkeypatch.setattr(docker_monitor.subprocess, "run", unavailable)
    data = client.get("/api/docker/status?format=detail").json()
    assert data["available"] is False
    assert len(data["containers"]) == 3
    assert {item["status"] for item in data["containers"]} == {"unavailable"}
    cards = client.get("/api/docker/status").json()
    assert len(cards) == 3
    assert all(card["id"] == card["name"] and card["ports"] == "—" for card in cards)


def test_demo_git_token_accepts_only_local_browser_origin(client, monkeypatch):
    from app.routers import git_control

    monkeypatch.setattr(git_control, "GIT_WRITE_TOKEN", git_control.VIVA_GIT_WRITE_TOKEN)
    monkeypatch.setattr(git_control.git_service, "commit_push", lambda *args: {"pushed": True})
    headers = {"Authorization": f"Bearer {git_control.VIVA_GIT_WRITE_TOKEN}"}
    body = {"files": ["README.md"], "message": "Update docs"}
    for endpoint, payload in (("/commit-push", body), ("/open-or-clone", {"repo_url": "https://github.com/example/repo"})):
        assert client.post(f"/api/git{endpoint}", json=payload, headers={
            **headers, "Origin": "https://example.com",
        }).status_code == 403
    assert client.post("/api/git/commit-push", json=body, headers={
        **headers, "Origin": "http://localhost:5173",
    }).json() == {"pushed": True}


@pytest.fixture
def collaboration(client, monkeypatch, tmp_path):
    from app.services import git_service, session_service

    repo = tmp_path / "project"
    repo.mkdir()
    workspace = tmp_path / "workspace"
    workspace.mkdir()
    git_service.run_git(repo, "init", "-b", "main")
    monkeypatch.setattr(git_service, "PROJECT_ROOT", repo)
    monkeypatch.setattr(git_service, "WORKSPACE", workspace)

    def github(username, token):
        return {"username": username, "connected": True, "verified": bool(token),
                "can_push": bool(token), "project": DEFAULT_PROJECT, "actions_ready": True}

    monkeypatch.setattr(session_service, "github_connection", github)
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    return client, workspace


def login_as(client, name="Asha", role="QA Testing Team"):
    response = client.post("/api/auth/login", json={
        "email": f"{name.lower()}@example.com", "name": name, "role": role,
        "github_username": "asha",
    })
    assert response.status_code == 200
    result = response.json()
    return {"Authorization": f"Bearer {result['session_token']}"}, result


def test_auth_session_connect_and_logout(collaboration):
    client, _ = collaboration
    assert client.get("/api/auth/session").status_code == 401
    headers, login = login_as(client)
    assert login["role"] == "QA Testing Team"
    assert login["services"]["postgresql.service"] == "SQLITE"
    assert login["services"]["github-actions.service"] == "OK"
    assert login["active_workspace"]["name"] == "cdd_minor"
    assert not login["github"]["verified"]
    linked = client.post("/api/auth/connect-github", headers=headers, json={
        "github_username": "asha", "github_token": "private-test-value",
    })
    assert linked.status_code == 200 and linked.json()["github"]["verified"]
    assert "private-test-value" not in linked.text
    assert client.get("/api/auth/session", headers=headers).json()["user"]["name"] == "Asha"
    assert client.post("/api/auth/logout", headers=headers).json()["logged_out"]
    assert client.get("/api/auth/session", headers=headers).status_code == 401


def test_workspaces_open_clone_and_isolate_recent_state(collaboration, monkeypatch):
    from app.services import git_service

    client, workspace = collaboration
    headers, _ = login_as(client)
    teammate, _ = login_as(client, "Sam", "CI Team")
    assert client.get("/api/workspaces").status_code == 401
    listed = client.get("/api/workspaces", headers=headers).json()["workspaces"]
    assert {item["name"] for item in listed} >= {"cdd_minor", "DevOps_Lab"}
    assert not {"devops-lab", "shop-api", "campus-portal"} & {item["name"] for item in listed}
    assert client.post("/api/workspaces/open", headers=headers, json={"path": "/etc"}).status_code == 400
    folder = workspace / "sandbox"
    folder.mkdir()
    opened = client.post("/api/workspaces/open", headers=headers, json={"path": str(folder), "name": "Sandbox"})
    assert opened.status_code == 200 and opened.json()["branch"] == "main"
    assert client.get("/api/auth/session", headers=teammate).json()["active_workspace"]["name"] == "cdd_minor"

    def clone(path, url, branch):
        target = workspace / "example"
        target.mkdir()
        git_service.run_git(target, "init", "-b", branch)
        git_service.run_git(target, "remote", "add", "origin", url)
        return target

    monkeypatch.setattr(git_service, "open_or_clone", clone)
    response = client.post("/api/workspaces/clone", headers=headers, json={
        "repo_url": "https://github.com/team/example.git", "branch": "qa", "team_role": "CI Team",
    })
    assert response.status_code == 200
    assert response.json()["branch"] == "qa" and response.json()["team_role"] == "CI Team"
    recent = client.get("/api/workspaces", headers=headers).json()["recent_workspaces"]
    assert [item["name"] for item in recent] == ["example", "Sandbox"]


def test_agent_executes_actions_and_requires_explicit_authenticated_commit(collaboration, monkeypatch):
    from app.services import git_service

    client, _ = collaboration
    headers, _ = login_as(client)

    def chat(message):
        return client.post("/api/agent/chat", headers=headers, json={"message": message})

    assert client.post("/api/agent/chat", json={"message": "/status"}).status_code == 401
    assert chat("/status").json()["git"]["files"] == []
    simulation = chat("/simulate").json()
    assert simulation["action_triggered"] == "SIMULATE_PIPELINE"
    assert client.get("/api/pipeline/live").json()["id"] == simulation["run"]["id"]
    assert chat("who is working").json()["active_team"] == "Dev"
    assert chat("/explain").json()["diagnosis"]["failed_stage"] == "Test"
    assert len(chat("/docker").json()["docker"]["containers"]) == 3
    assert chat("go to deployments").json()["target_view"] == "deployments"
    assert chat("/commit Docs").json()["action_triggered"] is None
    assert chat("/commit Docs -- README.md").status_code == 403

    client.post("/api/auth/connect-github", headers=headers, json={
        "github_username": "asha", "github_token": "private-test-value",
    })

    def push(path, files, message, *, github_auth, github_project):
        assert files == ["README.md"] and message == "Docs"
        assert github_auth == ("asha", "private-test-value") and github_project == DEFAULT_PROJECT
        return {"commit_sha": "abc123", "pushed": True, "files": files}

    monkeypatch.setattr(git_service, "commit_push", push)
    result = chat("/commit Docs -- README.md").json()
    assert result["commit_sha"] == "abc123" and result["pushed"]
    assert "private-test-value" not in str(result)


def test_agent_accepts_allowlisted_model_tool_and_falls_back(collaboration, monkeypatch):
    import httpx
    from app.services import agent_model

    client, _ = collaboration
    headers, _ = login_as(client)
    monkeypatch.setenv("OPENAI_API_KEY", "test-key")

    def provider(url, **kwargs):
        assert url == "https://api.openai.com/v1/responses"
        return httpx.Response(200, request=httpx.Request("POST", url), json={"output": [{
            "type": "function_call", "name": "inspect_devpulse", "arguments": '{"action":"status"}',
        }]})

    monkeypatch.setattr(agent_model.httpx, "post", provider)
    result = client.post("/api/agent/chat", headers=headers, json={"message": "Review the working tree"}).json()
    assert result["action_triggered"] == "GIT_STATUS" and result["engine"] == "openai"


def test_github_connection_checks_token_owner_and_repository(monkeypatch):
    import httpx
    from app.services import session_service

    real_client = httpx.Client
    requests = []

    def respond(request):
        requests.append(request.url.path)
        assert request.headers["Authorization"] == "Bearer fixture-token"
        if request.url.path == "/user":
            return httpx.Response(200, json={"login": "asha"})
        if request.url.path.endswith("/actions/runs"):
            return httpx.Response(200, json={"workflow_runs": []})
        return httpx.Response(200, json={"permissions": {"push": True}})

    monkeypatch.setattr(session_service.httpx, "Client", lambda **kwargs: real_client(
        transport=httpx.MockTransport(respond), **kwargs))
    result = session_service.github_connection("Asha", "fixture-token")
    assert result["verified"] and result["can_push"] and result["actions_ready"]
    assert requests == ["/user", f"/repos/{DEFAULT_PROJECT}", f"/repos/{DEFAULT_PROJECT}/actions/runs"]
    from fastapi import HTTPException
    with pytest.raises(HTTPException) as exc:
        session_service.github_connection("different-user", "fixture-token")
    assert exc.value.status_code == 422


def test_remote_workspace_fallback_and_agent_navigation(collaboration, monkeypatch):
    import httpx
    from app.services import git_service, workspace_service

    client, _ = collaboration
    headers, _ = login_as(client)

    def fail_clone(*args, **kwargs):
        raise git_service.GitError("Clone unavailable")

    def public_repo(url, **kwargs):
        assert url == "https://api.github.com/repos/team/example"
        return httpx.Response(200, request=httpx.Request("GET", url))

    monkeypatch.setattr(git_service, "open_or_clone", fail_clone)
    monkeypatch.setattr(workspace_service.httpx, "get", public_repo)
    result = client.post("/api/agent/chat", headers=headers, json={
        "message": "connect repo https://github.com/team/example",
    }).json()
    assert result["target_view"] == "workspaces"
    assert result["workspace"]["kind"] == "remote"
    assert client.get("/api/auth/session", headers=headers).json()["active_workspace"]["project"] == "team/example"


def test_browser_contract_uses_same_origin_cookie(collaboration):
    client, _ = collaboration
    body = {"email": "browser@example.test", "name": "Browser User", "role": "CI Build Team",
            "githubRepo": DEFAULT_PROJECT}
    same_origin = {"Origin": "http://testserver", "Sec-Fetch-Site": "same-origin"}
    cross_origin = {"Origin": "http://elsewhere.test", "Sec-Fetch-Site": "cross-site"}
    assert client.post("/api/auth/login", json=body, headers=cross_origin).status_code == 403
    login = client.post("/api/auth/login", json=body, headers=same_origin)
    assert login.status_code == 200 and login.json()["user"]["role"] == "CI Team"
    assert "HttpOnly" in login.headers["set-cookie"] and "SameSite=strict" in login.headers["set-cookie"]
    assert "session_token" not in login.json()
    assert isinstance(client.get("/api/workspaces").json(), list)
    opened = client.post("/api/workspaces/open", json={"path": "~/Desktop/cdd_minor"}, headers=same_origin)
    assert opened.status_code == 200 and opened.json()["name"] == "cdd_minor"
    assert client.post("/api/agent/chat", json={"prompt": "/simulate"}, headers=cross_origin).status_code == 403
    chat = client.post("/api/agent/chat", json={"prompt": "/simulate"}, headers=same_origin).json()
    assert chat["response"] == chat["message"]
    assert chat["action_triggered"] == "SIMULATE_PIPELINE"
    assert chat["action"] == {"type": "NAVIGATE", "tab": "overview"}
    assert client.get("/api/pipeline/live").json()["id"] == chat["run"]["id"]
    assert client.post("/api/auth/logout", headers=same_origin).json()["logged_out"]
    assert client.get("/api/auth/session").status_code == 401


def test_github_catalog_paginates_and_keeps_only_public_owner_repositories():
    import httpx

    def repo(name, owner="Shwetankjais", private=False):
        return {"full_name": f"{owner}/{name}", "private": private, "name": name}

    def respond(request):
        assert request.url.path == "/users/Shwetankjais/repos"
        assert request.url.params["sort"] == "updated"
        assert request.url.params["per_page"] == "20"
        if request.url.params.get("page") == "2":
            return httpx.Response(200, json=[repo("more"), repo("hidden", private=True), repo("other", "another")])
        return httpx.Response(200, json=[repo(f"repo-{i}") for i in range(20)])

    github = GitHubService()
    github.client.close()
    with httpx.Client(base_url="https://api.github.com", transport=httpx.MockTransport(respond)) as client:
        github.client = client
        names = {item["name"] for item in github.repositories()}
    assert len(names) == 21 and "more" in names


def test_pipeline_uses_recent_commits_for_repo_without_workflow_runs(client, monkeypatch):
    import httpx

    sha = "1234567890abcdef1234567890abcdef12345678"
    project = "Shwetankjais/DevOps_Lab"

    def respond(request):
        path = request.url.path
        if path.endswith("/actions/runs"):
            return httpx.Response(200, json={"workflow_runs": []})
        if path.endswith("/commits"):
            return httpx.Response(200, json=[{
                "sha": sha, "html_url": f"https://github.com/{project}/commit/{sha}",
                "commit": {"message": "Add lab exercise", "author": {"name": "Shwetank Jaiswal"},
                           "committer": {"date": "2026-11-09T05:00:00Z"}},
            }])
        assert path == f"/repos/{project}"
        return httpx.Response(200, json={"full_name": project, "default_branch": "lab", "private": False})

    github = GitHubService()
    github.client.close()
    with httpx.Client(base_url="https://api.github.com", transport=httpx.MockTransport(respond)) as http:
        github.client = http
        monkeypatch.setattr(client.app.state, "github", github)
        rows = client.get("/api/pipeline/runs", params={"project": project}).json()
        assert rows[0]["commit_sha"] == sha
        assert rows[0]["branch"] == "lab" and rows[0]["title"] == "Estimated · Add lab exercise"
        assert rows[0]["source"] == "commit_estimate" and rows[0]["estimated"]
        assert client.get("/api/pipeline/summary", params={"project": project}).json()["estimated"]
        assert client.get(f"/api/pipeline/error-summary/{sha}", params={"project": project}).status_code == 409


def test_authenticated_folder_browse_and_open_by_name(collaboration, monkeypatch, tmp_path):
    from app.services import git_service, workspace_service

    client, _ = collaboration
    home = tmp_path / "host"
    for root in ("Desktop", "Documents", "Downloads"):
        (home / root).mkdir(parents=True)
    repo = home / "Desktop" / "DevOps_Lab"
    repo.mkdir()
    git_service.run_git(repo, "init", "-b", "main")
    (home / "Desktop" / "unlisted.txt").touch()
    (home / "Desktop" / "escape").symlink_to(tmp_path)
    monkeypatch.setattr(workspace_service, "HOST_HOME", home)
    assert client.get("/api/workspaces/browse").status_code == 401
    headers, _ = login_as(client)
    folders = client.get("/api/workspaces/browse", headers=headers, params={"dir": "~/Desktop"}).json()["folders"]
    assert [item["name"] for item in folders] == ["DevOps_Lab"]
    assert client.get("/api/workspaces/browse", headers=headers, params={"dir": "Desktop/escape"}).status_code == 400
    response = client.post("/api/workspaces/open", headers=headers, json={"folder_name": "DevOps_Lab"})
    assert response.status_code == 200 and response.json()["path"] == str(repo)
    assert response.json()["branch"] == "main"
    (home / "Documents" / "DevOps_Lab").mkdir()
    assert client.post("/api/workspaces/open", headers=headers, json={"folder_name": "DevOps_Lab"}).status_code == 409
    chosen = client.post("/api/workspaces/open", headers=headers, json={
        "folder_name": "DevOps_Lab", "dir": "Documents",
    }).json()
    assert chosen["kind"] == "folder" and not (Path(chosen["path"]) / ".git").exists()


def test_browser_picker_resolves_legacy_desktop_prefix_across_roots(collaboration, monkeypatch, tmp_path):
    from app.services import workspace_service

    client, _ = collaboration
    home = tmp_path / "host"
    folder = home / "Downloads" / "PickedRepo"
    folder.mkdir(parents=True)
    monkeypatch.setattr(workspace_service, "HOST_HOME", home)
    login = client.post("/api/auth/login", json={"email": "picker@example.test", "name": "Picker",
                                                 "githubRepo": DEFAULT_PROJECT})
    assert login.status_code == 200
    roots = client.get("/api/workspaces/browse").json()
    assert any(root["folder"] == "Downloads" for root in roots)
    opened = client.post("/api/workspaces/open", json={"path": "~/Desktop/PickedRepo"})
    assert opened.status_code == 200 and opened.json()["path"] == str(folder)
