"""Resolve repositories within configured server-side roots."""
import re
from pathlib import Path

import httpx
from fastapi import HTTPException

from ..config import DEFAULT_PROJECT, HOST_HOME
from ..models import iso_utc, utc_now
from . import git_service

from .github_service import PUBLIC_OWNER_LABEL

GITHUB_URL = re.compile(r"https://github\.com/([A-Za-z0-9-]{1,39})/([A-Za-z0-9_.-]{1,100})")


def project_slug(url):
    match = GITHUB_URL.fullmatch(url or "")
    if not match:
        return None
    owner, name = match.groups()
    name = name.removesuffix(".git")
    return f"{owner}/{name}" if name and not name.startswith(".") else None


def folder_roots():
    return {name: (HOST_HOME / name) for name in ("Desktop", "Downloads", "Documents")} | {
        "workspace": git_service.WORKSPACE,
    }


def resolve_directory(value):
    roots = folder_roots()
    # Browser paths such as ~/Desktop refer to the host, not the container user.
    relative = value.removeprefix("~/")
    alias, _, suffix = relative.partition("/")
    path = (roots[alias] / suffix if alias in roots else Path(value).expanduser()).resolve()
    if path == git_service.PROJECT_ROOT or any(path.is_relative_to(root) for root in roots.values()):
        return path
    raise HTTPException(400, "Choose Desktop, Downloads, Documents, or a configured workspace.")


def browse_folders(directory=None):
    if not directory:
        return {"dir": None, "folders": [{"name": name, "path": str(root)} for name, root in folder_roots().items()
                                        if root.is_dir()]}
    root = resolve_directory(directory)
    if not root.is_dir():
        raise HTTPException(404, "The folder does not exist on the server.")
    try:
        folders = [{"name": child.name, "path": str(child)} for child in sorted(root.iterdir(), key=lambda p: p.name.casefold())
                   if not child.name.startswith(".") and not child.is_symlink() and child.is_dir()]
    except PermissionError as exc:
        raise HTTPException(403, "The backend cannot read this folder.") from exc
    return {"dir": str(root), "folders": folders}


def find_folder(name, directory=None):
    if name in {".", ".."} or name.startswith(".") or any(char in name for char in "/\\\0"):
        raise HTTPException(422, "Send a folder name without path separators.")
    if name.casefold() in {"cdd_minor", git_service.PROJECT_ROOT.name.casefold()} and not directory:
        return git_service.PROJECT_ROOT
    locations = [directory] if directory else list(folder_roots())
    matches = set()
    for location in locations:
        root = resolve_directory(location)
        if not root.is_dir():
            continue
        for entry in browse_folders(location)["folders"]:
            if entry["name"].casefold() == name.casefold():
                matches.add(Path(entry["path"]))
    if not matches:
        raise HTTPException(404, "Folder not found in the configured roots. Browse a parent folder and try again.")
    if len(matches) > 1:
        raise HTTPException(409, "Several folders have this name. Select a parent directory or send the browsed path.")
    return matches.pop()


def describe(path, role, name=None):
    root = git_service.repo_path(str(path), additional_roots=folder_roots().values())
    try:
        remote = git_service.run_git(root, "remote", "get-url", "origin").decode().strip()
    except git_service.GitError:
        remote = None
    if remote and remote.startswith("git@github.com:"):
        remote = "https://github.com/" + remote.split(":", 1)[1]
    project = project_slug(remote)
    # Never return a configured remote that could contain credentials.
    if not project:
        remote = None
    return {"id": str(root), "name": name or root.name, "path": str(root), "kind": "local",
            "branch": git_service.branch_name(root), "remote_url": remote,
            "project": project, "team_role": role,
            "owner": PUBLIC_OWNER_LABEL if project and project.lower().startswith("shwetankjais/") else None}


def default_workspace(role):
    try:
        return describe(git_service.PROJECT_ROOT, role, "cdd_minor")
    except (git_service.GitError, OSError):
        return {"id": str(git_service.PROJECT_ROOT), "name": "cdd_minor", "kind": "local",
                "path": str(git_service.PROJECT_ROOT), "branch": None, "project": DEFAULT_PROJECT,
                "remote_url": f"https://github.com/{DEFAULT_PROJECT}", "team_role": role}


def activate(session, workspace):
    recent = [item for item in session.recent_workspaces if item["id"] != workspace["id"]]
    session.workspace = {**workspace, "last_opened_at": iso_utc(utc_now())}
    session.recent_workspaces = [session.workspace, *recent][:15]
    return session.workspace


def list_workspaces(session, repositories):
    role = session.profile["role"]
    recent = [item for item in session.recent_workspaces if item.get("kind") != "template"]
    available = {item["id"]: item for item in recent}
    default = default_workspace(role)
    available.setdefault(default["id"], default)
    for path in list(git_service.WORKSPACE.glob("*"))[:100]:
        if path.is_dir() and not path.is_symlink():
            try:
                item = describe(path, role)
                available.setdefault(item["id"], item)
            except (git_service.GitError, OSError):
                continue
    linked_projects = {item["project"].lower() for item in available.values() if item.get("project")}
    for repo in repositories:
        project = repo["full_name"]
        if project.lower() not in linked_projects:
            key = f"github:{project.lower()}"
            available[key] = {"id": key, "name": repo["name"], "kind": "remote", "team_role": role,
                              "path": None, "branch": repo.get("default_branch"), "remote_url": repo["html_url"],
                              "project": project, "owner": PUBLIC_OWNER_LABEL}
    return {"workspaces": list(available.values()), "recent_workspaces": recent,
            "active_workspace": session.workspace if (session.workspace or {}).get("kind") != "template" else None,
            "active_role": (session.workspace or {}).get("team_role", role)}


def open_workspace(path, role, name=None):
    root = resolve_directory(str(path))
    if not root.is_dir():
        raise HTTPException(404, "The selected folder does not exist on the server.")
    if root != git_service.PROJECT_ROOT and not (root / ".git").exists():
        if not root.is_relative_to(git_service.WORKSPACE):
            return {"id": str(root), "name": name or root.name, "kind": "folder", "path": str(root),
                    "project": None, "branch": None, "remote_url": None, "team_role": role}
        if root == git_service.WORKSPACE:
            raise HTTPException(400, "Choose a folder inside the workspace root.")
        with git_service.WRITE_LOCK:
            if not (root / ".git").exists():
                git_service.run_git(root, "init", "-b", "main")
    return describe(root, role, name or ("cdd_minor" if root == git_service.PROJECT_ROOT else None))


def clone_workspace(repo_url, branch, role):
    project = project_slug(repo_url)
    if not project:
        raise HTTPException(422, "Supply a GitHub HTTPS repository URL without credentials.")
    if branch.startswith("-") or any(char.isspace() for char in branch):
        raise HTTPException(422, "Supply a valid Git branch name.")
    name = project.split("/")[1]
    default = default_workspace(role)
    if (default["project"] or "").lower() == project.lower() and default["branch"] == branch:
        return default
    root = git_service.WORKSPACE / name
    if root.exists():
        item = describe(root, role)
        if (item["project"] or "").lower() != project.lower():
            raise HTTPException(409, "Another repository already uses that workspace name.")
        if item["branch"] != branch:
            raise HTTPException(409, f"The existing workspace is on {item['branch']}; open it or choose that branch.")
        return item
    try:
        root = git_service.open_or_clone(None, repo_url, branch=branch)
    except git_service.GitError as exc:
        try:
            response = httpx.get(f"https://api.github.com/repos/{project}", timeout=3)
            response.raise_for_status()
        except httpx.HTTPError:
            raise HTTPException(422, "Clone failed and the public GitHub repository could not be verified.") from exc
        return {"id": f"github:{project.lower()}", "name": name, "kind": "remote",
                "path": None, "project": project, "branch": branch,
                "remote_url": f"https://github.com/{project}", "team_role": role}
    return describe(root, role)
