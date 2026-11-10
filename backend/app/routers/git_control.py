import hmac

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy.orm import Session

from .. import config
from ..config import GIT_WRITE_TOKEN, VIVA_GIT_WRITE_TOKEN
from ..database import get_db
from ..schemas import CommitRequest, OpenRepository
from ..services import cloud_workspace, git_service, workspace_service
from ..services.session_service import require_session

router = APIRouter(prefix="/api/git")


def authorize_write(authorization: str = Header(default=""), origin: str | None = Header(default=None)):
    if not GIT_WRITE_TOKEN:
        raise HTTPException(503, "Set GIT_WRITE_TOKEN to enable repository writes.")
    if GIT_WRITE_TOKEN == VIVA_GIT_WRITE_TOKEN and origin not in {
        None, "http://localhost:5173", "http://127.0.0.1:5173",
    }:
        raise HTTPException(403, "The demo Git token is restricted to the local dashboard.")
    if not hmac.compare_digest(authorization.encode(), f"Bearer {GIT_WRITE_TOKEN}".encode()):
        raise HTTPException(401, "A valid Git write token is required.")


def local_only(request):
    if not cloud_workspace.local_request(request):
        raise HTTPException(403, "Use cloud mode for hosted Git requests.")


@router.get("/status")
def status(request: Request, path: str | None = None, authorization: str = Header(default=""),
           db: Session = Depends(get_db)):
    try:
        if config.CLOUD_MODE:
            session = require_session(request, authorization, db)
            workspace = cloud_workspace.describe(path or (session.workspace or {}).get("path"), session)
            return {**git_service.status(workspace["path"], sandbox=cloud_workspace.sandbox(session)),
                    "path": workspace["path"]}
        local_only(request)
        return git_service.status(path)
    except (git_service.GitError, OSError, ValueError) as exc:
        raise HTTPException(400, str(exc)) from exc


@router.post("/open-or-clone")
def open_or_clone(body: OpenRepository, request: Request, authorization: str = Header(default=""),
                  origin: str | None = Header(default=None), db: Session = Depends(get_db)):
    try:
        if config.CLOUD_MODE:
            session = require_session(request, authorization, db)
            if bool(body.path) == bool(body.repo_url):
                raise HTTPException(422, "Supply exactly one repository path or URL.")
            workspace = (cloud_workspace.clone(session, request.app.state.github, body.repo_url)
                         if body.repo_url else cloud_workspace.describe(body.path, session))
            workspace_service.activate(session, workspace)
            return {**git_service.status(workspace["path"], sandbox=cloud_workspace.sandbox(session)),
                    "path": workspace["path"]}
        local_only(request)
        if body.repo_url:
            authorize_write(authorization, origin)
        root = git_service.open_or_clone(body.path, body.repo_url)
        return git_service.status(str(root))
    except (git_service.GitError, OSError, ValueError) as exc:
        raise HTTPException(400, str(exc)) from exc


@router.post("/commit-push")
def commit_push(body: CommitRequest, request: Request, authorization: str = Header(default=""),
                origin: str | None = Header(default=None), db: Session = Depends(get_db)):
    try:
        if config.CLOUD_MODE:
            session = require_session(request, authorization, db)
            path = body.path or (session.workspace or {}).get("path")
            return cloud_workspace.commit(session, request.app.state.github, path, body.files,
                                          body.message, body.branch)
        local_only(request)
        authorize_write(authorization, origin)
        return git_service.commit_push(body.path, body.files, body.message, body.branch)
    except (git_service.GitError, OSError, ValueError) as exc:
        raise HTTPException(409, str(exc)) from exc
