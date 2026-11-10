"""Read Actions data with bounded requests and a short cache for dashboard polling."""

from collections import OrderedDict
from datetime import datetime, timezone
from threading import Lock
from time import monotonic

import httpx

from .. import config
from ..config import GITHUB_TOKEN
from .handoff_service import job_progress, simulation_progress

PUBLIC_OWNER = "Shwetankjais"
PUBLIC_OWNER_LABEL = "Shwetank Jaiswal (@Shwetankjais)"


class GitHubService:
    def __init__(self):
        headers = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
        if GITHUB_TOKEN and not config.CLOUD_MODE:
            headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"
        self.client = httpx.Client(base_url="https://api.github.com", headers=headers, timeout=3)
        self.cache = OrderedDict()
        self.lock = Lock()

    def get(self, path, ttl=20):
        with self.lock:
            cached = self.cache.get(path)
            if cached and monotonic() < cached[0]:
                return cached[1]
        try:
            response = self.client.get(path)
            response.raise_for_status()
            data = response.json()
        except (httpx.HTTPError, ValueError):
            data = cached[1] if cached else {}
        with self.lock:
            self.cache[path] = (monotonic() + ttl, data)
            self.cache.move_to_end(path)
            if len(self.cache) > 256:
                self.cache.popitem(last=False)
        return data

    def repositories(self, owner=PUBLIC_OWNER):
        endpoint = f"/users/{owner}/repos?sort=updated&per_page=20"
        result = {}
        page = 1
        while True:
            batch = self.get(endpoint if page == 1 else f"{endpoint}&page={page}", ttl=300)
            if not isinstance(batch, list):
                break
            previous = len(result)
            for repo in batch:
                full_name = repo["full_name"]
                if not repo.get("private") and full_name.split("/")[0].lower() == owner.lower():
                    result[full_name.lower()] = repo
            if len(batch) < 20 or len(result) == previous:
                break
            page += 1
        return list(result.values())

    def is_public(self, project):
        repo = self.get(f"/repos/{project}", ttl=300)
        return bool(repo.get("full_name", "").casefold() == project.casefold() and repo.get("private") is False)

    def commit_estimates(self, project):
        repo = self.get(f"/repos/{project}", ttl=300)
        if not repo.get("full_name") or repo.get("private"):
            return []
        commits = self.get(f"/repos/{project}/commits?per_page=20", ttl=120)
        if not isinstance(commits, list):
            return []
        return [estimate_commit(item, project, repo["default_branch"]) for item in commits]

    def runs(self, project):
        runs = self.get(f"/repos/{project}/actions/runs?per_page=30").get("workflow_runs", [])
        return [normalize_run(run, project) for run in runs]

    def run(self, project, run_id):
        data = self.get(f"/repos/{project}/actions/runs/{run_id}")
        return normalize_run(data, project) if data.get("id") else None

    def jobs(self, project, run_id, attempt=1):
        return self.get(f"/repos/{project}/actions/runs/{run_id}/attempts/{attempt}/jobs?per_page=100",
                        ttl=8).get("jobs", [])

    def log(self, project, job_id):
        # GitHub's API responds with a short-lived signed download URL.
        try:
            response = self.client.get(f"/repos/{project}/actions/jobs/{job_id}/logs")
            if response.status_code == 302:
                url = httpx.URL(response.headers["Location"])
                if url.scheme != "https":
                    return ""
                with httpx.stream("GET", url, timeout=4) as stream:
                    stream.raise_for_status()
                    chunks = bytearray()
                    for chunk in stream.iter_bytes(chunk_size=8192):
                        chunks.extend(chunk)
                        if len(chunks) >= 512_000:
                            break
                return chunks.decode(errors="replace")
            response.raise_for_status()
            return response.text[:512_000]
        except (httpx.HTTPError, ValueError, KeyError):
            return ""


def normalize_run(run, project):
    started = run.get("run_started_at") or run["created_at"]
    ended = run["updated_at"] if run["status"] == "completed" else datetime.now(timezone.utc).isoformat()
    duration = datetime.fromisoformat(ended) - datetime.fromisoformat(started)
    return {
        "id": str(run["id"]), "project": project, "source": "github",
        "name": run.get("name") or "GitHub Actions", "title": run.get("display_title", ""),
        "branch": run.get("head_branch") or "", "status": run["status"],
        "conclusion": run.get("conclusion"), "created_at": run["created_at"],
        "duration_seconds": max(0, round(duration.total_seconds())), "url": run.get("html_url"),
        "commit_sha": run.get("head_sha"), "author": (run.get("actor") or {}).get("login"),
        "attempt": run.get("run_attempt", 1), **job_progress([], run.get("conclusion")),
    }


def estimate_commit(item, project, branch):
    """Create a clearly labeled illustrative row, using real commit metadata."""
    sha = item["sha"]
    commit = item["commit"]
    fingerprint = int(sha[:8], 16)
    success = fingerprint % 10 != 0
    author = commit.get("author") or {}
    committer = commit.get("committer") or {}
    stage = simulation_progress(100 if success else 64)
    stage["handoff_alert"] = None
    return {"id": sha, "project": project, "source": "commit_estimate", "estimated": True,
            "name": "Commit-based estimate", "title": "Estimated · " + commit["message"].split("\n", 1)[0],
            "branch": branch, "status": "completed", "conclusion": "success" if success else "failure",
            "created_at": committer.get("date") or author["date"], "duration_seconds": 45 + fingerprint % 196,
            "commit_sha": sha, "url": item["html_url"],
            "author": author.get("name") or (item.get("author") or {}).get("login") or project.partition("/")[0],
            **stage}
