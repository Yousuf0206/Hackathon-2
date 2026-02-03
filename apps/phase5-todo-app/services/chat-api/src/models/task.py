"""
Task model for Phase V Event-Driven Todo AI Platform.

Extended from Phase IV with status enum, reminder_time, and recurrence_rule_id.
Per data-model.md entity definitions.
"""

from sqlmodel import SQLModel, Field
from sqlalchemy import Column, Enum as SAEnum, ForeignKey
from typing import Optional
from datetime import datetime, date
from uuid import UUID
import re
import enum


class TaskStatus(str, enum.Enum):
    """Task status enum per data-model.md state transitions."""
    pending = "pending"
    completed = "completed"
    deleted = "deleted"


class Task(SQLModel, table=True):
    """
    Task entity representing a todo item owned by a user.

    Phase V extensions:
    - status: enum (pending/completed/deleted) replaces boolean completed
    - reminder_time: datetime for scheduling reminders via Dapr Jobs API
    - recurrence_rule_id: FK to RecurrenceRule for recurring task generation
    """
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True, nullable=False)
    title: str = Field(min_length=1, max_length=500, nullable=False)
    description: Optional[str] = Field(default=None, max_length=5000)
    completed: bool = Field(default=False)
    status: str = Field(
        default=TaskStatus.pending.value,
        sa_column=Column(
            SAEnum(TaskStatus, name="taskstatus", create_constraint=False),
            default=TaskStatus.pending.value,
            nullable=False,
        ),
    )
    due_date: Optional[date] = Field(default=None)
    due_time: Optional[str] = Field(default=None, max_length=5)
    reminder_time: Optional[datetime] = Field(default=None)
    recurrence_rule_id: Optional[int] = Field(
        default=None,
        sa_column=Column(
            "recurrence_rule_id",
            ForeignKey("recurrence_rules.id", ondelete="SET NULL"),
            nullable=True,
        ),
    )
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
