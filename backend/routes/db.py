import logging

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import create_engine, inspect, pool, text
from sqlalchemy.exc import OperationalError, ProgrammingError

from database import app_state, db_pool, query_cache, require_db_connection, schema_cache
from limiter import limiter
from schemas import DBCredentials, DBCreate, DBSelection
from sql_utils import (
    DatabaseType,
    build_db_uri,
    get_create_database_sql,
    get_list_databases_query,
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/api/list-databases")
@limiter.limit("20/minute")
async def list_databases(request: Request, creds: DBCredentials):
    uri = build_db_uri(creds.host, creds.port, creds.user, creds.password, creds.db_type)
    try:
        tmp = create_engine(uri, poolclass=pool.NullPool)
        sql, system_dbs = get_list_databases_query(creds.db_type)
        with tmp.connect() as conn:
            rows = conn.execute(text(sql)).fetchall()
        tmp.dispose()
        dbs = [r[0] for r in rows if r[0] not in system_dbs]
        return {"success": True, "databases": dbs, "db_type": creds.db_type}
    except OperationalError as exc:
        msg = str(exc)
        if "Access denied" in msg or "authentication failed" in msg.lower():
            raise HTTPException(401, detail={"error": "Authentication Failed", "message": msg})
        if "Connection refused" in msg or "could not connect" in msg.lower():
            raise HTTPException(503, detail={"error": "Connection Refused", "message": msg})
        raise HTTPException(500, detail={"error": "Connection Error", "message": msg})
    except Exception as exc:
        raise HTTPException(500, detail={"error": "Unknown Error", "message": str(exc)})


@router.post("/api/create-database")
@limiter.limit("10/hour")
async def create_database(request: Request, config: DBCreate):
    """DBCreate.database_name is validated by the Pydantic model itself."""
    uri = build_db_uri(config.host, config.port, config.user, config.password, config.db_type)
    try:
        tmp = create_engine(uri, poolclass=pool.NullPool)
        sql, system_dbs = get_list_databases_query(config.db_type)
        create_sql = get_create_database_sql(config.db_type, config.database_name)

        with tmp.connect() as conn:
            existing = [r[0] for r in conn.execute(text(sql)).fetchall()]
            if config.database_name in existing:
                raise HTTPException(409, detail={"error": "Database Already Exists"})
            if config.db_type == DatabaseType.POSTGRESQL:
                conn.execute(text("COMMIT"))
            conn.execute(text(create_sql))
            if config.db_type != DatabaseType.POSTGRESQL:
                conn.commit()
        tmp.dispose()
        return {"success": True, "database_name": config.database_name}
    except HTTPException:
        raise
    except OperationalError as exc:
        msg = str(exc)
        code = 403 if ("Access denied" in msg or "permission denied" in msg.lower()) else 500
        raise HTTPException(code, detail={"error": "DB Creation Failed", "message": msg})
    except Exception as exc:
        raise HTTPException(500, detail={"error": "Unknown Error", "message": str(exc)})


@router.post("/api/connect")
@limiter.limit("20/minute")
async def connect_db(request: Request, config: DBSelection):
    uri = build_db_uri(config.host, config.port, config.user, config.password, config.db_type, config.database)
    try:
        eng = db_pool.get_engine(uri, config.db_type)
        with eng.connect() as conn:
            conn.execute(text("SELECT 1"))

        sql_db = db_pool.get_sql_db(uri, config.db_type)
        schema_cache.get(uri, sql_db)  # pre-warm

        app_state.db_uri = uri
        app_state.db_name = config.database
        app_state.db_type = config.db_type

        logger.info("Connected to %s database: %s", config.db_type, config.database)
        return {"success": True, "database": config.database, "db_type": config.db_type}
    except ProgrammingError as exc:
        msg = str(exc)
        code = 404 if "does not exist" in msg.lower() or "Unknown database" in msg else 400
        raise HTTPException(code, detail={"error": "DB Error", "message": msg})
    except OperationalError as exc:
        msg = str(exc)
        if "Access denied" in msg or "authentication failed" in msg.lower():
            raise HTTPException(401, detail={"error": "Authentication Failed", "message": msg})
        raise HTTPException(503, detail={"error": "Connection Refused", "message": msg})
    except Exception as exc:
        raise HTTPException(500, detail={"error": "Unknown Error", "message": str(exc)})


@router.post("/api/disconnect")
async def disconnect_db():
    if not app_state.db_uri:
        return {"success": False, "message": "No database connected"}
    db_pool.clear(app_state.db_uri)
    schema_cache.invalidate(app_state.db_uri)
    query_cache.clear()
    app_state.db_uri = None
    app_state.db_name = None
    app_state.db_type = None
    return {"success": True, "message": "Disconnected"}


@router.get("/api/tables")
@limiter.limit("30/minute")
async def get_all_tables(request: Request, state=Depends(require_db_connection)):
    try:
        eng = db_pool.get_engine(state.db_uri)
        if state.db_type == DatabaseType.POSTGRESQL:
            with eng.connect() as conn:
                rows = conn.execute(text(
                    "SELECT tablename FROM pg_catalog.pg_tables "
                    "WHERE schemaname NOT IN ('pg_catalog','information_schema') "
                    "ORDER BY tablename"
                )).fetchall()
            tables = [r[0] for r in rows]
        else:
            tables = inspect(eng).get_table_names()
        return {"success": True, "tables": tables, "count": len(tables), "database": state.db_name}
    except Exception as exc:
        raise HTTPException(500, detail=str(exc))


@router.get("/api/table-schema/{table_name}")
@limiter.limit("30/minute")
async def get_table_schema(request: Request, table_name: str, state=Depends(require_db_connection)):
    try:
        eng = db_pool.get_engine(state.db_uri)
        insp = inspect(eng)
        if table_name not in insp.get_table_names():
            raise HTTPException(404, detail=f"Table '{table_name}' not found")

        pk = (insp.get_pk_constraint(table_name) or {}).get("constrained_columns", [])
        fks = [c for fk in insp.get_foreign_keys(table_name) for c in fk.get("constrained_columns", [])]
        uniq = [c for uc in insp.get_unique_constraints(table_name) for c in uc.get("column_names", [])]

        cols = []
        for col in insp.get_columns(table_name):
            name = col["name"]
            key = "PRI" if name in pk else ("MUL" if name in fks else ("UNI" if name in uniq else None))
            cols.append({
                "name": name,
                "type": str(col["type"]),
                "nullable": col.get("nullable", True),
                "key": key,
                "default": str(col["default"]) if col.get("default") is not None else None,
                "autoincrement": col.get("autoincrement", False),
            })
        return {"success": True, "table_name": table_name, "columns": cols}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(500, detail=str(exc))
