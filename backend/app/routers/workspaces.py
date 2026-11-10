from fastapi import APIRouter, Depends, HTTPException, Query, Request

from .. import config
from ..models.user_session import UserSession
from ..schemas.collaboration import CloneWorkspace, GitHubUsername, OpenWorkspace
from ..services import cloud_workspace, git_service, workspace_service
from ..services.session_service import repository_owner, require_session

router = APIRouter(prefix="/api/workspaces", tags=["workspaces"])


def browser_workspace(workspace):
    return {**workspace, "role": workspace["team_role"], "passRate": "—"}


@router.get("")
def workspaces(request: Request, session: UserSession = Depends(require_session),
               github_user: GitHubUsername | None = None):
    if not config.CLOUD_MODE and not cloud_workspace.local_request(request):
        raise HTTPException(403, "Use cloud mode for hosted workspace requests.")
    owner = repository_owner(session, github_user)
    repositories = request.app.state.github.repositories(owner) if owner else []
    result = workspace_service.list_workspaces(session, repositories, owner)
    if getattr(request.state, "browser_session", False):
        return [browser_workspace(item) for item in result["workspaces"]]
    return result


@router.get("/browse")
def browse(request: Request, dir: str | None = Query(default=None, max_length=4096),
           session: UserSession = Depends(require_session)):
    if config.CLOUD_MODE or not cloud_workspace.local_request(request):
        raise HTTPException(403, "Host folder browsing is available only on the local dashboard.")
    try:
        result = workspace_service.browse_folders(dir)
        if not dir and getattr(request.state, "browser_session", False):
            return [{"name": "cdd_minor", "path": str(git_service.PROJECT_ROOT), "folder": "cdd_minor"},
                    *[{**folder, "folder": folder["name"]} for folder in result["folders"]]]
        return result
    except (OSError, ValueError) as exc:
        raise HTTPException(400, "The folder could not be listed.") from exc


@router.post("/open")
def open_folder(body: OpenWorkspace, request: Request, session: UserSession = Depends(require_session)):
    if not config.CLOUD_MODE and not cloud_workspace.local_request(request):
        raise HTTPException(403, "Use cloud mode for hosted workspace requests.")
    browser = getattr(request.state, "browser_session", False)
    if bool(body.path) == bool(body.folder_name):
        raise HTTPException(422, "Supply exactly one of path or folder_name.")
    if config.CLOUD_MODE:
        if body.dir:
            raise HTTPException(400, "Choose a repository in your session workspace.")
        try:
            return workspace_service.activate(session, cloud_workspace.describe(body.path or body.folder_name, session))
        except (git_service.GitError, OSError, ValueError) as exc:
            raise HTTPException(400, "Select a repository inside your session workspace.") from exc
    path = str(git_service.PROJECT_ROOT) if body.path == "~/Desktop/cdd_minor" else body.path
    try:
        if body.folder_name:
            path = workspace_service.find_folder(body.folder_name, body.dir)
        elif browser and body.path.startswith("~/Desktop/"):
            # The committed picker sends a name prefixed with ~/Desktop regardless of the actual root.
            selected = body.path.removeprefix("~/Desktop/")
            if selected and "/" not in selected and "\\" not in selected:
                path = workspace_service.find_folder(selected)
        workspace = workspace_service.open_workspace(path, session.profile["role"], body.name)
    except (git_service.GitError, OSError, ValueError) as exc:
        raise HTTPException(400, str(exc)) from exc
    result = workspace_service.activate(session, workspace)
    return {**browser_workspace(result), "message": f"Opened {result['name']}."} if browser else result


@router.post("/clone")
def clone_repository(body: CloneWorkspace, request: Request, session: UserSession = Depends(require_session)):
    if not config.CLOUD_MODE and not cloud_workspace.local_request(request):
        raise HTTPException(403, "Use cloud mode for hosted workspace requests.")
    try:
        if config.CLOUD_MODE:
            workspace = cloud_workspace.clone(session, request.app.state.github, body.repo_url, body.branch)
        else:
            workspace = workspace_service.clone_workspace(body.repo_url, body.branch,
                                                          body.team_role or session.profile["role"])
    except (git_service.GitError, OSError, ValueError) as exc:
        raise HTTPException(400, str(exc)) from exc
    result = workspace_service.activate(session, workspace)
    if getattr(request.state, "browser_session", False):
        operation = "Linked" if result["kind"] == "remote" else "Opened"
        return {**browser_workspace(result), "message": f"{operation} {result['name']} on {result['branch']}."}
    return result
