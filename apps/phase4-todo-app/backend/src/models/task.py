"""
Task model for Phase IV Todo AI Chatbot.

Per spec section 5: Database Models (Authoritative)
"""

from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, date
import re


class Task(SQLModel, table=True):
    """
    Task entity representing a todo item owned by a user.

    Fields per spec:
    - id: integer, primary key
    - user_id: string, auth-bound owner
    - title: string, required
    - description: string, optional
    - completed: boolean, default false
    - due_date: date, optional (YYYY-MM-DD)
    - due_time: string, optional (HH:MM, 24h format)
    - created_at: datetime, auto
    - updated_at: datetime, auto
    """
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True, nullable=False)
    title: str = Field(min_length=1, max_length=500, nullable=False)
    description: Optional[str] = Field(default=None, max_length=5000)
    completed: bool = Field(default=False)
    due_date: Optional[date] = Field(default=None)
    due_time: Optional[str] = Field(default=None, max_length=5)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    @staticmethod
    def validate_due_time(value: Optional[str]) -> Optional[str]:
        """Validate due_time is in HH:MM 24-hour format."""
        if value is None:
            return None
        if not re.match(r"^\d{2}:\d{2}$", value):
            raise ValueError("due_time must be in HH:MM format (e.g., '14:30')")
        hours, minutes = int(value[:2]), int(value[3:5])
        if hours > 23 or minutes > 59:
            raise ValueError("due_time must be a valid time (00:00-23:59)")
        return value
