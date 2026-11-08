# DevPulse: Visual CI/CD Pipeline Monitoring Dashboard

## Run the backend

From the repository root:

```sh
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
python -m pytest
uvicorn app.main:app --reload
```

The API is available at `http://127.0.0.1:8000/api/health` and its interactive OpenAPI reference at `http://127.0.0.1:8000/docs`. Startup creates a SQLite database and inserts timestamped demo runs and deployments once. Set `DATABASE_URL` in `backend/.env` to use PostgreSQL. Copy `backend/.env.example` to get started.

Pipeline reads merge GitHub Actions runs with demo history for `Shwetankjais/cdd_minorproj`. An optional GitHub token with Actions read access can increase the request allowance or read private repositories. Scope it to repositories that dashboard users can see. Every run includes a `source` field. To exercise handoffs, call `POST /api/pipeline/simulate` and poll `GET /api/pipeline/live` about once per second.

Collection endpoints for projects, runs, and deployments return arrays. `/api/pipeline/summary` returns aggregate counts and `recent_runs`. `/api/pipeline/live` returns `progress`, `current_stage`, `stages`, and a nullable `handoff_alert`. Git status returns `path`, `branch`, and `files`. Docker status returns a list of dashboard cards. Pass `format=detail` for the original `available` and `containers` response with raw port bindings.

## Run with Docker Compose

```sh
docker compose up --build --wait db backend
# When the frontend Dockerfile is available, start the complete stack.
docker compose up --build --wait
```

Compose uses PostgreSQL 15 and publishes the API and UI on localhost ports 8000 and 5173. Open the dashboard at `http://localhost:5173`. Nginx serves the dashboard on container port 80 and proxies `/api/` to FastAPI. Docker inspection uses the Docker CLI and returns an unavailable state if it cannot reach a daemon. To inspect a Docker daemon from the backend container, configure a reachable `DOCKER_HOST` or a socket mount and matching socket permissions in a local Compose override.

Git opens the project root or repositories inside the configured workspace. Cloning and committing require `GIT_WRITE_TOKEN` and an `Authorization: Bearer <token>` header. Clones use GitHub HTTPS URLs. Commit requests take `files`, `message`, optional `path`, and optional `branch`. Run the backend on the host to use your existing Git identity and credential helper. In Compose, the project is mounted at `/workspace/project`. Container writes require compatible file permissions and separately configured Git identity and credentials. If a push fails after committing, the response returns the saved commit SHA and `pushed: false`.

## GitHub Actions and deployment history

Pushes and pull requests run Build, Test, Docker, and Deploy jobs. The Deploy job starts and checks an isolated Compose stack on the runner. Frontend steps run when their package manifest or Dockerfile is present.

To deliver notifications from pushes, set the repository secrets `DEVPULSE_WEBHOOK_URL` to the deployed HTTPS URL ending in `/api/webhooks/github` and `DEVPULSE_WEBHOOK_SECRET` to the same value as the backend's `GITHUB_WEBHOOK_SECRET`. The endpoint also accepts signed GitHub deployment status and completed `deploy` workflow job events. Configure either the workflow notification or the workflow job webhook for a given verification to avoid separate records for the same execution. `GET /api/deployments?hours=2` filters deployments by UTC age. Supported windows are 1, 2, 24, and all.

The current UI reads projects and Docker status from the API. Its run history, charts, simulation, and deployment views use browser-side demo data. The Git drawer uses demo state and does not provide the token or selected files required for authenticated Git writes.
