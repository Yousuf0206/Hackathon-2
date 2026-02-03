"""
Conversation model for Phase III Todo AI Chatbot.

Per spec section 5: Database Models (Authoritative)
Per constitution section VII: Conversation State Law
- Conversation context MUST be persisted in database
- Server holds ZERO conversational memory
"""

from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime


class Conversation(SQLModel, table=True):
    """
    Conversation entity representing a chat session with the AI.

    Fields per spec:
    - id: integer, primary key
    - user_id: string, auth-bound owner
    - created_at: datetime, auto
    - updated_at: datetime, auto
    """
    __tablename__ = "conversations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
