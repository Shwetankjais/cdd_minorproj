import os
from pathlib import Path
from urllib.parse import urlsplit

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BACKEND_DIR / ".env")

DEFAULT_PROJECT = "Shwetankjais/cdd_minorproj"
PROJECT_ROOT = Path(os.getenv("DEVPULSE_REPO", str(BACKEND_DIR.parent))).resolve()
WORKSPACE = Path(os.getenv("DEVPULSE_WORKSPACE", str(PROJECT_ROOT / "workspace"))).resolve()
HOST_HOME = Path(os.getenv("DEVPULSE_HOST_HOME", str(Path.home()))).resolve()
DATABASE_URL = os.getenv("DATABASE_URL") or f"sqlite:///{BACKEND_DIR / 'devpulse.db'}"
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
WEBHOOK_SECRET = os.getenv("GITHUB_WEBHOOK_SECRET")
VIVA_GIT_WRITE_TOKEN = "devpulse-viva-token"
GIT_WRITE_TOKEN = os.getenv("GIT_WRITE_TOKEN", VIVA_GIT_WRITE_TOKEN)

CLOUD_MODE = os.getenv("DEVPULSE_MODE", "local") == "cloud" or any(
    os.getenv(name) for name in ("RENDER", "RAILWAY_ENVIRONMENT_ID")
)
CLOUD_WORKSPACE_ROOT = Path("/tmp/workspaces")
CORS_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"]
CORS_VERCEL_ORIGIN = r"https://[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.vercel\.app"
for origin in os.getenv("DEVPULSE_CORS_ORIGINS", "").split(","):
    origin = origin.strip()
    if not origin:
        continue
    if origin == "*" and CLOUD_MODE:
        CORS_ORIGINS.append(origin)
        continue
    url = urlsplit(origin)
    if (url.scheme != "https" or not url.hostname or url.username or "*" in origin
            or url.path or url.query or url.fragment):
        raise ValueError("DEVPULSE_CORS_ORIGINS requires exact HTTPS origins without a path, or '*' in cloud mode.")
    CORS_ORIGINS.append(origin)
SESSION_ENCRYPTION_KEY = os.getenv("DEVPULSE_SESSION_ENCRYPTION_KEY")
