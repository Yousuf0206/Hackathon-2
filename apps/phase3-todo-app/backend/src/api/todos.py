"""
Todos API endpoints.
T032-T033: POST and GET /api/todos endpoints with user isolation.
T038: Error handling for todo operations.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, Field
from sqlmodel import Session, select
from typing import Optional, List
from uuid import UUID
from datetime import datetime

from ..database import get_session
from ..models.todo import Todo
from ..dependencies import get_current_user


router = APIRouter()


class TodoCreate(BaseModel):
    """Request payload for creating a todo."""
    title: str = Field(min_length=1, max_length=500)
    description: Optional[str] = Field(default=None, max_length=5000)


class TodoResponse(BaseModel):
    """Response model for a single todo."""
    id: str
    user_id: str
    title: str
    description: Optional[str]
    completed: bool
    created_at: str
    updated_at: str


class TodoListResponse(BaseModel):
    """Response model for list of todos."""
    todos: List[TodoResponse]


@router.post("", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
def create_todo(
    request: TodoCreate,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a new todo item.

    T032: POST /api/todos
    - Extracts user_id from JWT (get_current_user dependency)
    - Validates title (required, trim whitespace, max 500 chars)
    - Validates description (optional, max 5000 chars)
    - Creates todo with user_id from JWT (never from request body)
    - Sets completed=false
    - Returns 201 with created todo

    T038: Error handling
    - 400 for empty title
    - 401 for expired token (handled by get_current_user)
    """
    # Trim whitespace from title
    title = request.title.strip()

    # Validate title is not empty after trimming
    if not title:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title cannot be empty"
        )

    # Validate title length
    if len(title) > 500:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title must be 500 characters or less"
        )

    # Validate description length if provided
    if request.description and len(request.description) > 5000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Description must be 5000 characters or less"
        )

    # Create new todo
    # CRITICAL: user_id comes from JWT only, never from request body
    new_todo = Todo(
        user_id=UUID(user_id),
        title=title,
        description=request.description,
        completed=False
    )

    session.add(new_todo)
    session.commit()
    session.refresh(new_todo)

    # Return created todo
    return TodoResponse(
        id=str(new_todo.id),
        user_id=str(new_todo.user_id),
        title=new_todo.title,
        description=new_todo.description,
        completed=new_todo.completed,
        created_at=new_todo.created_at.isoformat(),
        updated_at=new_todo.updated_at.isoformat()
    )


@router.get("", response_model=TodoListResponse)
def get_todos(
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get all todos for the authenticated user.

    T033: GET /api/todos
    - Extracts user_id from JWT
    - Queries todos filtered by user_id (WHERE user_id = <jwt_user_id>)
    - Returns 200 with list sorted by created_at DESC (newest first)

    CRITICAL: User isolation enforced - only returns current user's todos.
    """
    # Query todos with user_id filter (user isolation)
    todos = session.exec(
        select(Todo)
        .where(Todo.user_id == UUID(user_id))
        .order_by(Todo.created_at.desc())
    ).all()

    # Convert to response format
    todo_responses = [
        TodoResponse(
            id=str(todo.id),
            user_id=str(todo.user_id),
            title=todo.title,
            description=todo.description,
            completed=todo.completed,
            created_at=todo.created_at.isoformat(),
            updated_at=todo.updated_at.isoformat()
        )
        for todo in todos
    ]

    return TodoListResponse(todos=todo_responses)


@router.get("/{todo_id}", response_model=TodoResponse)
def get_todo_by_id(
    todo_id: str,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get a specific todo by ID.

    T039: GET /api/todos/{todo_id}
    - Extracts user_id from JWT
    - Queries todo with WHERE id = <todo_id> AND user_id = <jwt_user_id>
    - Returns 404 (not 403) if not found or unauthorized to prevent enumeration

    CRITICAL: Returns 404 on ownership violations (not 403).
    """
    try:
        todo_uuid = UUID(todo_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid todo ID format"
        )

    # Query with ownership check
    todo = session.exec(
        select(Todo)
        .where(Todo.id == todo_uuid)
        .where(Todo.user_id == UUID(user_id))
    ).first()

    # Return 404 for not found OR unauthorized (prevents enumeration)
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )

    return TodoResponse(
        id=str(todo.id),
        user_id=str(todo.user_id),
        title=todo.title,
        description=todo.description,
        completed=todo.completed,
        created_at=todo.created_at.isoformat(),
        updated_at=todo.updated_at.isoformat()
    )


class TodoUpdate(BaseModel):
    """Request payload for updating a todo."""
    title: str = Field(min_length=1, max_length=500)
    description: Optional[str] = Field(default=None, max_length=5000)


@router.put("/{todo_id}", response_model=TodoResponse)
def update_todo(
    todo_id: str,
    request: TodoUpdate,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update todo title and/or description.

    T047: PUT /api/todos/{todo_id}
    - Extracts user_id from JWT
    - Validates title (required, trim whitespace, max 500 chars)
    - Validates description (optional, max 5000 chars)
    - Queries todo with ownership check (WHERE id = <todo_id> AND user_id = <jwt_user_id>)
    - Updates title/description and updated_at timestamp (completed field unchanged)
    - Returns 200 with updated todo (404 if not found/unauthorized, 400 for validation errors)
    """
    try:
        todo_uuid = UUID(todo_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid todo ID format"
        )

    # Trim whitespace from title
    title = request.title.strip()

    # Validate title is not empty after trimming
    if not title:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title cannot be empty"
        )

    # Validate title length
    if len(title) > 500:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title must be 500 characters or less"
        )

    # Validate description length if provided
    if request.description and len(request.description) > 5000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Description must be 5000 characters or less"
        )

    # Query with ownership check
    todo = session.exec(
        select(Todo)
        .where(Todo.id == todo_uuid)
        .where(Todo.user_id == UUID(user_id))
    ).first()

    # Return 404 for not found OR unauthorized
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )

    # Update fields
    todo.title = title
    todo.description = request.description
    todo.updated_at = datetime.utcnow()

    session.add(todo)
    session.commit()
    session.refresh(todo)

    return TodoResponse(
        id=str(todo.id),
        user_id=str(todo.user_id),
        title=todo.title,
        description=todo.description,
        completed=todo.completed,
        created_at=todo.created_at.isoformat(),
        updated_at=todo.updated_at.isoformat()
    )


class TodoCompletionUpdate(BaseModel):
    """Request payload for updating todo completion status."""
    completed: bool


@router.patch("/{todo_id}/complete", response_model=TodoResponse)
def toggle_todo_completion(
    todo_id: str,
    request: TodoCompletionUpdate,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Toggle todo completion status.

    T043: PATCH /api/todos/{todo_id}/complete
    - Extracts user_id from JWT
    - Validates completed field (required boolean)
    - Queries todo with ownership check (WHERE id = <todo_id> AND user_id = <jwt_user_id>)
    - Updates completed status and updated_at timestamp
    - Returns 200 with updated todo (404 if not found/unauthorized)
    """
    try:
        todo_uuid = UUID(todo_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid todo ID format"
        )

    # Query with ownership check
    todo = session.exec(
        select(Todo)
        .where(Todo.id == todo_uuid)
        .where(Todo.user_id == UUID(user_id))
    ).first()

    # Return 404 for not found OR unauthorized
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )

    # Update completion status
    todo.completed = request.completed
    todo.updated_at = datetime.utcnow()

    session.add(todo)
    session.commit()
    session.refresh(todo)

    return TodoResponse(
        id=str(todo.id),
        user_id=str(todo.user_id),
        title=todo.title,
        description=todo.description,
        completed=todo.completed,
        created_at=todo.created_at.isoformat(),
        updated_at=todo.updated_at.isoformat()
    )


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(
    todo_id: str,
    user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Delete a todo.

    T050: DELETE /api/todos/{todo_id}
    - Extracts user_id from JWT
    - Queries todo with ownership check (WHERE id = <todo_id> AND user_id = <jwt_user_id>)
    - Deletes from database
    - Returns 204 No Content (404 if not found/unauthorized)
    """
    try:
        todo_uuid = UUID(todo_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid todo ID format"
        )

    # Query with ownership check
    todo = session.exec(
        select(Todo)
        .where(Todo.id == todo_uuid)
        .where(Todo.user_id == UUID(user_id))
    ).first()

    # Return 404 for not found OR unauthorized
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )

    # Delete todo
    session.delete(todo)
    session.commit()

    return None
