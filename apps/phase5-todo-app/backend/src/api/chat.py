"""
Chat API endpoint for Phase III Todo AI Chatbot.

Per spec section 6 - Chat API Specification:
- Endpoint: POST /api/{user_id}/chat
- Request: { conversation_id?: int, message: string }
- Response: { conversation_id: int, response: string, tool_calls: array }

Per constitution - Stateless Server Law:
- Server holds ZERO state between requests
- Conversation context reconstructed from database each request
"""

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from sqlmodel import Session

from auth.dependencies import get_current_user
from database import (
    get_session,
    get_or_create_conversation,
    get_conversation_messages,
    create_message
)
from models.message import MessageRole
from agent.runner import run_agent


router = APIRouter(tags=["chat"])


class ChatRequest(BaseModel):
    """Request body for chat endpoint."""
    conversation_id: Optional[int] = Field(
        default=None,
        description="Optional conversation ID to continue existing conversation"
    )
    message: str = Field(
        ...,
        min_length=1,
        max_length=10000,
        description="User message to process"
    )


class ToolCallResponse(BaseModel):
    """Tool call in response."""
    tool: str
    arguments: Dict[str, Any]
    success: bool
    result: Any


class ChatResponse(BaseModel):
    """Response body for chat endpoint."""
    conversation_id: int
    response: str
    tool_calls: List[ToolCallResponse]


@router.post("/{user_id}/chat", response_model=ChatResponse)
async def chat(
    user_id: str,
    request: ChatRequest,
    current_user: str = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Process a chat message and return AI response.

    Per spec section 6 - Processing Rules:
    1. Authenticate request
    2. Validate input schema
    3. Fetch conversation history (if exists)
    4. Store user message
    5. Run agent with history + new message
    6. Execute MCP tools (if invoked)
    7. Store assistant message
    8. Return response

    Per constitution - Authentication Law:
    - user_id in path MUST match authenticated user from JWT
    """
    # Step 1: Validate user_id matches authenticated user
    if user_id != current_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot access another user's chat"
        )

    # Step 2: Input validation (handled by Pydantic model)

    # Step 3: Get or create conversation
    conversation = get_or_create_conversation(
        session=session,
        conversation_id=request.conversation_id,
        user_id=current_user
    )

    # Step 4: Fetch conversation history
    messages = get_conversation_messages(
        session=session,
        conversation_id=conversation.id,
        user_id=current_user
    )

    # Convert to dict format for agent
    message_history = [
        {"role": msg.role.value, "content": msg.content}
        for msg in messages
    ]

    # Step 5: Store user message
    create_message(
        session=session,
        conversation_id=conversation.id,
        user_id=current_user,
        role=MessageRole.USER,
        content=request.message
    )

    # Step 6 & 7: Run agent (executes MCP tools internally)
    try:
        result = await run_agent(
            user_id=current_user,
            messages=message_history,
            user_message=request.message
        )
    except ValueError as e:
        # Known agent errors (API key invalid, rate limit, etc.)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )
    except Exception as e:
        # Unexpected errors - log but return safe message
        logging.getLogger(__name__).error(f"Agent error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process your request. Please try again."
        )

    # Step 8: Store assistant response
    create_message(
        session=session,
        conversation_id=conversation.id,
        user_id=current_user,
        role=MessageRole.ASSISTANT,
        content=result["response"]
    )

    # Return response
    return ChatResponse(
        conversation_id=conversation.id,
        response=result["response"],
        tool_calls=[
            ToolCallResponse(
                tool=tc["tool"],
                arguments=tc["arguments"],
                success=tc["success"],
                result=tc["result"]
            )
            for tc in result["tool_calls"]
        ]
    )
