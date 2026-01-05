# Todo Application - Command Reference

Complete guide to using all commands in the Phase I Todo Application.

## Quick Start

```bash
# Run the application
uv run python src/main.py
```

---

## Command Overview

| Command | Purpose | Example |
|---------|---------|---------|
| `add` | Create a new task | Add "Buy groceries" |
| `list` | Display all tasks | View all tasks with IDs |
| `update` | Modify existing task | Update task #1 |
| `delete` | Remove a task | Delete task #1 |
| `complete` | Mark task as done | Complete task #1 |
| `incomplete` | Mark task as not done | Incomplete task #1 |
| `help` | Show all commands | Display command list |
| `exit` | Quit application | Exit gracefully |

---

## Detailed Command Guide

### 1. ADD - Create New Task

**Purpose**: Add a new task with title and description to your todo list.

**Steps**:
```
> add
Enter title: Buy groceries
Enter description (optional): Milk, eggs, bread, coffee

Task added successfully! ID: 1
```

**Validation Rules**:
- ✅ Title: **Required**, 1-100 characters
- ✅ Description: **Optional**, 0-500 characters
- ✅ Whitespace automatically trimmed

**Examples**:

```bash
# Simple task with description
> add
Enter title: Write report
Enter description (optional): Q4 financial summary

# Task without description
> add
Enter title: Call dentist
Enter description (optional):

# Task with whitespace (auto-trimmed)
> add
Enter title:   Schedule meeting
Enter description (optional):   Team standup
```

**Error Cases**:
```bash
# Empty title
> add
Enter title:
❌ ValidationError: Title cannot be empty. Please provide a title.

# Title too long (>100 chars)
> add
Enter title: This is an extremely long title that exceeds the one hundred character limit...
❌ ValidationError: Title exceeds 100 characters (current: 127). Please shorten.

# Description too long (>500 chars)
> add
Enter title: Valid title
Enter description (optional): [501+ characters]
❌ ValidationError: Description exceeds 500 characters (current: 501). Please shorten.
```

---

### 2. LIST - Display All Tasks

**Purpose**: View all your tasks in creation order with completion status.

**Usage**:
```
> list

=== Your Tasks ===
[ ] 1. Buy groceries — Milk, eggs, bread, coffee
[x] 2. Write report — Q4 financial summary
[ ] 3. Call dentist
[ ] 4. Schedule meeting — Team standup
```

**Output Format**:
- `[ ]` = Incomplete task
- `[x]` = Completed task
- Number = Task ID (for use with other commands)
- Format: `[status] ID. Title — Description`

**Empty List**:
```
> list

No tasks found. Use 'add' to create a new task.
```

**Key Features**:
- ✅ Tasks displayed in **creation order**
- ✅ Completion status shown with checkboxes
- ✅ Unique IDs for referencing tasks

---

### 3. UPDATE - Modify Task Details

**Purpose**: Change the title and/or description of an existing task.

**Steps**:
```
> update
Enter task ID: 1
Enter new title: Buy groceries and snacks
Enter new description: Milk, eggs, bread, coffee, chips

Task 1 updated successfully!
```

**Before Update**:
```
[ ] 1. Buy groceries — Milk, eggs, bread, coffee
```

**After Update**:
```
[ ] 1. Buy groceries and snacks — Milk, eggs, bread, coffee, chips
```

**Validation Rules**:
- ✅ Task ID must exist
- ✅ New title: 1-100 characters (required)
- ✅ New description: 0-500 characters (optional)
- ✅ **Atomic operation**: Both fields updated together or not at all

**Examples**:

```bash
# Update both fields
> update
Enter task ID: 2
Enter new title: Write Q4 report
Enter new description: Include revenue, expenses, and projections

# Update to empty description
> update
Enter task ID: 3
Enter new title: Call dentist - urgent
Enter new description:
```

**Error Cases**:
```bash
# Invalid ID format
> update
Enter task ID: abc
❌ InvalidIDError: Invalid task ID 'abc'. ID must be a number.

# Non-existent task
> update
Enter task ID: 999
❌ TaskNotFoundError: Task with ID 999 not found.

# Invalid new title
> update
Enter task ID: 1
Enter new title:
❌ ValidationError: Title cannot be empty. Please provide a title.
```

---

### 4. DELETE - Remove Task

**Purpose**: Permanently delete a task from your list.

**Steps**:
```
> delete
Enter task ID: 1

Task 1 deleted successfully!
```

**Before Delete**:
```
[ ] 1. Buy groceries — Milk, eggs, bread
[ ] 2. Write report — Q4 financial summary
[ ] 3. Call dentist
```

**After Delete**:
```
[ ] 2. Write report — Q4 financial summary
[ ] 3. Call dentist
```

**Important Notes**:
- ⚠️ **Permanent operation** - cannot be undone
- ✅ **IDs never reused** - Next task will get ID 4, not ID 1
- ✅ Task removed from list immediately

**Examples**:

```bash
# Delete a task
> delete
Enter task ID: 5
Task 5 deleted successfully!

# Verify deletion
> list
[ ] 2. Write report — Q4 financial summary
[ ] 3. Call dentist
[ ] 4. Schedule meeting
```

**Error Cases**:
```bash
# Invalid ID
> delete
Enter task ID: xyz
❌ InvalidIDError: Invalid task ID 'xyz'. ID must be a number.

# Task doesn't exist
> delete
Enter task ID: 100
❌ TaskNotFoundError: Task with ID 100 not found.
```

---

### 5. COMPLETE - Mark Task as Done

**Purpose**: Mark a task as completed (changes checkbox from [ ] to [x]).

**Steps**:
```
> complete
Enter task ID: 1

Task 1 marked as complete!
```

**Before**:
```
[ ] 1. Buy groceries — Milk, eggs, bread
```

**After**:
```
[x] 1. Buy groceries — Milk, eggs, bread
```

**Examples**:

```bash
# Mark task as complete
> complete
Enter task ID: 2
Task 2 marked as complete!

# Verify in list
> list
[x] 1. Buy groceries — Milk, eggs, bread
[x] 2. Write report — Q4 financial summary
[ ] 3. Call dentist
```

**Error Cases**:
```bash
# Invalid ID format
> complete
Enter task ID: done
❌ InvalidIDError: Invalid task ID 'done'. ID must be a number.

# Non-existent task
> complete
Enter task ID: 50
❌ TaskNotFoundError: Task with ID 50 not found.
```

---

### 6. INCOMPLETE - Mark Task as Not Done

**Purpose**: Mark a completed task as incomplete (changes checkbox from [x] to [ ]).

**Steps**:
```
> incomplete
Enter task ID: 1

Task 1 marked as incomplete!
```

**Before**:
```
[x] 1. Buy groceries — Milk, eggs, bread
```

**After**:
```
[ ] 1. Buy groceries — Milk, eggs, bread
```

**Use Cases**:
- Accidentally marked task as complete
- Task needs to be redone
- Status changed (e.g., groceries need to be bought again)

**Examples**:

```bash
# Unmark a completed task
> incomplete
Enter task ID: 2
Task 2 marked as incomplete!

# Toggle completion status
> complete
Enter task ID: 2
Task 2 marked as complete!

> incomplete
Enter task ID: 2
Task 2 marked as incomplete!
```

---

### 7. HELP - Show Available Commands

**Purpose**: Display all available commands with descriptions.

**Usage**:
```
> help

=== Available Commands ===

add          - Create a new task with title and description
list         - Display all tasks in creation order
update       - Modify title and description of an existing task
delete       - Permanently remove a task
complete     - Mark a task as completed
incomplete   - Mark a task as incomplete
help         - Show this help message
exit         - Exit the application
```

**When to Use**:
- Forgot a command name
- First time using the application
- Need to see what commands are available

---

### 8. EXIT - Quit Application

**Purpose**: Gracefully terminate the application.

**Usage**:
```
> exit

Goodbye!
```

**Notes**:
- ✅ Clean shutdown (no errors)
- ⚠️ All data is lost (in-memory only, no persistence)
- ✅ Can also use Ctrl+C for emergency exit

---

## Complete Workflow Example

Here's a complete session showing all commands:

```bash
$ uv run python src/main.py

Todo Application - Phase I
Type 'help' for available commands.

> help

=== Available Commands ===
[... command list ...]

> add
Enter title: Buy groceries
Enter description (optional): Milk, eggs, bread
Task added successfully! ID: 1

> add
Enter title: Write report
Enter description (optional): Q4 summary
Task added successfully! ID: 2

> add
Enter title: Call dentist
Enter description (optional):
Task added successfully! ID: 3

> list

=== Your Tasks ===
[ ] 1. Buy groceries — Milk, eggs, bread
[ ] 2. Write report — Q4 summary
[ ] 3. Call dentist

> complete
Enter task ID: 1
Task 1 marked as complete!

> update
Enter task ID: 2
Enter new title: Write Q4 financial report
Enter new description: Include revenue and projections
Task 2 updated successfully!

> list

=== Your Tasks ===
[x] 1. Buy groceries — Milk, eggs, bread
[ ] 2. Write Q4 financial report — Include revenue and projections
[ ] 3. Call dentist

> delete
Enter task ID: 3
Task 3 deleted successfully!

> list

=== Your Tasks ===
[x] 1. Buy groceries — Milk, eggs, bread
[ ] 2. Write Q4 financial report — Include revenue and projections

> incomplete
Enter task ID: 1
Task 1 marked as incomplete!

> list

=== Your Tasks ===
[ ] 1. Buy groceries — Milk, eggs, bread
[ ] 2. Write Q4 financial report — Include revenue and projections

> exit

Goodbye!
```

---

## Tips & Best Practices

### ✅ Command Entry
- Commands are **case-insensitive**: `add`, `ADD`, `Add` all work
- Press Enter after typing a command
- Empty input is ignored (just press Enter again)

### ✅ Task IDs
- Use the `list` command to see task IDs
- IDs are **permanent** - never change or get reused
- After deleting task #1, new tasks start at #4, #5, etc.

### ✅ Title & Description
- Whitespace is automatically trimmed
- Title is required (1-100 characters)
- Description is optional (0-500 characters)

### ✅ Error Recovery
- Errors don't crash the app - just try again
- Error messages explain what went wrong
- Use `help` if you forget command names

### ✅ Data Persistence
- ⚠️ **All data is lost when you exit** (in-memory only)
- This is Phase I - no file saving
- Each session starts with an empty list

---

## Error Messages Quick Reference

| Error Type | Meaning | Solution |
|------------|---------|----------|
| `InvalidCommandError` | Unknown command | Use `help` to see valid commands |
| `ValidationError` | Input failed validation | Check title/description length |
| `InvalidIDError` | ID is not a number | Enter a numeric task ID |
| `TaskNotFoundError` | Task doesn't exist | Use `list` to see valid IDs |
| `EmptyInputError` | Required input is empty | Provide non-empty input |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Submit command/input |
| `Ctrl+C` | Emergency exit (may show interruption message) |
| `Ctrl+Z` (Windows) / `Ctrl+D` (Unix) | EOF signal (exits program) |

---

## Validation Rules Summary

| Field | Min | Max | Required | Notes |
|-------|-----|-----|----------|-------|
| Command | - | - | Yes | Case-insensitive, 8 valid commands |
| Task ID | 1 | ∞ | Yes* | Positive integer, must exist |
| Title | 1 char | 100 chars | Yes | Whitespace trimmed |
| Description | 0 chars | 500 chars | No | Whitespace trimmed, can be empty |

*Required for update, delete, complete, incomplete commands

---

## Need More Help?

- Run `help` command inside the application
- Check README.md for project overview
- Review specs/001-phase1-todo-app/quickstart.md for setup guide
- All 68 unit tests verify correct behavior

---

**Happy task managing!** 📝✅
