"""
CLI interface for the Phase I Todo Application.

This module provides the command-line interface, command dispatcher,
and user interaction logic. No business logic resides here.

Constitutional Compliance:
- C-15: Clean architecture - CLI separate from business logic
- C-12: User-friendly error messages (what, why, how-to-fix)
- FR-016: Never terminate loop on errors, only on 'exit' command
- FR-017: Never display stack traces to users
"""

from todo.services import TaskService
from todo.validation import validate_command, validate_id
from todo.errors import (
    InvalidCommandError,
    ValidationError,
    InvalidIDError,
    TaskNotFoundError,
    EmptyInputError
)


class CLI:
    """
    Command-line interface for the todo application.

    Handles user interaction, command dispatching, and error display.
    Business logic delegated to TaskService.
    """

    def __init__(self):
        """Initialize CLI with TaskService instance."""
        self.service = TaskService()
        self.running = False

    def run(self):
        """
        Main command loop.

        Displays welcome message and processes commands until 'exit' is entered.
        Catches all exceptions to prevent termination on errors.
        """
        print("Todo Application - Phase I")
        print("Type 'help' for available commands.\n")

        self.running = True

        while self.running:
            try:
                # Get command from user
                cmd_input = input("> ").strip()

                # Skip empty input
                if not cmd_input:
                    continue

                # Validate and dispatch command
                cmd = validate_command(cmd_input)
                self.handle_command(cmd)

            except (InvalidCommandError, ValidationError, InvalidIDError,
                    TaskNotFoundError, EmptyInputError) as e:
                self.display_error(e)

            except KeyboardInterrupt:
                print("\n\nInterrupted. Type 'exit' to quit.")

            except Exception as e:
                # Catch unexpected errors during development
                print(f"Unexpected error: {e}")
                print("Please report this issue.")

    def handle_command(self, cmd: str):
        """
        Dispatch command to appropriate handler.

        Args:
            cmd: Validated, lowercase command string

        Raises:
            InvalidCommandError: If command not recognized (should not happen after validation)
        """
        if cmd == "add":
            self.handle_add()
        elif cmd == "list":
            self.handle_list()
        elif cmd == "update":
            self.handle_update()
        elif cmd == "delete":
            self.handle_delete()
        elif cmd == "complete":
            self.handle_complete()
        elif cmd == "incomplete":
            self.handle_incomplete()
        elif cmd == "help":
            self.handle_help()
        elif cmd == "exit":
            self.handle_exit()
        else:
            raise InvalidCommandError(f"Unknown command '{cmd}'. Type 'help' for available commands.")

    def handle_add(self):
        """
        Handle 'add' command to create a new task.

        Prompts for title and description, validates inputs,
        creates task via service, and displays success message.
        """
        print("\n=== Add New Task ===")

        # Get title
        title = input("Enter title: ")

        # Get description (optional)
        description = input("Enter description (optional): ")

        # Create task (validation happens in service)
        task = self.service.add_task(title, description)

        print(f"\nTask added successfully! ID: {task.id}")

    def handle_list(self):
        """
        Handle 'list' command to display all tasks.

        Retrieves tasks from service and displays in format:
        [x] ID. Title — Description
        [ ] ID. Title — Description
        """
        tasks = self.service.list_tasks()

        if not tasks:
            print("\nNo tasks found. Use 'add' to create a new task.")
            return

        print("\n=== Your Tasks ===")
        for task in tasks:
            # Format completion checkbox
            checkbox = "[x]" if task.completed else "[ ]"

            # Format output line
            if task.description:
                print(f"{checkbox} {task.id}. {task.title} — {task.description}")
            else:
                print(f"{checkbox} {task.id}. {task.title}")

    def handle_update(self):
        """
        Handle 'update' command to modify existing task.

        Prompts for ID, new title, and new description.
        Updates task atomically via service.
        """
        print("\n=== Update Task ===")

        # Get task ID
        id_str = input("Enter task ID: ")
        task_id = validate_id(id_str)

        # Get new title
        new_title = input("Enter new title: ")

        # Get new description
        new_description = input("Enter new description: ")

        # Update task (validation and atomicity handled in service)
        task = self.service.update_task(task_id, new_title, new_description)

        print(f"\nTask {task.id} updated successfully!")

    def handle_delete(self):
        """
        Handle 'delete' command to remove task permanently.

        Prompts for ID and deletes task via service.
        """
        print("\n=== Delete Task ===")

        # Get task ID
        id_str = input("Enter task ID: ")
        task_id = validate_id(id_str)

        # Delete task
        self.service.delete_task(task_id)

        print(f"\nTask {task_id} deleted successfully!")

    def handle_complete(self):
        """
        Handle 'complete' command to mark task as done.

        Prompts for ID and marks task complete via service.
        """
        print("\n=== Mark Task Complete ===")

        # Get task ID
        id_str = input("Enter task ID: ")
        task_id = validate_id(id_str)

        # Mark complete
        task = self.service.complete_task(task_id)

        print(f"\nTask {task.id} marked as complete!")

    def handle_incomplete(self):
        """
        Handle 'incomplete' command to mark task as not done.

        Prompts for ID and marks task incomplete via service.
        """
        print("\n=== Mark Task Incomplete ===")

        # Get task ID
        id_str = input("Enter task ID: ")
        task_id = validate_id(id_str)

        # Mark incomplete
        task = self.service.incomplete_task(task_id)

        print(f"\nTask {task.id} marked as incomplete!")

    def handle_help(self):
        """
        Handle 'help' command to display available commands.

        Shows all 8 commands with brief descriptions.
        """
        print("\n=== Available Commands ===\n")
        print("add          - Create a new task with title and description")
        print("list         - Display all tasks in creation order")
        print("update       - Modify title and description of an existing task")
        print("delete       - Permanently remove a task")
        print("complete     - Mark a task as completed")
        print("incomplete   - Mark a task as incomplete")
        print("help         - Show this help message")
        print("exit         - Exit the application")

    def handle_exit(self):
        """
        Handle 'exit' command to terminate application.

        Sets running flag to False to exit main loop.
        """
        print("\nGoodbye!")
        self.running = False

    def display_error(self, error: Exception):
        """
        Display user-friendly error message.

        Formats error messages with clear guidance on how to fix.
        Never displays stack traces.

        Args:
            error: Exception to display
        """
        error_type = type(error).__name__
        message = str(error)

        print(f"\nERROR - {error_type}: {message}\n")


def main():
    """Entry point for the application."""
    cli = CLI()
    cli.run()


if __name__ == "__main__":
    main()
