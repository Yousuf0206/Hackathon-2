# Data Model: Phase I Todo App

**Feature**: Phase I — Todo In-Memory Python Console App
**Date**: 2025-12-31
**Status**: Complete

## Overview

This document defines the domain model for the Phase I todo application. The model consists of a single entity (TodoItem) with strict validation rules and clear state transitions. The model is deliberately simple - a pure data container with no business logic.

---

## Entity: TodoItem

### Description

Represents a single todo task with a unique identifier, title, description, and completion status. Tasks are created in an incomplete state and can be updated, marked complete/incomplete, or deleted.

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| **id** | `int` | Required, unique, ≥ 1, auto-increment, never reused | Unique identifier assigned at creation time |
| **title** | `str` | Required, trimmed, 1-100 characters | Short task description, always visible |
| **description** | `str` | Optional, trimmed, 0-500 characters | Extended task details, can be empty |
| **completed** | `bool` | Required, defaults to `False` | Completion status (True = done, False = pending) |

### Field Details

#### id: int
- **Purpose**: Unique identifier for task referencing
- **Generation**: Auto-incremented sequentially starting from 1
- **Uniqueness**: Never reused, even after task deletion
- **Immutable**: Set at creation, never changed
- **Validation**: N/A (system-generated, users never provide)
- **Examples**: 1, 2, 3, ..., 999

#### title: str
- **Purpose**: Primary task description shown in all views
- **Required**: Yes (cannot be empty or whitespace-only)
- **Trimming**: Whitespace removed from both ends before validation
- **Length**: 1-100 characters (after trimming)
- **Validation Errors**:
  - Empty string after trimming → `ValidationError: Title cannot be empty.`
  - Length > 100 → `ValidationError: Title exceeds 100 characters. Current length: [N].`
- **Examples**:
  - Valid: `"Buy groceries"`, `"  Fix bug #123  "` (trimmed to `"Fix bug #123"`)
  - Invalid: `""`, `"   "` (empty after trim), `"A" * 101` (too long)

#### description: str
- **Purpose**: Extended task details, context, notes
- **Required**: No (can be empty string)
- **Trimming**: Whitespace removed from both ends before validation
- **Length**: 0-500 characters (after trimming)
- **Validation Errors**:
  - Length > 500 → `ValidationError: Description exceeds 500 characters. Current length: [N].`
- **Examples**:
  - Valid: `""`, `"Pick up milk, eggs, bread"`, `"  Some context  "` (trimmed)
  - Invalid: `"A" * 501` (too long)

#### completed: bool
- **Purpose**: Track whether task is finished
- **Required**: Yes
- **Default**: `False` (new tasks are incomplete)
- **Mutable**: Can be toggled via `complete` and `incomplete` commands
- **Values**: `True` (task done), `False` (task pending)
- **Display**: `[x]` when True, `[ ]` when False

---

## State Transitions

### Creation
```
[No State] → CREATE with (title, description) → TodoItem(id=auto, title=value, description=value, completed=False)
```
- New task always starts with `completed=False`
- ID assigned from incrementing counter
- Title and description validated before creation

### Update
```
TodoItem → UPDATE with (new_title, new_description) → TodoItem(same_id, new_title, new_description, same_completed)
```
- **Atomic**: Both title and description updated together or not at all
- ID and completion status unchanged
- Both fields validated before update occurs
- If validation fails for either field, no changes applied

### Completion Status Change
```
TodoItem(completed=False) → COMPLETE → TodoItem(completed=True)
TodoItem(completed=True) → INCOMPLETE → TodoItem(completed=False)
```
- Only `completed` field changes
- ID, title, description remain unchanged
- Can toggle between states freely

### Deletion
```
TodoItem → DELETE → [No State]
```
- Task removed from list
- ID never reused
- Operation is permanent (no undo)

---

## Validation Rules

### Input Validation (Pre-Storage)

All validation occurs **before** entity creation or modification:

1. **Title Validation**:
   - Input: raw string from user
   - Trim whitespace from both ends
   - Check: length ≥ 1 and length ≤ 100
   - Fail: Raise `ValidationError` with descriptive message
   - Success: Return trimmed string

2. **Description Validation**:
   - Input: raw string from user (can be empty)
   - Trim whitespace from both ends
   - Check: length ≤ 500
   - Fail: Raise `ValidationError` with descriptive message
   - Success: Return trimmed string (may be empty)

3. **ID Validation** (for update/delete/complete/incomplete):
   - Input: raw string from user
   - Check: Can be parsed as integer
   - Fail: Raise `InvalidIDError`
   - Success: Parse to int
   - Then check: ID exists in task list
   - Fail: Raise `TaskNotFoundError`
   - Success: Return TodoItem reference

### Entity Invariants

These must hold true at all times:

1. **ID Uniqueness**: No two tasks have the same ID (enforced by sequential generation)
2. **ID Non-Reuse**: Deleted task IDs never assigned to new tasks (enforced by non-decrementing counter)
3. **Title Non-Empty**: Title field never contains empty string (enforced by validation)
4. **Field Lengths**: Title ≤ 100 chars, description ≤ 500 chars (enforced by validation)
5. **Creation Order**: Tasks maintain insertion order in list (enforced by list data structure)

---

## Domain Constraints

### Functional Constraints

| Constraint | Specification Reference | Enforcement |
|------------|------------------------|-------------|
| IDs start at 1 | FR-008 | next_id initialized to 1 |
| IDs are sequential | FR-008 | Increment counter on each add |
| IDs never reused | FR-009 | Counter never decrements |
| Creation order preserved | FR-010 | Tasks stored in list (ordered) |
| Validation before mutation | FR-002 | validate_*() called before state change |
| Atomic updates | FR-013 | Validate all fields before applying any |
| Title required | FR-004 | validate_title() rejects empty |
| Title length 1-100 | FR-005 | validate_title() checks length |
| Description length 0-500 | FR-006 | validate_description() checks length |
| Description optional | FR-007 | Empty string accepted |

### Architectural Constraints

| Constraint | Specification Reference | Enforcement |
|------------|------------------------|-------------|
| No validation in model | FR-021 | validation.py module separate from models.py |
| Model is data container only | C-15 (clean architecture) | No methods beyond dataclass defaults |
| No business logic in model | FR-022 | Logic resides in services.py |

---

## Implementation Specification

### Python Dataclass Definition

```python
from dataclasses import dataclass

@dataclass
class TodoItem:
    """
    Domain model for a todo task.

    This is a pure data container with no business logic.
    Validation occurs in validation.py before instance creation.
    State mutations occur in services.py after validation.
    """
    id: int
    title: str
    description: str
    completed: bool = False
```

**Design Notes**:
- `@dataclass` provides automatic `__init__`, `__repr__`, `__eq__`
- `frozen=False` (default) allows mutation (needed for `completed` field updates)
- No validation methods (validation.py handles this)
- No business methods (services.py handles this)
- Type hints document expected types

### Storage Structure

```python
class TaskService:
    def __init__(self):
        self.tasks: list[TodoItem] = []  # Ordered list, preserves creation sequence
        self.next_id: int = 1             # ID counter, never decrements
```

**Design Notes**:
- `list` preserves insertion order (Python 3.7+ guaranteed)
- `next_id` incremented after each add, never reset
- Delete removes from list but doesn't decrement counter
- Lookup by ID requires linear search (O(n), acceptable for target scale)

---

## Usage Examples

### Valid TodoItem Creation

```python
# After validation in services.py
task1 = TodoItem(
    id=1,
    title="Buy groceries",
    description="Milk, eggs, bread",
    completed=False
)

task2 = TodoItem(
    id=2,
    title="Fix bug #123",
    description="",  # Empty description is valid
    completed=False
)
```

### State Mutations

```python
# Marking task complete (after validation)
task1.completed = True

# Updating task (after validation, atomic)
task1.title = "Buy groceries and snacks"
task1.description = "Milk, eggs, bread, chips"
```

### Invalid Operations (Prevented by Validation Layer)

```python
# These would be caught by validation.py before reaching models/services:

# Empty title
validate_title("")  # Raises ValidationError

# Title too long
validate_title("A" * 101)  # Raises ValidationError

# Description too long
validate_description("B" * 501)  # Raises ValidationError

# Invalid ID
validate_id("not_a_number")  # Raises InvalidIDError

# Non-existent ID
service.get_task(9999)  # Raises TaskNotFoundError
```

---

## Testing Checklist

### Unit Tests (models.py)

- [ ] TodoItem instantiation with valid fields
- [ ] TodoItem equality comparison (`__eq__`)
- [ ] TodoItem string representation (`__repr__`)
- [ ] TodoItem default value for `completed` (False)
- [ ] TodoItem field access (getters)
- [ ] TodoItem field mutation (setters) for `completed`, `title`, `description`

### Validation Tests (validation.py)

- [ ] validate_title: accept 1-100 char strings
- [ ] validate_title: trim whitespace correctly
- [ ] validate_title: reject empty string after trim
- [ ] validate_title: reject 101+ char strings
- [ ] validate_description: accept 0-500 char strings
- [ ] validate_description: trim whitespace correctly
- [ ] validate_description: reject 501+ char strings
- [ ] validate_id: parse valid integer strings
- [ ] validate_id: reject non-integer strings

### State Management Tests (services.py)

- [ ] ID counter starts at 1
- [ ] ID increments sequentially (1, 2, 3, ...)
- [ ] IDs never reused after deletion
- [ ] Tasks maintain creation order in list
- [ ] Atomic update: failure leaves task unchanged
- [ ] TaskNotFoundError raised for non-existent IDs

---

## Future Considerations (Out of Scope for Phase I)

The following are explicitly excluded but documented for future phases:

- **Persistence**: Saving/loading tasks from files or databases
- **Task Relationships**: Dependencies, parent/child tasks
- **Task Metadata**: Created timestamp, updated timestamp, priority, tags
- **Task Search**: Filtering, sorting, full-text search
- **Undo/Redo**: Operation history and rollback
- **Concurrency**: Multi-user access, locking, conflict resolution

---

## Data Model Status

**Status**: ✅ **Complete**

**Validation**: All constraints align with specification requirements FR-001 through FR-026

**Ready for**: Contract generation and implementation (Phase 2 tasks)
