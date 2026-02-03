"""
CloudEvents v1.0 schema definitions for Recurring Task Service events.
Per data-model.md and contracts/event-contracts.md.
"""
from pydantic import BaseModel, Field
from typing import Dict, Any
from uuid import uuid4
from datetime import datetime


class CloudEvent(BaseModel):
    """Base CloudEvents v1.0 envelope."""
    specversion: str = "1.0"
    type: str
    source: str
    id: str = Field(default_factory=lambda: str(uuid4()))
    time: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    datacontenttype: str = "application/json"
    data: Dict[str, Any]


class RecurringTaskGeneratedData(BaseModel):
    """Data payload for RecurringTaskGenerated.v1 event."""
    original_task_id: str
    new_task_id: str
    user_id: str
    recurrence_rule_id: str
    occurrence_number: int


# --- Event Type Constants ---

EVENT_TYPES = {
    "recurring_generated": "com.todo.recurring.generated.v1",
}

# --- Topic Mapping ---

TOPIC_MAPPING = {
    "com.todo.recurring.generated.v1": "recurring-events",
}


def create_cloud_event(event_type: str, source: str, data: BaseModel) -> dict:
    """Create a CloudEvents v1.0 envelope for the given event type and data."""
    event = CloudEvent(
        type=event_type,
        source=source,
        data=data.model_dump(),
    )
    return event.model_dump()
