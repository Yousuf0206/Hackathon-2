"""
RecurrenceRule model for Phase V recurring task generation.
Per data-model.md entity definitions.
"""

from sqlmodel import SQLModel, Field
from sqlalchemy import Column, Enum as SAEnum, ForeignKey
from typing import Optional
from datetime import datetime
import enum


class RecurrenceFrequency(str, enum.Enum):
    """Recurrence frequency enum per data-model.md."""
    daily = "daily"
    weekly = "weekly"
    monthly = "monthly"


class RecurrenceRule(SQLModel, table=True):
    """
    RecurrenceRule entity for defining task recurrence patterns.

    Termination Logic:
    - If end_after_count is set and occurrences_generated >= end_after_count → is_active = false
    - If end_by_date is set and now >= end_by_date → is_active = false
    - If neither is set → indefinite (always active)
    """
    __tablename__ = "recurrence_rules"

    id: Optional[int] = Field(default=None, primary_key=True)
    task_id: int = Field(
        sa_column=Column(
            "task_id",
            ForeignKey("tasks.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
    )
    frequency: str = Field(
        sa_column=Column(
            SAEnum(RecurrenceFrequency, name="recurrencefrequency", create_constraint=False),
            nullable=False,
        ),
    )
    end_after_count: Optional[int] = Field(default=None)
    end_by_date: Optional[datetime] = Field(default=None)
    occurrences_generated: int = Field(default=0)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    def should_terminate(self) -> bool:
        """Check if this recurrence rule should be terminated."""
        if self.end_after_count is not None and self.occurrences_generated >= self.end_after_count:
            return True
        if self.end_by_date is not None and datetime.utcnow() >= self.end_by_date:
            return True
        return False
