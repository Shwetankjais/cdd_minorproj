from datetime import datetime, timezone

from sqlalchemy import JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


def utc_now():
    # Store UTC consistently across SQLite and PostgreSQL.
    return datetime.now(timezone.utc).replace(tzinfo=None)


def iso_utc(value):
    return value.isoformat() + "Z"


class PipelineRun(Base):
    __tablename__ = "pipeline_runs"

    id: Mapped[str] = mapped_column(String(120), primary_key=True)
    project: Mapped[str] = mapped_column(String(205), index=True)
    source: Mapped[str] = mapped_column(String(20))
    created_at: Mapped[datetime] = mapped_column(index=True)
    payload: Mapped[dict] = mapped_column(JSON)


class Deployment(Base):
    __tablename__ = "deployments"

    id: Mapped[str] = mapped_column(String(240), primary_key=True)
    project: Mapped[str] = mapped_column(String(205))
    created_at: Mapped[datetime] = mapped_column(index=True)
    payload: Mapped[dict] = mapped_column(JSON)
