# ─────────────────────────────────────────────────────────────────────────────
# database.py — SQLite database connection setup using SQLAlchemy
# ─────────────────────────────────────────────────────────────────────────────

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite database file path (created automatically on first run)
SQLALCHEMY_DATABASE_URL = "sqlite:///./nextdegree.db"

# Create the SQLAlchemy engine
# check_same_thread=False is required for SQLite to work with FastAPI
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# SessionLocal is used to create individual database sessions per request
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class that all ORM models will inherit from
Base = declarative_base()


# ── Dependency — yields a DB session and closes it after each request ────────
def get_db():
    """
    FastAPI dependency that provides a database session.
    Automatically closes the session when the request is done.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
