"""
MCP Tool: update_task

Per spec section 7.6 (Phase IV):
- Purpose: Update task fields including date/time
- Parameters: user_id (required), task_id (required), title (optional),
              description (optional), due_date (optional), due_time (optional)
- Validation: At least one field to update, Task must exist, Task must belong to user
- Returns: { task_id, status: "updated", title, due_date, due_time }
"""

from typing import Optional, Dict, Any
from sqlmodel import Session

from mcp.server import MCPServer, ValidationError, NotFoundError
from database import engine, update_task as db_update_task

# Sentinel to distinguish "not provided" from "set to null"
_UNSET = "UNSET"


async def handle_update_task(
    user_id: str,
    task_id: int,
    title: Optional[str] = None,
    description: Optional[str] = None,
    due_date: Optional[str] = _UNSET,
    due_time: Optional[str] = _UNSET,
) -> Dict[str, Any]:
    """
    Update a task's fields.

    Per constitution - Tool Determinism Law:
    - Stateless operation
    - Single operation: update task fields
    - Deterministic output
    - Strict ownership validation
    """
    # Validate inputs
    if not user_id or not isinstance(user_id, str):
        raise ValidationError("user_id is required and must be a string")

    if task_id is None or not isinstance(task_id, int):
        raise ValidationError("task_id is required and must be an integer")

    # Validate at least one field to update
    has_update = (
        title is not None
        or description is not None
        or due_date != _UNSET
        or due_time != _UNSET
    )
    if not has_update:
        raise ValidationError("At least one field to update must be provided")

    # Validate title if provided
    if title is not None:
        title = title.strip()
        if len(title) == 0:
            raise ValidationError("title cannot be empty")
        if len(title) > 500:
            raise ValidationError("title must be 500 characters or less")

    # Validate description if provided
    if description is not None:
        description = description.strip()
        if len(description) > 5000:
            raise ValidationError("description must be 5000 characters or less")

    # Validate due_date format if provided (not UNSET)
    if due_date != _UNSET and due_date is not None:
        import re
        if not re.match(r"^\d{4}-\d{2}-\d{2}$", due_date):
            raise ValidationError("due_date must be in YYYY-MM-DD format")
        from datetime import date
        try:
            date.fromisoformat(due_date)
        except ValueError:
            raise ValidationError(f"due_date '{due_date}' is not a valid date")

    # Validate due_time format if provided (not UNSET)
    if due_time != _UNSET and due_time is not None:
        import re
        if not re.match(r"^\d{2}:\d{2}$", due_time):
            raise ValidationError("due_time must be in HH:MM format (e.g., '14:30')")
        hours, minutes = int(due_time[:2]), int(due_time[3:5])
        if hours > 23 or minutes > 59:
            raise ValidationError("due_time must be a valid time (00:00-23:59)")

    # Update task
    with Session(engine) as session:
        task = db_update_task(
            session=session,
            task_id=task_id,
            user_id=user_id,
            title=title,
            description=description,
            due_date=due_date,
            due_time=due_time,
        )

        if not task:
            raise NotFoundError(f"Task {task_id} not found")

        return {
            "task_id": task.id,
            "status": "updated",
            "title": task.title,
            "due_date": str(task.due_date) if task.due_date else None,
            "due_time": task.due_time,
        }


def register_update_task(mcp_server: MCPServer) -> None:
    """Register the update_task tool with the MCP server."""
    mcp_server.register_tool(
        name="update_task",
        description="Update a task's title, description, due date, or due time",
        parameters={
            "type": "object",
            "properties": {
                "user_id": {
                    "type": "string",
                    "description": "The authenticated user's ID"
                },
                "task_id": {
                    "type": "integer",
                    "description": "The ID of the task to update"
                },
                "title": {
                    "type": "string",
                    "description": "New title for the task (max 500 chars)"
                },
                "description": {
                    "type": "string",
                    "description": "New description for the task (max 5000 chars)"
                },
                "due_date": {
                    "type": ["string", "null"],
                    "description": "New due date in YYYY-MM-DD format, or null to clear"
                },
                "due_time": {
                    "type": ["string", "null"],
                    "description": "New due time in HH:MM 24-hour format, or null to clear"
                }
            },
            "required": ["user_id", "task_id"]
        },
        handler=handle_update_task
    )
