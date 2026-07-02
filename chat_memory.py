# chat_memory.py
# -------------------------------------------------
# Tiny SQLite‑based memory layer for the AI Dermatologist
# -------------------------------------------------
import sqlite3
import time
from pathlib import Path

# ------------------------------------------------------------------
# Path where the DB will live – keep it inside the `data/` folder
# ------------------------------------------------------------------
DB_PATH = Path("data/chat.db")
DB_PATH.parent.mkdir(parents=True, exist_ok=True)   # ensure `data/` exists


def init_db() -> None:
    """Create the `messages` table if it does not exist."""
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS messages (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id  TEXT NOT NULL,
                role        TEXT NOT NULL,          -- 'user' or 'assistant'
                content     TEXT NOT NULL,
                created_at  REAL NOT NULL
            );
            """
        )


def add_message(session_id: str, role: str, content: str) -> None:
    """
    Persist a single chat turn.
    :param session_id: unique identifier for the conversation
    :param role:       "user" or "assistant"
    :param content:    raw text of the message
    """
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            INSERT INTO messages (session_id, role, content, created_at)
            VALUES (?,?,?,?);
            """,
            (session_id, role, content, time.time()),
        )


def get_history(session_id: str, limit: int = 10) -> list[dict]:
    """
    Return the last `limit` messages for a session, ordered oldest → newest.
    Each entry is a dict: {"role": "...", "content": "..."}.
    """
    with sqlite3.connect(DB_PATH) as conn:
        rows = conn.execute(
            """
            SELECT role, content
            FROM messages
            WHERE session_id = ?
            ORDER BY id DESC
            LIMIT ?;
            """,
            (session_id, limit),
        ).fetchall()

    # Reverse so the list is chronological (oldest first)
    rows.reverse()
    return [{"role": r, "content": c} for r, c in rows]
