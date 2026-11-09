"""Run bounded, non-interactive Git commands on repositories inside configured roots."""

import os
import re
import subprocess
from pathlib import Path
from threading import Lock
from urllib.parse import urlsplit

from ..config import PROJECT_ROOT, WORKSPACE

WRITE_LOCK = Lock()


class GitError(Exception):
    pass


def run_git(path, *args, timeout=15, report_failure=False):
    env = dict(os.environ, GIT_TERMINAL_PROMPT="0", GIT_LITERAL_PATHSPECS="1")
    for key in ("GIT_DIR", "GIT_WORK_TREE", "GIT_INDEX_FILE"):
        env.pop(key, None)
    try:
        result = subprocess.run(
            ["git", "-c", "core.hooksPath=/dev/null", "-c", "core.fsmonitor=false",
             "-c", "protocol.ext.allow=never", "-C", str(path), *args],
            capture_output=True, timeout=timeout, env=env, check=False,
        )
    except (OSError, subprocess.TimeoutExpired) as exc:
        raise GitError("Git is unavailable or the command timed out.") from exc
    if result.returncode:
        if report_failure:
            output = (result.stderr + b"\n" + result.stdout).decode(errors="replace").strip()
            # Hide credentials embedded in remote URLs before returning Git output.
            output = re.sub(r"(https?://)[^/\s@]+@", r"\1[redacted]@", output)
            if output:
                raise GitError(output[:8000])
        raise GitError(f"Git {args[0]} failed. Check repository permissions and Git configuration.")
    return result.stdout


def repo_path(path=None):
    candidate = Path(path).expanduser().resolve() if path else PROJECT_ROOT
    if candidate != PROJECT_ROOT and not candidate.is_relative_to(WORKSPACE):
        raise GitError("Choose the project root or a repository inside the configured workspace.")
    root = Path(os.fsdecode(run_git(candidate, "rev-parse", "--show-toplevel").rstrip(b"\n"))).resolve()
    if root != candidate:
        raise GitError("Choose the repository root.")
    return root


def branch_name(root):
    return os.fsdecode(run_git(root, "branch", "--show-current")).strip()


def status(path=None):
    root = repo_path(path)
    entries = run_git(root, "status", "--porcelain=v1", "-z", "--untracked-files=all",
                      "--no-renames").split(b"\0")
    # Diff against the empty tree for a newly initialized repository.
    try:
        base = run_git(root, "rev-parse", "--verify", "HEAD").strip().decode()
    except GitError:
        base = run_git(root, "hash-object", "-t", "tree", "/dev/null").strip().decode()
    stats = {}
    for entry in run_git(root, "diff", "--numstat", "-z", "--no-renames", "--no-ext-diff", "--no-textconv", base, "--").split(b"\0"):
        if entry:
            added, deleted, name = entry.split(b"\t", 2)
            stats[name] = (int(added), int(deleted)) if added != b"-" else (0, 0)
    files = []
    for entry in filter(None, entries):
        flags, raw_name = entry[:2].decode(), entry[3:]
        name = os.fsdecode(raw_name)
        change = "A" if flags == "??" or "A" in flags else "D" if "D" in flags else "M"
        added, deleted = stats.get(raw_name, (0, 0))
        if flags == "??":
            file = root / name
            if file.is_file() and not file.is_symlink() and file.stat().st_size <= 2_000_000:
                content = file.read_bytes()
                if b"\0" not in content:
                    added = len(content.splitlines())
        files.append({"path": name.encode("utf-8", errors="replace").decode(), "status": change,
                      "additions": added, "deletions": deleted})
    return {"path": str(root), "branch": branch_name(root), "files": files}


def open_or_clone(path, url):
    if bool(path) == bool(url):
        raise GitError("Supply exactly one local path or clone URL.")
    if path:
        return repo_path(path)
    parsed = urlsplit(url)
    if (parsed.scheme != "https" or parsed.netloc.lower() != "github.com" or parsed.query
            or parsed.fragment or not re.fullmatch(r"/[\w-]+/[\w.-]+", parsed.path)):
        raise GitError("Use a GitHub HTTPS clone URL without credentials.")
    name = parsed.path.split("/")[-1].removesuffix(".git")
    if name in {"", ".", ".."} or name.startswith("."):
        raise GitError("The repository name is invalid.")
    with WRITE_LOCK:
        WORKSPACE.mkdir(parents=True, exist_ok=True)
        target = WORKSPACE / name
        if target.exists() or target.is_symlink():
            raise GitError("A workspace entry already uses this name. Open it by path instead.")
        run_git(WORKSPACE, "clone", "--", url, name, timeout=120)
        return repo_path(str(target))


def commit_push(path, files, message, expected_branch=None):
    with WRITE_LOCK:
        root = repo_path(path)
        branch = branch_name(root)
        if not branch or (expected_branch and expected_branch != branch):
            raise GitError("Check out the requested branch before committing.")
        run_git(root, "remote", "get-url", "--push", "origin")
        if not message.strip():
            raise GitError("Enter a commit message.")
        if run_git(root, "ls-files", "--unmerged"):
            raise GitError("Resolve merge conflicts before committing.")
        for marker in ("MERGE_HEAD", "CHERRY_PICK_HEAD", "REVERT_HEAD", "rebase-merge", "rebase-apply"):
            state_path = Path(os.fsdecode(run_git(root, "rev-parse", "--git-path", marker)).rstrip("\n"))
            if (root / state_path).exists():
                raise GitError("Finish the Git operation already in progress.")
        changed = {entry["path"] for entry in status(str(root))["files"]}
        selected = list(dict.fromkeys(files))
        if any(file not in changed for file in selected):
            raise GitError("Select individual changed paths from Git status.")
        run_git(root, "add", "--", *selected)
        # --only preserves unrelated changes that someone else has staged.
        run_git(root, "commit", "--only", "-m", message, "--", *selected)
        sha = run_git(root, "rev-parse", "HEAD").strip().decode()
        committed = run_git(root, "diff-tree", "--root", "--no-commit-id", "--name-only",
                            "--no-renames", "-r", "-z", sha)
        result = {"path": str(root), "branch": branch, "commit": sha, "commit_sha": sha,
                  "files": [name.decode("utf-8", errors="replace") for name in committed.split(b"\0") if name],
                  "pushed": False}
        try:
            run_git(root, "push", "origin", f"{sha}:refs/heads/{branch}", timeout=90, report_failure=True)
        except GitError as exc:
            return {**result, "message": "Commit saved locally. Push failed.", "push_error": str(exc)}
        return {**result, "pushed": True}
