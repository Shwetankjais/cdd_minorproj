from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..config import DEFAULT_PROJECT
from ..database import get_db
from ..models import PipelineRun, iso_utc, utc_now
from ..schemas import ProjectName, SimulationRequest
from ..services.error_analyzer import analyze
from ..services.handoff_service import job_progress, simulation_progress, stage_index

router = APIRouter(prefix="/api")


@router.get("/projects")
def projects(db: Session = Depends(get_db)):
    names = {DEFAULT_PROJECT, *db.scalars(select(PipelineRun.project).distinct())}
    return [{"id": name, "name": name.split("/")[1], "full_name": name} for name in sorted(names)]


def simulation_state(run):
    elapsed = (utc_now() - run.created_at).total_seconds()
    milestones = [0, 10, 20, 25, 35, 45, 50, 65, 75, 80, 90, 100]
    step = min(len(milestones) - 1, max(0, int(elapsed / run.payload["interval_seconds"])))
    percent = milestones[step]
    return {**run.payload, **simulation_progress(percent),
            "status": "completed" if percent == 100 else "in_progress",
            "conclusion": "success" if percent == 100 else None,
            "duration_seconds": min(round(elapsed), round((len(milestones) - 1) * run.payload["interval_seconds"]))}


def history(request, db, project):
    rows = db.scalars(select(PipelineRun).where(func.lower(PipelineRun.project) == project.lower())
                      .order_by(PipelineRun.created_at.desc()).limit(100))
    local = []
    for row in rows:
        payload = simulation_state(row) if row.source == "simulation" else row.payload
        local.append({key: value for key, value in payload.items() if key != "log"})
    remote = request.app.state.github.runs(project)
    merged = {run["id"]: run for run in [*local, *remote]}
    return sorted(merged.values(), key=lambda run: datetime.fromisoformat(run["created_at"]), reverse=True)


@router.get("/pipeline/runs")
def runs(request: Request, project: ProjectName = DEFAULT_PROJECT, status: str = "",
         search: str = "", db: Session = Depends(get_db)):
    return [run for run in history(request, db, project)
            if (not status or status.lower() in {"all", run["status"], run["conclusion"]})
            and (not search or search.lower() in " ".join(str(run.get(key, "")) for key in
                                                         ("id", "name", "title", "branch")).lower())]


@router.get("/pipeline/summary")
def summary(request: Request, project: ProjectName = DEFAULT_PROJECT, db: Session = Depends(get_db)):
    items = history(request, db, project)
    successful = sum(run["conclusion"] == "success" for run in items)
    failed = sum(run["conclusion"] == "failure" for run in items)
    durations = [run["duration_seconds"] for run in items if run["status"] == "completed"]
    return {"project": project, "total_runs": len(items), "successful_runs": successful,
            "failed_runs": failed, "success_rate": round(100 * successful / len(durations), 1) if durations else 0,
            "average_duration_seconds": round(sum(durations) / len(durations), 1) if durations else 0,
            "recent_runs": items[:10]}


@router.get("/pipeline/live")
def live(request: Request, project: ProjectName = DEFAULT_PROJECT, db: Session = Depends(get_db)):
    latest_simulation = db.scalar(select(PipelineRun).where(
        func.lower(PipelineRun.project) == project.lower(), PipelineRun.source == "simulation"
    ).order_by(PipelineRun.created_at.desc()).limit(1))
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
def simulate(body: SimulationRequest = SimulationRequest(), db: Session = Depends(get_db)):
    project = body.project or DEFAULT_PROJECT
    now = utc_now()
    run_id = f"sim-{uuid4().hex}"
    payload = {"id": run_id, "project": project, "source": "simulation", "name": "DevPulse simulation",
               "title": "Examiner pipeline walkthrough", "branch": "demo", "created_at": iso_utc(now),
               "interval_seconds": body.interval_seconds}
    run = PipelineRun(id=run_id, project=project, source="simulation", created_at=now, payload=payload)
    db.add(run)
    db.flush()
    return simulation_state(run)


@router.get("/pipeline/error-summary/{run_id}")
def error_summary(run_id: str, request: Request, project: ProjectName = DEFAULT_PROJECT,
                  db: Session = Depends(get_db)):
    local = db.get(PipelineRun, run_id)
    if local and local.project.lower() == project.lower():
        if local.payload.get("conclusion") != "failure":
            raise HTTPException(409, "This run has no recorded failure.")
        return analyze(local.payload.get("log", ""))
    github = request.app.state.github
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
