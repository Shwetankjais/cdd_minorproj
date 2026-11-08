from typing import Annotated

from pydantic import BaseModel, Field, StringConstraints

ProjectName = Annotated[
    str, StringConstraints(pattern=r"^[A-Za-z0-9][A-Za-z0-9-]{0,38}/[A-Za-z0-9_-][A-Za-z0-9._-]{0,99}$")
]


class SimulationRequest(BaseModel):
    project: ProjectName | None = None
    interval_seconds: float = Field(default=1.5, ge=0.1, le=30)


class OpenRepository(BaseModel):
    path: str | None = None
    repo_url: str | None = None


class CommitRequest(BaseModel):
    path: str | None = None
    files: list[str] = Field(min_length=1, max_length=200)
    message: str = Field(min_length=1, max_length=500)
    branch: str | None = None
