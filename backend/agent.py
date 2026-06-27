import ast
import json
import logging
import re
from typing import List

from langchain_community.utilities import SQLDatabase
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_groq import ChatGroq

from config import GROQ_API_KEY
from database import query_cache
from sql_utils import (
    DatabaseType,
    detect_dangerous_sql,
    get_columns_from_query,
    parse_pg_result,
    sanitize_sql,
    sql_to_table_preview,
)

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# LangChain SQL Chain Builder
# ---------------------------------------------------------------------------
def build_sql_chain(schema: str, db_type: str):
    if db_type == DatabaseType.POSTGRESQL:
        template = """You are a PostgreSQL expert. Return ONLY the SQL query – no markdown, no explanation.

Rules:
- Use double-quoted identifiers ("table_name")
- End with a semicolon

Schema: {schema}
History: {chat_history}
Question: {question}

SQL:"""
    else:
        template = """You are a MySQL expert. Return ONLY the SQL query – no markdown, no explanation.

Rules:
- Use backtick identifiers (`table_name`)
- End with a semicolon

Schema: {schema}
History: {chat_history}
Question: {question}

SQL:"""

    prompt = ChatPromptTemplate.from_template(template)
    llm = ChatGroq(api_key=GROQ_API_KEY, model="llama-3.1-8b-instant", temperature=0)

    return (
        RunnablePassthrough.assign(schema=lambda _: schema)
        | prompt
        | llm
        | StrOutputParser()
    )


# ---------------------------------------------------------------------------
# Main Query Generation & Execution Handler
# ---------------------------------------------------------------------------
def run_query(
    question: str,
    sql_db: SQLDatabase,
    history: List,
    uri: str,
    schema: str,
    db_type: str,
) -> str:
    """Generate SQL, execute it, and return a structured JSON string."""

    # Cache hit
    cached = query_cache.get(question, uri, history)
    if cached:
        return cached

    chain = build_sql_chain(schema, db_type)
    formatted_history = "\n".join(
        f"{'Human' if isinstance(m, HumanMessage) else 'AI'}: {m.content}"
        for m in history[-6:]
    )

    sql_query = "N/A"
    try:
        raw_response = chain.invoke({"question": question, "chat_history": formatted_history})

        # Strip accidental markdown fences
        sql_query = re.sub(r"^```sql\s*", "", raw_response.strip(), flags=re.IGNORECASE)
        sql_query = re.sub(r"\s*```$", "", sql_query).strip()

        # Keep only the first statement
        if sql_query.count(";") > 1:
            sql_query = sql_query.split(";")[0] + ";"

        sql_query = sanitize_sql(sql_query)
        logger.info("Generated SQL: %s", sql_query)

        dangers = detect_dangerous_sql(sql_query)
        if dangers:
            return json.dumps({
                "type": "confirmation_required",
                "sql": sql_query,
                "table": sql_to_table_preview(sql_query),
                "warnings": dangers,
            })

        raw_result = sql_db.run(sql_query)
        logger.debug("Raw DB result: %s", raw_result)

        is_read = sql_query.upper().startswith("SELECT") or "SHOW" in sql_query.upper()

        if is_read:
            columns = get_columns_from_query(uri, sql_query)
            clean = raw_result.strip()

            if not clean or clean == "[]" or "Empty set" in clean:
                output = {"type": "select", "data": [], "columns": columns, "row_count": 0}
            elif clean.startswith("[") and clean.endswith("]"):
                if db_type == DatabaseType.POSTGRESQL:
                    rows_raw = parse_pg_result(clean)
                else:
                    # MySQL: handle Decimal objects from repr strings
                    cleaned = re.sub(r"Decimal\('([^']+)'\)", r"'\1'", clean)
                    try:
                        rows_raw = ast.literal_eval(cleaned)
                    except Exception:
                        rows_raw = []

                def cell_to_str(c) -> str:
                    if c is None:
                        return ""
                    if isinstance(c, bytes):
                        return c.decode("utf-8", errors="replace")
                    return str(c)

                if rows_raw and isinstance(rows_raw[0], (tuple, list)):
                    data = [[cell_to_str(c) for c in row] for row in rows_raw]
                else:
                    data = [[cell_to_str(item)] for item in rows_raw]

                if data and not columns:
                    columns = [f"column_{i}" for i in range(len(data[0]))]

                output = {"type": "select", "data": data, "columns": columns, "row_count": len(data)}
            else:
                output = {"type": "error", "message": f"Unexpected format: {clean[:200]}"}
        else:
            # DML / DDL
            clean = raw_result.strip()
            m = re.search(r"(\d+)\s+rows?\s+affected", clean, re.IGNORECASE)
            affected = int(m.group(1)) if m else 0
            output = {
                "type": "status",
                "message": f"Executed successfully. {affected} row(s) affected.",
                "affected_rows": affected,
            }

        final = f"SQL: `{sql_query}`\nOutput: {json.dumps(output)}"
        query_cache.set(question, uri, history, final)
        return final

    except Exception as exc:
        logger.error("Query execution error: %s", exc)
        output = {"type": "error", "message": str(exc)}
        return f"SQL: `{sql_query}`\nOutput: {json.dumps(output)}"
