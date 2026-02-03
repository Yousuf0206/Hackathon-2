"""
MCP Server Package for Phase III Todo AI Chatbot.

Per constitution section IV.B - MCP Exclusivity Law:
- ALL task mutations MUST occur via MCP tools only
- If an action cannot be expressed as an MCP tool, it is forbidden

Per constitution section IV.C - Tool Determinism Law:
- MCP tools MUST be stateless
- MCP tools MUST perform exactly ONE operation
- MCP tools MUST produce deterministic outputs
- MCP tools MUST validate all inputs strictly
"""

from .server import mcp_server, get_mcp_tools

__all__ = ["mcp_server", "get_mcp_tools"]
