from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user_session import UserSession
from ..schemas.collaboration import AgentChat
from ..services import agent_service, git_service
from ..services.session_service import require_session

router = APIRouter(prefix="/api/agent", tags=["agent"])


@router.post("/chat")
def chat(body: AgentChat, request: Request, session: UserSession = Depends(require_session),
         db: Session = Depends(get_db)):
    try:
        return agent_service.execute(body, session, request, db)
    except (git_service.GitError, OSError, ValueError) as exc:
        raise HTTPException(409, str(exc)) from exc
