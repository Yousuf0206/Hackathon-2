"""
MCP Tool: complete_task

Per spec section 7.4:
- Purpose: Mark task complete
- Parameters: user_id (required), task_id (required)
- Validation: Task must exist, Task must belong to user
- Returns: { task_id, status: "completed", title }
"""

from typing import Dict, Any
from sqlmodel import Session

from mcp.server import MCPServer, ValidationError, NotFoundError
from database import engine, update_task


async def handle_complete_task(
    user_id: str,
    task_id: int
) -> Dict[str, Any]:
    """
    Mark a task as complete.

    Per constitution - Tool Determinism Law:
    - Stateless operation
    - Single operation: update completed status
    - Deterministic output
    - Strict ownership validation
    """
    # Validate inputs
    if not user_id or not isinstance(user_id, str):
        raise ValidationError("user_id is required and must be a string")

    if task_id is None or not isinstance(task_id, int):
        raise ValidationError("task_id is required and must be an integer")

    # Update task
    with Session(engine) as session:
        task = update_task(
            session=session,
            task_id=task_id,
            user_id=user_id,
            completed=True
        )

        if not task:
            raise NotFoundError(f"Task {task_id} not found")

        return {
            "task_id": task.id,
            "status": "completed",
            "title": task.title
        }


def register_complete_task(mcp_server: MCPServer) -> None:
    """Register the complete_task tool with the MCP server."""
    mcp_server.register_tool(
        name="complete_task",
        description="Mark a task as complete",
        parameters={
            "type": "object",
            "properties": {
                "user_id": {
                    "type": "string",
                    "description": "The authenticated user's ID"
                },
                "task_id": {
                    "type": "integer",
                    "description": "The ID of the task to complete"
                }
            },
            "required": ["user_id", "task_id"]
        },
        handler=handle_complete_task
    )
