# Command Contract: exit

**Command**: `exit`
**Purpose**: Terminate the application gracefully
**Category**: Application control

## Input Specification

### Command Entry
- **Prompt**: `> `
- **User Input**: `exit` (case-insensitive)
- **Additional Input**: None

## Processing

### Termination Sequence
1. Validate command
2. Break command loop
3. Exit application (return from main function)

### No State Persistence
- State is not saved (in-memory only)
- All tasks lost on exit (per spec design)
- No cleanup required

## Output Specification

### Success Output

```
Goodbye!
```

### Application Termination
- Exit code 0 (success)
- Clean termination (no exceptions)

## Examples

### Example 1: Exit Application
**Input**:
```
> exit
```
**Output**:
```
Goodbye!
```
**Result**: Application terminates

## Acceptance Criteria

- [x] **AS5.2**: Application terminates gracefully without errors
- [x] **FR-016**: Only exit command terminates loop (not errors)

## Testing Checklist

- [ ] Exit terminates application
- [ ] Exit displays goodbye message
- [ ] Exit returns code 0
- [ ] State not persisted after exit
