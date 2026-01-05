# Implementation Plan: Phase I — Todo In-Memory Python Console App

**Branch**: `001-phase1-todo-app` | **Date**: 2025-12-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-phase1-todo-app/spec.md`

## Summary

Implement a command-line todo application with in-memory task storage that enforces strict input validation, atomic state mutations, and deterministic behavior. The application follows clean architecture principles with complete separation of CLI, domain, and validation concerns. All behavior is explicitly defined in the specification with zero-trust input handling and fail-fast error propagation.

**Technical Approach**: Python 3.13+ single-project structure using standard library only. Layered architecture (models → validation → services → CLI) ensures validation occurs before any state mutation. Five explicit error types provide clear user guidance without exposing technical details.

## Technical Context

**Language/Version**: Python 3.13+
**Primary Dependencies**: Standard library only (no external packages)
**Storage**: In-memory list structure (no persistence)
**Testing**: pytest for unit and integration testing
**Target Platform**: Cross-platform console (Windows, Linux, macOS)
**Project Type**: Single-project CLI application
**Performance Goals**: Instant response (< 100ms) for up to 1000 tasks
**Constraints**:
- No file I/O, databases, or network communication
- No implicit type conversions or default substitutions
- All validation must complete before state mutation
- IDs never reused, tasks maintain creation order
- Application loop must never terminate on errors

**Scale/Scope**:
- 8 commands (add, list, update, delete, complete, incomplete, help, exit)
- 5 error types (InvalidCommandError, ValidationError, InvalidIDError, TaskNotFoundError, EmptyInputError)
- Single TodoItem entity with 4 fields
- Target: hundreds of tasks (not thousands)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Core Principles Compliance

✅ **Zero-Trust Input Model** (C-2)
- All input treated as invalid by default
- Explicit validation before processing
- No implicit conversions, no silent coercion, no default substitution
- **Implementation**: Centralized validation layer raises explicit errors

✅ **Correctness Before Convenience** (C-3)
- Explicit errors preferred over guessing user intent
- Rejection preferred over approximation
- **Implementation**: Fail-fast validation; atomic operations only

✅ **Deterministic Behavior** (C-4)
- Same inputs → same outputs and state
- No random behavior, no time-dependent logic (except timestamps if logged)
- No hidden side effects
- **Implementation**: Sequential ID generation, creation-order preservation, pure functions

✅ **Spec-Driven Development** (C-5)
- Constitution mandates: Spec → Plan → Tasks → Implementation
- No manual coding permitted
- **Implementation**: This plan derived exclusively from specification

✅ **Explicit Validation Required** (C-8)
- Every input must define: type, range/constraints, failure behavior
- **Implementation**: validation.py module with explicit rules for commands, IDs, titles, descriptions

✅ **No Implicit Type Conversion** (C-9)
- Forbidden: string→number casting, empty→default, truthy/falsy conversions
- **Implementation**: Type validation raises InvalidIDError on non-integers

✅ **Atomic Operations** (C-10)
- Validation failure → terminate immediately
- No partial state mutation allowed
- **Implementation**: Validate all inputs before any state change; rollback not needed since mutations only occur after validation

✅ **Errors Are First-Class** (C-11, C-12)
- Explicitly named, categorized, intentionally handled
- User-correctable messages (what, why, how to fix)
- **Implementation**: 5 custom error classes in errors.py with descriptive messages

✅ **Phase I Constraints** (C-13, C-14, C-15)
- In-memory only (C-13): No persistence ✅
- Required features only (C-14): 8 commands exactly as specified ✅
- Clean architecture (C-15): Separation of concerns enforced ✅

✅ **Technology Constraints** (C-16)
- Python 3.13+, UV, Claude Code, Spec-Kit Plus ✅
- No unapproved tools/frameworks ✅

### Constitution Check Result

**Status**: ✅ **PASS** - All constitutional requirements satisfied

No violations detected. No complexity justifications required.

## Project Structure

### Documentation (this feature)

```text
specs/001-phase1-todo-app/
├── spec.md              # Feature specification (/sp.specify output)
├── plan.md              # This file (/sp.plan output)
├── research.md          # Phase 0 output (technology decisions, patterns)
├── data-model.md        # Phase 1 output (TodoItem entity definition)
├── quickstart.md        # Phase 1 output (setup and usage instructions)
├── contracts/           # Phase 1 output (CLI command contracts)
│   ├── add.md
│   ├── list.md
│   ├── update.md
│   ├── delete.md
│   ├── complete.md
│   ├── incomplete.md
│   ├── help.md
│   └── exit.md
├── checklists/
│   └── requirements.md  # Spec quality validation (already created)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
src/
├── todo/
│   ├── __init__.py         # Package initialization
│   ├── models.py           # Domain model: TodoItem
│   ├── errors.py           # Error taxonomy: 5 custom exceptions
│   ├── validation.py       # Centralized validation logic
│   ├── services.py         # State management + command handlers
│   └── cli.py              # CLI interface + command dispatcher
└── main.py                 # Application bootstrap

tests/
├── unit/
│   ├── test_models.py      # TodoItem tests
│   ├── test_errors.py      # Error behavior tests
│   ├── test_validation.py  # Validation logic tests
│   └── test_services.py    # State management + handler tests
├── integration/
│   ├── test_cli.py         # CLI integration tests
│   └── test_commands.py    # End-to-end command flow tests
└── contract/
    └── test_command_contracts.py  # Verify each command adheres to spec

pyproject.toml              # UV project configuration
README.md                   # Project overview
```

**Structure Decision**: Single-project structure selected because:
- Single executable application with no frontend/backend split
- No multiple services or platform variations
- All code in unified `src/todo/` package for simplicity
- Clear layered architecture: models → errors → validation → services → CLI

## Complexity Tracking

> **No violations detected** - Constitution Check passed without exceptions.

This section intentionally left empty as no constitutional violations require justification.

---

## Phase 0: Research & Technology Decisions

### Research Tasks

The specification is comprehensive and leaves no technical ambiguities. All decisions are already defined:

1. **✅ Language & Version Decision**: Python 3.13+ (specified in spec dependencies)
2. **✅ Testing Framework Decision**: pytest (specified in spec dependencies)
3. **✅ Project Structure Decision**: Clean architecture with layered separation (specified in spec architecture constraints)
4. **✅ Error Handling Pattern**: Explicit error taxonomy with 5 named exceptions (specified in spec error specification)
5. **✅ Validation Strategy**: Centralized validation-first with fail-fast behavior (specified in spec validation rules)
6. **✅ State Management Pattern**: In-memory list with atomic operations (specified in spec state rules)

### Research Output

**All research complete** - No NEEDS CLARIFICATION items exist. See [research.md](./research.md) for detailed decisions and rationales.

---

## Phase 1: Design & Contracts

### Data Model

**Entity**: TodoItem

See [data-model.md](./data-model.md) for complete entity definition including:
- Field specifications (id, title, description, completed)
- Validation rules (length constraints, type requirements)
- State transitions (creation → update → completion → deletion)
- Invariants (ID uniqueness, creation order preservation)

### Command Contracts

**8 CLI commands** with explicit input/output specifications:

See `contracts/` directory for individual command specifications:
- [add.md](./contracts/add.md) - Create new task
- [list.md](./contracts/list.md) - Display all tasks
- [update.md](./contracts/update.md) - Modify existing task
- [delete.md](./contracts/delete.md) - Remove task permanently
- [complete.md](./contracts/complete.md) - Mark task as done
- [incomplete.md](./contracts/incomplete.md) - Mark task as not done
- [help.md](./contracts/help.md) - Show available commands
- [exit.md](./contracts/exit.md) - Terminate application

Each contract defines:
- Input prompts and validation rules
- Success output format
- Error conditions and messages
- State mutation effects

### Quickstart Guide

See [quickstart.md](./quickstart.md) for:
- Environment setup (Python 3.13+, UV installation)
- Running the application
- Example usage workflows
- Testing instructions

---

## Phase 2: Implementation Tasks

**Note**: Phase 2 (tasks.md generation) is handled by the `/sp.tasks` command, NOT by `/sp.plan`.

This plan provides the architectural foundation. Task breakdown will include:
- Step-by-step implementation sequence
- Test-first development approach (red-green-refactor)
- Acceptance criteria validation
- Integration checkpoints

Run `/sp.tasks` after this plan is approved to generate the detailed task list.

---

## Architecture Decisions

### AD-001: Layered Architecture with Strict Separation

**Decision**: Implement 4-layer architecture: Domain (models.py) → Validation (validation.py) → Business Logic (services.py) → Interface (cli.py)

**Rationale**:
- Constitutional requirement C-15: "No business logic in main.py" and "Separate concerns clearly"
- Spec requirement FR-020: "System MUST separate business logic from CLI interface logic"
- Spec requirement FR-021: "System MUST separate validation logic from domain logic"
- Enforces validation-before-mutation pattern (C-10 Atomic Operations)
- Each layer has single responsibility, enabling independent testing

**Alternatives Considered**:
- **Single-file implementation**: Rejected - violates clean architecture mandate and makes testing/maintenance difficult
- **MVC pattern**: Rejected - unnecessary complexity for CLI app with no view layer
- **Repository pattern**: Rejected - no persistence layer, would add needless abstraction

**Implications**:
- Clear import hierarchy: cli.py → services.py → validation.py → errors.py → models.py
- No circular dependencies possible
- Each layer testable in isolation

### AD-002: Explicit Error Taxonomy with Custom Exceptions

**Decision**: Create 5 custom exception classes (InvalidCommandError, ValidationError, InvalidIDError, TaskNotFoundError, EmptyInputError) inheriting from base Exception

**Rationale**:
- Constitutional requirement C-11: "Errors must be explicitly named, categorized, intentionally handled"
- Spec requirement FR-023: "System MUST use explicit, named error types"
- Enables precise error handling in CLI layer without catching generic exceptions
- Provides clear user-facing messages that explain what/why/how-to-fix (C-12)

**Alternatives Considered**:
- **Generic Exception with error codes**: Rejected - loses type safety and requires error code lookups
- **Result objects (Ok/Err pattern)**: Rejected - not idiomatic Python, adds complexity
- **Logging instead of exceptions**: Rejected - violates fail-fast principle, allows partial state mutations

**Implications**:
- CLI layer catches specific exceptions for targeted error messages
- Validation and services layers raise exceptions immediately on failure
- No try-except blocks that swallow errors

### AD-003: Validation-First with Fail-Fast Behavior

**Decision**: All validation must complete successfully before any state mutation occurs. On validation failure, raise explicit exception immediately without modifying state.

**Rationale**:
- Constitutional requirement C-10: "If any validation step fails, operation must terminate immediately, no partial state mutation"
- Spec requirement FR-002: "System MUST validate all input explicitly before any state mutation"
- Spec requirement FR-013: "System MUST perform atomic updates - if any validation fails, no fields are modified"
- Prevents inconsistent state and simplifies error recovery (no rollback needed)

**Alternatives Considered**:
- **Collect all validation errors before failing**: Rejected - spec mandates immediate termination on first failure
- **Validate after mutation with rollback**: Rejected - increases complexity and violates atomic operation principle
- **Optimistic validation (assume valid, check later)**: Rejected - violates zero-trust input model (C-2)

**Implications**:
- validation.py functions only validate, never mutate
- services.py handlers call validation first, then mutate
- No transaction management or rollback logic needed

### AD-004: In-Memory List with Sequential ID Generation

**Decision**: Maintain tasks in a Python list (creation-ordered), generate IDs using a counter that never decrements, never reuse IDs even after deletion.

**Rationale**:
- Spec requirement FR-008: "System MUST assign unique, sequential, auto-incrementing IDs starting from 1"
- Spec requirement FR-009: "System MUST never reuse task IDs, even after deletion"
- Spec requirement FR-010: "System MUST maintain task creation order when displaying lists"
- Constitutional requirement C-4: Deterministic behavior - same operations produce same ID sequence

**Alternatives Considered**:
- **Dictionary with ID keys**: Rejected - doesn't preserve creation order (Python 3.7+ dicts are ordered but list is clearer intent)
- **UUID/random IDs**: Rejected - violates deterministic behavior requirement, harder for users to reference tasks
- **Reuse IDs after deletion**: Rejected - explicitly forbidden by FR-009

**Implications**:
- TaskService maintains: `tasks: list[TodoItem]` and `next_id: int`
- Delete operation removes from list but never decrements `next_id`
- List command iterates tasks list in order (no sorting needed)

### AD-005: CLI Loop with Error Recovery

**Decision**: Implement infinite command loop that catches all custom exceptions, displays user-friendly messages, and continues loop. Only "exit" command terminates loop.

**Rationale**:
- Spec requirement FR-016: "System MUST NOT terminate the application loop on errors - only 'exit' command terminates"
- Spec requirement FR-017: "System MUST NOT display stack traces or debug logs to users"
- Constitutional requirement C-12: "All errors must clearly communicate: What went wrong, Why it failed, How the user can fix it"
- Enables error recovery without application restart

**Alternatives Considered**:
- **Terminate on error**: Rejected - explicitly forbidden by FR-016, poor user experience
- **Catch Exception base class**: Rejected - could hide programming errors, spec requires explicit error handling
- **Return error codes instead of exceptions**: Rejected - less Pythonic, harder to propagate validation failures

**Implications**:
- CLI layer has explicit `except` clause for each custom exception type
- Error messages template: "[ErrorType]: [What happened]. [How to fix]."
- Unexpected exceptions (programming errors) should still propagate to expose bugs during development

---

## Implementation Sequence

The following sequence ensures validation-before-mutation and testability:

### Step 1: Foundation (Models & Errors)
1. Create `src/todo/__init__.py` (empty package marker)
2. Create `src/todo/models.py`:
   - TodoItem dataclass with 4 fields (id, title, description, completed)
   - No validation logic in model (pure data container)
3. Create `src/todo/errors.py`:
   - 5 custom exception classes with descriptive docstrings
4. **Test**: Unit tests for TodoItem instantiation and error raising

### Step 2: Validation Layer
5. Create `src/todo/validation.py`:
   - `validate_command(cmd: str)` → raises InvalidCommandError or EmptyInputError
   - `validate_id(id_str: str)` → returns int or raises InvalidIDError
   - `validate_title(title: str)` → returns trimmed str or raises ValidationError
   - `validate_description(desc: str)` → returns trimmed str or raises ValidationError
6. **Test**: Unit tests for each validation function (pass and fail cases)

### Step 3: Business Logic (State Management)
7. Create `src/todo/services.py`:
   - TaskService class with:
     - `__init__`: Initialize empty task list and next_id=1
     - `add_task(title, description)` → returns created TodoItem
     - `list_tasks()` → returns list[TodoItem]
     - `update_task(task_id, title, description)` → returns updated TodoItem
     - `delete_task(task_id)` → returns None
     - `complete_task(task_id)` → returns updated TodoItem
     - `incomplete_task(task_id)` → returns updated TodoItem
   - Each handler calls validation first, then mutates state atomically
8. **Test**: Unit tests for TaskService (state management, ID generation, atomic updates)

### Step 4: CLI Interface
9. Create `src/todo/cli.py`:
   - CLI class with:
     - `__init__`: Initialize TaskService
     - `run()`: Main command loop
     - `handle_command(cmd)`: Command dispatcher
     - `handle_add()`, `handle_list()`, etc.: Command-specific flows
     - `display_error(error)`: User-friendly error messages
10. **Test**: Integration tests for CLI (command dispatching, error display, loop continuation)

### Step 5: Application Bootstrap
11. Create `src/main.py`:
    - Import CLI class
    - Instantiate and call `cli.run()`
    - No logic beyond initialization
12. **Test**: End-to-end tests (full command workflows)

### Step 6: Verification
13. Run all acceptance criteria from spec
14. Verify constitutional compliance (no violations introduced)
15. Performance check (< 100ms response for 1000 tasks)

---

## Testing Strategy

### Unit Tests (TDD - Red-Green-Refactor)
- **models.py**: TodoItem field access, immutability (if using dataclass frozen=True)
- **errors.py**: Exception raising and message content
- **validation.py**: Each validation function with valid/invalid inputs
- **services.py**: TaskService methods in isolation (mocking not needed, pure functions)

### Integration Tests
- **CLI command flows**: Input → validation → state change → output
- **Error propagation**: Validation failure → CLI error display → loop continuation
- **State persistence across commands**: Add → list → update → list (verify changes)

### Contract Tests
- **Each command specification**: Verify input/output format matches spec contracts
- **Edge cases**: Empty list, non-existent IDs, boundary inputs (100 chars, 500 chars)
- **Atomic operations**: Trigger validation failure mid-update, verify no partial changes

### Acceptance Tests
- **All user scenarios**: Implement each Given-When-Then from spec as automated test
- **Success criteria validation**: Verify SC-001 through SC-010 (determinism, error messages, performance)

---

## Post-Design Constitution Re-Check

**Status**: ✅ **PASS** - All constitutional requirements remain satisfied after design

No new violations introduced. Architecture decisions align with:
- C-2 Zero-Trust Input (validation layer enforces)
- C-4 Deterministic Behavior (sequential IDs, ordered list)
- C-10 Atomic Operations (validate-then-mutate pattern)
- C-11/C-12 Explicit Errors (5 custom exceptions with clear messages)
- C-15 Clean Architecture (4-layer separation)

**Ready for Phase 2 (Tasks)**: Run `/sp.tasks` to generate detailed implementation checklist.

---

## Risk Analysis

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| ID collision after deletion | Low | High | Never reuse IDs (counter only increments) |
| Partial state mutation on validation failure | Low | High | Validate-first pattern enforced by architecture |
| Stack trace exposure to users | Medium | Medium | CLI catches all custom exceptions with user-friendly messages |
| Performance degradation with large task lists | Low | Low | List iteration O(n), acceptable for hundreds of tasks; spec limits scope |
| Implicit type conversions | Low | High | Validation layer explicitly checks types before conversion |

---

## Success Criteria Verification

The implementation will satisfy all 10 success criteria:

- **SC-001** ✅: Add workflow = 3 steps (command, title, description)
- **SC-002** ✅: Validation-first pattern prevents invalid input from mutating state
- **SC-003** ✅: Each exception includes what/why/how-to-fix message
- **SC-004** ✅: List maintains creation order (no sorting)
- **SC-005** ✅: CLI catches exceptions and displays messages (no stack traces)
- **SC-006** ✅: List iteration O(n), under 100ms for 1000 items
- **SC-007** ✅: Help command documents all commands
- **SC-008** ✅: Atomic operations (validation before mutation)
- **SC-009** ✅: Deterministic ID generation and state management
- **SC-010** ✅: 8 commands implemented per specification

---

## Next Steps

1. **Approve this plan**: Review architecture decisions and implementation sequence
2. **Run `/sp.tasks`**: Generate detailed task breakdown with test cases
3. **Run `/sp.implement`**: Execute tasks in TDD sequence (red-green-refactor)
4. **Validate acceptance criteria**: Verify all spec requirements satisfied
5. **Create commit and PR**: Document implementation completion

**Plan Status**: ✅ **COMPLETE** - Ready for task generation
