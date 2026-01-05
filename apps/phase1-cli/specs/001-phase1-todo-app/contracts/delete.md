# Command Contract: delete

**Command**: `delete`
**Purpose**: Permanently remove a task from the list
**Category**: State-mutating operation (destructive)

## Input Specification

### Command Entry
- **Prompt**: `> `
- **User Input**: `delete` (case-insensitive)

### Task ID Input
- **Prompt**: `Enter task ID: `
- **User Input**: String (should be integer)
- **Validation**:
  1. Must parse as integer → `InvalidIDError`
  2. Must exist in task list → `TaskNotFoundError`

## Processing

### State Mutation
1. Validate ID exists
2. Remove task from tasks list
3. **ID counter unchanged** (never reused)

## Output Specification

### Success
```
Task {id} deleted successfully!
```

### Errors
```
InvalidIDError: Invalid ID '{input}'. ID must be a number.
TaskNotFoundError: Task with ID {id} not found.
```

## Examples

### Example 1: Successful Deletion
**Input**:
```
> delete
Enter task ID: 2
```
**Output**: `Task 2 deleted successfully!`
**State**: Task 2 removed, ID 2 never reused

### Example 2: Delete Non-Existent Task
**Input**:
```
> delete
Enter task ID: 999
```
**Output**: `TaskNotFoundError: Task with ID 999 not found.`

## Acceptance Criteria

- [x] **AS4.1**: Permanent removal from list
- [x] **AS4.2**: TaskNotFoundError for non-existent ID
- [x] **AS4.3**: InvalidIDError for non-integer ID
- [x] **FR-009**: ID never reused after deletion

## Testing Checklist

- [ ] Delete existing task
- [ ] Delete non-existent ID
- [ ] Delete with non-integer ID
- [ ] Verify deleted ID not reused
- [ ] Verify list order unchanged after deletion
