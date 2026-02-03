"""
Tasks API endpoint for Phase IV task view pages.

GET /api/tasks?status=all|pending|completed
POST /api/tasks
PATCH /api/tasks/{task_id}/complete
PUT /api/tasks/{task_id}
DELETE /api/tasks/{task_id}

Returns tasks (from Task model used by MCP/chat) with counts,
sorted by updated_at DESC per FR-022.
"""
from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel, Field
from sqlmodel import Session
from typing import Optional, List
from datetime import datetime, date

from database import get_session, get_tasks_by_user, create_task, update_task, delete_task
from dependencies import get_current_user


router = APIRouter()


class TaskResponse(BaseModel):
    """Response model for a single task."""
    id: int
    user_id: str
    title: str
    description: Optional[str]
    completed: bool
    due_date: Optional[str]
    due_time: Optional[str]
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
        TaskResponse(
            id=task.id,
            user_id=task.user_id,
            title=task.title,
            description=task.description,
            completed=task.completed,
            due_date=str(task.due_date) if task.due_date else None,
            due_time=task.due_time,
            created_at=task.created_at.isoformat() if task.created_at else "",
            updated_at=task.updated_at.isoformat() if task.updated_at else "",
        )
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


def _task_to_response(task) -> TaskResponse:
    """Convert a Task model instance to TaskResponse."""
    return TaskResponse(
        id=task.id,
        user_id=task.user_id,
        title=task.title,
        description=task.description,
        completed=task.completed,
        due_date=str(task.due_date) if task.due_date else None,
        due_time=task.due_time,
        created_at=task.created_at.isoformat() if task.created_at else "",
        updated_at=task.updated_at.isoformat() if task.updated_at else "",
    )


class TaskCreate(BaseModel):
    """Request payload for creating a task."""
    title: str = Field(min_length=1, max_length=500)
    description: Optional[str] = Field(default=None, max_length=5000)
    due_date: Optional[str] = None
    due_time: Optional[str] = None


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task_endpoint(
    request: TaskCreate,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Create a new task for the authenticated user."""
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
    )
    return _task_to_response(task)


class TaskCompletionUpdate(BaseModel):
    """Request payload for toggling task completion."""
    completed: bool


@router.patch("/{task_id}/complete", response_model=TaskResponse)
def toggle_task_completion(
    task_id: int,
    request: TaskCompletionUpdate,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Toggle task completion status."""
    task = update_task(
        session=session,
        task_id=task_id,
        user_id=user_id,
        completed=request.completed,
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return _task_to_response(task)


class TaskUpdate(BaseModel):
    """Request payload for updating a task."""
    title: str = Field(min_length=1, max_length=500)
    description: Optional[str] = Field(default=None, max_length=5000)


@router.put("/{task_id}", response_model=TaskResponse)
def update_task_endpoint(
    task_id: int,
    request: TaskUpdate,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Update task title and description."""
    title = request.title.strip()
    if not title:
        raise HTTPException(status_code=400, detail="Title cannot be empty")

    task = update_task(
        session=session,
        task_id=task_id,
        user_id=user_id,
        title=title,
        description=request.description,
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return _task_to_response(task)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task_endpoint(
    task_id: int,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Delete a task."""
    task = delete_task(session=session, task_id=task_id, user_id=user_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return None
