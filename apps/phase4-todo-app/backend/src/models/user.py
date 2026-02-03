"""
User model.
T011: User model with id, email, password_hash, created_at, updated_at.
"""
from sqlmodel import SQLModel, Field
from sqlalchemy import Column
from typing import Optional
from datetime import datetime
from uuid import UUID, uuid4
import sqlalchemy.sql.sqltypes as sqltypes


class User(SQLModel, table=True):
    """
    User entity representing an authenticated user account.

    Relationships:
    - One-to-many with Todo

    Indexes:
    - Unique index on email for fast lookups and uniqueness constraint
    """
    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(sa_column=Column(sqltypes.String(255), unique=True, index=True))
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password_hash": "$2b$12$...",
                "created_at": "2026-01-01T00:00:00Z",
                "updated_at": "2026-01-01T00:00:00Z"
            }
        }
