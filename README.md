# DevPulse: Visual CI/CD Pipeline Monitoring Dashboard

[![DevPulse CI/CD](https://github.com/Shwetankjais/cdd_minorproj/actions/workflows/ci-cd.yml/badge.svg?branch=main)](https://github.com/Shwetankjais/cdd_minorproj/actions/workflows/ci-cd.yml)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.4.5-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Docker Compose](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.19-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://www.python.org/)

## 1. Project Overview

DevPulse brings workflow runs, release history, and local development status into one dashboard. It helps engineers see which stage needs attention, understand common CI failures, and anticipate the next team's handoff. Public GitHub Actions runs and clearly labeled seed records support both real repository monitoring and a repeatable classroom demonstration.

CI failures can be buried in long logs, and downstream teams may have little warning before their work begins. DevPulse pairs a visual stage tracker with handoff alerts and plain-English diagnostics so those teams can follow a run without switching between runner logs and local tools.

## 2. Technology Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 18.3.1, Vite 6.4.5, Tailwind CSS 3.4.19, PostCSS, Recharts 2.15.4, Lucide React 0.475.0 |
| API | Python 3.12, FastAPI, Pydantic, Uvicorn, HTTPX |
| Persistence | SQLAlchemy, psycopg, PostgreSQL 15 in Compose, SQLite for zero-config local runs |
| Source control | Native Git CLI invoked through Python's `subprocess` |
| Tests | pytest and FastAPI TestClient for the backend, Vitest 3.2.7 with jsdom and Testing Library for React |
| Infrastructure | Docker Compose, a Node 20 build stage and Nginx Alpine for the frontend, a Python 3.12 slim backend image, GitHub Actions on Ubuntu 24.04 |

Frontend versions reflect [the npm lockfile](frontend/package-lock.json). The backend declares supported dependency ranges in [requirements.txt](backend/requirements.txt).

## 3. Project Architecture

```text
                         localhost
  +-----------------------------------------------------------+
  | Browser                                                   |
  | React SPA: sidebar views, launcher, and right-column chat |
  +------------+-------------------------------+--------------+
               | page and assets               | default REST API
               v                               | localhost:8000/api
  +----------------------------+               |
  | Nginx                      |               |
  | host :5173 -> container :80|               |
  +------------+---------------+               |
               | /api/ proxy                   |
               v                               v
  +-----------------------------------------------------------+
  | FastAPI :8000                                             |
  | Auth sessions, workspace hub, agent action executor       |
  | Pipeline runs, handoffs, diagnostics, deployments, Git    |
  +-------------+----------------------+----------------------+
                |                      |
                v                      +--> GitHub Actions REST API
  +-----------------------------+      +--> Git CLI and allowed workspace
  | PostgreSQL 15 in Compose    |      +--> Docker CLI with daemon access
  | SQLite for local defaults   |
  +-----------------------------+

  GitHub Actions -- optional signed HTTPS notification --> FastAPI
  OpenAI or Gemini <-- optional read-only tool selection --> Agent
```

The Vite client defaults to `http://localhost:8000/api`. For a local Vite session, `VITE_API_URL` can override that URL. The integration Compose build sets `VITE_API_URL=/api`, so the SPA and API share the Nginx origin on port 5173. The UI uses bundled demo responses when some requests fail. The API separately labels seeded, simulated, and GitHub run records using `source`.

The v1.5 backend adds a session gate for workspace and agent requests. The frontend integration uses a login and GitHub connection screen, a workspace launcher, sidebar view switching instead of one long dashboard, and a right-column agent panel. These UI changes are maintained on the frontend track.

## 4. Ideas and Concepts Implemented

The handoff engine combines stage weights with job and step status. The failure translator uses regex rules to turn common build or test errors into a short diagnosis and suggested fix. The Git service checks the target branch and limits a commit to the submitted paths.

| Pipeline progress | Role | Work |
| --- | --- | --- |
| 0–25% | Dev | Checkout and installation |
| 25–50% | CI Team | Build |
| 50–80% | QA Testing Team | Tests |
| 80–100% | CD Release Team | Docker and deployment verification |

For example, 45% overall means the build is 80% through its own range and can alert QA. Alerts are exposed in the polled API payload and displayed in the dashboard.

## 5. Features Implemented

| Feature | Current behavior |
| --- | --- |
| Projects, KPIs, charts, and run history | The UI reads projects, summaries, and runs from FastAPI. It displays KPI cards, pass-rate and duration charts, and a searchable run table. Some visual details use demo or derived values. |
| Stage tracker and role handoffs | The UI presents Build, Test, Docker, and Deploy. The API maps workflow jobs and steps to role progress and returns a handoff alert when an eligible stage reaches 75% of its own range before completion. |
| Pipeline simulation | Start a 0–100% walkthrough from the dashboard or via `POST /api/pipeline/simulate`. The UI polls progress and displays handoff alerts. |
| Diagnostics and waterfall | Regex-based failure summaries report the stage, likely cause, and suggested fix. The run inspector includes a test summary, waterfall, and log modal. Raw logs and per-test counts can use display fixtures when the API supplies only a diagnosis or run-level data. |
| Deployment history | The API returns timestamped seed records and can record signed GitHub events or CI verification notifications. Filters support 1, 2, or 24 hours, plus all records. |
| Docker status | The API inspects the three DevPulse containers when it can reach a Docker daemon. Default Compose starts without a Docker socket mount. The dashboard currently substitutes health and resource readings when telemetry is missing. Use `docker compose ps` or the detailed API response for verification. |
| Source Control Sync | The drawer reads working-tree status and displays added, modified, and deleted paths. The backend supports repository opening, GitHub HTTPS cloning, and authenticated commit and push. The drawer submits only the checked paths. |
| Authentication and GitHub connection | Login creates a 12-hour bearer session. GitHub public access supports monitoring. A PAT proves account identity and can unlock chat pushes for the verified collaborative repository. |
| Collaborative workspace launcher | Open or initialize allowed folders, clone a GitHub HTTPS repository, or link a publicly verified repository for remote monitoring. Each session has its own role, active workspace, and recent history. |
| Action-executing agent | Chat starts simulations, reads Git and Docker status, diagnoses the latest failure, reports handoffs, and returns navigation actions. Explicitly selected Git files can be committed and pushed using the linked GitHub credential. Optional OpenAI or Gemini tool calling helps interpret less direct read-only requests. |
| Theme and navigation | The React SPA provides light and dark modes, project selection, and dedicated views for runs, tests, errors, and deployments. |

## 6. Development Progress

The integrated dashboard, Compose stack, and four-job workflow have passed end-to-end verification. The API consumes GitHub Actions data, and the UI can fall back to bundled fixtures. Optional integrations such as a signed webhook destination and Docker daemon access depend on local configuration.

v1.5.0 implements and tests the session, workspace, and chat contracts. Sidebar navigation, the launcher, and the right-column chat are frontend integration work. Container metadata requires daemon access. In Compose, chat can report service reachability when daemon inspection is unavailable.

## 7. Folder Structure

```text
cdd_minor/
|-- .github/workflows/ci-cd.yml
|-- docker-compose.yml
|-- README.md
|-- backend/
|   |-- .env.example
|   |-- Dockerfile
|   |-- requirements.txt
|   |-- requirements-dev.txt
|   |-- app/
|   |   |-- main.py                 # FastAPI app and startup
|   |   |-- config.py               # Environment and path defaults
|   |   |-- database.py             # SQLAlchemy engine and sessions
|   |   |-- seed.py                 # Demo runs and deployments
|   |   |-- models/                 # Runs, deployments, user_session.py
|   |   |-- schemas/                # Request validation
|   |   |-- routers/
|   |   |   |-- auth.py
|   |   |   |-- workspaces.py
|   |   |   |-- ai_agent.py
|   |   |   |-- pipeline.py
|   |   |   |-- deployments.py
|   |   |   |-- docker_monitor.py
|   |   |   `-- git_control.py
|   |   `-- services/
|   |       |-- session_service.py
|   |       |-- workspace_service.py
|   |       |-- agent_service.py
|   |       |-- agent_model.py
|   |       |-- github_service.py
|   |       |-- handoff_service.py
|   |       |-- error_analyzer.py
|   |       `-- git_service.py
|   `-- tests/
|       |-- test_api.py
|       `-- test_git_service.py
`-- frontend/
    |-- Dockerfile
    |-- nginx.conf
    |-- package.json
    |-- package-lock.json
    |-- vite.config.js
    |-- tailwind.config.js
    `-- src/
        |-- main.jsx
        |-- App.jsx
        |-- index.css
        |-- context/                # Theme, project, and pipeline state
        |-- services/               # API client and demo fixtures
        |-- components/             # Layout, dashboard, deployments, and Git
        `-- tests/                 # Dashboard component tests
```

## 8. CI/CD Pipeline

[The workflow](.github/workflows/ci-cd.yml) runs on pushes and pull requests. Each job depends on the preceding job.

```text
  build  -->  test  -->  docker  -->  deploy
```

| Job | Checks |
| --- | --- |
| `build` | Sets up Python 3.12 and Node.js 24, installs dependencies, checks Python syntax and imports, and validates Compose configuration. |
| `test` | Runs pytest, then runs Vitest and the Vite production build on branches with a frontend manifest. |
| `docker` | Builds the backend image, smoke-tests its SQLite health endpoint, and builds the frontend image when its Dockerfile is present. |
| `deploy` | Starts an isolated Compose stack, checks PostgreSQL, seeded deployment history, and the Nginx UI/API proxy, then removes the runner's stack. On pushes, it can send a signed notification when the two repository secrets are configured. |

The Deploy job verifies a deployment on the runner. A hosted deployment and notification endpoint require separate infrastructure.

## 9. Setup and Installation

### Option A: Running via Docker Compose (Recommended)

Use Git and Docker with Compose v2.24.0 or newer for the optional `env_file.required` setting. [Docker Compose reference](https://docs.docker.com/compose/how-tos/environment-variables/set-environment-variables/#additional-information-1)

```sh
git clone https://github.com/Shwetankjais/cdd_minorproj.git
cd cdd_minorproj
docker compose up --build --wait
docker compose ps
```

| Service | Access |
| --- | --- |
| React dashboard | [http://localhost:5173](http://localhost:5173/) |
| FastAPI documentation | [http://localhost:8000/docs](http://localhost:8000/docs) |
| API health through Nginx | [http://localhost:5173/api/health](http://localhost:5173/api/health) |
| PostgreSQL | `db:5432` on the Compose network. The database and user are both `devpulse`. The local default password is `devpulse_local`. |

Compose stores PostgreSQL data in the `postgres_data` volume. `docker compose down` stops the stack and keeps that volume. For a shared environment, supply a URL-safe `POSTGRES_PASSWORD` before initializing the volume and configure access controls appropriate to that environment.

### Option B: Running Locally (Development Mode)

#### 1. Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Run backend tests
pytest

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```

With `DATABASE_URL` unset, startup creates and seeds `backend/devpulse.db`. A configured PostgreSQL connection must be reachable at startup. The repository ignores `backend/.venv/` by default. If you use the `backend/venv/` path above, keep it out of Git with a local exclude.

#### 2. Frontend Setup

In a second terminal, use Node.js 24 and run the following from the repository root.

```bash
cd frontend
npm ci
npm test
npm run build
npm run dev -- --port 5173 --strictPort
```

Open [http://localhost:5173](http://localhost:5173/). Stop any Compose services already using ports 5173 or 8000 before starting the local servers.

### Option C: Public deployment with Vercel and Render or Railway

Deploy the API as a standalone Docker service. The hosted service does not need the local Compose file or a host directory mount.

**Render**

1. In Render, create a Blueprint from this repository and select `main`. The root `render.yaml` builds `backend/Dockerfile`, creates a PostgreSQL database, injects its internal connection string, and generates the session encryption secret.
2. Set `DEVPULSE_CORS_ORIGINS` to the exact HTTPS Vercel origin, such as `https://your-project.vercel.app`. Use a comma-separated list for additional approved origins. Apply the Blueprint.
3. Open the API service’s public HTTPS URL and verify that `/api/health` returns `{"status":"ok","database":"postgresql"}`. [Render Blueprint reference](https://render.com/docs/blueprint-spec)

**Railway**

1. Create a project from this GitHub repository. Set the API service’s Root Directory to `/backend` and its Config File Path to `/railway.json` so Railway uses the root manifest with the backend Docker build context.
2. Add a PostgreSQL service. On the API service, set `DATABASE_URL` to a reference such as `${{Postgres.DATABASE_URL}}` (match the actual database service name), set `DEVPULSE_MODE=cloud`, and set `DEVPULSE_CORS_ORIGINS` to the exact Vercel HTTPS origin.
3. Generate a secret with `openssl rand -hex 32` and add it as the API service variable `DEVPULSE_SESSION_ENCRYPTION_KEY`. Keep the same key across deployments that share the database. Generate a public domain under Networking and check `/api/health`. SQLite works for a disposable single-instance test when `DATABASE_URL` is omitted. Its data is lost if the container filesystem is replaced. [Railway config as code](https://docs.railway.com/config-as-code) · [Railway PostgreSQL](https://docs.railway.com/databases/postgresql)

**Vercel**

1. Import the same GitHub repository, set the Root Directory to `frontend`, select Vite, and use `dist` as the output directory.
2. Set `VITE_API_URL` to the Render or Railway public HTTPS URL **including** `/api`. Deploy the frontend, add its exact origin to the API allowlist if needed, and redeploy the API. [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite)
3. Before sharing the link, ensure the frontend collects `github_username`, reads `session_token` from login, and sends `Authorization: Bearer <session_token>` on session, project, pipeline, workspace, and Git requests. Clear the token on logout or `401`. Avoid sending the local demo write token. Disable the native host folder picker in hosted mode and use the server clone and workspace list instead.
4. Sign in as two different GitHub users and confirm each project list matches its own account. A username alone selects public data. A GitHub token verifies account ownership and is required for Git pushes. Keep GitHub tokens and the session encryption key out of Vercel build variables.

The cloud API accepts `github_user` as a public catalog selector when the session has no linked handle. If a session has a linked handle, the selector must match it. GitHub credentials linked to hosted sessions are encrypted in the database. Clones live in disposable server storage scoped to each session, so use one API replica for workspace features. After a restart, reclone as needed. The server blocks host browsing and does not serve local deployment records or Docker details in cloud mode.

## 10. API Reference

| Method and route | Purpose |
| --- | --- |
| `POST /api/auth/login` | Start a session with a name, email, role, and optional GitHub username and PAT. |
| `GET /api/auth/session` | Read the session profile, GitHub verification, and active workspace. |
| `POST /api/auth/connect-github` | Validate a GitHub username and PAT against the collaborative repository. |
| `POST /api/auth/logout` | Revoke the current session. |
| `GET /api/workspaces` | List available and recently opened workspaces. |
| `POST /api/workspaces/open` | Open a server-side folder and activate it. |
| `POST /api/workspaces/clone` | Clone or link a GitHub repository and activate it. |
| `POST /api/agent/chat` | Execute an agent action and return its result and optional navigation target. |
| `GET /api/health` | Check API and database connectivity. |
| `GET /api/projects` | List monitored projects. |
| `GET /api/pipeline/summary` | Return aggregate run counts and recent runs. |
| `GET /api/pipeline/runs` | Return runs and support project, status, and search filters. |
| `GET /api/pipeline/live` | Read stage progress and the current handoff alert. |
| `POST /api/pipeline/simulate` | Start an on-demand simulation. |
| `GET /api/pipeline/error-summary/{run_id}` | Explain an available failure. |
| `GET /api/deployments?hours=2` | Filter deployment history by age. |
| `GET /api/docker/status?format=detail` | Return raw Docker availability and container status. |
| `GET /api/git/status` | List changed paths for the current or requested repository. |
| `POST /api/git/open-or-clone` | Open an allowed repository or clone a GitHub HTTPS URL with authorization. |
| `POST /api/git/commit-push` | Commit explicitly selected paths and attempt a push to the checked-out branch on `origin`. |
| `POST /api/webhooks/github` | Receive signed GitHub events or CI verification notifications. |

API clients send `Authorization: Bearer <session_token>` to the session, workspace, and chat routes after login. The committed browser client uses a same-origin, HttpOnly session cookie through Nginx. Its initial demo profile is local UI state. Sign out and sign in to establish a backend session before testing the workspace and chat requests. Roles are `Developer`, `CI Team`, `QA Testing Team`, and `CD Release Team`. The email and name are self-declared profile fields. A public lookup can report GitHub connectivity without verifying an identity. The session bearer is stored as a hash. A verified PAT is held only in server process memory and must be re-linked after a restart. The existing drawer uses its separate Git write token.

Workspaces are resolved on the API host or inside the container. In Compose, the repository is at `/workspace/project` and cloned repositories go under `/workspace/project/workspace`. The `devops-lab` and `shop-api` entries are templates. Per-session workspace selection does not create separate copies of a shared Git checkout.

Agent commands include `/simulate`, `/status`, `/explain`, `/docker`, `/handoff`, `go to deployments`, and `connect repo <url>`. The agent returns `message`, `action_triggered`, and action-specific data such as `run`, `target_view`, or `commit_sha`. Use `/commit Update docs -- README.md` or provide an explicit `files` array to request a Git write. Chat pushes use the linked PAT for the verified GitHub HTTPS remote and report if the commit was saved locally but rejected remotely. Provider tools can select read-only operations.

FastAPI serves interactive request schemas at [http://localhost:8000/docs](http://localhost:8000/docs).

## 11. Configuration

Start from [backend/.env.example](backend/.env.example) when you need local overrides. Keep tokens and secrets outside Git.

| Setting | Purpose |
| --- | --- |
| `OPENAI_API_KEY`, `GEMINI_API_KEY` | Optional model keys. OpenAI takes precedence when both are configured. Recognized commands run through the deterministic executor. |
| `OPENAI_MODEL`, `GEMINI_MODEL` | Optional model overrides for the configured provider. |
| `DATABASE_URL` | Selects the database. Compose configures PostgreSQL automatically. |
| `GITHUB_TOKEN` | Optional Actions read token. Public repositories can be queried without it. |
| `GITHUB_WEBHOOK_SECRET` | Verifies incoming HMAC signatures. To enable CI delivery, also configure `DEVPULSE_WEBHOOK_URL` and `DEVPULSE_WEBHOOK_SECRET` in GitHub Actions. |
| `GIT_WRITE_TOKEN` | Authorizes Git writes. Enter this value in the drawer's Git write token field. Git identity and remote credentials are separate. |
| `DEVPULSE_REPO`, `DEVPULSE_WORKSPACE` | Set the default repository and permitted workspace. Compose mounts the checkout at `/workspace/project`. |
| `VITE_API_URL` | Overrides the frontend API base URL at build time or in local Vite development. |

For Git writes with the local backend, configure the host Git identity and authenticate to the repository's `origin`. For containerized writes, give the backend container a Git identity and a credential helper or equivalent credentials scoped to the intended remote. The bind mount provides repository files and Git metadata.

## 12. Demo and Troubleshooting

1. Open **Source Control Sync** and refresh. Confirm the current branch and look for `README.md`.
2. Enter the backend's Git write token. Select only **README.md** and enter a commit message.
3. Click **1-Click Commit & Push**. Check the reported SHA, committed file list, and **Pushed** value. A push rejection leaves the commit locally and shows the Git diagnostic.
4. Verify the SHA on the remote branch. Check `git status --short` for changes you left unselected.

For a CI walkthrough, trigger a simulation and watch the role handoff progress. For actual service health, use `docker compose ps` and `/api/docker/status?format=detail`. Short deployment filters can be empty after seeded records age out of the selected window.

## 13. Project Changelog

| Milestone | Changes |
| --- | --- |
| Backend and DevOps | Added the FastAPI API, GitHub Actions integration, database seeds, Git operations, Compose services, and CI workflow. |
| Dashboard integration | Joined the React dashboard and FastAPI stack, fixed Nginx port mapping, and verified the four CI jobs with both application tiers. |
| Selective Git writes | Added explicit file selection, bearer-token entry, and real commit and push results in the Git drawer. |
| v1.5.0 | Added bearer sessions, verified GitHub linking, role-aware workspace state, and a chat executor with optional provider tool calling. |
| Cloud deployment preparation | Scoped GitHub catalogs, pipeline simulations, and clone directories to hosted sessions. Added encrypted GitHub credentials, an origin allowlist, and Render and Railway manifests. |
