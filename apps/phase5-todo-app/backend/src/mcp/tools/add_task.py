"""
MCP Tool: add_task

Per spec section 7.2 (Phase IV):
- Purpose: Create a new task with optional date/time
- Parameters: user_id (required), title (required), description (optional),
              due_date (optional, YYYY-MM-DD), due_time (optional, HH:MM)
- Validation: title must be non-empty, user_id must match auth user
- Returns: { task_id, status: "created", title, due_date, due_time }
"""

from typing import Optional, Dict, Any
from sqlmodel import Session

from mcp.server import MCPServer, ValidationError
from database import engine, create_task


async def handle_add_task(
    user_id: str,
    title: str,
    description: Optional[str] = None,
    due_date: Optional[str] = None,
    due_time: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Create a new task with optional due date and time.

    Per constitution - Tool Determinism Law:
    - Stateless operation
    - Single operation: create task
    - Deterministic output
    - Strict input validation
    """
    # Validate inputs
    if not user_id or not isinstance(user_id, str):
        raise ValidationError("user_id is required and must be a string")

    if not title or not isinstance(title, str):
        raise ValidationError("title is required and must be a non-empty string")

    title = title.strip()
    if len(title) == 0:
        raise ValidationError("title cannot be empty")

    if len(title) > 500:
        raise ValidationError("title must be 500 characters or less")

    if description:
        description = description.strip()
        if len(description) > 5000:
            raise ValidationError("description must be 5000 characters or less")

    # Validate due_date format if provided
    if due_date is not None:
        import re
        if not re.match(r"^\d{4}-\d{2}-\d{2}$", due_date):
            raise ValidationError("due_date must be in YYYY-MM-DD format")
        from datetime import date
        try:
            date.fromisoformat(due_date)
        except ValueError:
            raise ValidationError(f"due_date '{due_date}' is not a valid date")

    # Validate due_time format if provided
    if due_time is not None:
        import re
        if not re.match(r"^\d{2}:\d{2}$", due_time):
            raise ValidationError("due_time must be in HH:MM format (e.g., '14:30')")
        hours, minutes = int(due_time[:2]), int(due_time[3:5])
        if hours > 23 or minutes > 59:
            raise ValidationError("due_time must be a valid time (00:00-23:59)")

    # Create task
    with Session(engine) as session:
        task = create_task(
            session=session,
            user_id=user_id,
            title=title,
            description=description,
            due_date=due_date,
            due_time=due_time,
        )

        return {
            "task_id": task.id,
            "status": "created",
            "title": task.title,
            "due_date": str(task.due_date) if task.due_date else None,
            "due_time": task.due_time,
        }


def register_add_task(mcp_server: MCPServer) -> None:
    """Register the add_task tool with the MCP server."""
    mcp_server.register_tool(
        name="add_task",
        description="Create a new task for the user with optional due date and time",
        parameters={
            "type": "object",
            "properties": {
                "user_id": {
                    "type": "string",
                    "description": "The authenticated user's ID"
                },
                "title": {
                    "type": "string",
                    "description": "The title of the task (required, max 500 chars)"
                },
                "description": {
                    "type": "string",
                    "description": "Optional description of the task (max 5000 chars)"
                },
                "due_date": {
                    "type": "string",
                    "description": "Optional due date in YYYY-MM-DD format (e.g., '2026-03-15')"
                },
                "due_time": {
                    "type": "string",
                    "description": "Optional due time in HH:MM 24-hour format (e.g., '14:30')"
                }
            },
            "required": ["user_id", "title"]
        },
        handler=handle_add_task
    )
