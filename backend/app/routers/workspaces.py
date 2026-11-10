from fastapi import APIRouter, Depends, HTTPException, Query, Request

from ..models.user_session import UserSession
from ..schemas.collaboration import CloneWorkspace, OpenWorkspace
from ..services import git_service, workspace_service
from ..services.session_service import require_session

router = APIRouter(prefix="/api/workspaces", tags=["workspaces"])


def browser_workspace(workspace):
    return {**workspace, "role": workspace["team_role"], "passRate": "—"}


@router.get("")
def workspaces(request: Request, session: UserSession = Depends(require_session)):
    result = workspace_service.list_workspaces(session, request.app.state.github.repositories())
    if getattr(request.state, "browser_session", False):
        return [browser_workspace(item) for item in result["workspaces"]]
    return result


@router.get("/browse")
def browse(dir: str | None = Query(default=None, max_length=4096),
           session: UserSession = Depends(require_session)):
    try:
        return workspace_service.browse_folders(dir)
    except (OSError, ValueError) as exc:
        raise HTTPException(400, "The folder could not be listed.") from exc


@router.post("/open")
def open_folder(body: OpenWorkspace, request: Request, session: UserSession = Depends(require_session)):
    browser = getattr(request.state, "browser_session", False)
    if bool(body.path) == bool(body.folder_name):
        raise HTTPException(422, "Supply exactly one of path or folder_name.")
    path = str(git_service.PROJECT_ROOT) if body.path == "~/Desktop/cdd_minor" else body.path
    try:
        if body.folder_name:
            path = workspace_service.find_folder(body.folder_name, body.dir)
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
