"""
Database configuration module.
T010: Create database engine and session factory using SQLModel with PostgreSQL.
"""
from sqlmodel import create_engine, Session, SQLModel, select
from typing import Generator, Optional, List
from datetime import datetime
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


# ---------------------------------------------------------------------------
# Conversation / Message / Task helpers (used by chat API & MCP tools)
# ---------------------------------------------------------------------------
from models.conversation import Conversation
from models.message import Message, MessageRole
from models.task import Task


def get_or_create_conversation(
    session: Session,
    conversation_id: Optional[int],
    user_id: str,
) -> Conversation:
    """Return an existing conversation (owned by user_id) or create a new one."""
    if conversation_id is not None:
        conversation = session.exec(
            select(Conversation).where(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id,
            )
        ).first()
        if conversation:
            return conversation
    # Create new conversation
    conversation = Conversation(user_id=user_id)
    session.add(conversation)
    session.commit()
    session.refresh(conversation)
    return conversation


def get_conversation_messages(
    session: Session,
    conversation_id: int,
    user_id: str,
) -> List[Message]:
    """Return all messages for a conversation owned by user_id, ordered by created_at."""
    return list(
        session.exec(
            select(Message)
            .where(
                Message.conversation_id == conversation_id,
                Message.user_id == user_id,
            )
            .order_by(Message.created_at)
        ).all()
    )


def create_message(
    session: Session,
    conversation_id: int,
    user_id: str,
    role: MessageRole,
    content: str,
) -> Message:
    """Persist a new message."""
    msg = Message(
        conversation_id=conversation_id,
        user_id=user_id,
        role=role,
        content=content,
    )
    session.add(msg)
    session.commit()
    session.refresh(msg)
    return msg


def create_task(
    session: Session,
    user_id: str,
    title: str,
    description: Optional[str] = None,
) -> Task:
    """Create a new task for the given user."""
    task = Task(user_id=user_id, title=title, description=description)
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


def get_tasks_by_user(
    session: Session,
    user_id: str,
    status: Optional[str] = None,
) -> List[Task]:
    """Return tasks for user_id, optionally filtered by 'pending' or 'completed'."""
    stmt = select(Task).where(Task.user_id == user_id)
    if status == "pending":
        stmt = stmt.where(Task.completed == False)
    elif status == "completed":
        stmt = stmt.where(Task.completed == True)
    stmt = stmt.order_by(Task.created_at.desc())
    return list(session.exec(stmt).all())


def update_task(
    session: Session,
    task_id: int,
    user_id: str,
    completed: Optional[bool] = None,
    title: Optional[str] = None,
    description: Optional[str] = None,
) -> Optional[Task]:
    """Update fields on a task owned by user_id. Returns None if not found."""
    task = session.exec(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    ).first()
    if not task:
        return None
    if completed is not None:
        task.completed = completed
    if title is not None:
        task.title = title
    if description is not None:
        task.description = description
    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


def delete_task(
    session: Session,
    task_id: int,
    user_id: str,
) -> Optional[Task]:
    """Delete a task owned by user_id. Returns a detached copy (with id/title) or None."""
    task = session.exec(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    ).first()
    if not task:
        return None
    # Capture data before deletion
    deleted = Task(id=task.id, user_id=task.user_id, title=task.title,
                   description=task.description, completed=task.completed,
                   created_at=task.created_at, updated_at=task.updated_at)
    session.delete(task)
    session.commit()
    return deleted
