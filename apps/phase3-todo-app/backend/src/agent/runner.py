"""
Agent Runner for Phase III Todo AI Chatbot.

Per constitution:
- Agent may NOT access the database directly
- ALL task mutations MUST occur via MCP tools
- Agent behavior must be deterministic

Per spec section 6 - Processing Rules:
1. Authenticate request
2. Validate input schema
3. Fetch conversation history (if exists)
4. Store user message
5. Run agent with history + new message
6. Execute MCP tools (if invoked)
7. Store assistant message
8. Return response
"""

import json
from typing import List, Dict, Any
from openai import AsyncOpenAI, AuthenticationError, RateLimitError, APIError

from config import settings
from agent.prompts import SYSTEM_PROMPT
from mcp.server import mcp_server, get_mcp_tools
from mcp.tools import register_all_tools


# Initialize OpenAI client
client = AsyncOpenAI(api_key=settings.openai_api_key)

# Register all MCP tools
register_all_tools(mcp_server)


async def run_agent(
    user_id: str,
    messages: List[Dict[str, str]],
    user_message: str
) -> Dict[str, Any]:
    """
    Run the AI agent with the given conversation context.

    Per constitution - Stateless Server Law:
    - Agent reconstructs context from provided messages
    - No in-memory conversation storage
    - Each call is independent

    Args:
        user_id: Authenticated user's ID
        messages: Conversation history from database
        user_message: New user message to process

    Returns:
        {
            "response": str,  # Agent's response text
            "tool_calls": List[Dict]  # Tools that were called
        }
    """
    # Build conversation for OpenAI
    openai_messages = [
        {"role": "system", "content": SYSTEM_PROMPT}
    ]

    # Add conversation history
    for msg in messages:
        openai_messages.append({
            "role": msg["role"],
            "content": msg["content"]
        })

    # Add new user message
    openai_messages.append({
        "role": "user",
        "content": user_message
    })

    # Get MCP tools for function calling
    tools = get_mcp_tools()

    # Track tool calls for response
    executed_tool_calls = []

    # Run agent loop (handle multiple tool calls)
    max_iterations = 10  # Prevent infinite loops
    iteration = 0

    while iteration < max_iterations:
        iteration += 1

        # Call OpenAI
        try:
            response = await client.chat.completions.create(
                model="gpt-4o",
                messages=openai_messages,
                tools=tools if tools else None,
                tool_choice="auto" if tools else None
            )
        except AuthenticationError:
            raise ValueError("OpenAI API key is invalid or expired. Please update OPENAI_API_KEY.")
        except RateLimitError:
            raise ValueError("OpenAI rate limit reached. Please try again in a moment.")
        except APIError as e:
            raise ValueError(f"OpenAI API error: {e.message}")

        assistant_message = response.choices[0].message

        # Check if agent wants to call tools
        if assistant_message.tool_calls:
            # Add assistant message with tool calls
            openai_messages.append({
                "role": "assistant",
                "content": assistant_message.content or "",
                "tool_calls": [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {
                            "name": tc.function.name,
                            "arguments": tc.function.arguments
                        }
                    }
                    for tc in assistant_message.tool_calls
                ]
            })

            # Execute each tool call
            for tool_call in assistant_message.tool_calls:
                tool_name = tool_call.function.name
                try:
                    arguments = json.loads(tool_call.function.arguments)
                except json.JSONDecodeError:
                    arguments = {}

                # Inject user_id for security (override any provided user_id)
                arguments["user_id"] = user_id

                # Execute tool via MCP server
                result = await mcp_server.execute_tool(tool_name, arguments)

                # Track the tool call
                executed_tool_calls.append({
                    "tool": tool_name,
                    "arguments": {k: v for k, v in arguments.items() if k != "user_id"},
                    "success": result.success,
                    "result": result.data if result.success else result.error
                })

                # Add tool result to messages
                openai_messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(result.data if result.success else {"error": result.error})
                })

            # Continue loop to let agent process tool results
            continue

        # No more tool calls - agent is done
        final_response = assistant_message.content or ""
        break
    else:
        # Max iterations reached
        final_response = "I apologize, but I'm having trouble processing your request. Please try again."

    return {
        "response": final_response,
        "tool_calls": executed_tool_calls
    }
