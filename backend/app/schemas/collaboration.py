from typing import Literal

from pydantic import AliasChoices, BaseModel, Field, SecretStr, field_validator, model_validator

from . import ProjectName

TeamRole = Literal["Developer", "CI Team", "QA Testing Team", "CD Release Team"]


class GitHubConnection(BaseModel):
    github_username: str | None = Field(default=None, max_length=39, pattern=r"^[A-Za-z0-9][A-Za-z0-9-]*$")
    github_token: SecretStr | None = None


class Login(GitHubConnection):
    email: str = Field(max_length=254, pattern=r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
    name: str = Field(min_length=1, max_length=120)
    role: TeamRole = "Developer"
    browser_repo: ProjectName | None = Field(default=None, validation_alias="githubRepo")

    @field_validator("role", mode="before")
    @classmethod
    def normalize_role(cls, role):
        return "CI Team" if role == "CI Build Team" else role


class OpenWorkspace(BaseModel):
    path: str = Field(min_length=1, max_length=4096)
    name: str | None = Field(default=None, max_length=120)


class CloneWorkspace(BaseModel):
    repo_url: str = Field(max_length=300)
    branch: str = Field(default="main", min_length=1, max_length=200)
    team_role: TeamRole | None = None


class ChatTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(max_length=2000)


class AgentChat(BaseModel):
    message: str = Field(min_length=1, max_length=4000, validation_alias=AliasChoices("message", "prompt"))
    project: ProjectName | None = None
    workspace_path: str | None = Field(default=None, max_length=4096)
    history: list[ChatTurn] = Field(default_factory=list, max_length=12)
    files: list[str] = Field(default_factory=list, max_length=200)

    @model_validator(mode="before")
    @classmethod
    def browser_context(cls, value):
        if isinstance(value, dict) and "prompt" in value and "project" not in value:
            context = value.get("context")
            project = context.get("project") if isinstance(context, dict) else None
            if isinstance(project, str) and "/" in project:
                return {**value, "project": project}
        return value
