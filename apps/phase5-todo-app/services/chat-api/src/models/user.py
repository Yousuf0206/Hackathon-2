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
    - Unique index on login_name for fast lookups and uniqueness constraint
    """
    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    login_name: str = Field(sa_column=Column(sqltypes.String(30), unique=True, index=True, nullable=False))
    name: str = Field(default="", sa_column=Column(sqltypes.String(255), nullable=False, server_default=""))
    father_name: str = Field(default="", sa_column=Column(sqltypes.String(255), nullable=False, server_default=""))
    email: Optional[str] = Field(default=None, sa_column=Column(sqltypes.String(255), unique=True, index=True, nullable=True))
    phone: Optional[str] = Field(default=None, sa_column=Column(sqltypes.String(20), nullable=True))
    biodata: Optional[str] = Field(default=None, sa_column=Column(sqltypes.Text, nullable=True))
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "login_name": "john_doe",
                "name": "John",
                "father_name": "Doe Sr",
                "email": "user@example.com",
                "password_hash": "$2b$12$...",
                "created_at": "2026-01-01T00:00:00Z",
                "updated_at": "2026-01-01T00:00:00Z"
            }
        }
