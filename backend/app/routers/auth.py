import os

import httpx
from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy import text
from sqlalchemy.orm import Session

from .. import config
from ..database import get_db
from ..models.user_session import UserSession
from ..schemas.collaboration import GitHubConnection, Login
from ..services import git_service, session_service, workspace_service
from ..services.cloud_workspace import local_request

router = APIRouter(prefix="/api/auth", tags=["auth"])


def readiness(db, github):
    db.execute(text("SELECT 1"))
    try:
        if not config.CLOUD_MODE:
            git_service.repo_path()
        git_status = "OK"
    except (git_service.GitError, OSError):
        git_status = "UNAVAILABLE"
    compose_status = "UNAVAILABLE"
    if os.getenv("DEVPULSE_COMPOSE"):
        try:
            response = httpx.get("http://frontend/api/health", timeout=1)
            if response.is_success:
                compose_status = "OK"
        except httpx.HTTPError:
            pass
    return {"git-flow.service": git_status,
            "github-actions.service": "OK" if github.get("actions_ready") else "UNAVAILABLE",
            "fastapi.service": "OK",
            "postgresql.service": "OK" if db.get_bind().dialect.name == "postgresql" else "SQLITE",
            "docker-compose.service": compose_status}


@router.post("/login")
def login(body: Login, request: Request, response: Response, db: Session = Depends(get_db)):
    if body.browser_repo and not config.CLOUD_MODE:
        session_service.check_browser_origin(request)
    token = body.github_token.get_secret_value() if body.github_token else None
    github = session_service.github_connection(body.github_username, token)
    profile = {"email": body.email, "name": body.name, "role": body.role}
    local_demo = not config.CLOUD_MODE and not github.get("username") and local_request(request)
    session_token, session = session_service.new_session(
        db, profile, github, workspace_service.default_workspace(body.role) if local_demo else None)
    services = readiness(db, github)
    session_service.remember_credential(session, token if github["verified"] else None)
    payload = {**session_service.session_payload(session), "services": services}
    if body.browser_repo and not config.CLOUD_MODE:
        response.set_cookie(session_service.BROWSER_COOKIE, session_token, max_age=12 * 3600,
                            path="/api", httponly=True, samesite="strict",
                            secure=request.url.scheme == "https")
        payload["user"] = {**profile, "githubConnected": github["connected"],
                           "githubRepo": github.get("project") or body.browser_repo}
        return payload
    return {"session_token": session_token, "token_type": "bearer", **payload}


@router.get("/session")
def session_info(session: UserSession = Depends(session_service.require_session)):
    return session_service.session_payload(session)


@router.post("/connect-github")
def connect(body: GitHubConnection, session: UserSession = Depends(session_service.require_session)):
    token = body.github_token.get_secret_value() if body.github_token else None
    previous = session.github.get("username")
    session.github = session_service.github_connection(body.github_username, token)
    if config.CLOUD_MODE and (previous or "").casefold() != (session.github.get("username") or "").casefold():
        session.workspace = None
        session.recent_workspaces = []
    session_service.remember_credential(session, token if session.github["verified"] else None)
    return session_service.session_payload(session)


@router.post("/logout")
def logout(response: Response, session: UserSession = Depends(session_service.require_session),
           db: Session = Depends(get_db)):
    session_service.remember_credential(session)
    db.delete(session)
    response.delete_cookie(session_service.BROWSER_COOKIE, path="/api")
    return {"logged_out": True}
