"""
Todo model.
T012: Todo model with id, user_id, title, description, completed, created_at, updated_at.
"""
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, ForeignKey
from typing import Optional
from datetime import datetime
from uuid import UUID, uuid4
import sqlalchemy.sql.sqltypes as sqltypes


class Todo(SQLModel, table=True):
    """
    Todo entity representing a task item owned by a user.

    Relationships:
    - Many-to-one with User (via user_id foreign key)

    Indexes:
    - Index on user_id for efficient query filtering

    Constraints:
    - ON DELETE CASCADE for user_id foreign key
    - Title required, max 500 chars
    - Description optional, max 5000 chars
    """
    __tablename__ = "todos"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(
        sa_column=Column(
            "user_id",
            ForeignKey("users.id", ondelete="CASCADE"),
            index=True
        )
    )
    title: str = Field(min_length=1, max_length=500)
    description: Optional[str] = Field(default=None, max_length=5000)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Buy groceries",
                "description": "Milk, eggs, bread",
                "completed": False,
                "created_at": "2026-01-01T00:00:00Z",
                "updated_at": "2026-01-01T00:00:00Z"
            }
        }
