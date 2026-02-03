"""
Business logic and state management for the Phase I Todo Application.

This module contains the TaskService class which manages task state
and enforces validation-before-mutation pattern.

Constitutional Compliance:
- C-4: Deterministic behavior - sequential IDs, creation order preserved
- C-10: Atomic operations - validate all inputs before any state mutation
- C-13: In-memory only - no persistence
"""

from typing import List
from todo.models import TodoItem
from todo.validation import validate_title, validate_description
from todo.errors import TaskNotFoundError


class TaskService:
    """
    Service class for managing todo tasks.

    Maintains in-memory task list and enforces validation-before-mutation pattern.
    IDs are never reused, tasks maintain creation order.
    """

    def __init__(self):
        """Initialize empty task list and ID counter."""
        self.tasks: List[TodoItem] = []
        self.next_id: int = 1

    def add_task(self, title: str, description: str) -> TodoItem:
        """
        Create a new task with validated inputs.

        Validates title and description before creating task.
        Assigns unique sequential ID and appends to task list.

        Args:
            title: Task title (will be validated)
            description: Task description (will be validated)

        Returns:
            Created TodoItem with assigned ID

        Raises:
            ValidationError: If title or description validation fails
        """
        # Validate inputs first (fail-fast)
        validated_title = validate_title(title)
        validated_description = validate_description(description)

        # Create task with next available ID
        task = TodoItem(
            id=self.next_id,
            title=validated_title,
            description=validated_description,
            completed=False
        )

        # Add to list and increment ID counter
        self.tasks.append(task)
        self.next_id += 1

        return task

    def list_tasks(self) -> List[TodoItem]:
        """
        Get all tasks in creation order.

        Returns:
            Copy of task list in creation order
        """
        # Return copy to prevent external mutation
        return self.tasks.copy()

    def get_task_by_id(self, task_id: int) -> TodoItem:
        """
        Find task by ID.

        Args:
            task_id: Task ID to find

        Returns:
            TodoItem with matching ID

        Raises:
            TaskNotFoundError: If no task with given ID exists
        """
        for task in self.tasks:
            if task.id == task_id:
                return task

        raise TaskNotFoundError(f"Task with ID {task_id} not found.")

    def complete_task(self, task_id: int) -> TodoItem:
        """
        Mark task as completed.

        Args:
            task_id: ID of task to mark complete

        Returns:
            Updated TodoItem

        Raises:
            TaskNotFoundError: If task ID not found
        """
        task = self.get_task_by_id(task_id)
        task.completed = True
        return task

    def incomplete_task(self, task_id: int) -> TodoItem:
        """
        Mark task as incomplete.

        Args:
            task_id: ID of task to mark incomplete

        Returns:
            Updated TodoItem

        Raises:
            TaskNotFoundError: If task ID not found
        """
        task = self.get_task_by_id(task_id)
        task.completed = False
        return task

    def update_task(self, task_id: int, new_title: str, new_description: str) -> TodoItem:
        """
        Update task title and description atomically.

        Validates all inputs before applying any changes.

        Args:
            task_id: ID of task to update
            new_title: New title (will be validated)
            new_description: New description (will be validated)

        Returns:
            Updated TodoItem

        Raises:
            TaskNotFoundError: If task ID not found
            ValidationError: If title or description validation fails
        """
        # Validate task exists first
        task = self.get_task_by_id(task_id)

        # Validate both inputs (fail-fast, atomic)
        validated_title = validate_title(new_title)
        validated_description = validate_description(new_description)

        # Apply changes atomically (validation passed for both)
        task.title = validated_title
        task.description = validated_description

        return task

    def delete_task(self, task_id: int) -> None:
        """
        Permanently delete task.

        IDs are never reused - next_id counter is not decremented.

        Args:
            task_id: ID of task to delete

        Raises:
            TaskNotFoundError: If task ID not found
        """
        # Validate task exists
        task = self.get_task_by_id(task_id)

        # Remove from list (ID counter unchanged)
        self.tasks.remove(task)
