from fastapi import APIRouter, Depends, HTTPException

from ..models.user_session import UserSession
from ..schemas.collaboration import CloneWorkspace, OpenWorkspace
from ..services import git_service, workspace_service
from ..services.session_service import require_session

router = APIRouter(prefix="/api/workspaces", tags=["workspaces"])


@router.get("")
def workspaces(session: UserSession = Depends(require_session)):
    return workspace_service.list_workspaces(session)


@router.post("/open")
def open_folder(body: OpenWorkspace, session: UserSession = Depends(require_session)):
    try:
        workspace = workspace_service.open_workspace(body.path, session.profile["role"], body.name)
    except (git_service.GitError, OSError, ValueError) as exc:
        raise HTTPException(400, str(exc)) from exc
    return workspace_service.activate(session, workspace)


@router.post("/clone")
def clone_repository(body: CloneWorkspace, session: UserSession = Depends(require_session)):
    try:
        workspace = workspace_service.clone_workspace(body.repo_url, body.branch,
                                                      body.team_role or session.profile["role"])
    except (git_service.GitError, OSError, ValueError) as exc:
        raise HTTPException(400, str(exc)) from exc
    return workspace_service.activate(session, workspace)
