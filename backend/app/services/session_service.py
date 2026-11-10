import base64
import hashlib
import os
import secrets
from collections import OrderedDict
from datetime import timedelta
from threading import Lock
from urllib.parse import urlsplit

import httpx
from cryptography.fernet import Fernet, InvalidToken
from fastapi import Depends, Header, HTTPException, Request
from sqlalchemy.orm import Session

from .. import config
from ..config import DEFAULT_PROJECT
from ..database import get_db
from ..models import iso_utc, utc_now
from ..models.user_session import UserSession


def github_connection(username=None, token=None):
    """A public lookup checks connectivity, while /user proves a PAT owner's identity."""
    headers = {"Accept": "application/vnd.github+json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    try:
        with httpx.Client(base_url="https://api.github.com", timeout=3, headers=headers) as client:
            if token:
                identity = client.get("/user")
                if identity.status_code in {401, 403}:
                    raise HTTPException(401, "GitHub rejected the supplied token.")
                identity.raise_for_status()
                login = identity.json()["login"]
                if username and username.lower() != login.lower():
                    raise HTTPException(422, "The GitHub token belongs to a different username.")
                username = login
            if config.CLOUD_MODE:
                if not username:
                    return {"username": None, "connected": False, "verified": False, "can_push": False}
                account = client.get(f"/users/{username}") if not token else identity
                if account.status_code == 404:
                    raise HTTPException(422, "GitHub username was not found.")
                account.raise_for_status()
                return {"username": account.json()["login"], "connected": True,
                        "verified": bool(token), "can_push": bool(token), "actions_ready": True}
            repo = client.get(f"/repos/{DEFAULT_PROJECT}")
            if repo.status_code in {403, 404} and token:
                raise HTTPException(403, "The GitHub token cannot access the collaborative repository.")
            repo.raise_for_status()
            permissions = repo.json().get("permissions", {})
            try:
                actions_ready = client.get(f"/repos/{DEFAULT_PROJECT}/actions/runs?per_page=1").is_success
            except httpx.HTTPError:
                actions_ready = False
    except (httpx.HTTPError, ValueError, KeyError) as exc:
        if token:
            raise HTTPException(502, "GitHub connectivity could not be verified.") from exc
        return {"username": username, "connected": False, "verified": False, "can_push": False}
    return {"username": username, "connected": True, "verified": bool(token),
            "can_push": bool(token and permissions.get("push")), "project": DEFAULT_PROJECT,
            "actions_ready": actions_ready}


def token_digest(token):
    return hashlib.sha256(token.encode()).hexdigest()


def new_session(db, profile, github, workspace):
    token = secrets.token_urlsafe(32)
    session = UserSession(token_hash=token_digest(token), expires_at=utc_now() + timedelta(hours=12),
                          profile={**profile, "_cloud_session": config.CLOUD_MODE}, github=github,
                          workspace=workspace, recent_workspaces=[])
    db.add(session)
    return token, session


# Cookies are scoped by hostname, not port. Each Compose project needs its own name.
cookie_scope = os.getenv("DEVPULSE_SESSION_COOKIE_SCOPE")
BROWSER_COOKIE = f"devpulse_session_{cookie_scope}" if cookie_scope else "devpulse_session"


def check_browser_origin(request):
    origin = request.headers.get("origin")
    fetch_site = request.headers.get("sec-fetch-site")
    if fetch_site not in (None, "same-origin") or (origin and (
        fetch_site != "same-origin" or urlsplit(origin).hostname != request.url.hostname
    )):
        raise HTTPException(403, "Use the dashboard origin for browser session requests.")


def require_session(request: Request, authorization: str = Header(default=""), db: Session = Depends(get_db)):
    scheme, _, token = authorization.partition(" ")
    if not config.CLOUD_MODE and not authorization and request.cookies.get(BROWSER_COOKIE):
        check_browser_origin(request)
        token = request.cookies[BROWSER_COOKIE]
        scheme = "bearer"
        request.state.browser_session = True
    if scheme.lower() != "bearer" or not token or len(token) > 128:
        raise HTTPException(401, "A DevPulse session bearer token is required.")
    session = db.get(UserSession, token_digest(token))
    if (session is None or session.expires_at <= utc_now()
            or config.CLOUD_MODE and not session.profile.get("_cloud_session")):
        raise HTTPException(401, "The DevPulse session is expired or invalid.")
    return session


def session_payload(session):
    github = {key: value for key, value in session.github.items() if key != "encrypted_token"}
    profile = {key: value for key, value in session.profile.items() if key != "_cloud_session"}
    return {"user": profile, "role": session.profile["role"], "github": github,
            "active_workspace": session.workspace, "expires_at": iso_utc(session.expires_at)}


# Keep PATs in the process that validated them. A restart requires reconnection.

_credentials = OrderedDict()
_credentials_lock = Lock()


def credential_cipher():
    key = config.SESSION_ENCRYPTION_KEY
    if not key or len(key) < 32:
        raise HTTPException(503, "Configure DEVPULSE_SESSION_ENCRYPTION_KEY before linking tokens.")
    return Fernet(base64.urlsafe_b64encode(hashlib.sha256(key.encode()).digest()))


def remember_credential(session, token=None):
    if config.CLOUD_MODE:
        if token:
            encrypted = credential_cipher().encrypt(token.encode()).decode()
            session.github = {**session.github, "encrypted_token": encrypted}
        return
    with _credentials_lock:
        for key, (expires_at, _) in list(_credentials.items()):
            if expires_at <= utc_now():
                del _credentials[key]
        _credentials.pop(session.token_hash, None)
        if token:
            _credentials[session.token_hash] = (session.expires_at, token)
        while len(_credentials) > 256:
            _credentials.popitem(last=False)


def linked_credential(session):
    if config.CLOUD_MODE:
        encrypted = session.github.get("encrypted_token")
        if encrypted:
            try:
                return credential_cipher().decrypt(encrypted.encode()).decode()
            except InvalidToken:
                return None
        return None
    with _credentials_lock:
        entry = _credentials.get(session.token_hash)
        if entry and entry[0] > utc_now():
            return entry[1]
        _credentials.pop(session.token_hash, None)
        return None


def optional_session(request: Request, authorization: str = Header(default=""),
                     db: Session = Depends(get_db)):
    if config.CLOUD_MODE or authorization:
        return require_session(request, authorization, db)
    # Public local dashboard polling may continue after the demo cookie expires.
    token = request.cookies.get(BROWSER_COOKIE)
    if token and len(token) <= 128:
        check_browser_origin(request)
        session = db.get(UserSession, token_digest(token))
        if session and session.expires_at > utc_now():
            return session
    return None


def repository_owner(session, github_user=None):
    linked = session.github.get("username") if session else None
    if linked and github_user and linked.casefold() != github_user.casefold():
        raise HTTPException(403, "This session is scoped to its linked GitHub account.")
    return linked or github_user or (None if config.CLOUD_MODE else DEFAULT_PROJECT.split("/")[0])
