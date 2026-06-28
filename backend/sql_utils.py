import ast
import logging
import re
from typing import Dict, List, Optional, Tuple
from urllib.parse import quote_plus

from sqlalchemy import text
from database import db_pool

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Database-Type Constants & Helpers
# ---------------------------------------------------------------------------
class DatabaseType:
    MYSQL = "mysql"
    POSTGRESQL = "postgresql"

    @staticmethod
    def get_driver(db_type: str) -> str:
        return "postgresql" if db_type == DatabaseType.POSTGRESQL else "mysql+mysqlconnector"


def build_db_uri(host: str, port: int, user: str, password: str, db_type: str, database: str = "") -> str:
    """Build a SQLAlchemy connection URI."""
    encoded_pw = quote_plus(password) if password else ""
    if db_type == DatabaseType.POSTGRESQL:
        db_part = database if database else "postgres"
        return f"postgresql://{user}:{encoded_pw}@{host}:{port}/{db_part}"
    db_part = f"/{database}" if database else ""
    return f"mysql+mysqlconnector://{user}:{encoded_pw}@{host}:{port}{db_part}"


def get_list_databases_query(db_type: str) -> Tuple[str, List[str]]:
    """Return (SQL, system_db_names_to_exclude)."""
    if db_type == DatabaseType.POSTGRESQL:
        return (
            "SELECT datname FROM pg_database WHERE datistemplate = false AND datname != 'postgres'",
            ["postgres", "template0", "template1"],
        )
    return (
        "SHOW DATABASES",
        ["information_schema", "mysql", "performance_schema", "sys"],
    )


def get_create_database_sql(db_type: str, name: str) -> str:
    if db_type == DatabaseType.POSTGRESQL:
        return f'CREATE DATABASE "{name}"'
    return f"CREATE DATABASE `{name}`"


# ---------------------------------------------------------------------------
# SQL Safety & Sanitization
# ---------------------------------------------------------------------------
_DANGEROUS_KEYWORDS = {"DROP", "TRUNCATE", "DELETE", "ALTER", "UPDATE"}
_INJECTION_PATTERNS = [
    r";\s*DROP",
    r"--",
    r"/\*.*?\*/",
    r"UNION\s+SELECT",
    r"OR\s+1\s*=\s*1",
    r"AND\s+1\s*=\s*1",
    r"'\s*OR\s*'",
    r";\s*EXEC",
    r"xp_cmdshell",
]


def detect_dangerous_sql(sql: str) -> List[str]:
    upper = sql.upper()
    dangers: List[str] = [kw for kw in _DANGEROUS_KEYWORDS if kw in upper]
    for pat in _INJECTION_PATTERNS:
        if re.search(pat, sql, re.IGNORECASE | re.DOTALL):
            dangers.append(f"INJECTION_PATTERN:{pat}")
    return dangers


def sanitize_sql(sql: str) -> str:
    sql = re.sub(r"--.*$", "", sql, flags=re.MULTILINE)
    sql = re.sub(r"/\*.*?\*/", "", sql, flags=re.DOTALL)
    return sql.strip()


def sql_to_table_preview(sql: str) -> Dict:
    upper = sql.upper()
    action, table, condition = "UNKNOWN", "-", "-"
    if upper.startswith("DELETE"):
        action = "DELETE"
        m = re.search(r"FROM\s+[`\"]?(\w+)[`\"]?", upper)
        if m:
            table = m.group(1)
    elif upper.startswith("UPDATE"):
        action = "UPDATE"
        m = re.search(r"UPDATE\s+[`\"]?(\w+)[`\"]?", upper)
        if m:
            table = m.group(1)
    elif upper.startswith("DROP"):
        action = "DROP"
        m = re.search(r"DROP\s+TABLE\s+[`\"]?(\w+)[`\"]?", upper)
        if m:
            table = m.group(1)
    w = re.search(r"WHERE\s+(.+)", sql, re.IGNORECASE)
    if w:
        condition = w.group(1)
    return {
        "columns": ["Action", "Table", "Condition", "Impact"],
        "data": [[action, table, condition, "Removes/modifies record(s) permanently"]],
    }


# ---------------------------------------------------------------------------
# Column & Table Detection
# ---------------------------------------------------------------------------
def get_columns_from_query(uri: str, sql: str) -> List[str]:
    """Execute a query and return its column names."""
    try:
        eng = db_pool.get_engine(uri)
        with eng.connect() as conn:
            result = conn.execute(text(sql))
            return list(result.keys())
    except Exception as exc:
        logger.warning("Could not get columns for query: %s", exc)
        return []


def extract_table_name(sql: str) -> Optional[str]:
    for pat in [
        r"FROM\s+[`\"]?(\w+)[`\"]?",
        r"JOIN\s+[`\"]?(\w+)[`\"]?",
        r"INTO\s+[`\"]?(\w+)[`\"]?",
        r"UPDATE\s+[`\"]?(\w+)[`\"]?",
    ]:
        m = re.search(pat, sql, re.IGNORECASE)
        if m:
            return m.group(1)
    return None


# ---------------------------------------------------------------------------
# PostgreSQL Result String Parser
# ---------------------------------------------------------------------------
def parse_pg_result(raw: str) -> List:
    """
    Safely parse a LangChain/SQLAlchemy result string such as
    "[('val',), ('val2',)]" or "[(1, 'text'), (2, 'text')]".
    Falls back gracefully.
    """
    raw = raw.strip()
    if not raw or raw == "[]":
        return []
    try:
        parsed = ast.literal_eval(raw)
        if isinstance(parsed, list):
            return parsed
    except (ValueError, SyntaxError) as exc:
        logger.debug("ast.literal_eval failed (%s); trying regex fallback", exc)

    rows = []
    for row_str in re.findall(r"\([^)]*\)", raw):
        inner = row_str.strip("()")
        values: List = []
        for part in inner.split(","):
            part = part.strip().strip("'\"")
            # Only convert to int/float when the entire value is numeric
            try:
                values.append(int(part))
            except ValueError:
                try:
                    values.append(float(part))
                except ValueError:
                    values.append(part)
        rows.append(tuple(values) if len(values) != 1 else (values[0],))
    return rows
