import json
import subprocess
from datetime import datetime, timezone

from fastapi import APIRouter

router = APIRouter(prefix="/api/docker")
NAMES = ("devpulse-frontend", "devpulse-backend", "devpulse-db")


@router.get("/status")
def status():
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
