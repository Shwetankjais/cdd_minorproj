import os
from pathlib import Path

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
