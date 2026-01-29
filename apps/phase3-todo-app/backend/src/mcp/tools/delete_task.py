"""
MCP Tool: delete_task

Per spec section 7.5:
- Purpose: Delete a task
- Parameters: user_id (required), task_id (required)
- Validation: Task must exist, Task must belong to user
- Returns: { task_id, status: "deleted", title }
"""

from typing import Dict, Any
from sqlmodel import Session

from mcp.server import MCPServer, ValidationError, NotFoundError
from database import engine, delete_task as db_delete_task


async def handle_delete_task(
    user_id: str,
    task_id: int
) -> Dict[str, Any]:
    """
    Delete a task.

    Per constitution - Tool Determinism Law:
    - Stateless operation
    - Single operation: delete task
    - Deterministic output
    - No partial deletes
    """
    # Validate inputs
    if not user_id or not isinstance(user_id, str):
        raise ValidationError("user_id is required and must be a string")

    if task_id is None or not isinstance(task_id, int):
        raise ValidationError("task_id is required and must be an integer")

    # Delete task
    with Session(engine) as session:
        task = db_delete_task(
            session=session,
            task_id=task_id,
            user_id=user_id
        )

        if not task:
            raise NotFoundError(f"Task {task_id} not found")

        return {
            "task_id": task.id,
            "status": "deleted",
            "title": task.title
        }


def register_delete_task(mcp_server: MCPServer) -> None:
    """Register the delete_task tool with the MCP server."""
    mcp_server.register_tool(
        name="delete_task",
        description="Delete a task permanently",
        parameters={
            "type": "object",
            "properties": {
                "user_id": {
                    "type": "string",
                    "description": "The authenticated user's ID"
                },
                "task_id": {
                    "type": "integer",
                    "description": "The ID of the task to delete"
                }
            },
            "required": ["user_id", "task_id"]
        },
        handler=handle_delete_task
    )
