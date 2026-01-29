"""
Agent Package for Phase III Todo AI Chatbot.

Per constitution section IV.B - MCP Exclusivity Law:
- AI agents may NOT access the database directly
- AI agents may NOT mutate state outside MCP tools
- ALL task mutations MUST occur via MCP tools only

Per constitution section VI - Agent Behavior Constitution:
- Agent MUST follow intent-to-tool mappings
- Agent MUST provide friendly confirmations
- Agent MUST provide explicit success/failure responses
"""

from .runner import run_agent
from .prompts import SYSTEM_PROMPT

__all__ = ["run_agent", "SYSTEM_PROMPT"]
