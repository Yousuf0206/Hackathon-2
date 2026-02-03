"""
AuditEntry model for immutable event logging.
Per data-model.md: INSERT only. No UPDATE or DELETE permitted.
"""
from sqlmodel import SQLModel, Field
from sqlalchemy import Column, Text, JSON
from typing import Optional, Any
from datetime import datetime


class AuditEntry(SQLModel, table=True):
    """
    Immutable audit log entry for domain events.

    Stores every CloudEvent processed by the system for
    compliance and debugging purposes.
    """
    __tablename__ = "audit_entries"

    id: Optional[int] = Field(default=None, primary_key=True)
    event_type: str = Field(nullable=False, index=True)
    event_id: str = Field(nullable=False, unique=True, index=True)
    source: str = Field(nullable=False)
    actor_id: Optional[str] = Field(default=None, index=True)
    payload: Any = Field(default=None, sa_column=Column(JSON, nullable=False))
    timestamp: datetime = Field(nullable=False)
    received_at: datetime = Field(default_factory=datetime.utcnow)
