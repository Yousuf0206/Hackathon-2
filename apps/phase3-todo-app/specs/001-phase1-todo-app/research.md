# Research & Technology Decisions: Phase I Todo App

**Feature**: Phase I — Todo In-Memory Python Console App
**Date**: 2025-12-31
**Status**: Complete

## Overview

This document captures all technology decisions, pattern selections, and architectural research for the Phase I todo application. The specification was comprehensive and left no technical ambiguities - all decisions were predetermined by constitutional and specification requirements.

---

## Decision Log

### D-001: Language & Version

**Decision**: Python 3.13+

**Rationale**:
- Explicitly specified in spec dependencies section
- Modern Python features (improved error messages, performance optimizations)
- Type hints and dataclasses available for clean domain modeling
- Standard library sufficient for all requirements (no external deps needed)

**Alternatives Considered**:
- **Python 3.11/3.12**: Rejected - spec mandates 3.13+ explicitly
- **Other languages (Go, Rust, etc.)**: Rejected - spec mandates Python

**Implementation Impact**:
- Requires Python 3.13+ in environment setup
- Can use modern syntax (match statements, improved type annotations)
- Performance sufficient for target scale (hundreds of tasks)

---

### D-002: Project Structure Pattern

**Decision**: Single-project layered architecture (models → errors → validation → services → CLI)

**Rationale**:
- Spec requirement FR-020/FR-021: Separate concerns (CLI, domain, validation)
- Spec requirement FR-022: No business logic in main.py
- Constitutional requirement C-15: Clean architecture with clear separation
- No frontend/backend split needed (CLI-only application)
- Enables independent testing of each layer

**Alternatives Considered**:
- **Flat module structure**: Rejected - violates clean architecture mandate
- **MVC pattern**: Rejected - no view layer in CLI app, unnecessary complexity
- **Hexagonal/ports-adapters**: Rejected - over-engineered for simple CLI app
- **Monolithic single file**: Rejected - violates separation of concerns

**Implementation Impact**:
- Directory structure: `src/todo/{models,errors,validation,services,cli}.py`
- Clear import hierarchy (no circular dependencies)
- Each layer testable in isolation

---

### D-003: State Management Pattern

**Decision**: In-memory list with sequential ID counter

**Rationale**:
- Spec requirement FR-008: Sequential, auto-incrementing IDs starting from 1
- Spec requirement FR-009: Never reuse IDs, even after deletion
- Spec requirement FR-010: Maintain creation order
- Constitutional requirement C-4: Deterministic behavior
- Python lists preserve insertion order by design (no sorting needed)

**Alternatives Considered**:
- **Dictionary with ID keys**: Rejected - less clear that order matters, list is more explicit
- **OrderedDict**: Rejected - unnecessary (Python 3.7+ dicts are ordered), list is simpler
- **Database/ORM**: Rejected - explicitly out of scope (no persistence)
- **UUID/random IDs**: Rejected - violates deterministic behavior and user-friendliness

**Implementation Impact**:
- TaskService maintains: `tasks: list[TodoItem]` and `next_id: int`
- Delete removes item but never decrements counter
- List iteration is O(n), acceptable for target scale
- ID lookup requires linear search (acceptable for hundreds of items)

---

### D-004: Validation Strategy

**Decision**: Centralized validation-first with fail-fast exceptions

**Rationale**:
- Spec requirement FR-002: Validate all input before mutation
- Spec requirement FR-013: Atomic operations (no partial updates)
- Constitutional requirement C-2: Zero-trust input model
- Constitutional requirement C-10: Validation failure → immediate termination
- Exceptions are idiomatic Python for control flow in validation

**Alternatives Considered**:
- **Return Result objects (Ok/Err)**: Rejected - not Pythonic, adds complexity
- **Validate after mutation with rollback**: Rejected - violates atomic operation principle
- **Collect all errors before failing**: Rejected - spec mandates fail-fast behavior
- **Validation in models**: Rejected - spec requires separated validation layer

**Implementation Impact**:
- validation.py module with pure validation functions (no side effects)
- Each validator raises explicit exception on failure or returns validated value
- Services layer calls validators before any state mutation
- No transaction management or rollback logic needed

---

### D-005: Error Handling Pattern

**Decision**: Custom exception hierarchy with 5 explicit error types

**Rationale**:
- Spec requirement FR-023: Use explicit, named error types (5 specified)
- Constitutional requirement C-11: Errors must be named, categorized
- Constitutional requirement C-12: User-correctable error messages (what, why, how)
- Enables precise exception handling in CLI layer
- Type-safe error propagation from validation → services → CLI

**Alternatives Considered**:
- **Generic Exception with error codes**: Rejected - loses type safety, requires lookups
- **String return values**: Rejected - not Pythonic, easily ignored
- **Logging instead of exceptions**: Rejected - allows execution to continue after errors
- **Result/Option types**: Rejected - not idiomatic Python, increases complexity

**Implementation Impact**:
- errors.py defines: InvalidCommandError, ValidationError, InvalidIDError, TaskNotFoundError, EmptyInputError
- Each exception has descriptive message explaining what/why/how-to-fix
- CLI layer has explicit except clauses for each error type
- Generic exceptions (programming errors) still propagate during development

---

### D-006: Testing Framework

**Decision**: pytest with unit, integration, and contract test categories

**Rationale**:
- Specified in spec dependencies section
- Industry standard for Python testing
- Excellent fixture support for test setup/teardown
- Parametrized tests for validation edge cases
- Clear test discovery and reporting

**Alternatives Considered**:
- **unittest (stdlib)**: Rejected - more verbose, less expressive assertions
- **nose**: Rejected - deprecated, pytest is successor
- **doctest**: Rejected - insufficient for integration/contract tests

**Implementation Impact**:
- Test directory structure: `tests/{unit,integration,contract}/`
- Use pytest fixtures for TaskService instantiation
- Parametrize validation tests for all edge cases
- Contract tests verify each command against spec

---

### D-007: Input/Output Handling

**Decision**: Console input() for prompts, print() for output, formatted error messages for exceptions

**Rationale**:
- Spec requirement: CLI application with text I/O
- Spec requirement FR-017: No stack traces, clear messages only
- Standard library functions sufficient (no rich/colorama needed)
- Deterministic output formatting per spec requirements

**Alternatives Considered**:
- **Rich library for formatting**: Rejected - external dependency, spec mandates stdlib only
- **Click/Typer for CLI parsing**: Rejected - spec defines interactive prompts, not arg parsing
- **Logging framework**: Rejected - spec forbids debug logs in user output
- **JSON output**: Rejected - spec defines human-readable text format

**Implementation Impact**:
- CLI uses `input()` for prompts with descriptive messages
- List command formats output: `[x] 1. Title — Description`
- Error messages template: `[ErrorType]: Message. Fix: Suggestion.`
- No ANSI codes or colors (cross-platform compatibility)

---

### D-008: Data Model Implementation

**Decision**: Python dataclass for TodoItem with frozen=False (mutable)

**Rationale**:
- Clean, readable syntax for domain model
- Automatic `__init__`, `__repr__`, `__eq__` generation
- Type hints for all fields
- Mutable (frozen=False) allows completion status changes

**Alternatives Considered**:
- **NamedTuple**: Rejected - immutable, can't update completion status
- **Regular class with manual __init__**: Rejected - more boilerplate, less readable
- **Dict with keys**: Rejected - no type safety, error-prone
- **Pydantic model**: Rejected - external dependency, validation belongs in separate layer

**Implementation Impact**:
- `@dataclass` decorator on TodoItem class
- Fields: id (int), title (str), description (str), completed (bool)
- No validation logic in model (pure data container)
- Services layer mutates fields after validation

---

### D-009: Command Dispatching

**Decision**: String-based command dispatcher with case-insensitive matching

**Rationale**:
- Spec requirement FR-001: Accept commands case-insensitively
- Simple match/case or if/elif dispatch based on validated command string
- No complex routing or middleware needed

**Alternatives Considered**:
- **Command pattern with classes**: Rejected - over-engineered for 8 simple commands
- **Decorator-based registration**: Rejected - unnecessary complexity
- **Separate command modules**: Rejected - commands are simple enough for single CLI file

**Implementation Impact**:
- CLI has `handle_command(cmd: str)` method
- `cmd.lower()` used for case-insensitive comparison
- Each command has dedicated handler method: `handle_add()`, `handle_list()`, etc.
- Unknown commands raise InvalidCommandError in validation layer

---

### D-010: Performance Strategy

**Decision**: No optimization needed for target scale (hundreds of tasks)

**Rationale**:
- Spec constraint: Target scale is hundreds of tasks, not thousands
- Success criterion SC-006: < 100ms response for 1000 tasks
- List iteration is O(n), adequate for small collections
- ID lookup is O(n), acceptable given scale

**Alternatives Considered**:
- **Dict index for ID lookup**: Rejected - premature optimization, list is sufficient
- **Binary search for IDs**: Rejected - IDs not guaranteed contiguous (deletions create gaps)
- **Caching/memoization**: Rejected - no expensive operations to cache

**Implementation Impact**:
- Simple list iteration for all operations
- No indexing data structures needed
- Performance testing validates < 100ms at 1000 tasks
- If scale increases in future phases, can refactor to dict-based lookup

---

## Research Summary

**Total Decisions**: 10

**Research Status**: ✅ **Complete** - All decisions finalized

**No Clarifications Needed**: The specification was comprehensive and prescriptive. All technical choices were either:
1. Explicitly specified (Python 3.13+, pytest, stdlib only)
2. Mandated by constitutional principles (clean architecture, validation-first, explicit errors)
3. Obvious given constraints (in-memory list for no-persistence requirement)

**Risk Assessment**: **Low** - All decisions align with specification and constitution requirements. No novel technologies or untested patterns.

---

## Technology Stack Summary

| Category | Technology | Rationale |
|----------|-----------|-----------|
| Language | Python 3.13+ | Spec requirement |
| Testing | pytest | Spec requirement |
| Dependencies | Standard library only | Spec requirement |
| Storage | In-memory list | Spec requirement (no persistence) |
| Architecture | Layered (4 layers) | Constitutional requirement |
| Validation | Fail-fast exceptions | Constitutional requirement |
| Error Handling | 5 custom exceptions | Spec requirement |
| I/O | input()/print() | Stdlib sufficient, cross-platform |
| Data Model | @dataclass | Clean, type-safe, idiomatic Python |
| Command Dispatch | String matching | Simple, adequate for 8 commands |

---

## Implementation Readiness

✅ **All research complete** - No blockers for Phase 1 (design)

**Next Phase**: Generate data-model.md and command contracts

**Confidence Level**: **High** - All decisions grounded in explicit requirements, no assumptions made
