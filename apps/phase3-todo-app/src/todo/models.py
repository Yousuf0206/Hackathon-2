"""
Domain models for the Phase I Todo Application.

This module contains pure data containers with no business logic.
Validation occurs in validation.py before instance creation.
State mutations occur in services.py after validation.
"""

from dataclasses import dataclass


@dataclass
class TodoItem:
    """
    Domain model for a todo task.

    This is a pure data container with no business logic.
    Validation occurs in validation.py before instance creation.
    State mutations occur in services.py after validation.

    Attributes:
        id: Unique, auto-incrementing identifier (≥ 1), never reused
        title: Required, trimmed, 1-100 characters
        description: Optional, trimmed, 0-500 characters
        completed: Completion status, defaults to False
    """
    id: int
    title: str
    description: str
    completed: bool = False
