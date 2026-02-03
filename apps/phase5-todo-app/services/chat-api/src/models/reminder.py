"""
Reminder model for Phase V asynchronous reminder system.
Per data-model.md entity definitions.
"""

from sqlmodel import SQLModel, Field
from sqlalchemy import Column, Enum as SAEnum, ForeignKey
from typing import Optional
from datetime import datetime
import enum


class ReminderStatus(str, enum.Enum):
    """Reminder status enum per data-model.md state transitions."""
    pending = "pending"
    delivered = "delivered"
    failed = "failed"


class Reminder(SQLModel, table=True):
    """
    Reminder entity for task reminder scheduling and delivery tracking.

    State Transitions:
    - pending → delivered (via ReminderDelivered event)
    - pending → failed (via ReminderFailed event)
    """
    __tablename__ = "reminders"

    id: Optional[int] = Field(default=None, primary_key=True)
    task_id: int = Field(
        sa_column=Column(
            "task_id",
            ForeignKey("tasks.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
    )
    user_id: str = Field(nullable=False, index=True)
    trigger_time: datetime = Field(nullable=False)
    status: str = Field(
        default=ReminderStatus.pending.value,
        sa_column=Column(
            SAEnum(ReminderStatus, name="reminderstatus", create_constraint=False),
            default=ReminderStatus.pending.value,
            nullable=False,
        ),
    )
    dapr_job_name: str = Field(nullable=False, unique=True)
    delivered_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
