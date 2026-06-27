import logging
import threading
import hashlib
import json
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from fastapi import HTTPException
from sqlalchemy import create_engine, pool
from sqlalchemy.orm import declarative_base, sessionmaker
from langchain_community.utilities import SQLDatabase

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# SQLite Setup
# ---------------------------------------------------------------------------
SQLITE_DB_FILE = "users.db"

engine = create_engine(
    f"sqlite:///{SQLITE_DB_FILE}",
    echo=False,
    pool_pre_ping=True,
    connect_args={"check_same_thread": False},
)

Base = declarative_base()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Connection Pool Manager
# ---------------------------------------------------------------------------
class DatabaseConnectionPool:
    """Thread-safe pool of SQLAlchemy engines and LangChain SQLDatabase objects."""

    def __init__(self) -> None:
        self._lock = threading.RLock()
        self._engines: Dict[str, Any] = {}
        self._sql_dbs: Dict[str, SQLDatabase] = {}
        self._db_types: Dict[str, str] = {}

    def get_engine(self, uri: str, db_type: str = "") -> Any:
        with self._lock:
            if uri not in self._engines:
                logger.info("Creating connection pool for %s", db_type or "unknown")
                self._engines[uri] = create_engine(
                    uri,
                    poolclass=pool.QueuePool,
                    pool_size=10,
                    max_overflow=20,
                    pool_timeout=30,
                    pool_recycle=3600,
                    pool_pre_ping=True,
                    echo=False,
                )
                if db_type:
                    self._db_types[uri] = db_type
            return self._engines[uri]

    def get_sql_db(self, uri: str, db_type: str = "") -> SQLDatabase:
        with self._lock:
            if uri not in self._sql_dbs:
                engine = self.get_engine(uri, db_type)
                self._sql_dbs[uri] = SQLDatabase(engine)
            return self._sql_dbs[uri]

    def get_db_type(self, uri: str) -> str:
        return self._db_types.get(uri, "")

    def clear(self, uri: str) -> None:
        with self._lock:
            if uri in self._engines:
                self._engines[uri].dispose()
                del self._engines[uri]
            self._sql_dbs.pop(uri, None)
            self._db_types.pop(uri, None)

    def clear_all(self) -> None:
        for uri in list(self._engines.keys()):
            self.clear(uri)


db_pool = DatabaseConnectionPool()


# ---------------------------------------------------------------------------
# Schema cache (TTL-based)
# ---------------------------------------------------------------------------
class SchemaCache:
    def __init__(self, ttl_minutes: int = 30) -> None:
        self._lock = threading.Lock()
        self._cache: Dict[str, str] = {}
        self._timestamps: Dict[str, datetime] = {}
        self._ttl = timedelta(minutes=ttl_minutes)

    def get(self, uri: str, sql_db: SQLDatabase) -> str:
        with self._lock:
            now = datetime.now(timezone.utc)
            ts = self._timestamps.get(uri)
            if ts and (now - ts) < self._ttl:
                logger.debug("Schema cache hit")
                return self._cache[uri]
            logger.info("Fetching fresh schema for %s", uri)
            schema = sql_db.get_table_info()
            self._cache[uri] = schema
            self._timestamps[uri] = now
            return schema

    def invalidate(self, uri: str) -> None:
        with self._lock:
            self._cache.pop(uri, None)
            self._timestamps.pop(uri, None)

    def clear_all(self) -> None:
        with self._lock:
            self._cache.clear()
            self._timestamps.clear()


schema_cache = SchemaCache()


# ---------------------------------------------------------------------------
# Query Cache
# ---------------------------------------------------------------------------
class QueryCache:
    def __init__(self, max_size: int = 100) -> None:
        self._lock = threading.Lock()
        self._cache: Dict[str, str] = {}
        self._max_size = max_size

    def _make_key(self, question: str, uri: str, history: List) -> Optional[str]:
        if len(history) > 4:
            return None
        history_str = json.dumps([m.content for m in history[-4:]])
        raw = f"{question}|{uri}|{history_str}"
        return hashlib.md5(raw.encode()).hexdigest()

    def get(self, question: str, uri: str, history: List) -> Optional[str]:
        key = self._make_key(question, uri, history)
        if not key:
            return None
        with self._lock:
            return self._cache.get(key)

    def set(self, question: str, uri: str, history: List, result: str) -> None:
        key = self._make_key(question, uri, history)
        if not key:
            return
        with self._lock:
            if len(self._cache) >= self._max_size:
                oldest = next(iter(self._cache))
                del self._cache[oldest]
            self._cache[key] = result

    def clear(self) -> None:
        with self._lock:
            self._cache.clear()


query_cache = QueryCache(max_size=100)


# ---------------------------------------------------------------------------
# Per-request/session global state
# ---------------------------------------------------------------------------
class AppState:
    db_uri: Optional[str] = None
    db_name: Optional[str] = None
    db_type: Optional[str] = None


app_state = AppState()


def require_db_connection():
    if not app_state.db_uri:
        raise HTTPException(status_code=400, detail="No database connected")
    return app_state
