"""Persist session metadata without storing bearer tokens or GitHub credentials."""
from datetime import datetime

from sqlalchemy import JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


class UserSession(Base):
    __tablename__ = "user_sessions"

    token_hash: Mapped[str] = mapped_column(String(64), primary_key=True)
    expires_at: Mapped[datetime] = mapped_column(index=True)
    profile: Mapped[dict] = mapped_column(JSON)
    github: Mapped[dict] = mapped_column(JSON)
    workspace: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    recent_workspaces: Mapped[list] = mapped_column(JSON, default=list)
