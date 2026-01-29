"""
Task model for Phase III Todo AI Chatbot.

Per spec section 5: Database Models (Authoritative)
"""

from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime


class Task(SQLModel, table=True):
    """
    Task entity representing a todo item owned by a user.

    Fields per spec:
    - id: integer, primary key
    - user_id: string, auth-bound owner
    - title: string, required
    - description: string, optional
    - completed: boolean, default false
    - created_at: datetime, auto
    - updated_at: datetime, auto
    """
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True, nullable=False)
    title: str = Field(min_length=1, max_length=500, nullable=False)
    description: Optional[str] = Field(default=None, max_length=5000)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
