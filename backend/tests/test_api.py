import hashlib
import hmac
import json
from datetime import timedelta

import pytest
from fastapi.testclient import TestClient

from app.config import DEFAULT_PROJECT
from app.main import create_app
from app.models import utc_now
from app.routers import deployments, pipeline
from app.services.github_service import normalize_run


class StubGitHub:
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
    assert client.get("/api/projects").json()[0]["id"] == DEFAULT_PROJECT
    summary = client.get("/api/pipeline/summary").json()
    assert summary["total_runs"] == 10
    runs = client.get("/api/pipeline/runs", params={"status": "failure", "search": "login"}).json()
    assert len(runs) == 1
    assert runs[0]["source"] == "seed"
    assert "log" not in runs[0]
    explanation = client.get(f"/api/pipeline/error-summary/{runs[0]['id']}").json()
    assert explanation["failed_stage"] == "Test"
    assert "401" in explanation["plain_english_reason"]


def test_merge_live_run_with_demo_history(client, monkeypatch):
    github = client.app.state.github
    external = github.runs("test/demo")[0]
    monkeypatch.setattr(github, "runs", lambda project: [{**external, "project": project}])
    runs = client.get("/api/pipeline/runs").json()
    assert len(runs) == 11
    assert {run["source"] for run in runs} == {"seed", "github"}


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
    data = client.get("/api/docker/status").json()
    assert data["available"] is False
    assert len(data["containers"]) == 3
    assert {item["status"] for item in data["containers"]} == {"unavailable"}
