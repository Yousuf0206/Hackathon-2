# Command Contract: update

**Command**: `update`
**Purpose**: Modify title and description of an existing task atomically
**Category**: State-mutating operation

## Input Specification

### Command Entry
- **Prompt**: `> `
- **User Input**: `update` (case-insensitive)
- **Validation**: Must be recognized command
- **Error**: `InvalidCommandError`

### Task ID Input
- **Prompt**: `Enter task ID: `
- **User Input**: String (should be integer)
- **Validation**:
  1. Must parse as integer → `InvalidIDError`
  2. Must exist in task list → `TaskNotFoundError`
- **Errors**:
  - Non-integer: `InvalidIDError: Invalid ID '{input}'. ID must be a number.`
  - Not found: `TaskNotFoundError: Task with ID {id} not found.`

### New Title Input
- **Prompt**: `Enter new title: `
- **Validation**: Same as add command (1-100 chars after trim)
- **Errors**: Same ValidationError messages as add

### New Description Input
- **Prompt**: `Enter new description: `
- **Validation**: Same as add command (0-500 chars after trim)
- **Errors**: Same ValidationError messages as add

## Processing

### Atomicity Guarantee
**CRITICAL**: Both title and description must be validated BEFORE either is updated.
If any validation fails, the task remains completely unchanged.

### Sequence
1. Validate command
2. Validate and parse ID
3. Verify task exists
4. Validate new title
5. Validate new description
6. **Only after all validation passes**: Update task.title and task.description

## Output Specification

### Success
```
Task {id} updated successfully!
```

### Errors
```
InvalidIDError: Invalid ID 'abc'. ID must be a number.
TaskNotFoundError: Task with ID 999 not found.
ValidationError: Title cannot be empty. Please provide a title.
ValidationError: Title exceeds 100 characters (current: 127). Please shorten.
ValidationError: Description exceeds 500 characters (current: 542). Please shorten.
```

## Examples

### Example 1: Successful Update
**Input**:
```
> update
Enter task ID: 1
Enter new title: Buy groceries and snacks
Enter new description: Milk, eggs, bread, chips, cookies
```
**Output**: `Task 1 updated successfully!`
**State**: Task 1 title and description both updated

### Example 2: Atomic Failure - Invalid Description
**Before**: Task 1: title="Old", description="Old desc"
**Input**:
```
> update
Enter task ID: 1
Enter new title: New title
Enter new description: [501 characters]
```
**Output**: `ValidationError: Description exceeds 500 characters (current: 501). Please shorten.`
**After**: Task 1: title="Old", description="Old desc" (UNCHANGED)

## Acceptance Criteria

- [x] **AS3.1**: Atomic update of both fields
- [x] **AS3.3**: ValidationError prevents partial updates
- [x] **AS3.4**: No partial updates on any validation failure

## Testing Checklist

- [ ] Update both title and description successfully
- [ ] Update with invalid title (verify no changes)
- [ ] Update with invalid description (verify no changes)
- [ ] Update with invalid ID (verify error, no search attempted)
- [ ] Update non-existent task (verify error)
- [ ] Update preserves completion status
- [ ] Update preserves ID
