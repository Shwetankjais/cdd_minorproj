"""Keep hosted Git operations inside one session's disposable workspace."""

import ipaddress
import os
import re

from fastapi import HTTPException

from .. import config
from . import git_service, workspace_service
from .session_service import linked_credential, repository_owner


def local_request(request):
    try:
        peer = ipaddress.ip_address(request.client.host)
    except (AttributeError, ValueError):
        return False
    if request.url.hostname not in {"localhost", "127.0.0.1", "::1", "frontend"}:
        return False
    return peer.is_loopback or (peer.is_private and os.getenv("DEVPULSE_COMPOSE") == "1")


def sandbox(session):
    root = config.CLOUD_WORKSPACE_ROOT.resolve()
    path = root / session.token_hash
    if not re.fullmatch(r"[0-9a-f]{64}", session.token_hash) or path.is_symlink():
        raise HTTPException(403, "Invalid session workspace.")
    return path


def owned_public_project(github, owner, project):
    if not owner:
        raise HTTPException(422, "Select a GitHub username first.")
    if not project or project.partition("/")[0].casefold() != owner.casefold():
        raise HTTPException(403, "This project belongs to a different GitHub account.")
    if not github.is_public(project):
        raise HTTPException(404, "Public GitHub repository not found.")
    return project


def describe(path, session):
    root = git_service.sandbox_repo_path(path, sandbox(session))
    remote = git_service.run_git(root, "remote", "get-url", "origin").decode().strip()
    project = workspace_service.project_slug(remote)
    owner = repository_owner(session)
    if not project or not owner or project.partition("/")[0].casefold() != owner.casefold():
        raise HTTPException(403, "This repository belongs to a different GitHub account.")
    return {"id": root.name, "name": root.name, "path": root.name, "kind": "local",
            "branch": git_service.branch_name(root), "remote_url": remote,
            "project": project, "team_role": session.profile["role"]}


def clone(session, github, url, branch=None):
    project = owned_public_project(github, repository_owner(session), workspace_service.project_slug(url))
    if branch and (branch.startswith("-") or any(char.isspace() for char in branch)):
        raise HTTPException(422, "Supply a valid Git branch name.")
    path = git_service.open_or_clone(None, f"https://github.com/{project}.git", branch, sandbox=sandbox(session))
    return describe(path, session)


def commit(session, github, path, files, message, branch=None):
    token = linked_credential(session)
    username = session.github.get("username")
    if not token or not username or not session.github.get("verified"):
        raise HTTPException(403, "Link your GitHub account with a token that has repository write access.")
    workspace = describe(path, session)
    project = owned_public_project(github, username, workspace["project"])
    result = git_service.commit_push(path, files, message, branch, sandbox=sandbox(session),
                                     github_auth=(username, token), github_project=project)
    return {**result, "path": workspace["path"]}
