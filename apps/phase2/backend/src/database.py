"""
Database configuration module.
T010: Create database engine and session factory using SQLModel with PostgreSQL.
"""
from sqlmodel import create_engine, Session, SQLModel
from typing import Generator
from config import settings


# Create engine with connection pooling
# Note: SQLite specific settings for local development
engine_args = {
    "echo": True,  # Log SQL queries in development
}

# Add PostgreSQL-specific settings if using PostgreSQL
if "postgresql" in settings.database_url:
    engine_args.update({
        "pool_pre_ping": True,
        "pool_size": 10,
        "max_overflow": 20
    })
elif "sqlite" in settings.database_url:
    # SQLite specific settings
    engine_args["connect_args"] = {"check_same_thread": False}

engine = create_engine(settings.database_url, **engine_args)


def get_session() -> Generator[Session, None, None]:
    """
    Dependency for getting database session.
    Yields a session and ensures it's closed after use.
    """
    with Session(engine) as session:
        yield session


def init_db() -> None:
    """
    Initialize database tables.
    Creates all tables defined in SQLModel models.
    """
    SQLModel.metadata.create_all(engine)
