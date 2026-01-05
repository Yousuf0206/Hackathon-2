"""
Unit tests for custom exception classes.
"""

import pytest
from todo.errors import (
    InvalidCommandError,
    ValidationError,
    InvalidIDError,
    TaskNotFoundError,
    EmptyInputError
)


def test_invalid_command_error():
    """Test InvalidCommandError can be raised and caught."""
    with pytest.raises(InvalidCommandError):
        raise InvalidCommandError("Unknown command 'foo'")


def test_validation_error():
    """Test ValidationError can be raised and caught."""
    with pytest.raises(ValidationError):
        raise ValidationError("Title cannot be empty")


def test_invalid_id_error():
    """Test InvalidIDError can be raised and caught."""
    with pytest.raises(InvalidIDError):
        raise InvalidIDError("Invalid ID 'abc'")


def test_task_not_found_error():
    """Test TaskNotFoundError can be raised and caught."""
    with pytest.raises(TaskNotFoundError):
        raise TaskNotFoundError("Task with ID 999 not found")


def test_empty_input_error():
    """Test EmptyInputError can be raised and caught."""
    with pytest.raises(EmptyInputError):
        raise EmptyInputError("Input cannot be empty")


def test_exception_messages():
    """Test exception messages are preserved."""
    message = "Custom error message"

    try:
        raise ValidationError(message)
    except ValidationError as e:
        assert str(e) == message


def test_exceptions_inherit_from_exception():
    """Test all custom exceptions inherit from Exception."""
    assert issubclass(InvalidCommandError, Exception)
    assert issubclass(ValidationError, Exception)
    assert issubclass(InvalidIDError, Exception)
    assert issubclass(TaskNotFoundError, Exception)
    assert issubclass(EmptyInputError, Exception)
