"""
Recurrence Rules API endpoints for Phase V recurring task management.

GET    /api/recurrence-rules/{id}  — fetch rule by ID
POST   /api/recurrence-rules       — create rule
PATCH  /api/recurrence-rules/{id}  — update rule
DELETE /api/recurrence-rules/{id}  — delete rule

Required because recurring-task service calls these via Dapr service invocation.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select
from typing import Optional
from datetime import datetime

from database import get_session
from dependencies import get_current_user
from models.recurrence_rule import RecurrenceRule, RecurrenceFrequency
from models.task import Task

import logging

logger = logging.getLogger(__name__)

router = APIRouter()


class RecurrenceRuleResponse(BaseModel):
    """Response model for a recurrence rule."""
    id: int
    task_id: int
    frequency: str
    end_after_count: Optional[int] = None
    end_by_date: Optional[str] = None
    occurrences_generated: int = 0
    is_active: bool = True
    created_at: str


class RecurrenceRuleCreate(BaseModel):
    """Request payload for creating a recurrence rule."""
    task_id: int
    frequency: str  # daily, weekly, monthly
    end_after_count: Optional[int] = None
    end_by_date: Optional[str] = None


class RecurrenceRuleUpdate(BaseModel):
    """Request payload for updating a recurrence rule."""
    frequency: Optional[str] = None
    end_after_count: Optional[int] = None
    end_by_date: Optional[str] = None
    is_active: Optional[bool] = None


def _rule_to_response(rule: RecurrenceRule) -> RecurrenceRuleResponse:
    """Convert a RecurrenceRule model instance to RecurrenceRuleResponse."""
    return RecurrenceRuleResponse(
        id=rule.id,
        task_id=rule.task_id,
        frequency=rule.frequency,
        end_after_count=rule.end_after_count,
        end_by_date=rule.end_by_date.isoformat() if rule.end_by_date else None,
        occurrences_generated=rule.occurrences_generated,
        is_active=rule.is_active,
        created_at=rule.created_at.isoformat() if rule.created_at else "",
    )


@router.get("/{rule_id}", response_model=RecurrenceRuleResponse)
def get_recurrence_rule(
    rule_id: int,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Fetch a recurrence rule by ID. Validates ownership via the associated task."""
    rule = session.get(RecurrenceRule, rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Recurrence rule not found")

    # Verify ownership through the associated task
    task = session.exec(
        select(Task).where(Task.id == rule.task_id, Task.user_id == user_id)
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Recurrence rule not found")

    return _rule_to_response(rule)


@router.post("", response_model=RecurrenceRuleResponse, status_code=status.HTTP_201_CREATED)
def create_recurrence_rule(
    request: RecurrenceRuleCreate,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Create a new recurrence rule for a task owned by the authenticated user."""
    # Verify task ownership
    task = session.exec(
        select(Task).where(Task.id == request.task_id, Task.user_id == user_id)
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Validate frequency
    if request.frequency not in [f.value for f in RecurrenceFrequency]:
        raise HTTPException(status_code=400, detail="Invalid frequency. Must be daily, weekly, or monthly")

    parsed_end_by = None
    if request.end_by_date:
        parsed_end_by = datetime.fromisoformat(request.end_by_date)

    rule = RecurrenceRule(
        task_id=request.task_id,
        frequency=request.frequency,
        end_after_count=request.end_after_count,
        end_by_date=parsed_end_by,
    )
    session.add(rule)
    session.commit()
    session.refresh(rule)

    # Link rule to task
    task.recurrence_rule_id = rule.id
    session.add(task)
    session.commit()
    session.refresh(task)

    logger.info(f"Created recurrence rule {rule.id} for task {task.id}")
    return _rule_to_response(rule)


@router.patch("/{rule_id}", response_model=RecurrenceRuleResponse)
def update_recurrence_rule(
    rule_id: int,
    request: RecurrenceRuleUpdate,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Update a recurrence rule. Validates ownership via the associated task."""
    rule = session.get(RecurrenceRule, rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Recurrence rule not found")

    # Verify ownership
    task = session.exec(
        select(Task).where(Task.id == rule.task_id, Task.user_id == user_id)
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Recurrence rule not found")

    if request.frequency is not None:
        if request.frequency not in [f.value for f in RecurrenceFrequency]:
            raise HTTPException(status_code=400, detail="Invalid frequency. Must be daily, weekly, or monthly")
        rule.frequency = request.frequency

    if request.end_after_count is not None:
        rule.end_after_count = request.end_after_count

    if request.end_by_date is not None:
        rule.end_by_date = datetime.fromisoformat(request.end_by_date)

    if request.is_active is not None:
        rule.is_active = request.is_active

    session.add(rule)
    session.commit()
    session.refresh(rule)

    logger.info(f"Updated recurrence rule {rule.id}")
    return _rule_to_response(rule)


@router.delete("/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recurrence_rule(
    rule_id: int,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Delete a recurrence rule. Validates ownership via the associated task."""
    rule = session.get(RecurrenceRule, rule_id)
    if not rule:
        raise HTTPException(status_code=404, detail="Recurrence rule not found")

    # Verify ownership
    task = session.exec(
        select(Task).where(Task.id == rule.task_id, Task.user_id == user_id)
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Recurrence rule not found")

    # Unlink from task
    if task.recurrence_rule_id == rule.id:
        task.recurrence_rule_id = None
        session.add(task)

    session.delete(rule)
    session.commit()

    logger.info(f"Deleted recurrence rule {rule_id}")
    return None
