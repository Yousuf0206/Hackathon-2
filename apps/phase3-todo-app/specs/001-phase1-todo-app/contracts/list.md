# Command Contract: list

**Command**: `list`
**Purpose**: Display all tasks in creation order with completion status
**Category**: Read-only operation (no state mutation)

## Input Specification

### Command Entry
- **Prompt**: `> ` (generic command prompt)
- **User Input**: `list` (case-insensitive)
- **Validation**: Command must be one of the 8 accepted commands
- **Error**: `InvalidCommandError: Unknown command '{input}'. Type 'help' for available commands.`

###Additional Input
- **None**: This command accepts no further input

## Processing

### Validation Sequence
1. Validate command string → `validate_command("list")`

### State Access (No Mutation)
1. Retrieve all tasks from tasks list
2. Iterate in creation order (list order)
3. Format each task for display

### Formatting Rules
- **Format**: `[{status}] {id}. {title} — {description}`
- **Status Symbol**:
  - `[x]` if `completed == True`
  - `[ ]` if `completed == False`
- **Separator**: ` — ` (space-dash-dash-space) between title and description
- **Empty Description**: Display separator even if description is empty

## Output Specification

### Success Output (Tasks Exist)

**Format**:
```
[ ] 1. Task title — Task description
[x] 2. Another task — Another description
```

**Examples**:
```
[ ] 1. Buy groceries — Milk, eggs, bread
[ ] 2. Call dentist —
[x] 3. Fix bug #123 — Check error logs
```

### Success Output (No Tasks)

**Format**:
```
No tasks found. Use 'add' to create a new task.
```

### Error Output

**Invalid Command**:
```
InvalidCommandError: Unknown command 'lst'. Type 'help' for available commands.
```

## Examples

### Example 1: List with Multiple Tasks

**Input**:
```
> list
```

**Output**:
```
[ ] 1. Buy groceries — Milk, eggs, bread
[x] 2. Call dentist —
[ ] 3. Fix bug #123 — Check error logs
```

**Explanation**:
- Task 1: Incomplete, has description
- Task 2: Completed, no description (empty string)
- Task 3: Incomplete, has description

---

### Example 2: List with Empty Task List

**Input**:
```
> list
```

**Output**:
```
No tasks found. Use 'add' to create a new task.
```

---

### Example 3: List After Deletion (ID Gap)

**Scenario**: Tasks 1, 2, 3 created; Task 2 deleted; List shows 1 and 3 only

**Input**:
```
> list
```

**Output**:
```
[ ] 1. Buy groceries — Milk, eggs, bread
[ ] 3. Fix bug #123 — Check error logs
```

**Explanation**: ID 2 is missing (deleted), but IDs are never reused

---

### Example 4: List Shows Creation Order

**Scenario**: Tasks added in order 1, 2, 3; Task 2 completed; Order remains 1, 2, 3

**Input**:
```
> list
```

**Output**:
```
[ ] 1. First task — Description 1
[x] 2. Second task — Description 2
[ ] 3. Third task — Description 3
```

**Explanation**: Completion status doesn't affect display order

## Acceptance Criteria

**From Specification User Story 1**:

- [x] **AS1.2**: Given I have added multiple tasks, When I enter "list", Then all tasks are displayed in creation order with completion status, ID, title, and description
- [x] **AS1.3**: Given I have no tasks, When I enter "list", Then I see appropriate message indicating no tasks exist

**Constitutional Requirements**:

- [x] **FR-010**: Maintain task creation order
- [x] **FR-014**: Display format with [x]/[ ], ID, title, description
- [x] **C-4**: Deterministic behavior (same state → same output)

## Testing Checklist

- [ ] List empty task list (verify "No tasks" message)
- [ ] List single task
- [ ] List multiple tasks (verify creation order)
- [ ] List after task deletion (verify ID gap, no reuse)
- [ ] List with mix of complete/incomplete tasks (verify [x]/[ ] symbols)
- [ ] List task with empty description (verify "—" separator still appears)
- [ ] List after completing middle task (verify order unchanged)
- [ ] List with 100-char title (verify no truncation)
- [ ] List with 500-char description (verify no truncation)
