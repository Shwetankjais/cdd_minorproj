"""Resolve repositories within configured server-side roots."""
import re
from pathlib import Path

import httpx
from fastapi import HTTPException

from ..config import DEFAULT_PROJECT
from ..models import iso_utc, utc_now
from . import git_service

GITHUB_URL = re.compile(r"https://github\.com/([A-Za-z0-9-]{1,39})/([A-Za-z0-9_.-]{1,100})")


def project_slug(url):
    match = GITHUB_URL.fullmatch(url or "")
    if not match:
        return None
    owner, name = match.groups()
    name = name.removesuffix(".git")
    return f"{owner}/{name}" if name and not name.startswith(".") else None


def describe(path, role, name=None):
    root = git_service.repo_path(str(path))
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
            "project": project, "team_role": role}


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


def list_workspaces(session):
    role = session.profile["role"]
    available = {item["id"]: item for item in session.recent_workspaces}
    default = default_workspace(role)
    available.setdefault(default["id"], default)
    for path in list(git_service.WORKSPACE.glob("*"))[:100]:
        if path.is_dir() and not path.is_symlink():
            try:
                item = describe(path, role)
                available.setdefault(item["id"], item)
            except (git_service.GitError, OSError):
                continue
    for name, team in (("devops-lab", "CI Team"), ("shop-api", "QA Testing Team")):
        available[name] = {"id": name, "name": name, "kind": "template", "team_role": team,
                           "path": None, "branch": None, "remote_url": None, "project": None}
    return {"workspaces": list(available.values()), "recent_workspaces": session.recent_workspaces,
            "active_workspace": session.workspace,
            "active_role": (session.workspace or {}).get("team_role", role)}


def open_workspace(path, role, name=None):
    root = Path(path).expanduser().resolve()
    if root != git_service.PROJECT_ROOT and not root.is_relative_to(git_service.WORKSPACE):
        raise HTTPException(400, "Choose the project root or a folder inside the configured workspace.")
    if not root.is_dir():
        raise HTTPException(404, "The selected folder does not exist on the server.")
    if root != git_service.PROJECT_ROOT and not (root / ".git").exists():
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
