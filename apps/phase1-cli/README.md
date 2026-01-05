# Phase I — Todo In-Memory Python Console App

A command-line todo application with in-memory task storage, explicit input validation, and deterministic behavior following strict spec-driven development principles.

## Features

- ✅ **Add Tasks**: Create tasks with titles and descriptions
- ✅ **List Tasks**: View all tasks in creation order with completion status
- ✅ **Mark Complete/Incomplete**: Track task progress
- ✅ **Update Tasks**: Modify task titles and descriptions
- ✅ **Delete Tasks**: Remove unwanted tasks permanently
- ✅ **Help Command**: View all available commands
- ✅ **Exit Command**: Gracefully terminate the application

## Quick Start

### Prerequisites

- Python 3.13 or higher
- UV package manager

### Installation

```bash
# Clone or navigate to the repository
cd phase1-todo-app

# Install dependencies
uv sync

# Run the application
uv run python src/main.py
```

### Usage

### Quick Start Commands

```bash
# Run the application
uv run python src/main.py

# Basic workflow
> add              # Create a new task
> list             # View all tasks
> complete [ID]    # Mark task as done
> exit             # Quit application
```

### Example Session

```
Todo Application - Phase I
Type 'help' for available commands.

> add
Enter title: Buy groceries
Enter description: Milk, eggs, bread
Task added successfully! ID: 1

> list
=== Your Tasks ===
[ ] 1. Buy groceries — Milk, eggs, bread

> complete
Enter task ID: 1
Task 1 marked as complete!

> list
=== Your Tasks ===
[x] 1. Buy groceries — Milk, eggs, bread
```

### 📖 Command Documentation

- **[COMMANDS.md](COMMANDS.md)** - Complete command reference with examples
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick reference card
- **[demo.txt](demo.txt)** - Interactive demo script

## Architecture

This application follows clean architecture principles with strict separation of concerns:

```
src/todo/
├── models.py       # Domain models (TodoItem)
├── errors.py       # Custom exceptions (5 error types)
├── validation.py   # Input validation functions
├── services.py     # Business logic (TaskService)
└── cli.py          # CLI interface and command handling
```

### Key Principles

- **Zero-trust input**: All input validated explicitly before processing
- **Fail-fast validation**: Operations terminate immediately on validation failure
- **Atomic operations**: No partial state mutations
- **Deterministic behavior**: Sequential IDs, creation order preserved
- **Clean error messages**: User-friendly messages without stack traces

## Development

### Running Tests

```bash
# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov=src/todo --cov-report=term-missing

# Run specific test file
uv run pytest tests/unit/test_services.py -v
```

### Test Statistics

- **68 unit tests** covering all modules
- **100% pass rate**
- Comprehensive coverage of validation, service logic, and error handling

## Validation Rules

- **Title**: 1-100 characters (after trimming), required
- **Description**: 0-500 characters (after trimming), optional
- **Task IDs**: Positive integers, never reused after deletion
- **Commands**: Case-insensitive (add, ADD, Add all work)

## Error Handling

The application uses 5 explicit error types:

- `InvalidCommandError`: Unknown command entered
- `ValidationError`: Input fails validation rules
- `InvalidIDError`: ID is not a valid integer
- `TaskNotFoundError`: Task with given ID doesn't exist
- `EmptyInputError`: Required input is empty

All errors provide clear messages explaining what went wrong and how to fix it.

## Project Structure

```
phase1-todo-app/
├── src/
│   ├── todo/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── errors.py
│   │   ├── validation.py
│   │   ├── services.py
│   │   └── cli.py
│   └── main.py
├── tests/
│   ├── unit/
│   │   ├── test_models.py
│   │   ├── test_errors.py
│   │   ├── test_validation.py
│   │   └── test_services.py
│   ├── integration/
│   └── contract/
├── specs/001-phase1-todo-app/
│   ├── spec.md          # Feature specification
│   ├── plan.md          # Implementation plan
│   ├── tasks.md         # Task breakdown
│   ├── data-model.md    # Entity definitions
│   ├── research.md      # Technology decisions
│   ├── quickstart.md    # Setup guide
│   └── contracts/       # Command specifications
├── pyproject.toml
├── .gitignore
└── README.md
```

## Documentation

- **[Specification](specs/001-phase1-todo-app/spec.md)**: Complete feature requirements
- **[Implementation Plan](specs/001-phase1-todo-app/plan.md)**: Architecture and design decisions
- **[Task Breakdown](specs/001-phase1-todo-app/tasks.md)**: Detailed implementation tasks
- **[Quickstart Guide](specs/001-phase1-todo-app/quickstart.md)**: Setup and usage instructions

## Constitutional Compliance

This implementation adheres to strict spec-driven development principles:

- ✅ **C-2**: Zero-trust input model
- ✅ **C-4**: Deterministic behavior
- ✅ **C-10**: Atomic operations
- ✅ **C-11/C-12**: Explicit error handling with user-friendly messages
- ✅ **C-13**: In-memory only (no persistence)
- ✅ **C-15**: Clean architecture
- ✅ **C-16**: Python 3.13+, UV, standard library only

## License

Phase I Todo Application - Educational implementation following spec-driven development.

## Support

For issues or questions, refer to:
- Specification: `specs/001-phase1-todo-app/spec.md`
- Architecture: `specs/001-phase1-todo-app/plan.md`
- Setup Guide: `specs/001-phase1-todo-app/quickstart.md`
