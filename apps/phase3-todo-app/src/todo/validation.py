"""
Centralized validation logic for the Phase I Todo Application.

This module contains explicit validation functions that raise specific exceptions
on failure. All validation must complete before any state mutation occurs.

Constitutional Compliance:
- C-2: Zero-trust input model - all input is invalid by default
- C-3: Correctness before convenience - reject invalid input explicitly
- C-9: No implicit type conversion - validate types explicitly
- C-10: Atomic operations - validation failure terminates immediately
"""

from todo.errors import (
    InvalidCommandError,
    ValidationError,
    InvalidIDError,
    EmptyInputError
)


# Valid commands for the application
VALID_COMMANDS = {
    "add", "list", "update", "delete",
    "complete", "incomplete", "help", "exit"
}


def validate_command(cmd: str) -> str:
    """
    Validate command input.

    Args:
        cmd: Raw command string from user

    Returns:
        Lowercase command string if valid

    Raises:
        EmptyInputError: If command is empty or whitespace-only
        InvalidCommandError: If command is not in VALID_COMMANDS
    """
    # Trim whitespace
    cmd = cmd.strip()

    # Check for empty input
    if not cmd:
        raise EmptyInputError("No command entered. Type 'help' for available commands.")

    # Convert to lowercase for case-insensitive matching
    cmd_lower = cmd.lower()

    # Validate against known commands
    if cmd_lower not in VALID_COMMANDS:
        raise InvalidCommandError(
            f"Unknown command '{cmd}'. Type 'help' for available commands."
        )

    return cmd_lower


def validate_id(id_str: str) -> int:
    """
    Validate and parse task ID.

    Args:
        id_str: Raw ID string from user

    Returns:
        Parsed integer ID

    Raises:
        InvalidIDError: If ID cannot be parsed as integer
    """
    # Trim whitespace
    id_str = id_str.strip()

    # Check for empty input
    if not id_str:
        raise InvalidIDError("Task ID cannot be empty. Provide a numeric ID.")

    # Attempt to parse as integer
    try:
        task_id = int(id_str)
    except ValueError:
        raise InvalidIDError(
            f"Invalid task ID '{id_str}'. ID must be a number."
        )

    # Validate ID is positive
    if task_id < 1:
        raise InvalidIDError(
            f"Invalid task ID {task_id}. ID must be a positive number."
        )

    return task_id


def validate_title(title: str) -> str:
    """
    Validate and trim task title.

    Args:
        title: Raw title string from user

    Returns:
        Trimmed title string

    Raises:
        ValidationError: If title is empty after trimming or exceeds 100 characters
    """
    # Trim whitespace from both ends
    title = title.strip()

    # Check for empty title
    if not title:
        raise ValidationError(
            "Title cannot be empty. Please provide a title."
        )

    # Check title length
    if len(title) > 100:
        raise ValidationError(
            f"Title exceeds 100 characters (current: {len(title)}). Please shorten."
        )

    return title


def validate_description(description: str) -> str:
    """
    Validate and trim task description.

    Args:
        description: Raw description string from user

    Returns:
        Trimmed description string (may be empty)

    Raises:
        ValidationError: If description exceeds 500 characters
    """
    # Trim whitespace from both ends
    description = description.strip()

    # Check description length (empty is allowed)
    if len(description) > 500:
        raise ValidationError(
            f"Description exceeds 500 characters (current: {len(description)}). Please shorten."
        )

    return description
