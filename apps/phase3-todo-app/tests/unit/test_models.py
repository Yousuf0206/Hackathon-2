"""
Unit tests for TodoItem domain model.
"""

import pytest
from todo.models import TodoItem


def test_todoitem_creation():
    """Test TodoItem instantiation with all fields."""
    task = TodoItem(
        id=1,
        title="Buy groceries",
        description="Milk, eggs, bread",
        completed=False
    )

    assert task.id == 1
    assert task.title == "Buy groceries"
    assert task.description == "Milk, eggs, bread"
    assert task.completed is False


def test_todoitem_default_completed():
    """Test TodoItem defaults completed to False."""
    task = TodoItem(
        id=2,
        title="Fix bug",
        description="Description here"
    )

    assert task.completed is False


def test_todoitem_with_empty_description():
    """Test TodoItem allows empty description."""
    task = TodoItem(
        id=3,
        title="Task with no description",
        description=""
    )

    assert task.description == ""


def test_todoitem_equality():
    """Test TodoItem equality comparison."""
    task1 = TodoItem(id=1, title="Task", description="Desc", completed=False)
    task2 = TodoItem(id=1, title="Task", description="Desc", completed=False)
    task3 = TodoItem(id=2, title="Task", description="Desc", completed=False)

    assert task1 == task2
    assert task1 != task3


def test_todoitem_repr():
    """Test TodoItem string representation."""
    task = TodoItem(id=1, title="Test", description="Desc", completed=True)
    repr_str = repr(task)

    assert "TodoItem" in repr_str
    assert "id=1" in repr_str
    assert "title='Test'" in repr_str
    assert "completed=True" in repr_str


def test_todoitem_field_mutation():
    """Test TodoItem fields can be mutated."""
    task = TodoItem(id=1, title="Original", description="Original desc", completed=False)

    task.title = "Updated"
    task.description = "Updated desc"
    task.completed = True

    assert task.title == "Updated"
    assert task.description == "Updated desc"
    assert task.completed is True
