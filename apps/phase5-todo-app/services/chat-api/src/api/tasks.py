"""
Tasks API endpoint for Phase V event-driven task lifecycle.

GET /api/tasks?status=all|pending|completed
POST /api/tasks
PATCH /api/tasks/{task_id}/complete
PUT /api/tasks/{task_id}
DELETE /api/tasks/{task_id}

All mutations publish CloudEvents to Kafka via Dapr Pub/Sub (US1).
"""
from fastapi import APIRouter, Depends, Query, HTTPException, status, BackgroundTasks
from pydantic import BaseModel, Field
from sqlmodel import Session
from typing import Optional, List
import logging

from database import get_session, get_tasks_by_user, create_task, update_task, delete_task
from dependencies import get_current_user
from events.publisher import publish_event
from events.schemas import (
    EVENT_TYPES,
    TaskCreatedData,
    TaskUpdatedData,
    TaskCompletedData,
    TaskDeletedData,
)

logger = logging.getLogger(__name__)


router = APIRouter()


class TaskResponse(BaseModel):
    """Response model for a single task."""
    id: int
    user_id: str
    title: str
    description: Optional[str]
    completed: bool
    priority: str = "medium"
    tags: Optional[str] = None
    due_date: Optional[str]
    due_time: Optional[str]
    recurrence_rule_id: Optional[int] = None
    recurrence: Optional[dict] = None
    created_at: str
    updated_at: str


class TaskCounts(BaseModel):
    """Counts for task summary."""
    total: int
    pending: int
    completed: int


class TaskListResponse(BaseModel):
    """Response model for task list with counts."""
    tasks: List[TaskResponse]
    counts: TaskCounts


@router.get("", response_model=TaskListResponse)
def list_tasks(
    status: Optional[str] = Query(default="all", pattern="^(all|pending|completed)$"),
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    List tasks for the authenticated user.

    Per contracts/backend-api.yaml:
    - Accepts ?status=all|pending|completed
    - Returns {tasks: Task[], counts: {total, pending, completed}}
    - Sorted by updated_at DESC (FR-022)
    - Requires JWT auth
    """
    # Normalize status
    filter_status = None if status == "all" else status

    # Get filtered tasks (already sorted by updated_at DESC)
    tasks = get_tasks_by_user(session=session, user_id=user_id, status=filter_status)

    # Get all tasks for counts (unfiltered)
    all_tasks = get_tasks_by_user(session=session, user_id=user_id, status=None)
    completed_count = sum(1 for t in all_tasks if t.completed)
    total_count = len(all_tasks)

    task_responses = [
        _task_to_response(task, session)
        for task in tasks
    ]

    return TaskListResponse(
        tasks=task_responses,
        counts=TaskCounts(
            total=total_count,
            pending=total_count - completed_count,
            completed=completed_count,
        ),
    )


def _task_to_response(task, session=None) -> TaskResponse:
    """Convert a Task model instance to TaskResponse."""
    recurrence = None
    if task.recurrence_rule_id and session:
        from models.recurrence_rule import RecurrenceRule
        rule = session.get(RecurrenceRule, task.recurrence_rule_id)
        if rule:
            recurrence = {
                "frequency": rule.frequency,
                "end_after_count": rule.end_after_count,
                "end_by_date": rule.end_by_date.isoformat() if rule.end_by_date else None,
                "is_active": rule.is_active,
            }
    return TaskResponse(
        id=task.id,
        user_id=task.user_id,
        title=task.title,
        description=task.description,
        completed=task.completed,
        priority=getattr(task, 'priority', 'medium') or 'medium',
        tags=getattr(task, 'tags', None),
        due_date=str(task.due_date) if task.due_date else None,
        due_time=task.due_time,
        recurrence_rule_id=task.recurrence_rule_id,
        recurrence=recurrence,
        created_at=task.created_at.isoformat() if task.created_at else "",
        updated_at=task.updated_at.isoformat() if task.updated_at else "",
    )


class TaskCreate(BaseModel):
    """Request payload for creating a task."""
    title: str = Field(min_length=1, max_length=500)
    description: Optional[str] = Field(default=None, max_length=5000)
    due_date: Optional[str] = None
    due_time: Optional[str] = None
    priority: Optional[str] = "medium"
    tags: Optional[str] = None
    recurrence: Optional[dict] = None
    reminder_minutes: Optional[int] = None


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task_endpoint(
    request: TaskCreate,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Create a new task for the authenticated user. Publishes TaskCreated.v1 event."""
    title = request.title.strip()
    if not title:
        raise HTTPException(status_code=400, detail="Title cannot be empty")

    task = create_task(
        session=session,
        user_id=user_id,
        title=title,
        description=request.description,
        due_date=request.due_date,
        due_time=request.due_time,
        priority=request.priority,
        tags=request.tags,
    )

    # Create recurrence rule if provided
    if request.recurrence:
        from models.recurrence_rule import RecurrenceRule
        rule = RecurrenceRule(
            task_id=task.id,
            frequency=request.recurrence.get("frequency", "daily"),
            end_after_count=request.recurrence.get("end_after_count"),
            end_by_date=request.recurrence.get("end_by_date"),
        )
        session.add(rule)
        session.commit()
        session.refresh(rule)
        task.recurrence_rule_id = rule.id
        session.add(task)
        session.commit()
        session.refresh(task)

    # T025: Publish TaskCreated.v1 event after successful DB insert
    background_tasks.add_task(
        publish_event,
        event_type=EVENT_TYPES["task_created"],
        source="chat-api",
        data=TaskCreatedData(
            task_id=str(task.id),
            user_id=user_id,
            title=task.title,
            description=task.description,
            due_date=str(task.due_date) if task.due_date else None,
            priority=task.priority,
            tags=task.tags,
        ),
    )

    return _task_to_response(task, session)


class TaskCompletionUpdate(BaseModel):
    """Request payload for toggling task completion."""
    completed: bool


@router.patch("/{task_id}/complete", response_model=TaskResponse)
async def toggle_task_completion(
    task_id: int,
    request: TaskCompletionUpdate,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Toggle task completion status. Publishes TaskCompleted.v1 event when completed."""
    task = update_task(
        session=session,
        task_id=task_id,
        user_id=user_id,
        completed=request.completed,
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # T027: Publish TaskCompleted.v1 event when marking as complete
    if request.completed:
        background_tasks.add_task(
            publish_event,
            event_type=EVENT_TYPES["task_completed"],
            source="chat-api",
            data=TaskCompletedData(
                task_id=str(task.id),
                user_id=user_id,
                had_recurrence_rule=task.recurrence_rule_id is not None,
                recurrence_rule_id=str(task.recurrence_rule_id) if task.recurrence_rule_id else None,
            ),
        )

    return _task_to_response(task, session)


class TaskUpdate(BaseModel):
    """Request payload for updating a task."""
    title: str = Field(min_length=1, max_length=500)
    description: Optional[str] = Field(default=None, max_length=5000)
    priority: Optional[str] = None
    tags: Optional[str] = None
    due_date: Optional[str] = None
    due_time: Optional[str] = None
    recurrence: Optional[dict] = None


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task_endpoint(
    task_id: int,
    request: TaskUpdate,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Update task title and description. Publishes TaskUpdated.v1 event."""
    title = request.title.strip()
    if not title:
        raise HTTPException(status_code=400, detail="Title cannot be empty")

    task = update_task(
        session=session,
        task_id=task_id,
        user_id=user_id,
        title=title,
        description=request.description,
        priority=request.priority if request.priority is not None else "UNSET",
        tags=request.tags if request.tags is not None else "UNSET",
        due_date=request.due_date if request.due_date is not None else "UNSET",
        due_time=request.due_time if request.due_time is not None else "UNSET",
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Handle recurrence update
    if request.recurrence is not None:
        from models.recurrence_rule import RecurrenceRule
        if task.recurrence_rule_id:
            rule = session.get(RecurrenceRule, task.recurrence_rule_id)
            if rule:
                rule.frequency = request.recurrence.get("frequency", rule.frequency)
                rule.end_after_count = request.recurrence.get("end_after_count")
                rule.end_by_date = request.recurrence.get("end_by_date")
                session.add(rule)
                session.commit()
        else:
            rule = RecurrenceRule(
                task_id=task.id,
                frequency=request.recurrence.get("frequency", "daily"),
                end_after_count=request.recurrence.get("end_after_count"),
                end_by_date=request.recurrence.get("end_by_date"),
            )
            session.add(rule)
            session.commit()
            session.refresh(rule)
            task.recurrence_rule_id = rule.id
            session.add(task)
            session.commit()
            session.refresh(task)

    # T026: Publish TaskUpdated.v1 event after successful DB update
    changes = {"title": title}
    if request.description is not None:
        changes["description"] = request.description
    if request.priority is not None:
        changes["priority"] = request.priority
    if request.tags is not None:
        changes["tags"] = request.tags
    background_tasks.add_task(
        publish_event,
        event_type=EVENT_TYPES["task_updated"],
        source="chat-api",
        data=TaskUpdatedData(
            task_id=str(task.id),
            user_id=user_id,
            changes=changes,
        ),
    )

    return _task_to_response(task, session)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task_endpoint(
    task_id: int,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Delete a task. Publishes TaskDeleted.v1 event."""
    task = delete_task(session=session, task_id=task_id, user_id=user_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # T028: Publish TaskDeleted.v1 event after deletion
    background_tasks.add_task(
        publish_event,
        event_type=EVENT_TYPES["task_deleted"],
        source="chat-api",
        data=TaskDeletedData(
            task_id=str(task.id),
            user_id=user_id,
        ),
    )

    return None
