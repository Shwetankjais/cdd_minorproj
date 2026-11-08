"""Install a repeatable demo history. IDs identify seeded data separately from GitHub."""

from datetime import timedelta

from sqlalchemy.dialects.postgresql import insert as postgres_insert
from sqlalchemy.dialects.sqlite import insert as sqlite_insert

from .config import DEFAULT_PROJECT
from .models import Deployment, PipelineRun, iso_utc, utc_now
from .services.handoff_service import simulation_progress

SCENARIOS = (
    (12, "success", "Refresh dashboard build assets", "main", 100, ""),
    (38, "failure", "Tighten login authorization checks", "feature/auth", 66, "E assert 401 == 200"),
    (53, "success", "Validate dashboard API pagination", "main", 100, ""),
    (83, "success", "Add database readiness checks", "main", 100, ""),
    (108, "failure", "Add pipeline telemetry exporter", "feature/metrics", 10,
     "ModuleNotFoundError: No module named 'opentelemetry'"),
    (140, "cancelled", "Experiment with release jobs", "feature/releases", 35, ""),
    (260, "success", "Enable release smoke tests", "main", 100, ""),
    (680, "failure", "Update frontend package aliases", "feature/ui", 35,
     "Vite error: failed to resolve import"),
    (1120, "success", "Add deployment history", "main", 100, ""),
    (1720, "success", "Initialize pipeline monitoring", "main", 100, ""),
)


def insert_once(db, model, rows):
    insert = postgres_insert if db.bind.dialect.name == "postgresql" else sqlite_insert
    db.execute(insert(model).values(rows).on_conflict_do_nothing(index_elements=["id"]))


def seed(db):
    now = utc_now()
    runs = []
    for index, (minutes, result, title, branch, percent, log) in enumerate(SCENARIOS):
        run_id = f"demo-{1001 - index}"
        created = now - timedelta(minutes=minutes)
        payload = {"id": run_id, "project": DEFAULT_PROJECT, "source": "seed", "name": "DevPulse CI/CD",
                   "title": title, "branch": branch, "status": "completed", "conclusion": result,
                   "created_at": iso_utc(created), "duration_seconds": 90 + 23 * index,
                   "log": log, **simulation_progress(percent)}
        payload["handoff_alert"] = None
        runs.append(dict(id=run_id, project=DEFAULT_PROJECT, source="seed", created_at=created, payload=payload))
    insert_once(db, PipelineRun, runs)

    deployments = []
    for index, (minutes, version, status) in enumerate([
        (12, "v1.4.0", "success"), (53, "v1.3.2", "success"), (83, "v1.3.1", "success"),
        (115, "v1.3.0", "failure"), (260, "v1.2.0", "success"), (1600, "v1.1.0", "success"),
    ]):
        deployment_id = f"demo-release-{index}"
        created = now - timedelta(minutes=minutes)
        payload = {"id": deployment_id, "project": DEFAULT_PROJECT, "version": version,
                   "status": status, "environment": "demo", "source": "seed",
                   "image": f"devpulse-backend:{version}", "created_at": iso_utc(created)}
        deployments.append(dict(id=deployment_id, project=DEFAULT_PROJECT, created_at=created, payload=payload))
    insert_once(db, Deployment, deployments)
