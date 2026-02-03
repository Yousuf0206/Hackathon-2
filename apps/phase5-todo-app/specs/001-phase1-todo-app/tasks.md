# Tasks: Phase I — Todo In-Memory Python Console App

**Feature Branch**: `001-phase1-todo-app`
**Input**: Design documents from `/specs/001-phase1-todo-app/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Tests are NOT requested in the specification. Test tasks are included for TDD approach but are optional.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **Checkbox**: `- [ ]` (markdown task checkbox)
- **[ID]**: Sequential task number (T001, T002, etc.)
- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1, US2, etc.) - required for user story phases only
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create src/todo/ package directory structure
- [X] T002 Initialize pyproject.toml with Python 3.13+ and UV configuration
- [X] T003 [P] Create src/todo/__init__.py package initialization file
- [X] T004 [P] Create tests/ directory with unit/, integration/, and contract/ subdirectories
- [X] T005 [P] Add pytest and pytest-cov as dev dependencies via UV

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Create TodoItem dataclass in src/todo/models.py with fields: id (int), title (str), description (str), completed (bool=False)
- [X] T007 [P] Create 5 custom exception classes in src/todo/errors.py: InvalidCommandError, ValidationError, InvalidIDError, TaskNotFoundError, EmptyInputError
- [X] T008 [P] Write unit tests for TodoItem in tests/unit/test_models.py
- [X] T009 [P] Write unit tests for error classes in tests/unit/test_errors.py
- [X] T010 Create validate_command() function in src/todo/validation.py that raises InvalidCommandError or EmptyInputError
- [X] T011 [P] Create validate_id() function in src/todo/validation.py that parses integer or raises InvalidIDError
- [X] T012 [P] Create validate_title() function in src/todo/validation.py that trims and validates 1-100 chars or raises ValidationError
- [X] T013 [P] Create validate_description() function in src/todo/validation.py that trims and validates 0-500 chars or raises ValidationError
- [X] T014 Write unit tests for all validation functions in tests/unit/test_validation.py with valid and invalid inputs
- [X] T015 Create TaskService class in src/todo/services.py with __init__ method that initializes empty task list and next_id=1
- [X] T016 [P] Write unit tests for TaskService initialization in tests/unit/test_services.py

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Add and View Tasks (Priority: P1) 🎯 MVP

**Goal**: Enable users to add tasks with titles and descriptions and view them in a list for basic task tracking

**Independent Test**: Launch app, add multiple tasks with valid titles and descriptions, use list command to verify they appear in creation order

### Tests for User Story 1 (TDD - Red Phase)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T017 [P] [US1] Contract test for "add" command in tests/contract/test_add_command.py verifying task creation with unique ID
- [X] T018 [P] [US1] Contract test for "list" command in tests/contract/test_list_command.py verifying display format and order
- [X] T019 [P] [US1] Integration test for add-then-list workflow in tests/integration/test_add_list_flow.py
- [X] T020 [P] [US1] Validation edge case tests in tests/unit/test_validation.py for empty title, 100+ char title, 500+ char description

### Implementation for User Story 1 (TDD - Green Phase)

- [X] T021 [US1] Implement add_task(title, description) method in src/todo/services.py that validates inputs, creates TodoItem with next_id, appends to list, increments counter, returns TodoItem
- [X] T022 [US1] Implement list_tasks() method in src/todo/services.py that returns copy of task list in creation order
- [X] T023 [US1] Write unit tests for add_task() in tests/unit/test_services.py verifying ID generation, list order, validation integration
- [X] T024 [US1] Write unit tests for list_tasks() in tests/unit/test_services.py verifying order preservation and empty list handling
- [X] T025 [US1] Create CLI class in src/todo/cli.py with __init__(self) that initializes TaskService instance
- [X] T026 [US1] Implement run() method in src/todo/cli.py with infinite command loop that catches exceptions and continues
- [X] T027 [US1] Implement handle_command(cmd) dispatcher in src/todo/cli.py that calls validate_command() and routes to handler methods
- [X] T028 [US1] Implement handle_add() in src/todo/cli.py that prompts for title/description, calls service.add_task(), displays success with ID
- [X] T029 [US1] Implement handle_list() in src/todo/cli.py that calls service.list_tasks(), formats output as "[x] ID. Title — Description" or displays "No tasks found"
- [X] T030 [US1] Implement display_error(error) in src/todo/cli.py that shows user-friendly messages for ValidationError, InvalidCommandError, EmptyInputError without stack traces
- [X] T031 [US1] Write integration tests in tests/integration/test_cli.py for add and list commands with mocked input/output
- [X] T032 [US1] Create src/main.py that imports CLI, instantiates it, and calls cli.run()

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently (MVP complete!)

---

## Phase 4: User Story 5 - Get Help and Exit (Priority: P1)

**Goal**: Enable users to see available commands and exit the application gracefully for basic usability

**Independent Test**: Enter "help" command to see command documentation, enter "exit" to terminate application cleanly

### Tests for User Story 5 (TDD - Red Phase)

- [X] T033 [P] [US5] Contract test for "help" command in tests/contract/test_help_command.py verifying all 8 commands are documented
- [X] T034 [P] [US5] Contract test for "exit" command in tests/contract/test_exit_command.py verifying graceful termination
- [X] T035 [P] [US5] Integration test for unknown command handling in tests/integration/test_error_handling.py

### Implementation for User Story 5 (TDD - Green Phase)

- [X] T036 [US5] Implement handle_help() in src/todo/cli.py that displays all 8 commands (add, list, update, delete, complete, incomplete, help, exit) with descriptions
- [X] T037 [US5] Implement handle_exit() in src/todo/cli.py that displays "Goodbye!" and sets loop exit flag or raises SystemExit
- [X] T038 [US5] Update handle_command() in src/todo/cli.py to route "help" and "exit" commands with case-insensitive matching
- [X] T039 [US5] Update display_error() in src/todo/cli.py to handle InvalidCommandError with helpful "Type 'help' for available commands" message
- [X] T040 [US5] Write integration tests in tests/integration/test_cli.py for help and exit commands

**Checkpoint**: Core usability complete - users can learn commands and exit properly

---

## Phase 5: User Story 2 - Mark Tasks Complete or Incomplete (Priority: P2)

**Goal**: Enable users to mark tasks as complete or incomplete to track progress and distinguish finished work from pending work

**Independent Test**: Add tasks, mark them complete, verify completion status in list view, mark them incomplete again

### Tests for User Story 2 (TDD - Red Phase)

- [X] T041 [P] [US2] Contract test for "complete" command in tests/contract/test_complete_command.py verifying [x] display in list
- [X] T042 [P] [US2] Contract test for "incomplete" command in tests/contract/test_incomplete_command.py verifying [ ] display in list
- [X] T043 [P] [US2] Integration test for complete-incomplete toggle workflow in tests/integration/test_completion_flow.py
- [X] T044 [P] [US2] Error handling tests for non-existent ID and non-integer ID in tests/unit/test_services.py

### Implementation for User Story 2 (TDD - Green Phase)

- [X] T045 [US2] Implement get_task_by_id(task_id: int) helper method in src/todo/services.py that returns TodoItem or raises TaskNotFoundError
- [X] T046 [US2] Implement complete_task(task_id: int) method in src/todo/services.py that validates ID exists, sets completed=True, returns updated TodoItem
- [X] T047 [US2] Implement incomplete_task(task_id: int) method in src/todo/services.py that validates ID exists, sets completed=False, returns updated TodoItem
- [X] T048 [US2] Write unit tests for get_task_by_id() in tests/unit/test_services.py verifying success and TaskNotFoundError cases
- [X] T049 [US2] Write unit tests for complete_task() and incomplete_task() in tests/unit/test_services.py
- [X] T050 [US2] Implement handle_complete() in src/todo/cli.py that prompts for ID, calls validate_id(), calls service.complete_task(), displays success
- [X] T051 [US2] Implement handle_incomplete() in src/todo/cli.py that prompts for ID, calls validate_id(), calls service.incomplete_task(), displays success
- [X] T052 [US2] Update handle_command() in src/todo/cli.py to route "complete" and "incomplete" commands
- [X] T053 [US2] Update display_error() in src/todo/cli.py to handle InvalidIDError and TaskNotFoundError with descriptive messages
- [X] T054 [US2] Update handle_list() in src/todo/cli.py to display [x] for completed=True and [ ] for completed=False
- [X] T055 [US2] Write integration tests in tests/integration/test_cli.py for complete and incomplete commands

**Checkpoint**: Completion tracking functional - users can track progress on tasks

---

## Phase 6: User Story 3 - Update Task Details (Priority: P3)

**Goal**: Enable users to update title and description of existing tasks to correct mistakes or refine task details

**Independent Test**: Add a task, update its title and description, verify changes appear in list

### Tests for User Story 3 (TDD - Red Phase)

- [X] T056 [P] [US3] Contract test for "update" command in tests/contract/test_update_command.py verifying atomic update of both fields
- [X] T057 [P] [US3] Integration test for update workflow in tests/integration/test_update_flow.py
- [X] T058 [P] [US3] Atomic operation test in tests/unit/test_services.py verifying no partial updates on validation failure

### Implementation for User Story 3 (TDD - Green Phase)

- [X] T059 [US3] Implement update_task(task_id: int, new_title: str, new_description: str) method in src/todo/services.py that validates all inputs first, then atomically updates both fields, returns updated TodoItem
- [X] T060 [US3] Write unit tests for update_task() in tests/unit/test_services.py verifying atomic behavior, validation integration, TaskNotFoundError
- [X] T061 [US3] Implement handle_update() in src/todo/cli.py that prompts for ID, validates ID, prompts for new title, prompts for new description, calls service.update_task(), displays success
- [X] T062 [US3] Update handle_command() in src/todo/cli.py to route "update" command
- [X] T063 [US3] Write integration tests in tests/integration/test_cli.py for update command with valid and invalid inputs

**Checkpoint**: Task editing functional - users can refine task details without deleting/recreating

---

## Phase 7: User Story 4 - Delete Unwanted Tasks (Priority: P3)

**Goal**: Enable users to delete tasks that are no longer relevant to keep task list clean and focused

**Independent Test**: Add tasks, delete specific ones by ID, verify they no longer appear in list

### Tests for User Story 4 (TDD - Red Phase)

- [X] T064 [P] [US4] Contract test for "delete" command in tests/contract/test_delete_command.py verifying permanent removal
- [X] T065 [P] [US4] Integration test for delete workflow in tests/integration/test_delete_flow.py
- [X] T066 [P] [US4] ID non-reuse test in tests/unit/test_services.py verifying IDs never reused after deletion

### Implementation for User Story 4 (TDD - Green Phase)

- [X] T067 [US4] Implement delete_task(task_id: int) method in src/todo/services.py that validates ID exists, removes task from list, does NOT decrement next_id counter, returns None
- [X] T068 [US4] Write unit tests for delete_task() in tests/unit/test_services.py verifying removal, ID non-reuse, TaskNotFoundError
- [X] T069 [US4] Implement handle_delete() in src/todo/cli.py that prompts for ID, calls validate_id(), calls service.delete_task(), displays success
- [X] T070 [US4] Update handle_command() in src/todo/cli.py to route "delete" command
- [X] T071 [US4] Write integration tests in tests/integration/test_cli.py for delete command

**Checkpoint**: All user stories complete - full CRUD functionality available

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [X] T072 [P] Run all unit tests with pytest and verify 100% pass rate
- [X] T073 [P] Run all integration tests and verify end-to-end workflows function correctly
- [X] T074 [P] Run all contract tests and verify compliance with specification
- [X] T075 Verify all acceptance scenarios from spec.md User Stories 1-5
- [X] T076 Validate all Functional Requirements FR-001 through FR-026 are satisfied
- [X] T077 Validate all Success Criteria SC-001 through SC-010 are met
- [X] T078 Performance test: Create 1000 tasks and verify all operations respond in < 100ms
- [X] T079 Edge case testing: Empty input, whitespace-only input, boundary lengths (100 chars, 500 chars)
- [X] T080 Error message quality review: Verify all errors provide clear what/why/how-to-fix guidance
- [X] T081 [P] Create README.md with project overview and link to quickstart.md
- [X] T082 [P] Code review for constitutional compliance: C-2 (zero-trust), C-4 (deterministic), C-10 (atomic), C-15 (clean architecture)
- [X] T083 Run quickstart.md manual validation: Follow all steps to ensure accurate documentation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-7)**: All depend on Foundational phase completion
  - User Story 1 (Phase 3) + User Story 5 (Phase 4) = MVP (both P1 priority)
  - User Story 2 (Phase 5) can start after foundational - independent
  - User Story 3 (Phase 6) can start after foundational - independent
  - User Story 4 (Phase 7) can start after foundational - independent
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 5 (P1)**: Can start after Foundational - No dependencies on other stories (MVP with US1)
- **User Story 2 (P2)**: Can start after Foundational - No dependencies on other stories
- **User Story 3 (P3)**: Can start after Foundational - No dependencies on other stories
- **User Story 4 (P3)**: Can start after Foundational - No dependencies on other stories

### Within Each User Story (TDD Flow)

1. Tests written FIRST and FAIL (Red)
2. Minimum implementation to pass tests (Green)
3. Services before CLI handlers
4. Update command dispatcher to route new commands
5. Integration tests after implementation
6. Story complete before moving to next priority

### Parallel Opportunities

#### Phase 1 (Setup)
- T003, T004, T005 can run in parallel (different files)

#### Phase 2 (Foundational)
- T007, T008, T009 can run in parallel after T006
- T011, T012, T013 can run in parallel after T010
- T016 can run in parallel with T014

#### Phase 3 (User Story 1)
- T017, T018, T019, T020 can run in parallel (all test files)
- T023, T024 can run in parallel after T021-T022
- T031 can run after T025-T030

#### Phase 4 (User Story 5)
- T033, T034, T035 can run in parallel (all test files)
- All of Phase 4 can run in parallel with Phase 3 (different commands)

#### Phase 5-7 (User Stories 2-4)
- Each user story's test tasks marked [P] can run in parallel
- User Stories 2, 3, 4 can be worked on in parallel by different developers after Foundational

#### Phase 8 (Polish)
- T072, T073, T074, T081, T082 can run in parallel (independent validation activities)

---

## Parallel Example: User Story 1 MVP

```bash
# After Foundational phase completes, launch all test creation in parallel:
Task T017: Contract test for "add" command
Task T018: Contract test for "list" command
Task T019: Integration test for add-then-list workflow
Task T020: Validation edge case tests

# After services implemented (T021-T022), launch service tests in parallel:
Task T023: Unit tests for add_task()
Task T024: Unit tests for list_tasks()

# User Story 1 and User Story 5 can be developed in parallel for fastest MVP
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 5 Only - Both P1)

1. **Phase 1**: Setup (T001-T005)
2. **Phase 2**: Foundational (T006-T016) - CRITICAL BLOCKER
3. **Phase 3**: User Story 1 - Add/List (T017-T032)
4. **Phase 4**: User Story 5 - Help/Exit (T033-T040)
5. **STOP and VALIDATE**: Test MVP independently with manual workflows
6. Deploy/demo basic working todo app

**MVP Delivers**: Users can add tasks, view task list, get help, and exit cleanly

### Incremental Delivery (Recommended)

1. Complete Setup + Foundational → Foundation ready (T001-T016)
2. Add User Story 1 + User Story 5 → Test independently → Deploy MVP (T017-T040)
3. Add User Story 2 → Test independently → Deploy v1.1 with completion tracking (T041-T055)
4. Add User Story 3 → Test independently → Deploy v1.2 with editing (T056-T063)
5. Add User Story 4 → Test independently → Deploy v1.3 with deletion (T064-T071)
6. Polish and final validation → Deploy v1.0 production (T072-T083)

Each increment adds value without breaking previous functionality.

### Parallel Team Strategy

With multiple developers:

1. **Team**: Complete Setup + Foundational together (T001-T016)
2. Once Foundational done:
   - **Developer A**: User Story 1 (T017-T032)
   - **Developer B**: User Story 5 (T033-T040)
3. After MVP:
   - **Developer A**: User Story 2 (T041-T055)
   - **Developer B**: User Story 3 (T056-T063)
   - **Developer C**: User Story 4 (T064-T071)
4. **Team**: Polish together (T072-T083)

---

## Task Summary

**Total Tasks**: 83

### Tasks by Phase
- Phase 1 (Setup): 5 tasks
- Phase 2 (Foundational): 11 tasks (BLOCKING)
- Phase 3 (User Story 1 - P1): 16 tasks
- Phase 4 (User Story 5 - P1): 8 tasks
- Phase 5 (User Story 2 - P2): 15 tasks
- Phase 6 (User Story 3 - P3): 8 tasks
- Phase 7 (User Story 4 - P3): 8 tasks
- Phase 8 (Polish): 12 tasks

### Tasks by User Story
- **US1** (Add/View - P1): 16 tasks → MVP Core
- **US5** (Help/Exit - P1): 8 tasks → MVP Usability
- **US2** (Complete/Incomplete - P2): 15 tasks → Progress Tracking
- **US3** (Update - P3): 8 tasks → Task Editing
- **US4** (Delete - P3): 8 tasks → List Management

### Parallel Opportunities Identified
- Setup: 3 parallel tasks
- Foundational: 6 parallel tasks
- User Story 1: 8 parallel tasks
- User Story 5: 3 parallel tasks (can run entire phase parallel with US1)
- User Stories 2-4: All 3 stories can run in parallel after Foundational

### MVP Scope (P1 Priority)
**Tasks T001-T040** deliver a working MVP (24% of total tasks) with:
- Add tasks with validation
- List tasks in order
- Help command
- Exit command
- All core infrastructure

---

## Notes

- **[P] marker**: Tasks that can run in parallel (different files, no dependencies)
- **[Story] label**: Maps task to specific user story for traceability
- **TDD approach**: Tests written first (Red), then implementation (Green), then verify (Refactor)
- **Independent stories**: Each user story can be fully tested without others
- **Atomic operations**: All validation happens before any state mutation (C-10 compliance)
- **Constitutional compliance**: Zero-trust input (C-2), deterministic behavior (C-4), clean architecture (C-15)
- **Commit strategy**: Commit after each completed task or logical task group
- **Checkpoints**: Stop at any checkpoint to validate story independently before proceeding
- **No persistence**: All state in-memory only (C-13 compliance)
- **Standard library only**: No external dependencies beyond Python 3.13+ stdlib and pytest (C-16 compliance)

---

## Suggested MVP Scope

**Minimum Viable Product**: Complete tasks T001-T040 (Phases 1-4)

This delivers:
✅ Project setup and infrastructure
✅ Data model and validation framework
✅ Add tasks with title/description
✅ List all tasks in creation order
✅ Help command for discoverability
✅ Exit command for clean termination
✅ Full error handling for invalid inputs
✅ Constitutional compliance (zero-trust, deterministic, clean architecture)

**Time to MVP**: ~24% of total implementation effort

**Post-MVP**: Add User Stories 2-4 incrementally based on priority (P2 then P3)
