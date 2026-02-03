# Quickstart Guide: Phase I Todo App

**Project**: The Evolution of ToDo - Phase I
**Date**: 2025-12-31
**Status**: Ready for implementation

## Overview

This quickstart guide helps you set up, run, and test the Phase I todo application. The application is a command-line todo manager with in-memory storage, designed to demonstrate strict spec-driven development principles.

---

## Prerequisites

### Required Software

- **Python 3.13+**: Required for modern syntax and features
- **UV**: Python package and project manager
- **Git**: For version control (optional but recommended)
- **pytest**: For running tests (installed via UV)

### Installation

#### Install Python 3.13+

**Windows**:
```powershell
# Download from python.org or use winget
winget install Python.Python.3.13
```

**macOS**:
```bash
# Using Homebrew
brew install python@3.13
```

**Linux**:
```bash
# Using apt (Ubuntu/Debian)
sudo apt update
sudo apt install python3.13 python3.13-venv
```

#### Install UV

```bash
# Using official installer (cross-platform)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Or using pip
pip install uv
```

---

## Project Setup

### 1. Clone or Navigate to Repository

```bash
cd path/to/phase1-todo-app
```

### 2. Verify Branch

```bash
git branch --show-current
# Should output: 001-phase1-todo-app
```

### 3. Initialize UV Project (if not already done)

```bash
uv init
```

This creates `pyproject.toml` if it doesn't exist.

### 4. Install Development Dependencies

```bash
uv add --dev pytest pytest-cov
```

---

## Running the Application

### Start the Todo App

```bash
# From repository root
uv run python src/main.py
```

### Expected Output

```
Todo Application - Phase I
Type 'help' for available commands.

>
```

---

## Basic Usage

### Add a Task

```
> add
Enter title: Buy groceries
Enter description (optional): Milk, eggs, bread
Task added successfully! ID: 1
```

### List Tasks

```
> list
[ ] 1. Buy groceries — Milk, eggs, bread
```

### Mark Task Complete

```
> complete
Enter task ID: 1
Task 1 marked as complete!

> list
[x] 1. Buy groceries — Milk, eggs, bread
```

### Update a Task

```
> update
Enter task ID: 1
Enter new title: Buy groceries and snacks
Enter new description: Milk, eggs, bread, chips
Task 1 updated successfully!
```

### Delete a Task

```
> delete
Enter task ID: 1
Task 1 deleted successfully!

> list
No tasks found. Use 'add' to create a new task.
```

### Get Help

```
> help
Available commands:

add          - Create a new task with title and description
list         - Display all tasks in creation order
update       - Modify title and description of an existing task
delete       - Permanently remove a task
complete     - Mark a task as completed
incomplete   - Mark a task as incomplete
help         - Show this help message
exit         - Exit the application
```

### Exit Application

```
> exit
Goodbye!
```

---

## Testing

### Run All Tests

```bash
# From repository root
uv run pytest tests/
```

### Run Tests with Coverage

```bash
uv run pytest --cov=src/todo --cov-report=term-missing tests/
```

### Run Specific Test Categories

```bash
# Unit tests only
uv run pytest tests/unit/

# Integration tests only
uv run pytest tests/integration/

# Contract tests only
uv run pytest tests/contract/
```

### Run Specific Test File

```bash
uv run pytest tests/unit/test_validation.py
```

### Run Tests in Verbose Mode

```bash
uv run pytest -v tests/
```

---

## Validation Examples

### Valid Inputs

✅ **Title**: 1-100 characters (after trimming whitespace)
```
"Buy groceries"
"  Fix bug #123  " → trimmed to "Fix bug #123"
```

✅ **Description**: 0-500 characters (after trimming whitespace)
```
"Milk, eggs, bread"
"" (empty is valid - optional field)
```

✅ **IDs**: Integers that exist in task list
```
"1", "2", "10"
```

### Invalid Inputs

❌ **Empty Title**:
```
> add
Enter title:
ValidationError: Title cannot be empty. Please provide a title.
```

❌ **Title Too Long** (> 100 chars):
```
> add
Enter title: This is an extremely long title that exceeds the maximum...
ValidationError: Title exceeds 100 characters (current: 127). Please shorten.
```

❌ **Description Too Long** (> 500 chars):
```
> add
Enter title: Valid title
Enter description (optional): [501 characters]
ValidationError: Description exceeds 500 characters (current: 501). Please shorten.
```

❌ **Non-Integer ID**:
```
> complete
Enter task ID: abc
InvalidIDError: Invalid ID 'abc'. ID must be a number.
```

❌ **Non-Existent ID**:
```
> delete
Enter task ID: 999
TaskNotFoundError: Task with ID 999 not found.
```

❌ **Unknown Command**:
```
> lst
InvalidCommandError: Unknown command 'lst'. Type 'help' for available commands.
```

---

## Troubleshooting

### "Command not found: uv"

**Solution**: Install UV using the installer:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### "Python 3.13 not found"

**Solution**: Verify Python installation:
```bash
python3.13 --version
```

If not installed, follow Python installation steps above.

### "ModuleNotFoundError: No module named 'todo'"

**Solution**: Ensure you're running from repository root:
```bash
cd path/to/phase1-todo-app
uv run python src/main.py
```

### Tests Failing

**Solution**: Ensure pytest is installed:
```bash
uv add --dev pytest
```

### Application Doesn't Exit on "exit" Command

**Possible Issue**: Typo in command (check for "exti", "exot", etc.)
**Solution**: Type `exit` exactly (case-insensitive)

---

## Development Workflow

### 1. Read the Specification

Review [spec.md](./spec.md) for feature requirements and acceptance criteria.

### 2. Review the Plan

Review [plan.md](./plan.md) for architecture decisions and implementation sequence.

### 3. Write Tests First (TDD)

```bash
# Red: Write failing test
uv run pytest tests/unit/test_models.py -k test_todo_item_creation
# (Test fails - not implemented yet)

# Green: Implement minimum code to pass
# Edit src/todo/models.py

# Refactor: Clean up implementation
uv run pytest tests/unit/test_models.py -k test_todo_item_creation
# (Test passes)
```

### 4. Run All Tests Before Committing

```bash
uv run pytest tests/
```

### 5. Verify Acceptance Criteria

Check each acceptance scenario from spec.md:
- User Story 1: Add and View Tasks
- User Story 2: Mark Complete/Incomplete
- User Story 3: Update Tasks
- User Story 4: Delete Tasks
- User Story 5: Help and Exit

---

## Project Structure

```
phase1-todo-app/
├── src/
│   ├── todo/
│   │   ├── __init__.py
│   │   ├── models.py          # TodoItem domain model
│   │   ├── errors.py          # 5 custom exceptions
│   │   ├── validation.py      # Input validation functions
│   │   ├── services.py        # TaskService (state management)
│   │   └── cli.py             # CLI interface and command loop
│   └── main.py                # Application entry point
├── tests/
│   ├── unit/                  # Unit tests for individual modules
│   ├── integration/           # Integration tests for workflows
│   └── contract/              # Contract tests per specification
├── specs/001-phase1-todo-app/
│   ├── spec.md                # Feature specification
│   ├── plan.md                # Implementation plan
│   ├── research.md            # Technology decisions
│   ├── data-model.md          # TodoItem entity definition
│   ├── quickstart.md          # This file
│   └── contracts/             # Individual command specifications
├── pyproject.toml             # UV project configuration
└── README.md                  # Project overview
```

---

## Next Steps

1. **✅ Specification Complete**: [spec.md](./spec.md)
2. **✅ Planning Complete**: [plan.md](./plan.md)
3. **⏭️ Generate Tasks**: Run `/sp.tasks` to create detailed task breakdown
4. **⏭️ Implement**: Run `/sp.implement` to execute tasks in TDD sequence
5. **⏭️ Validate**: Verify all acceptance criteria and success metrics
6. **⏭️ Commit**: Create commit and PR with implementation

---

## Reference

- **Specification**: [spec.md](./spec.md)
- **Implementation Plan**: [plan.md](./plan.md)
- **Architecture Decisions**: [plan.md#architecture-decisions](./plan.md#architecture-decisions)
- **Data Model**: [data-model.md](./data-model.md)
- **Command Contracts**: [contracts/](./contracts/)
- **Constitution**: [../../.specify/memory/constitution.md](../../.specify/memory/constitution.md)

---

## Support

For issues, questions, or clarifications:
1. Review specification and plan documents
2. Check contract definitions for command-specific behavior
3. Run tests to identify specific failures
4. Verify constitutional compliance for architectural decisions

**Status**: ✅ **Ready for implementation** - All planning artifacts complete
