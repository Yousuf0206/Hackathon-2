# Command Contract: help

**Command**: `help`
**Purpose**: Display all available commands with brief descriptions
**Category**: Read-only operation (informational)

## Input Specification

### Command Entry
- **Prompt**: `> `
- **User Input**: `help` (case-insensitive)
- **Additional Input**: None

## Processing

### State Access
- No state access required
- No validation beyond command recognition

## Output Specification

### Success Output

```
Available commands:

add          - Create a new task with title and description
list         - Display all tasks in creation order
update       - Modify title and description of an existing task
delete       - Permanently remove a task
complete     - Mark a task as completed
incomplete   - Mark a task as incomplete
help         - Show this help message
exit         - Exit the application

Type a command and press Enter to continue.
```

### Format Rules
- Left-aligned command names (12 chars wide for alignment)
- Dash separator: ` - ` (space-dash-space)
- One-line description per command
- Blank line before and after command list

## Examples

### Example 1: Show Help
**Input**:
```
> help
```
**Output**: (as shown above)

## Acceptance Criteria

- [x] **AS5.1**: Display list of all commands with descriptions
- [x] **FR-001**: Document all 8 commands
- [x] **SC-007**: Users can learn commands without external documentation

## Testing Checklist

- [ ] Help displays all 8 commands
- [ ] Help displays correct descriptions
- [ ] Help formatting is consistent
- [ ] Help output is readable
