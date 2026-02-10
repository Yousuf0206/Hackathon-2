"""
CloudEvents v1.0 schema definitions for all 9 domain event types.
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


# --- Task Lifecycle Events (Topic: task-events) ---

class TaskCreatedData(BaseModel):
    task_id: str
    user_id: str
    title: str
    description: Optional[str] = None
    due_date: Optional[str] = None
    reminder_time: Optional[str] = None
    recurrence_rule: Optional[Dict[str, Any]] = None
    priority: str = "medium"
    tags: Optional[str] = None


class TaskUpdatedData(BaseModel):
    task_id: str
    user_id: str
    changes: Dict[str, Any]


class TaskCompletedData(BaseModel):
    task_id: str
    user_id: str
    had_recurrence_rule: bool = False
    recurrence_rule_id: Optional[str] = None


class TaskDeletedData(BaseModel):
    task_id: str
    user_id: str


# --- Reminder Events (Topic: reminder-events) ---

class ReminderScheduledData(BaseModel):
    reminder_id: str
    task_id: str
    user_id: str
    trigger_time: str


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


# --- Recurring Events (Topic: recurring-events) ---

class RecurringTaskGeneratedData(BaseModel):
    original_task_id: str
    new_task_id: str
    user_id: str
    recurrence_rule_id: str
    occurrence_number: int


# --- Event Type Constants ---

EVENT_TYPES = {
    "task_created": "com.todo.task.created.v1",
    "task_updated": "com.todo.task.updated.v1",
    "task_completed": "com.todo.task.completed.v1",
    "task_deleted": "com.todo.task.deleted.v1",
    "reminder_scheduled": "com.todo.reminder.scheduled.v1",
    "reminder_triggered": "com.todo.reminder.triggered.v1",
    "reminder_delivered": "com.todo.reminder.delivered.v1",
    "reminder_failed": "com.todo.reminder.failed.v1",
    "recurring_generated": "com.todo.recurring.generated.v1",
}

# --- Topic Mapping ---

TOPIC_MAPPING = {
    "com.todo.task.created.v1": "task-events",
    "com.todo.task.updated.v1": "task-events",
    "com.todo.task.completed.v1": "task-events",
    "com.todo.task.deleted.v1": "task-events",
    "com.todo.reminder.scheduled.v1": "reminder-events",
    "com.todo.reminder.triggered.v1": "reminder-events",
    "com.todo.reminder.delivered.v1": "reminder-events",
    "com.todo.reminder.failed.v1": "reminder-events",
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
