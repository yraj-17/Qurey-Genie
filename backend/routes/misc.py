from datetime import datetime, timezone
from fastapi import APIRouter

from database import app_state, schema_cache, query_cache, db_pool

router = APIRouter()


@router.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database_connected": bool(app_state.db_uri),
        "database_type": app_state.db_type,
    }


@router.get("/api/cache-stats")
async def cache_stats():
    return {
        "schema_cache_size": len(schema_cache._cache),
        "query_cache_size": len(query_cache._cache),
        "connection_pools": len(db_pool._engines),
    }
