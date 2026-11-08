from contextlib import contextmanager

from fastapi import Request
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session

from .config import DATABASE_URL


class Base(DeclarativeBase):
    pass


def make_engine(url):
    if url.startswith(("postgres://", "postgresql://")):
        url = "postgresql+psycopg://" + url.split("://", 1)[1]
    return create_engine(url, pool_pre_ping=True)


@contextmanager
def session_scope(engine):
    with Session(engine) as session, session.begin():
        yield session


def get_db(request: Request):
    with session_scope(request.app.state.engine) as session:
        yield session
