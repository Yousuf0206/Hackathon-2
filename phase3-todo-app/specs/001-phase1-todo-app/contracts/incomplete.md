# Command Contract: incomplete

**Command**: `incomplete`
**Purpose**: Mark a task as incomplete (set completed=False)
**Category**: State-mutating operation

## Input Specification

### Command Entry
- **Prompt**: `> `
- **User Input**: `incomplete` (case-insensitive)

### Task ID Input
- **Prompt**: `Enter task ID: `
- **User Input**: String (should be integer)
- **Validation**:
  1. Must parse as integer → `InvalidIDError`
  2. Must exist → `TaskNotFoundError`

## Processing

### State Mutation
1. Validate ID
2. Set `task.completed = False`
3. Leave ID, title, description unchanged

## Output Specification

### Success
```
Task {id} marked as incomplete!
```

### Errors
```
InvalidIDError: Invalid ID '{input}'. ID must be a number.
TaskNotFoundError: Task with ID {id} not found.
```

## Examples

### Example 1: Mark Incomplete
**Input**:
```
> incomplete
Enter task ID: 2
```
**Output**: `Task 2 marked as incomplete!`
**State**: Task 2 `completed` changed from True to False

## Acceptance Criteria

- [x] **AS2.2**: Mark complete task incomplete, displays [ ] in list

## Testing Checklist

- [ ] Mark complete task incomplete
- [ ] Mark already-incomplete task (idempotent)
- [ ] Verify [ ] appears in list output
