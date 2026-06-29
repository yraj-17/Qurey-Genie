import json
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from langchain_core.messages import AIMessage, HumanMessage

from agent import run_query
from database import (
    db_pool,
    get_db,
    query_cache,
    require_db_connection,
    schema_cache,
)
from limiter import limiter
from models import ChatSession
from schemas import (
    ChatRequest,
    ConfirmSQLRequest,
    CreateSessionRequest,
    RenameSessionRequest,
    StarSessionRequest,
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/api/chat")
@limiter.limit("30/minute")
async def chat_endpoint(request: Request, body: ChatRequest, state=Depends(require_db_connection)):
    history = [
        AIMessage(content=m["content"]) if m["role"] == "ai" else HumanMessage(content=m["content"])
        for m in body.chat_history
    ]
    try:
        sql_db = db_pool.get_sql_db(state.db_uri, state.db_type)
        schema = schema_cache.get(state.db_uri, sql_db)
        result = run_query(body.question, sql_db, history, state.db_uri, schema, state.db_type)
        return {"success": True, "response": result}
    except Exception as exc:
        logger.error("Chat error: %s", exc)
        raise HTTPException(500, detail=str(exc))


@router.post("/api/confirm-sql")
@limiter.limit("20/minute")
async def confirm_sql(request: Request, body: ConfirmSQLRequest, state=Depends(require_db_connection)):
    if not body.confirm:
        return {"type": "status", "message": "SQL execution cancelled"}
    try:
        sql_db = db_pool.get_sql_db(state.db_uri, state.db_type)
        result = sql_db.run(body.sql)
        schema_cache.invalidate(state.db_uri)
        query_cache.clear()
        return {"type": "status", "message": f"Executed. Result: {result}"}
    except Exception as exc:
        return {"type": "error", "message": str(exc)}


@router.get("/api/chat-sessions")
@limiter.limit("60/minute")
async def get_chat_sessions(request: Request, user_id: int = Query(...), db: Session = Depends(get_db)):
    sessions = db.query(ChatSession).filter(ChatSession.user_id == user_id).order_by(ChatSession.id.desc()).all()
    return [
        {
            "id": s.id,
            "user_id": s.user_id,
            "title": s.title,
            "messages": json.loads(s.messages),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "isStarred": bool(s.is_starred),
        }
        for s in sessions
    ]


@router.post("/api/chat-sessions", status_code=201)
@limiter.limit("30/minute")
async def create_chat_session(request: Request, body: CreateSessionRequest, db: Session = Depends(get_db)):
    s = ChatSession(
        user_id=body.user_id,
        title=body.title,
        messages=json.dumps(body.messages),
        is_starred=1 if body.isStarred else 0,
    )
    db.add(s)
    db.commit()
    db.refresh(s)
    return {
        "id": s.id,
        "user_id": s.user_id,
        "title": s.title,
        "messages": json.loads(s.messages),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "isStarred": bool(s.is_starred),
    }


@router.put("/api/chat-sessions/{session_id}")
@limiter.limit("60/minute")
async def update_chat_session(
    request: Request, session_id: int, body: dict, db: Session = Depends(get_db)
):
    s = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not s:
        raise HTTPException(404, detail="Session not found")
    if s.user_id != body.get("user_id"):
        raise HTTPException(403, detail="Unauthorized")
    s.title = body.get("title", s.title)
    if "messages" in body:
        s.messages = json.dumps(body["messages"])
    db.commit()
    return {
        "id": s.id,
        "user_id": s.user_id,
        "title": s.title,
        "messages": json.loads(s.messages),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.delete("/api/chat-sessions/{session_id}")
@limiter.limit("30/minute")
async def delete_chat_session(
    request: Request, session_id: int, user_id: int = Query(...), db: Session = Depends(get_db)
):
    s = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not s:
        return {"success": True, "message": "Session not found or already deleted"}
    if s.user_id != user_id:
        raise HTTPException(403, detail="Unauthorized")
    db.delete(s)
    db.commit()
    return {"success": True, "message": "Session deleted"}


@router.put("/api/chat-sessions/{session_id}/star")
@limiter.limit("30/minute")
async def toggle_star(
    request: Request, session_id: int, body: StarSessionRequest, db: Session = Depends(get_db)
):
    s = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == body.user_id).first()
    if not s:
        raise HTTPException(404, detail="Session not found")
    s.is_starred = 1 if body.is_starred else 0
    db.commit()
    return {"success": True, "is_starred": body.is_starred}


@router.put("/api/chat-sessions/{session_id}/rename")
@limiter.limit("30/minute")
async def rename_session(
    request: Request, session_id: int, body: RenameSessionRequest, db: Session = Depends(get_db)
):
    if not body.title.strip():
        raise HTTPException(400, detail="Title cannot be empty")
    s = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == body.user_id).first()
    if not s:
        raise HTTPException(404, detail="Session not found")
    s.title = body.title.strip()
    db.commit()
    return {"success": True, "title": s.title}
