"""Dispatch chat intents to the same operations used by the dashboard."""
import os
import re
import shlex

import httpx
from fastapi import HTTPException
from sqlalchemy import text as sql
from sqlalchemy.exc import SQLAlchemyError

from .. import config
from ..routers import docker_monitor, pipeline
from ..schemas import SimulationRequest
from . import agent_model, cloud_workspace, git_service, workspace_service
from .session_service import linked_credential

INTENTS = {
    "simulate": r"simulate\b|run (?:the )?pipeline\b",
    "status": r"git status\b|changed files\b|what files changed\b|inspect git changes\b",
    "explain": r"why did (?:the )?(?:build|pipeline) fail\b|explain(?: error)?\b|diagnose\b",
    "docker": r"docker(?: status)?\b|containers\b",
    "handoff": r"who is working\b|handoff\b|progress\b",
}
TABS = {"dashboard": "dashboard", "charts": "analytics", "pipelines": "pipelines",
        "analytics": "analytics", "runs": "history", "history": "history", "deployments": "deployments", "tests": "tests", "errors": "errors",
        "diagnostics": "errors", "projects": "projects", "workspaces": "workspaces"}
FAILURES = {"failure", "timed_out", "startup_failure", "action_required"}


def reply(message, action=None, **data):
    return {"message": message, "reply": message, "action_triggered": action, **data}


def commit(text, body, session, path, request):
    text = re.sub(r"^(?:/commit|commit and push)\s*", "", text, flags=re.I)
    message, separator, paths = text.partition(" -- ")
    files = body.files or (shlex.split(paths) if separator else [])
    if not files or not message.strip():
        return reply("Choose the exact files and a message, for example: /commit Update docs -- README.md")
    if len(files) > 200 or len(message) > 500:
        raise HTTPException(422, "Use at most 200 files and a commit message of up to 500 characters.")
    if config.CLOUD_MODE:
        result = cloud_workspace.commit(session, request.app.state.github, path, files, message.strip())
    else:
        credential = linked_credential(session)
        github = session.github
        if not (credential and github.get("verified") and github.get("can_push")):
            raise HTTPException(403, "Reconnect GitHub with a token that can push to the collaborative repository.")
        result = git_service.commit_push(path, files, message.strip(), github_auth=(github["username"], credential),
                                         github_project=github["project"])
    message = f"Commit {result['commit_sha']} pushed." if result["pushed"] else (
        f"Commit {result['commit_sha']} saved locally. Push failed: {result['push_error']}")
    return reply(message, "COMMIT_PUSH", **{key: value for key, value in result.items() if key != "message"})


def docker_status(request):
    status = docker_monitor.inspect_containers()
    status["source"] = "docker" if status["available"] else "unavailable"
    if status["available"] or not os.getenv("DEVPULSE_COMPOSE"):
        return status
    # Compose has no daemon socket by default. Probe the services themselves.
    try:
        frontend = httpx.get("http://frontend/api/health", timeout=1).is_success
    except httpx.HTTPError:
        frontend = False
    try:
        with request.app.state.engine.connect() as connection:
            connection.execute(sql("SELECT 1"))
        database = request.app.state.engine.dialect.name == "postgresql"
    except SQLAlchemyError:
        database = False
    reachable = {"devpulse-frontend": frontend, "devpulse-backend": True, "devpulse-db": database}
    return {**status, "source": "service_probe", "containers": [
        {**item, "status": "reachable" if reachable[item["name"]] else "unreachable"}
        for item in status["containers"]
    ]}


def execute(body, session, request, db):
    text = body.message.strip()
    current = session.workspace or {}
    project = body.project or current.get("project")
    path = body.workspace_path or current.get("path")
    if re.match(r"^(?:/commit|commit and push)(?:\s|$)", text, re.I):
        if not path:
            raise HTTPException(409, "Open a local workspace before committing.")
        if not config.CLOUD_MODE and not cloud_workspace.local_request(request):
            raise HTTPException(403, "Use cloud mode for hosted Git requests.")
        return commit(text, body, session, path, request)
    connect = re.fullmatch(r"connect repo\s+(\S+)", text, re.I)
    if connect:
        if config.CLOUD_MODE:
            workspace = cloud_workspace.clone(session, request.app.state.github, connect[1])
        elif cloud_workspace.local_request(request):
            workspace = workspace_service.clone_workspace(connect[1], "main", session.profile["role"])
        else:
            raise HTTPException(403, "Use cloud mode for hosted Git requests.")
        return reply(f"Connected {workspace['name']}.", "SWITCH_TAB", target_view="workspaces",
                     workspace=workspace_service.activate(session, workspace))
    nav = re.fullmatch(r"(?:go to|open|switch to)\s+(?:the\s+)?([a-z]+)", text, re.I)
    if nav and nav[1].lower() in TABS:
        target = TABS[nav[1].lower()]
        return reply(f"Opening {nav[1].lower()}.", "SWITCH_TAB", target_view=target)
    normalized = re.sub(r"^(?:please\s+|can you\s+)", "", text.lower())
    action = next((name for name, pattern in INTENTS.items()
                   if normalized == f"/{name}" or re.match(pattern, normalized)), None)
    engine = "deterministic"
    if not action:
        action, engine = agent_model.select_tool(text, body.history)

    if action == "simulate":
        project = pipeline.resolve_project(request, project, session)
        run = pipeline.start_simulation(SimulationRequest(project=project), db, project, session)
        return reply("Started live pipeline run! Tracking 0% -> 100% and will pre-notify QA/CD at 80%.",
                     "SIMULATE_PIPELINE", run=run)
    if action == "status":
        if not path:
            return reply("This workspace is remote-only. Open or clone a local repository to inspect Git changes.")
        if config.CLOUD_MODE:
            workspace = cloud_workspace.describe(path, session)
            status = {**git_service.status(workspace["path"], sandbox=cloud_workspace.sandbox(session)),
                      "path": workspace["path"]}
        elif cloud_workspace.local_request(request):
            status = git_service.status(path)
        else:
            raise HTTPException(403, "Use cloud mode for hosted Git requests.")
        lines = [f"{item['status']} {item['path']}" for item in status["files"]]
        return reply("\n".join(lines) or "The working tree is clean.", "GIT_STATUS", git=status, engine=engine)
    if action == "explain":
        project = pipeline.resolve_project(request, project, session)
        latest = next((run for run in pipeline.history(request, db, project, session)
                       if run["conclusion"] in FAILURES and run["source"] != "commit_estimate"), None)
        if not latest:
            return reply("No failed pipeline run was found.", "NAVIGATE_DIAGNOSTICS", target_view="errors")
        diagnosis = pipeline.error_summary(latest["id"], request, project, db, session)
        return reply(f"Failed stage: {diagnosis['failed_stage']}\nCause: {diagnosis['plain_english_reason']}\n"
                     f"Suggested fix: {diagnosis['suggested_fix']}",
                     "NAVIGATE_DIAGNOSTICS", target_view="errors", run_id=latest["id"], diagnosis=diagnosis,
                     engine=engine)
    if action == "docker":
        status = docker_status(request)
        lines = [f"{item['name']}: {item['status']}" for item in status["containers"]]
        return reply("\n".join(lines), "DOCKER_STATUS", docker=status, engine=engine)
    if action == "handoff":
        run = pipeline.live(request, project, db, session)
        team = next(stage["team"] for stage in run["stages"] if stage["name"] == run["current_stage"])
        alert = run["handoff_alert"]
        note = alert["message"] if alert else "No handoff alert is active."
        return reply(f"{run['progress']}% · {run['current_stage']} · {team}. {note}",
                     "HANDOFF_STATUS", run=run, active_team=team, engine=engine)
    return reply("Try /simulate, /status, /explain, /docker, /handoff, go to deployments, or /commit <message> -- <files>.")
