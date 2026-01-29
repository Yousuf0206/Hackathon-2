"""
MCP Server for Phase III Todo AI Chatbot.

Per constitution section IV.B - MCP Exclusivity Law:
- This is the ONLY mutation boundary
- AI agents may NOT access the database directly
- ALL task mutations MUST occur via these tools only

Per constitution section IV.C - Tool Determinism Law:
- All tools are stateless
- One tool = one operation
- All inputs validated
- All outputs deterministic
"""

from typing import List, Dict, Any, Optional, Callable
from dataclasses import dataclass
from enum import Enum


class ToolError(Exception):
    """Base exception for MCP tool errors."""
    pass


class ValidationError(ToolError):
    """Input validation failed."""
    pass


class AuthorizationError(ToolError):
    """User authorization failed."""
    pass


class NotFoundError(ToolError):
    """Resource not found."""
    pass


@dataclass
class ToolResult:
    """Result of an MCP tool execution."""
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


@dataclass
class ToolDefinition:
    """Definition of an MCP tool."""
    name: str
    description: str
    parameters: Dict[str, Any]
    handler: Callable


class MCPServer:
    """
    MCP Server - The sole mutation boundary for task operations.

    Per constitution:
    - All task mutations MUST occur via registered tools
    - Tools are stateless and deterministic
    - Each tool performs exactly ONE operation
    """

    def __init__(self):
        self._tools: Dict[str, ToolDefinition] = {}

    def register_tool(
        self,
        name: str,
        description: str,
        parameters: Dict[str, Any],
        handler: Callable
    ) -> None:
        """Register an MCP tool."""
        self._tools[name] = ToolDefinition(
            name=name,
            description=description,
            parameters=parameters,
            handler=handler
        )

    def get_tool(self, name: str) -> Optional[ToolDefinition]:
        """Get a registered tool by name."""
        return self._tools.get(name)

    def list_tools(self) -> List[Dict[str, Any]]:
        """List all registered tools with their schemas."""
        return [
            {
                "name": tool.name,
                "description": tool.description,
                "parameters": tool.parameters
            }
            for tool in self._tools.values()
        ]

    async def execute_tool(
        self,
        name: str,
        arguments: Dict[str, Any]
    ) -> ToolResult:
        """
        Execute an MCP tool.

        Per constitution:
        - Validates tool exists
        - Validates all inputs
        - Executes deterministically
        - Returns explicit result
        """
        tool = self.get_tool(name)
        if not tool:
            return ToolResult(
                success=False,
                error=f"Unknown tool: {name}"
            )

        try:
            result = await tool.handler(**arguments)
            return ToolResult(success=True, data=result)
        except ValidationError as e:
            return ToolResult(success=False, error=f"Validation error: {str(e)}")
        except AuthorizationError as e:
            return ToolResult(success=False, error=f"Authorization error: {str(e)}")
        except NotFoundError as e:
            return ToolResult(success=False, error=f"Not found: {str(e)}")
        except Exception as e:
            return ToolResult(success=False, error=f"Tool execution error: {str(e)}")


# Global MCP server instance
mcp_server = MCPServer()


def get_mcp_tools() -> List[Dict[str, Any]]:
    """Get all MCP tools for OpenAI function calling."""
    tools = []
    for tool in mcp_server._tools.values():
        tools.append({
            "type": "function",
            "function": {
                "name": tool.name,
                "description": tool.description,
                "parameters": tool.parameters
            }
        })
    return tools
