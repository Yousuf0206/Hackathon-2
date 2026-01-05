"""
Custom exception classes for the Phase I Todo Application.

This module defines 5 explicit error types for clear, user-correctable error handling.
Each exception provides descriptive messages explaining what/why/how-to-fix.
"""


class InvalidCommandError(Exception):
    """
    Raised when user enters an unrecognized command.

    User Action: Check the 'help' command for available options.
    """
    pass


class ValidationError(Exception):
    """
    Raised when input fails validation rules (empty title, length limits, etc.).

    User Action: Review the error message and provide valid input.
    """
    pass


class InvalidIDError(Exception):
    """
    Raised when provided ID is not a valid integer.

    User Action: Provide a numeric task ID from the list command.
    """
    pass


class TaskNotFoundError(Exception):
    """
    Raised when attempting to operate on a non-existent task ID.

    User Action: Use the 'list' command to see available task IDs.
    """
    pass


class EmptyInputError(Exception):
    """
    Raised when user provides empty input where input is required.

    User Action: Provide non-empty input or use the correct command.
    """
    pass
