"""
User model.
T011: User model with id, email, password_hash, created_at, updated_at.
"""
from sqlmodel import SQLModel, Field, Column, String
from typing import Optional
from datetime import datetime
from uuid import UUID, uuid4


class User(SQLModel, table=True):
    """
    User entity representing an authenticated user account.

    Relationships:
    - One-to-many with Todo

    Indexes:
    - Unique index on email for fast lookups and uniqueness constraint
    """
    __tablename__ = "users"

    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        nullable=False
    )
    email: str = Field(
        sa_column=Column(String(255), unique=True, index=True, nullable=False)
    )
    password_hash: str = Field(nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password_hash": "$2b$12$...",
                "created_at": "2026-01-01T00:00:00Z",
                "updated_at": "2026-01-01T00:00:00Z"
            }
        }
