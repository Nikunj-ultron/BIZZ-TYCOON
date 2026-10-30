"""Database initialization module for GASTECT."""
import os
import sqlite3


def init_db():
    """Initialize the SQLite history database and create readings table."""
    db_path = os.path.join(os.path.dirname(__file__), '../database/history.db')
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ppm INTEGER,
        flame INTEGER,
        ldr INTEGER,
        motion INTEGER,
        touch INTEGER,
        battery INTEGER,
        status TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )''')
    conn.commit()
    conn.close()
    print("Database initialized successfully at:", db_path)


if __name__ == '__main__':
    init_db()
