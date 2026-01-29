"""
MCP Tool: add_task

Per spec section 7.2:
- Purpose: Create a new task
- Parameters: user_id (required), title (required), description (optional)
- Validation: title must be non-empty, user_id must match auth user
- Returns: { task_id, status: "created", title }
"""

from typing import Optional, Dict, Any
from sqlmodel import Session

from mcp.server import MCPServer, ValidationError
from database import engine, create_task


async def handle_add_task(
    user_id: str,
    title: str,
    description: Optional[str] = None
) -> Dict[str, Any]:
    """
    Create a new task.

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

    # Create task
    with Session(engine) as session:
        task = create_task(
            session=session,
            user_id=user_id,
            title=title,
            description=description
        )

        return {
            "task_id": task.id,
            "status": "created",
            "title": task.title
        }


def register_add_task(mcp_server: MCPServer) -> None:
    """Register the add_task tool with the MCP server."""
    mcp_server.register_tool(
        name="add_task",
        description="Create a new task for the user",
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
                }
            },
            "required": ["user_id", "title"]
        },
        handler=handle_add_task
    )
