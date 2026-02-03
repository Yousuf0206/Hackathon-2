"""
MCP Tools Package for Phase III Todo AI Chatbot.

Per spec section 7: MCP Server Specification
Tools:
- add_task: Create a new task
- list_tasks: Retrieve tasks
- complete_task: Mark task complete
- delete_task: Delete a task
- update_task: Update task fields
"""

from .add_task import register_add_task
from .list_tasks import register_list_tasks
from .complete_task import register_complete_task
from .delete_task import register_delete_task
from .update_task import register_update_task


def register_all_tools(mcp_server) -> None:
    """Register all MCP tools with the server."""
    register_add_task(mcp_server)
    register_list_tasks(mcp_server)
    register_complete_task(mcp_server)
    register_delete_task(mcp_server)
    register_update_task(mcp_server)


__all__ = ["register_all_tools"]
