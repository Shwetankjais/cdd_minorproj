import json
import subprocess
from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter

router = APIRouter(prefix="/api/docker")
NAMES = ("devpulse-frontend", "devpulse-backend", "devpulse-db")


def inspect_containers():
    found = {}
    available = False
    try:
        result = subprocess.run(["docker", "inspect", "--type", "container", *NAMES],
                                capture_output=True, text=True, timeout=4, check=False)
        containers = json.loads(result.stdout)
        available = bool(containers) or result.returncode == 0 or "No such" in result.stderr
        for container in containers:
            name = container["Name"].lstrip("/")
            if name not in NAMES:
                continue
            state = container["State"]
            uptime = 0
            if state["Running"]:
                started = datetime.fromisoformat(state["StartedAt"])
                uptime = max(0, int((datetime.now(timezone.utc) - started).total_seconds()))
            ports = container["NetworkSettings"].get("Ports") or {}
            found[name] = {"name": name, "status": state["Status"], "image": container["Config"]["Image"],
                           "ports": ports, "uptime_seconds": uptime}
    except (OSError, subprocess.TimeoutExpired, ValueError, KeyError, TypeError):
        available = False
    fallback = "not_found" if available else "unavailable"
    return {"available": available, "containers": [
        found.get(name, {"name": name, "status": fallback, "image": None, "ports": {}, "uptime_seconds": None})
        for name in NAMES
    ]}


@router.get("/status")
def status(format: Literal["dashboard", "detail"] = "dashboard"):
    result = inspect_containers()
    if format == "detail":
        return result

    containers = []
    for container in result["containers"]:
        published = []
        for port, bindings in container["ports"].items():
            published.extend(f"{binding['HostPort']} → {port}" for binding in bindings or [])
        seconds = container["uptime_seconds"]
        containers.append({
            **container, "id": container["name"], "ports": ", ".join(published) or "—",
            "uptime": f"{seconds // 60}m {seconds % 60}s" if seconds is not None else "—",
            "cpu": "—", "memory": "—",
        })
    return containers
