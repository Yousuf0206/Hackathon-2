# Command Contract: complete

**Command**: `complete`
**Purpose**: Mark a task as completed (set completed=True)
**Category**: State-mutating operation

## Input Specification

### Command Entry
- **Prompt**: `> `
- **User Input**: `complete` (case-insensitive)

### Task ID Input
- **Prompt**: `Enter task ID: `
- **User Input**: String (should be integer)
- **Validation**:
  1. Must parse as integer → `InvalidIDError`
  2. Must exist → `TaskNotFoundError`

## Processing

### State Mutation
1. Validate ID
2. Set `task.completed = True`
3. Leave ID, title, description unchanged

## Output Specification

### Success
```
Task {id} marked as complete!
```

### Errors
```
InvalidIDError: Invalid ID '{input}'. ID must be a number.
TaskNotFoundError: Task with ID {id} not found.
```

## Examples

### Example 1: Mark Complete
**Input**:
```
> complete
Enter task ID: 1
```
**Output**: `Task 1 marked as complete!`
**State**: Task 1 `completed` changed from False to True

## Acceptance Criteria

- [x] **AS2.1**: Mark incomplete task complete, displays [x] in list
- [x] **AS2.3**: InvalidIDError on non-integer
- [x] **AS2.4**: TaskNotFoundError on non-existent ID

## Testing Checklist

- [ ] Complete incomplete task
- [ ] Complete already-complete task (idempotent)
- [ ] Complete with invalid ID
- [ ] Verify [x] appears in list output
