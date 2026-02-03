"""
MCP Tool: list_tasks

Per spec section 7.3 (Phase IV):
- Purpose: Retrieve tasks with full details
- Parameters: user_id (required), status (optional: "all", "pending", "completed")
- Returns: [{ id, title, description, completed, due_date, due_time, created_at, updated_at }]
"""

from typing import Optional, Dict, Any, List
from sqlmodel import Session

from mcp.server import MCPServer, ValidationError
from database import engine, get_tasks_by_user


async def handle_list_tasks(
    user_id: str,
    status: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Retrieve tasks for a user with full details.

    Per constitution - Tool Determinism Law:
    - Stateless operation
    - Single operation: read tasks
    - Deterministic output (ordered by updated_at desc)
    - No mutation possible
    """
    # Validate inputs
    if not user_id or not isinstance(user_id, str):
        raise ValidationError("user_id is required and must be a string")

    # Validate status filter
    valid_statuses = [None, "all", "pending", "completed"]
    if status and status not in valid_statuses:
        raise ValidationError(f"status must be one of: all, pending, completed")

    # Normalize status
    if status == "all":
        status = None

    # Retrieve tasks
    with Session(engine) as session:
        tasks = get_tasks_by_user(
            session=session,
            user_id=user_id,
            status=status
        )

        return [
            {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "completed": task.completed,
                "due_date": str(task.due_date) if task.due_date else None,
                "due_time": task.due_time,
                "created_at": task.created_at.isoformat() if task.created_at else None,
                "updated_at": task.updated_at.isoformat() if task.updated_at else None,
            }
            for task in tasks
        ]


def register_list_tasks(mcp_server: MCPServer) -> None:
    """Register the list_tasks tool with the MCP server."""
    mcp_server.register_tool(
        name="list_tasks",
        description="Retrieve all tasks for the user with full details, optionally filtered by status",
        parameters={
            "type": "object",
            "properties": {
                "user_id": {
                    "type": "string",
                    "description": "The authenticated user's ID"
                },
                "status": {
                    "type": "string",
                    "enum": ["all", "pending", "completed"],
                    "description": "Filter tasks by status (default: all)"
                }
            },
            "required": ["user_id"]
        },
        handler=handle_list_tasks
    )
