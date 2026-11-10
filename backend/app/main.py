from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from . import config
from .config import DATABASE_URL
from .database import Base, make_engine, session_scope
from .routers import ai_agent, auth, deployments, docker_monitor, git_control, pipeline, workspaces
from .seed import seed
from .services.github_service import GitHubService


def create_app(database_url=DATABASE_URL, github=None):
    @asynccontextmanager
    async def lifespan(app):
        app.state.engine = make_engine(database_url)
        app.state.github = github or GitHubService()
        try:
            Base.metadata.create_all(app.state.engine)
            if not config.CLOUD_MODE:
                with session_scope(app.state.engine) as db:
                    seed(db)
            yield
        finally:
            if github is None:
                app.state.github.client.close()
            app.state.engine.dispose()

    app = FastAPI(title="DevPulse API", version="1.5.0", lifespan=lifespan)
    app.add_middleware(CORSMiddleware, allow_origins=config.CORS_ORIGINS, allow_credentials=not config.CLOUD_MODE,
                       allow_methods=["GET", "POST"], allow_headers=["Authorization", "Content-Type"])
    for router in (pipeline.router, deployments.router, git_control.router, docker_monitor.router,
                   auth.router, workspaces.router, ai_agent.router):
        app.include_router(router)

    @app.get("/api/health")
    def health():
        with app.state.engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ok", "database": app.state.engine.dialect.name}

    return app


app = create_app()
