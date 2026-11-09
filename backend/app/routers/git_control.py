import hmac

from fastapi import APIRouter, Depends, Header, HTTPException

from ..config import GIT_WRITE_TOKEN, VIVA_GIT_WRITE_TOKEN
from ..schemas import CommitRequest, OpenRepository
from ..services import git_service

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


@router.get("/status")
def status(path: str | None = None):
    try:
        return git_service.status(path)
    except (git_service.GitError, OSError, ValueError) as exc:
        raise HTTPException(400, str(exc)) from exc


@router.post("/open-or-clone")
def open_or_clone(body: OpenRepository, authorization: str = Header(default=""),
                  origin: str | None = Header(default=None)):
    if body.repo_url:
        authorize_write(authorization, origin)
    try:
        root = git_service.open_or_clone(body.path, body.repo_url)
        return git_service.status(str(root))
    except (git_service.GitError, OSError, ValueError) as exc:
        raise HTTPException(400, str(exc)) from exc


@router.post("/commit-push", dependencies=[Depends(authorize_write)])
def commit_push(body: CommitRequest):
    try:
        return git_service.commit_push(body.path, body.files, body.message, body.branch)
    except (git_service.GitError, OSError, ValueError) as exc:
        raise HTTPException(409, str(exc)) from exc
