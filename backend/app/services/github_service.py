"""Read Actions data with bounded requests and a short cache for dashboard polling."""

from collections import OrderedDict
from datetime import datetime, timezone
from threading import Lock
from time import monotonic

import httpx

from ..config import GITHUB_TOKEN
from .handoff_service import job_progress


class GitHubService:
    def __init__(self):
        headers = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
        if GITHUB_TOKEN:
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
            self.cache[path] = (monotonic() + ttl, data)
            self.cache.move_to_end(path)
            if len(self.cache) > 256:
                self.cache.popitem(last=False)
            return data

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
        "attempt": run.get("run_attempt", 1), **job_progress([], run.get("conclusion")),
    }
