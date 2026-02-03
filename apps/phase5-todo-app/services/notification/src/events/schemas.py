"""
CloudEvents v1.0 schema definitions for Notification Service reminder events.
Per data-model.md and contracts/event-contracts.md.
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
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


# --- Reminder Events (Topic: reminder-events) ---

class ReminderTriggeredData(BaseModel):
    reminder_id: str
    task_id: str
    user_id: str


class ReminderDeliveredData(BaseModel):
    reminder_id: str
    task_id: str
    user_id: str
    delivered_via: str = "websocket"


class ReminderFailedData(BaseModel):
    reminder_id: str
    task_id: str
    user_id: str
    reason: str


# --- Event Type Constants ---

EVENT_TYPES = {
    "reminder_triggered": "com.todo.reminder.triggered.v1",
    "reminder_delivered": "com.todo.reminder.delivered.v1",
    "reminder_failed": "com.todo.reminder.failed.v1",
}

# --- Topic Mapping ---

TOPIC_MAPPING = {
    "com.todo.reminder.triggered.v1": "reminder-events",
    "com.todo.reminder.delivered.v1": "reminder-events",
    "com.todo.reminder.failed.v1": "reminder-events",
}


def create_cloud_event(event_type: str, source: str, data: BaseModel) -> dict:
    """Create a CloudEvents v1.0 envelope for the given event type and data."""
    event = CloudEvent(
        type=event_type,
        source=source,
        data=data.model_dump(),
    )
    return event.model_dump()
