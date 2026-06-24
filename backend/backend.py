"""
Query Genie – FastAPI Backend
Fixed version: all known bugs resolved, code quality improved.
Modularized entry point.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from sqlalchemy import text

from config import validate_environment
from database import Base, engine, db_pool, schema_cache, query_cache
from limiter import limiter
import models  # Ensures all ORM models are imported before metadata setup
from routes import auth, db, chat, profile, misc

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(name)s | %(message)s")
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# App Lifespan
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup tasks
    validate_environment()

    # Create SQLite tables if they do not exist
    Base.metadata.create_all(bind=engine)

    # Ensure is_starred column exists (migration guard for sqlite schema changes)
    try:
        with engine.connect() as conn:
            result = conn.execute(
                text("SELECT name FROM pragma_table_info('chat_sessions') WHERE name='is_starred'")
            )
            if not result.fetchone():
                conn.execute(text("ALTER TABLE chat_sessions ADD COLUMN is_starred INTEGER DEFAULT 0"))
                conn.commit()
                logger.info("Added is_starred column")
    except Exception as exc:
        logger.warning("Migration check warning: %s", exc)

    logger.info("Query Genie started")
    yield

    # Shutdown tasks
    db_pool.clear_all()
    schema_cache.clear_all()
    query_cache.clear()
    logger.info("Query Genie shutdown complete")


# ---------------------------------------------------------------------------
# FastAPI App Initialization
# ---------------------------------------------------------------------------
app = FastAPI(lifespan=lifespan)
app.state.limiter = limiter


# ---------------------------------------------------------------------------
# Global Exception Handlers
# ---------------------------------------------------------------------------
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={
            "success": False,
            "error": "Rate Limit Exceeded",
            "message": "Too many requests. Please try again later.",
            "retry_after": 60,
        },
        headers={"Retry-After": "60"},
    )


# ---------------------------------------------------------------------------
# Middleware Configuration
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://localhost:8081",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:8081",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Router Registration
# ---------------------------------------------------------------------------
app.include_router(misc.router)
app.include_router(auth.router)
app.include_router(db.router)
app.include_router(chat.router)
app.include_router(profile.router)


# ---------------------------------------------------------------------------
# Direct Run Entry Point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend:app", host="0.0.0.0", port=8000, reload=True)