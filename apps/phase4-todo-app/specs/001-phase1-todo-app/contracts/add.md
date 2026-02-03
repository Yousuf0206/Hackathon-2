# Command Contract: add

**Command**: `add`
**Purpose**: Create a new todo task with title and description
**Category**: State-mutating operation

## Input Specification

### Command Entry
- **Prompt**: `> ` (generic command prompt)
- **User Input**: `add` (case-insensitive)
- **Validation**: Command must be one of the 8 accepted commands
- **Error**: `InvalidCommandError: Unknown command '{input}'. Type 'help' for available commands.`

### Title Input
- **Prompt**: `Enter title: `
- **User Input**: Raw string (can include whitespace)
- **Processing**:
  1. Trim whitespace from both ends
  2. Validate trimmed length
- **Validation Rules**:
  - Trimmed length must be ≥ 1 character
  - Trimmed length must be ≤ 100 characters
- **Error Conditions**:
  - Empty string after trimming → `ValidationError: Title cannot be empty. Please provide a title.`
  - Length > 100 → `ValidationError: Title exceeds 100 characters (current: {N}). Please shorten.`

### Description Input
- **Prompt**: `Enter description (optional): `
- **User Input**: Raw string (can include whitespace or be empty)
- **Processing**:
  1. Trim whitespace from both ends
  2. Validate trimmed length
- **Validation Rules**:
  - Trimmed length must be ≤ 500 characters
  - Empty string is valid (optional field)
- **Error Conditions**:
  - Length > 500 → `ValidationError: Description exceeds 500 characters (current: {N}). Please shorten.`

## Processing

### Validation Sequence
1. Validate command string → `validate_command("add")`
2. Prompt for title → validate title → `validate_title(raw_input)`
3. Prompt for description → validate description → `validate_description(raw_input)`

### State Mutation
**Only after all validation passes:**
1. Assign next available ID (increment counter)
2. Create `TodoItem(id=next_id, title=validated_title, description=validated_desc, completed=False)`
3. Append to tasks list
4. Increment `next_id` counter

### Atomicity Guarantee
- If any validation fails, no state changes occur
- Task is only created after all inputs are valid
- ID counter only increments after successful creation

## Output Specification

### Success Output
```
Task added successfully! ID: {id}
```

**Example**:
```
Task added successfully! ID: 1
```

### Error Output

**Invalid Command**:
```
InvalidCommandError: Unknown command 'ad'. Type 'help' for available commands.
```

**Empty Title**:
```
ValidationError: Title cannot be empty. Please provide a title.
```

**Title Too Long**:
```
ValidationError: Title exceeds 100 characters (current: 127). Please shorten.
```

**Description Too Long**:
```
ValidationError: Description exceeds 500 characters (current: 542). Please shorten.
```

## Examples

### Example 1: Successful Add

**Input Sequence**:
```
> add
Enter title: Buy groceries
Enter description (optional): Milk, eggs, bread
```

**Output**:
```
Task added successfully! ID: 1
```

**State Change**:
- New TodoItem created with id=1, title="Buy groceries", description="Milk, eggs, bread", completed=False
- Added to tasks list
- next_id incremented to 2

---

### Example 2: Add with Empty Description

**Input Sequence**:
```
> add
Enter title: Call dentist
Enter description (optional):
```

**Output**:
```
Task added successfully! ID: 2
```

**State Change**:
- New TodoItem created with id=2, title="Call dentist", description="", completed=False
- Empty description is valid (optional field)

---

### Example 3: Add with Whitespace Trimming

**Input Sequence**:
```
> add
Enter title:    Fix bug #123
Enter description (optional):    Check error logs
```

**Output**:
```
Task added successfully! ID: 3
```

**State Change**:
- Title trimmed: "   Fix bug #123   " → "Fix bug #123"
- Description trimmed: "   Check error logs   " → "Check error logs"
- TodoItem created with trimmed values

---

### Example 4: Validation Error - Empty Title

**Input Sequence**:
```
> add
Enter title:
```

**Output**:
```
ValidationError: Title cannot be empty. Please provide a title.
```

**State Change**: None (validation failed before creation)

---

### Example 5: Validation Error - Title Too Long

**Input Sequence**:
```
> add
Enter title: This is an extremely long title that exceeds the maximum allowed length of one hundred characters and should be rejected
```

**Output**:
```
ValidationError: Title exceeds 100 characters (current: 127). Please shorten.
```

**State Change**: None (validation failed before creation)

---

### Example 6: Validation Error - Description Too Long

**Input Sequence**:
```
> add
Enter title: Valid title
Enter description (optional): [550 characters of text]
```

**Output**:
```
ValidationError: Description exceeds 500 characters (current: 550). Please shorten.
```

**State Change**: None (validation failed before creation, no partial task)

## Acceptance Criteria

**From Specification User Story 1**:

- [x] **AS1.1**: Given the application is running, When I enter "add" and provide valid title and description, Then a new task is created with unique ID and marked incomplete
- [x] **AS1.4**: Given I enter "add", When I provide title with only whitespace, Then I receive ValidationError and no task is created
- [x] **AS1.5**: Given I enter "add", When I provide title exceeding 100 chars, Then I receive ValidationError and no task is created

**Constitutional Requirements**:

- [x] **C-2**: Zero-trust input (all inputs validated explicitly)
- [x] **C-9**: No implicit type conversion (strings kept as strings)
- [x] **C-10**: Atomic operation (validate all before mutating)
- [x] **FR-002**: Validation before mutation
- [x] **FR-013**: No partial updates on validation failure

## Testing Checklist

- [ ] Add task with valid title and description
- [ ] Add task with empty description (optional field)
- [ ] Add task with whitespace-padded title (verify trimming)
- [ ] Add task with whitespace-padded description (verify trimming)
- [ ] Reject empty title after trimming
- [ ] Reject title with 101 characters
- [ ] Reject title with 100 characters (should pass)
- [ ] Reject description with 501 characters
- [ ] Accept description with 500 characters (boundary)
- [ ] Verify ID increments sequentially (1, 2, 3, ...)
- [ ] Verify completed field defaults to False
- [ ] Verify no state change on validation failure
- [ ] Verify task appears in list after creation
