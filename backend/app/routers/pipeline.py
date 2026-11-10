from datetime import datetime
from typing import Annotated
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .. import config
from ..config import DEFAULT_PROJECT
from ..database import get_db
from ..models import PipelineRun, iso_utc, utc_now
from ..schemas import ProjectName, SimulationRequest
from ..schemas.collaboration import GitHubUsername
from ..models.user_session import UserSession
from ..services.cloud_workspace import owned_public_project
from ..services.session_service import optional_session, repository_owner
from ..services.error_analyzer import analyze
from ..services.github_service import PUBLIC_OWNER_LABEL
from ..services.handoff_service import job_progress, simulation_progress, stage_index

router = APIRouter(prefix="/api")


SessionScope = Annotated[UserSession | None, Depends(optional_session)]


def resolve_project(request, project, session=None, github_user=None):
    owner = repository_owner(session, github_user)
    scoped = config.CLOUD_MODE or github_user or (session and session.github.get("username"))
    if not scoped:
        return project or DEFAULT_PROJECT
    github = request.app.state.github
    if not project and owner:
        project = next((repo["full_name"] for repo in github.repositories(owner)), None)
    return owned_public_project(github, owner, project)


def scoped_runs(query, session):
    if config.CLOUD_MODE:
        return query.where(PipelineRun.payload["session_scope"].as_string() == session.token_hash)
    return query


@router.get("/projects")
def projects(request: Request, session: SessionScope = None, github_user: GitHubUsername | None = None):
    github = request.app.state.github
    owner = repository_owner(session, github_user)
    if not owner:
        return []
    catalog = github.repositories(owner)
    # Keep the configured repository selectable when GitHub is temporarily unavailable.
    if not catalog and not config.CLOUD_MODE and not github_user and not (session and session.github.get("username")):
        catalog = [{"full_name": DEFAULT_PROJECT, "name": DEFAULT_PROJECT.split("/")[1]}]
    result = []
    for repo in catalog:
        project = repo["full_name"]
        current = project.lower() == DEFAULT_PROJECT.lower() if not config.CLOUD_MODE else not result
        label = PUBLIC_OWNER_LABEL if owner.casefold() == "shwetankjais" else owner
        result.append({
            "id": project, "name": repo["name"], "full_name": project, "displayName": repo["name"],
            "branch": repo.get("default_branch"), "remote_url": repo.get("html_url"),
            "isCurrent": current, "passRate": None, "lastAuthor": label,
            "owner": label, "status": "Unknown",
        })
    return sorted(result, key=lambda item: not item["isCurrent"])


def simulation_state(run):
    elapsed = (utc_now() - run.created_at).total_seconds()
    milestones = [0, 10, 20, 25, 35, 45, 50, 65, 75, 80, 90, 100]
    step = min(len(milestones) - 1, max(0, int(elapsed / run.payload["interval_seconds"])))
    percent = milestones[step]
    return {**{key: value for key, value in run.payload.items() if key != "session_scope"},
            **simulation_progress(percent),
            "status": "completed" if percent == 100 else "in_progress",
            "conclusion": "success" if percent == 100 else None,
            "duration_seconds": min(round(elapsed), round((len(milestones) - 1) * run.payload["interval_seconds"]))}


def history(request, db, project, session=None):
    query = select(PipelineRun).where(func.lower(PipelineRun.project) == project.lower())
    rows = db.scalars(scoped_runs(query, session).order_by(PipelineRun.created_at.desc()).limit(100))
    local = []
    for row in rows:
        payload = simulation_state(row) if row.source == "simulation" else row.payload
        local.append({key: value for key, value in payload.items() if key not in {"log", "session_scope"}})
    github = request.app.state.github
    remote = github.runs(project) or github.commit_estimates(project)
    if remote:
        local = [run for run in local if run["source"] != "seed"]
    merged = {run["id"]: run for run in [*local, *remote]}
    return sorted(merged.values(), key=lambda run: datetime.fromisoformat(run["created_at"]), reverse=True)


@router.get("/pipeline/runs")
def runs(request: Request, project: ProjectName | None = None, status: str = "",
         search: str = "", db: Session = Depends(get_db), session: SessionScope = None,
         github_user: GitHubUsername | None = None):
    project = resolve_project(request, project, session, github_user)
    return [run for run in history(request, db, project, session)
            if (not status or status.lower() in {"all", run["status"], run["conclusion"]})
            and (not search or search.lower() in " ".join(str(run.get(key, "")) for key in
                                                         ("id", "name", "title", "branch", "author", "commit_sha")).lower())]


@router.get("/pipeline/summary")
def summary(request: Request, project: ProjectName | None = None, db: Session = Depends(get_db),
            session: SessionScope = None, github_user: GitHubUsername | None = None):
    project = resolve_project(request, project, session, github_user)
    items = history(request, db, project, session)
    successful = sum(run["conclusion"] == "success" for run in items)
    failed = sum(run["conclusion"] == "failure" for run in items)
    durations = [run["duration_seconds"] for run in items if run["status"] == "completed"]
    return {"project": project, "total_runs": len(items), "successful_runs": successful,
            "failed_runs": failed, "success_rate": round(100 * successful / len(durations), 1) if durations else 0,
            "average_duration_seconds": round(sum(durations) / len(durations), 1) if durations else 0,
            "recent_runs": items[:10],
            "estimated": any(run["source"] == "commit_estimate" for run in items)}


@router.get("/pipeline/live")
def live(request: Request, project: ProjectName | None = None, db: Session = Depends(get_db),
         session: SessionScope = None, github_user: GitHubUsername | None = None):
    project = resolve_project(request, project, session, github_user)
    query = select(PipelineRun).where(
        func.lower(PipelineRun.project) == project.lower(), PipelineRun.source == "simulation"
    )
    latest_simulation = db.scalar(scoped_runs(query, session).order_by(PipelineRun.created_at.desc()).limit(1))
    if latest_simulation:
        simulation = simulation_state(latest_simulation)
        # Keep 100% visible briefly so polling clients can observe the final milestone.
        if (utc_now() - latest_simulation.created_at).total_seconds() < simulation["duration_seconds"] + 20:
            return simulation
    github = request.app.state.github
    remote = github.runs(project)
    if remote:
        run = next((item for item in remote if item["status"] != "completed"), remote[0])
        return {**run, **job_progress(github.jobs(project, run["id"], run["attempt"]), run["conclusion"])}
    return simulation_state(latest_simulation) if latest_simulation else {
        "project": project, "status": "idle", **simulation_progress(0)
    }


@router.post("/pipeline/simulate", status_code=201)
def simulate(request: Request, body: SimulationRequest = SimulationRequest(), db: Session = Depends(get_db),
             session: SessionScope = None):
    project = resolve_project(request, body.project, session)
    return start_simulation(body, db, project, session)


def start_simulation(body, db, project, session):

    now = utc_now()
    run_id = f"sim-{uuid4().hex}"
    payload = {"id": run_id, "project": project, "source": "simulation", "name": "DevPulse simulation",
               "title": "Examiner pipeline walkthrough", "branch": "demo", "created_at": iso_utc(now),
               "interval_seconds": body.interval_seconds}
    if config.CLOUD_MODE:
        payload["session_scope"] = session.token_hash
    run = PipelineRun(id=run_id, project=project, source="simulation", created_at=now, payload=payload)
    db.add(run)
    db.flush()
    return simulation_state(run)


@router.get("/pipeline/error-summary/{run_id}")
def error_summary(run_id: str, request: Request, project: ProjectName | None = None,
                  db: Session = Depends(get_db), session: SessionScope = None,
                  github_user: GitHubUsername | None = None):
    project = resolve_project(request, project, session, github_user)
    local = db.scalar(scoped_runs(select(PipelineRun).where(PipelineRun.id == run_id), session))
    if local and local.project.lower() == project.lower():
        if local.payload.get("conclusion") != "failure":
            raise HTTPException(409, "This run has no recorded failure.")
        return analyze(local.payload.get("log", ""))
    github = request.app.state.github
    if len(run_id) == 40 and all(char in "0123456789abcdef" for char in run_id.lower()):
        raise HTTPException(409, "Commit estimates do not have workflow failure logs.")
    run = github.run(project, run_id) if run_id.isascii() and run_id.isdecimal() else None
    if not run:
        raise HTTPException(404, "Run not found.")
    if run["conclusion"] not in {"failure", "timed_out", "startup_failure", "action_required"}:
        raise HTTPException(409, "This run has no recorded failure.")
    jobs = github.jobs(project, run_id, run["attempt"])
    job = next((job for job in jobs if job.get("conclusion") in {"failure", "timed_out", "startup_failure"}), None)
    if not job:
        return analyze("")
    name = job["name"]
    if stage_index(name) == 1:
        failed = next((step for step in job.get("steps", []) if step.get("conclusion") == "failure"), None)
        if failed and stage_index(failed["name"]) == 0:
            name = failed["name"]
    stage = ["Install", "Build", "Test", "Deploy" if "deploy" in name.lower() else "Docker"][stage_index(name)]
    return analyze(github.log(project, job["id"]), stage)
