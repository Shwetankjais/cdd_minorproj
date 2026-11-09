from fastapi import APIRouter, Depends, HTTPException, Request

from ..models.user_session import UserSession
from ..schemas.collaboration import CloneWorkspace, OpenWorkspace
from ..services import git_service, workspace_service
from ..services.session_service import require_session

router = APIRouter(prefix="/api/workspaces", tags=["workspaces"])


def browser_workspace(workspace):
    return {**workspace, "role": workspace["team_role"], "passRate": "—"}


@router.get("")
def workspaces(request: Request, session: UserSession = Depends(require_session)):
    result = workspace_service.list_workspaces(session)
    if getattr(request.state, "browser_session", False):
        return [browser_workspace(item) for item in result["workspaces"]]
    return result


@router.post("/open")
def open_folder(body: OpenWorkspace, request: Request, session: UserSession = Depends(require_session)):
    browser = getattr(request.state, "browser_session", False)
    path = str(git_service.PROJECT_ROOT) if browser and body.path == "~/Desktop/cdd_minor" else body.path
    try:
        workspace = workspace_service.open_workspace(path, session.profile["role"], body.name)
    except (git_service.GitError, OSError, ValueError) as exc:
        raise HTTPException(400, str(exc)) from exc
    result = workspace_service.activate(session, workspace)
    return {**browser_workspace(result), "message": f"Opened {result['name']}."} if browser else result


@router.post("/clone")
def clone_repository(body: CloneWorkspace, request: Request, session: UserSession = Depends(require_session)):
    try:
        workspace = workspace_service.clone_workspace(body.repo_url, body.branch,
                                                      body.team_role or session.profile["role"])
    except (git_service.GitError, OSError, ValueError) as exc:
        raise HTTPException(400, str(exc)) from exc
    result = workspace_service.activate(session, workspace)
    if getattr(request.state, "browser_session", False):
        operation = "Linked" if result["kind"] == "remote" else "Opened"
        return {**browser_workspace(result), "message": f"{operation} {result['name']} on {result['branch']}."}
    return result
