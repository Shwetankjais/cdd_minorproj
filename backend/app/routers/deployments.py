import hashlib
import hmac
from datetime import timedelta
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import config
from ..config import WEBHOOK_SECRET
from ..database import get_db
from ..models import Deployment, iso_utc, utc_now
from ..seed import insert_once

router = APIRouter(prefix="/api")


@router.get("/deployments")
def deployments(hours: Literal["1", "2", "24", "all"] = "all", db: Session = Depends(get_db)):
    if config.CLOUD_MODE:
        return []
    query = select(Deployment).order_by(Deployment.created_at.desc())
    if hours != "all":
        query = query.where(Deployment.created_at >= utc_now() - timedelta(hours=int(hours)))
    return [entry.payload for entry in db.scalars(query)]


@router.post("/webhooks/github")
async def github_webhook(request: Request, db: Session = Depends(get_db)):
    if not WEBHOOK_SECRET:
        raise HTTPException(503, "Set GITHUB_WEBHOOK_SECRET to enable webhooks.")
    body = await request.body()
    signature = "sha256=" + hmac.new(WEBHOOK_SECRET.encode(), body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(signature, request.headers.get("X-Hub-Signature-256", "")):
        raise HTTPException(401, "Invalid webhook signature.")
    event = request.headers.get("X-GitHub-Event")
    try:
        data = await request.json()
        if event == "ping":
            return {"status": "ok"}
        if event == "deployment_status":
            deployment = data["deployment"]
            status = data["deployment_status"]
            release_id = f"github-deployment-{status['id']}"
            version = deployment["ref"]
            environment = status["environment"]
            result = status["state"]
        elif event == "workflow_job":
            job = data["workflow_job"]
            if data["action"] != "completed" or job["name"].lower() != "deploy":
                return {"status": "ignored"}
            release_id = f"github-job-{job['id']}"
            version = job["head_sha"][:12]
            environment = "ci-verification"
            result = job["conclusion"]
        elif event == "devpulse_verification":
            release_id = f"ci-verification-{data['run_id']}-{data['run_attempt']}"
            version = data["sha"][:12]
            environment = "ci-verification"
            result = "success"
        else:
            return {"status": "ignored"}
        project = data["repository"]["full_name"]
    except (KeyError, TypeError, ValueError) as exc:
        raise HTTPException(422, "Malformed webhook payload.") from exc
    now = utc_now()
    payload = {"id": release_id, "project": project, "version": version, "status": result,
               "environment": environment, "source": "github", "created_at": iso_utc(now)}
    insert_once(db, Deployment, dict(id=release_id, project=project, created_at=now, payload=payload))
    return {"status": "recorded", "id": release_id}
