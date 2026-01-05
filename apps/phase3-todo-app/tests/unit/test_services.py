"""
Unit tests for TaskService.
"""

import pytest
from todo.services import TaskService
from todo.models import TodoItem
from todo.errors import ValidationError


class TestTaskServiceInitialization:
    """Tests for TaskService initialization."""

    def test_init_empty_task_list(self):
        """Test TaskService initializes with empty task list."""
        service = TaskService()

        assert service.tasks == []
        assert isinstance(service.tasks, list)

    def test_init_next_id_starts_at_one(self):
        """Test TaskService initializes next_id to 1."""
        service = TaskService()

        assert service.next_id == 1

    def test_multiple_instances_independent(self):
        """Test multiple TaskService instances are independent."""
        service1 = TaskService()
        service2 = TaskService()

        assert service1.tasks is not service2.tasks
        assert service1.next_id == service2.next_id == 1


class TestAddTask:
    """Tests for add_task() method."""

    def test_add_task_success(self):
        """Test adding a valid task."""
        service = TaskService()

        task = service.add_task("Buy groceries", "Milk, eggs, bread")

        assert task.id == 1
        assert task.title == "Buy groceries"
        assert task.description == "Milk, eggs, bread"
        assert task.completed is False

    def test_add_task_increments_id(self):
        """Test ID increments sequentially."""
        service = TaskService()

        task1 = service.add_task("Task 1", "Description 1")
        task2 = service.add_task("Task 2", "Description 2")
        task3 = service.add_task("Task 3", "Description 3")

        assert task1.id == 1
        assert task2.id == 2
        assert task3.id == 3
        assert service.next_id == 4

    def test_add_task_appends_to_list(self):
        """Test tasks are appended in creation order."""
        service = TaskService()

        task1 = service.add_task("First", "Desc 1")
        task2 = service.add_task("Second", "Desc 2")

        assert len(service.tasks) == 2
        assert service.tasks[0] == task1
        assert service.tasks[1] == task2

    def test_add_task_with_empty_description(self):
        """Test adding task with empty description."""
        service = TaskService()

        task = service.add_task("Task", "")

        assert task.description == ""

    def test_add_task_trims_whitespace(self):
        """Test add_task trims whitespace from inputs."""
        service = TaskService()

        task = service.add_task("  Title  ", "  Description  ")

        assert task.title == "Title"
        assert task.description == "Description"

    def test_add_task_validates_title(self):
        """Test add_task validates title."""
        service = TaskService()

        # Empty title should raise ValidationError
        with pytest.raises(ValidationError):
            service.add_task("", "Description")

        # Title too long should raise ValidationError
        with pytest.raises(ValidationError):
            service.add_task("a" * 101, "Description")

    def test_add_task_validates_description(self):
        """Test add_task validates description."""
        service = TaskService()

        # Description too long should raise ValidationError
        with pytest.raises(ValidationError):
            service.add_task("Title", "a" * 501)

    def test_add_task_validation_failure_no_state_change(self):
        """Test validation failure prevents task creation."""
        service = TaskService()

        # Add valid task first
        service.add_task("Valid task", "Valid description")
        assert len(service.tasks) == 1
        assert service.next_id == 2

        # Attempt to add invalid task
        with pytest.raises(ValidationError):
            service.add_task("", "Description")

        # Verify no state change
        assert len(service.tasks) == 1
        assert service.next_id == 2


class TestListTasks:
    """Tests for list_tasks() method."""

    def test_list_tasks_empty(self):
        """Test list_tasks returns empty list when no tasks."""
        service = TaskService()

        tasks = service.list_tasks()

        assert tasks == []

    def test_list_tasks_returns_all_tasks(self):
        """Test list_tasks returns all tasks."""
        service = TaskService()

        task1 = service.add_task("Task 1", "Desc 1")
        task2 = service.add_task("Task 2", "Desc 2")
        task3 = service.add_task("Task 3", "Desc 3")

        tasks = service.list_tasks()

        assert len(tasks) == 3
        assert tasks[0] == task1
        assert tasks[1] == task2
        assert tasks[2] == task3

    def test_list_tasks_maintains_creation_order(self):
        """Test list_tasks preserves creation order."""
        service = TaskService()

        for i in range(10):
            service.add_task(f"Task {i}", f"Description {i}")

        tasks = service.list_tasks()

        for i, task in enumerate(tasks):
            assert task.id == i + 1
            assert task.title == f"Task {i}"

    def test_list_tasks_returns_copy(self):
        """Test list_tasks returns a copy, not original."""
        service = TaskService()
        service.add_task("Task", "Description")

        tasks1 = service.list_tasks()
        tasks2 = service.list_tasks()

        # Should be equal but not the same object
        assert tasks1 == tasks2
        assert tasks1 is not tasks2
        assert tasks1 is not service.tasks


class TestGetTaskById:
    """Tests for get_task_by_id() method."""

    def test_get_existing_task(self):
        """Test retrieving an existing task by ID."""
        service = TaskService()
        task1 = service.add_task("Task 1", "Desc 1")
        task2 = service.add_task("Task 2", "Desc 2")

        retrieved = service.get_task_by_id(2)

        assert retrieved == task2

    def test_get_nonexistent_task(self):
        """Test get_task_by_id raises TaskNotFoundError for missing ID."""
        service = TaskService()
        service.add_task("Task", "Description")

        from todo.errors import TaskNotFoundError
        with pytest.raises(TaskNotFoundError) as exc_info:
            service.get_task_by_id(999)

        assert "Task with ID 999 not found" in str(exc_info.value)


class TestCompleteTask:
    """Tests for complete_task() method."""

    def test_complete_task_success(self):
        """Test marking task as complete."""
        service = TaskService()
        task = service.add_task("Task", "Description")

        assert task.completed is False

        completed = service.complete_task(task.id)

        assert completed.completed is True
        assert completed == task  # Same object

    def test_complete_nonexistent_task(self):
        """Test complete_task raises TaskNotFoundError."""
        service = TaskService()

        from todo.errors import TaskNotFoundError
        with pytest.raises(TaskNotFoundError):
            service.complete_task(999)


class TestIncompleteTask:
    """Tests for incomplete_task() method."""

    def test_incomplete_task_success(self):
        """Test marking completed task as incomplete."""
        service = TaskService()
        task = service.add_task("Task", "Description")
        service.complete_task(task.id)

        assert task.completed is True

        incompleted = service.incomplete_task(task.id)

        assert incompleted.completed is False

    def test_incomplete_nonexistent_task(self):
        """Test incomplete_task raises TaskNotFoundError."""
        service = TaskService()

        from todo.errors import TaskNotFoundError
        with pytest.raises(TaskNotFoundError):
            service.incomplete_task(999)


class TestUpdateTask:
    """Tests for update_task() method."""

    def test_update_task_success(self):
        """Test updating task title and description."""
        service = TaskService()
        task = service.add_task("Original", "Original desc")

        updated = service.update_task(task.id, "Updated", "Updated desc")

        assert updated.title == "Updated"
        assert updated.description == "Updated desc"
        assert updated.id == task.id
        assert updated.completed == task.completed

    def test_update_task_trims_whitespace(self):
        """Test update_task trims whitespace."""
        service = TaskService()
        task = service.add_task("Task", "Description")

        updated = service.update_task(task.id, "  New Title  ", "  New Desc  ")

        assert updated.title == "New Title"
        assert updated.description == "New Desc"

    def test_update_task_validates_title(self):
        """Test update_task validates title."""
        service = TaskService()
        task = service.add_task("Task", "Description")

        # Empty title
        with pytest.raises(ValidationError):
            service.update_task(task.id, "", "Description")

        # Title too long
        with pytest.raises(ValidationError):
            service.update_task(task.id, "a" * 101, "Description")

    def test_update_task_validates_description(self):
        """Test update_task validates description."""
        service = TaskService()
        task = service.add_task("Task", "Description")

        # Description too long
        with pytest.raises(ValidationError):
            service.update_task(task.id, "Title", "a" * 501)

    def test_update_task_atomic(self):
        """Test update is atomic - no partial changes on validation failure."""
        service = TaskService()
        task = service.add_task("Original", "Original desc")

        # Attempt update with invalid description
        with pytest.raises(ValidationError):
            service.update_task(task.id, "New Title", "a" * 501)

        # Verify no changes applied
        assert task.title == "Original"
        assert task.description == "Original desc"

    def test_update_nonexistent_task(self):
        """Test update_task raises TaskNotFoundError."""
        service = TaskService()

        from todo.errors import TaskNotFoundError
        with pytest.raises(TaskNotFoundError):
            service.update_task(999, "Title", "Description")


class TestDeleteTask:
    """Tests for delete_task() method."""

    def test_delete_task_success(self):
        """Test deleting a task."""
        service = TaskService()
        task1 = service.add_task("Task 1", "Desc 1")
        task2 = service.add_task("Task 2", "Desc 2")
        task3 = service.add_task("Task 3", "Desc 3")

        service.delete_task(task2.id)

        tasks = service.list_tasks()
        assert len(tasks) == 2
        assert task1 in tasks
        assert task2 not in tasks
        assert task3 in tasks

    def test_delete_task_id_not_reused(self):
        """Test deleted task ID is not reused."""
        service = TaskService()
        task1 = service.add_task("Task 1", "Desc 1")
        service.delete_task(task1.id)

        task2 = service.add_task("Task 2", "Desc 2")

        # New task should get ID 2, not reuse ID 1
        assert task2.id == 2
        assert service.next_id == 3

    def test_delete_nonexistent_task(self):
        """Test delete_task raises TaskNotFoundError."""
        service = TaskService()

        from todo.errors import TaskNotFoundError
        with pytest.raises(TaskNotFoundError):
            service.delete_task(999)
