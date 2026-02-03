"""
Message model for Phase III Todo AI Chatbot.

Per spec section 5: Database Models (Authoritative)
Per constitution section VII: Conversation State Law
- Conversation context MUST be persisted in database
- Reconstructed per request
"""

from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class MessageRole(str, Enum):
    """Role of the message sender."""
    USER = "user"
    ASSISTANT = "assistant"


class Message(SQLModel, table=True):
    """
    Message entity representing a single message in a conversation.

    Fields per spec:
    - id: integer, primary key
    - conversation_id: integer, foreign key
    - user_id: string, auth-bound owner
    - role: enum(user, assistant)
    - content: text
    - created_at: datetime, auto
    """
    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversations.id", index=True, nullable=False)
    user_id: str = Field(index=True, nullable=False)
    role: MessageRole = Field(nullable=False)
    content: str = Field(nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
