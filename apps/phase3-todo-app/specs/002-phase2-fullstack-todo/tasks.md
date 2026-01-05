# Tasks: Phase II Full-Stack Todo Web Application

**Input**: Design documents from `/specs/002-phase2-fullstack-todo/`
**Prerequisites**: plan.md, spec.md, contracts/ (8 API contracts)

**Tests**: Not requested in spec - NO test tasks included

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5, US6)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- All paths are from repository root: `C:\Users\user\Desktop\Hackathon 2\phase2-todo-app`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and monorepo structure

- [ ] T001 [P] Create backend directory structure at `backend/` with subdirectories: `src/`, `src/models/`, `src/auth/`, `src/api/`, `migrations/`
- [ ] T002 [P] Create frontend directory structure at `frontend/` with subdirectories: `src/`, `src/app/`, `src/components/`, `src/lib/`
- [ ] T003 Initialize Python project with pyproject.toml and requirements.txt at `backend/requirements.txt` (FastAPI, SQLModel, python-jose, passlib, psycopg2-binary, uvicorn, alembic)
- [ ] T004 Initialize Next.js project with package.json at `frontend/package.json` (Next.js 16+, Better Auth, React 18+, TypeScript 5+)
- [ ] T005 [P] Create backend .env.example at `backend/.env.example` with DATABASE_URL and BETTER_AUTH_SECRET placeholders
- [ ] T006 [P] Create frontend .env.example at `frontend/.env.example` with NEXT_PUBLIC_API_URL and BETTER_AUTH_SECRET placeholders
- [ ] T007 [P] Create backend CLAUDE.md at `backend/CLAUDE.md` with FastAPI, SQLModel, JWT verification guidance
- [ ] T008 [P] Create frontend CLAUDE.md at `frontend/CLAUDE.md` with Next.js App Router, Better Auth, centralized API client guidance

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Backend Foundation

- [ ] T009 Create config module at `backend/src/config.py` to load DATABASE_URL and BETTER_AUTH_SECRET from environment variables
- [ ] T010 Create database engine and session factory at `backend/src/database.py` using SQLModel.create_engine with PostgreSQL connection
- [ ] T011 [P] Create User model at `backend/src/models/user.py` with fields: id (UUID), email (unique, indexed), password_hash, created_at, updated_at
- [ ] T012 [P] Create Todo model at `backend/src/models/todo.py` with fields: id (UUID), user_id (FK to User, indexed, ON DELETE CASCADE), title (max 500 chars), description (max 5000 chars), completed (default false), created_at, updated_at
- [ ] T013 Initialize Alembic migrations at `backend/migrations/` and create initial migration for User and Todo tables
- [ ] T014 Create password hashing utilities at `backend/src/auth/password.py` using passlib with bcrypt (hash_password, verify_password functions)
- [ ] T015 Create JWT utilities at `backend/src/auth/jwt.py` for token creation (create_access_token with sub claim, 24h expiry, HS256 algorithm) and verification (verify_token, extract_user_id)
- [ ] T016 Create JWT authentication middleware at `backend/src/auth/middleware.py` to extract and verify JWT from Authorization header, return 401 on failure
- [ ] T017 Create get_current_user dependency at `backend/src/dependencies.py` using FastAPI Depends to extract user_id from JWT sub claim
- [ ] T018 Create FastAPI app instance at `backend/src/main.py` with CORS middleware, startup database connection validation, and health check endpoint

### Frontend Foundation

- [ ] T019 Configure Better Auth at `frontend/src/lib/auth.ts` with JWT plugin, shared BETTER_AUTH_SECRET, 24h token expiry
- [ ] T020 Create centralized API client at `frontend/src/lib/api.ts` with automatic JWT attachment from Better Auth session, error handling (401 redirect to /login)
- [ ] T021 Create TypeScript types at `frontend/src/lib/types.ts` for User (id, email, created_at) and Todo (id, user_id, title, description, completed, created_at, updated_at)
- [ ] T022 Create Next.js middleware at `frontend/src/middleware.ts` to protect /todos routes (redirect unauthenticated users to /login)
- [ ] T023 Create root layout at `frontend/src/app/layout.tsx` with Better Auth provider and global styles
- [ ] T024 Create landing page at `frontend/src/app/page.tsx` with links to /login and /register

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Registration & Authentication (Priority: P1) 🎯 MVP

**Goal**: Enable users to create accounts, log in securely, and access protected routes with JWT-based authentication

**Independent Test**: Register new account → automatically logged in → logout → login with credentials → verify token attached to requests → access protected /todos page

### Implementation for User Story 1

- [ ] T025 [P] [US1] Implement POST /api/auth/register endpoint at `backend/src/api/auth.py`: validate email format, check uniqueness (409 if exists), hash password, create user, generate JWT with user_id in sub claim, return 201 with user and token
- [ ] T026 [P] [US1] Implement POST /api/auth/login endpoint at `backend/src/api/auth.py`: validate credentials, verify password hash, generate JWT with user_id in sub claim, return 200 with user and token (401 on invalid credentials without leaking user existence)
- [ ] T027 [US1] Mount auth router in `backend/src/main.py` at /api/auth prefix
- [ ] T028 [P] [US1] Create registration page at `frontend/src/app/register/page.tsx` with form (email, password), client-side validation (email format, password >= 8 chars), handle 409 conflict, store token in Better Auth session on success, redirect to /todos
- [ ] T029 [P] [US1] Create login page at `frontend/src/app/login/page.tsx` with form (email, password), handle 401 error without revealing user existence, store token in Better Auth session on success, redirect to /todos
- [ ] T030 [US1] Create Navbar component at `frontend/src/components/Navbar.tsx` with logout button (clears Better Auth session, redirects to /login)
- [ ] T031 [US1] Add input validation and error handling for auth endpoints: return 400 for missing fields, invalid email format, password < 8 chars

**Checkpoint**: At this point, User Story 1 should be fully functional - users can register, login, logout, and access protected routes

---

## Phase 4: User Story 2 - Create and View Personal Todos (Priority: P1) 🎯 MVP

**Goal**: Enable authenticated users to create new todo items and view their complete list of todos

**Independent Test**: Login → create todo with title only → create todo with title and description → view list showing only own todos → refresh page → verify todos persist

### Implementation for User Story 2

- [ ] T032 [P] [US2] Implement POST /api/todos endpoint at `backend/src/api/todos.py`: extract user_id from JWT (get_current_user dependency), validate title (required, trim whitespace, max 500 chars), validate description (optional, max 5000 chars), create todo with user_id from JWT (never from request body), set completed=false, return 201 with created todo
- [ ] T033 [P] [US2] Implement GET /api/todos endpoint at `backend/src/api/todos.py`: extract user_id from JWT, query todos filtered by user_id (WHERE user_id = <jwt_user_id>), return 200 with list sorted by created_at DESC (newest first)
- [ ] T034 [US2] Mount todos router in `backend/src/main.py` at /api/todos prefix with JWT authentication middleware
- [ ] T035 [P] [US2] Create TodoList component at `frontend/src/components/TodoList.tsx` to display list of todos with title, description, created_at timestamp, empty state message ("No todos yet - create your first one!")
- [ ] T036 [P] [US2] Create TodoForm component at `frontend/src/components/TodoForm.tsx` with title input (required), description textarea (optional), client-side validation (trim title, check non-empty), call POST /api/todos via centralized API client
- [ ] T037 [US2] Create todos dashboard page at `frontend/src/app/todos/page.tsx`: fetch todos on load via GET /api/todos, render TodoList and TodoForm components, handle 401 redirect to login
- [ ] T038 [US2] Add error handling for todo creation: 400 for empty title, 401 for expired token (redirect to login), display user-friendly error messages

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can register/login AND create/view their own todos

---

## Phase 5: User Story 6 - User Data Isolation (Priority: P1) 🎯 MVP (Security)

**Goal**: Enforce that users can ONLY access, view, modify, and delete their own todos, with no cross-user data leakage

**Independent Test**: Create 2 accounts → create todos in each → verify user A cannot access user B's todos through UI or API manipulation (attempts return 404)

### Implementation for User Story 6 (Integrated into Existing Endpoints)

- [ ] T039 [US6] Implement GET /api/todos/{todo_id} endpoint at `backend/src/api/todos.py`: extract user_id from JWT, query todo with WHERE id = <todo_id> AND user_id = <jwt_user_id>, return 404 (not 403) if not found or unauthorized to prevent enumeration
- [ ] T040 [US6] Add ownership verification to all todo endpoints: ensure all queries include `WHERE user_id = <jwt_user_id>` filter, never read user_id from URL/query params/request body (only from JWT sub claim), return 404 on ownership violations
- [ ] T041 [US6] Add security validation in JWT middleware at `backend/src/auth/middleware.py`: verify JWT sub claim exists, verify JWT signature with BETTER_AUTH_SECRET, verify expiration (<24h), return 401 for missing/invalid/expired tokens
- [ ] T042 [US6] Document user isolation enforcement in `backend/CLAUDE.md`: emphasize user_id MUST come exclusively from JWT sub claim, all todo queries MUST include user_id filter, 404 (not 403) on ownership violations

**Checkpoint**: User data isolation is now enforced at API level - cross-user access is impossible

---

## Phase 6: User Story 3 - Mark Todos as Complete/Incomplete (Priority: P2)

**Goal**: Enable users to toggle todo completion status with visual indication in UI

**Independent Test**: Login → create todos → mark one as complete (verify visual indicator like strikethrough) → refresh page (verify status persists) → mark as incomplete again

### Implementation for User Story 3

- [ ] T043 [US3] Implement PATCH /api/todos/{todo_id}/complete endpoint at `backend/src/api/todos.py`: extract user_id from JWT, validate completed field (required boolean), query todo with ownership check (WHERE id = <todo_id> AND user_id = <jwt_user_id>), update completed status and updated_at timestamp, return 200 with updated todo (404 if not found/unauthorized)
- [ ] T044 [US3] Create TodoItem component at `frontend/src/components/TodoItem.tsx` with checkbox for completion status, title with conditional strikethrough styling when completed, description display, visual distinction between completed/incomplete items
- [ ] T045 [US3] Update TodoList component at `frontend/src/components/TodoList.tsx` to render individual TodoItem components for each todo
- [ ] T046 [US3] Implement toggle completion handler in TodoItem component: call PATCH /api/todos/{id}/complete with opposite completed value, update local state optimistically (rollback on error), handle 404 (todo deleted or unauthorized) and 401 (token expired)

**Checkpoint**: At this point, User Stories 1, 2, 3, and 6 all work independently - users can register, create todos, and mark them complete/incomplete

---

## Phase 7: User Story 4 - Update Todo Details (Priority: P2)

**Goal**: Enable users to edit title and description of existing todos with validation and cancel functionality

**Independent Test**: Login → create todo → edit title → verify changes persist → edit description → cancel edit (verify original values preserved) → attempt empty title (verify validation error)

### Implementation for User Story 4

- [ ] T047 [US4] Implement PUT /api/todos/{todo_id} endpoint at `backend/src/api/todos.py`: extract user_id from JWT, validate title (required, trim whitespace, max 500 chars), validate description (optional, max 5000 chars), query todo with ownership check (WHERE id = <todo_id> AND user_id = <jwt_user_id>), update title/description and updated_at timestamp (completed field unchanged), return 200 with updated todo (404 if not found/unauthorized, 400 for validation errors)
- [ ] T048 [US4] Create TodoEditForm component at `frontend/src/components/TodoEditForm.tsx` with title input (pre-filled with current value), description textarea (pre-filled), Save button, Cancel button (revert to original values), client-side validation (non-empty title after trim)
- [ ] T049 [US4] Add edit mode state to TodoItem component at `frontend/src/components/TodoItem.tsx`: toggle between display mode (with Edit button) and edit mode (showing TodoEditForm), handle save (call PUT /api/todos/{id}), handle cancel (revert to original values), handle errors (400 validation, 404 not found, 401 expired token)

**Checkpoint**: Users can now fully edit their todos with proper validation and error handling

---

## Phase 8: User Story 5 - Delete Todos (Priority: P3)

**Goal**: Enable users to permanently delete todos with confirmation prompt to prevent accidental deletion

**Independent Test**: Login → create todo → delete with confirmation → verify removed from list and database → cancel deletion → verify todo remains

### Implementation for User Story 5

- [ ] T050 [US5] Implement DELETE /api/todos/{todo_id} endpoint at `backend/src/api/todos.py`: extract user_id from JWT, query todo with ownership check (WHERE id = <todo_id> AND user_id = <jwt_user_id>), delete from database, return 204 No Content (404 if not found/unauthorized)
- [ ] T051 [US5] Add delete button to TodoItem component at `frontend/src/components/TodoItem.tsx`: show confirmation dialog on click ("Are you sure you want to delete this todo?"), call DELETE /api/todos/{id} on confirm, remove from local state on success, handle errors (404, 401), allow cancel to abort deletion

**Checkpoint**: All user stories complete - full CRUD functionality with authentication, authorization, and user isolation

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final production readiness

- [ ] T052 [P] Add loading states to all frontend forms and lists: display spinner during API requests, disable buttons during submission, show loading skeleton for todo list
- [ ] T053 [P] Add comprehensive error handling across all backend endpoints: validate UUID formats, sanitize all inputs to prevent injection, catch database errors and return 503 Service Unavailable with user-friendly messages
- [ ] T054 [P] Improve UI/UX with consistent styling: add CSS framework (Tailwind or similar), responsive design for mobile devices, consistent color scheme and spacing, accessible form labels and ARIA attributes
- [ ] T055 Add timestamps display in TodoItem component: format created_at and updated_at with relative time (e.g., "2 hours ago"), show full timestamp on hover
- [ ] T056 [P] Create quickstart documentation at `specs/002-phase2-fullstack-todo/quickstart.md`: prerequisites (Python 3.11+, Node.js 18+, PostgreSQL), environment setup steps, database migration commands, running backend (uvicorn), running frontend (npm run dev), testing full flow, common troubleshooting (JWT secret mismatch, database connection errors)
- [ ] T057 [P] Add API documentation in backend: FastAPI automatic OpenAPI docs at /docs endpoint, add docstrings to all endpoints with parameter descriptions and response schemas
- [ ] T058 [P] Security hardening: ensure HTTPS enforcement in production, add CORS configuration to only allow frontend origin, implement request size limits, add rate limiting headers documentation (implementation optional for MVP)
- [ ] T059 Validate complete user journeys: end-to-end test of registration → login → create todos → mark complete → edit → delete → logout, verify all user isolation scenarios (cannot access other users' todos), verify token expiration handling (401 redirect to login)
- [ ] T060 Code cleanup and refactoring: remove console.log statements, add TypeScript strict mode checks, ensure consistent error messages, add comments for complex logic (JWT verification, user isolation enforcement)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-8)**: All depend on Foundational phase completion
  - User Story 1 (Phase 3) - Authentication: Can start after Phase 2, BLOCKS all other stories
  - User Story 2 (Phase 4) - Create/View: Depends on Phase 3 (requires auth)
  - User Story 6 (Phase 5) - Data Isolation: Can integrate during Phases 3-4 (integrated into endpoints)
  - User Story 3 (Phase 6) - Complete/Incomplete: Depends on Phase 4 (requires todos to exist)
  - User Story 4 (Phase 7) - Update: Depends on Phase 4 (requires todos to exist)
  - User Story 5 (Phase 8) - Delete: Depends on Phase 4 (requires todos to exist)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1) - Authentication**: MUST be complete before any other user story (provides JWT authentication foundation)
- **User Story 2 (P1) - Create/View**: Depends on US1 completion (requires authenticated users)
- **User Story 6 (P1) - Data Isolation**: Implemented alongside US2 (integrated into API endpoints)
- **User Story 3 (P2) - Complete/Incomplete**: Depends on US2 completion (requires todos to exist)
- **User Story 4 (P2) - Update**: Depends on US2 completion (requires todos to exist)
- **User Story 5 (P3) - Delete**: Depends on US2 completion (requires todos to exist)

### Within Each User Story

- Models before services/endpoints (Phase 2 foundation)
- Backend endpoints before frontend components (contract-first approach)
- Core implementation before error handling
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1 Setup**: T001-T002 (directories), T003-T004 (initialization), T005-T006 (.env files), T007-T008 (CLAUDE.md files) can all run in parallel
- **Phase 2 Foundation**: T011-T012 (models), T014-T015 (auth utilities), T019-T021 (frontend lib files), T028-T029 (auth pages) can run in parallel after their dependencies complete
- **Within User Stories**: Backend and frontend tasks marked [P] touching different files can run in parallel
- **US2 Implementation**: T032-T033 (backend endpoints), T035-T036 (frontend components) can run in parallel
- **US3 Implementation**: T043 (backend endpoint), T044 (TodoItem component) can run in parallel
- **Phase 9 Polish**: T052-T054 (loading/error handling/styling), T056-T058 (docs/security) can run in parallel

---

## Implementation Strategy

### MVP First (P1 Stories Only)

1. Complete Phase 1: Setup (T001-T008)
2. Complete Phase 2: Foundational (T009-T024) - CRITICAL, blocks all stories
3. Complete Phase 3: User Story 1 - Authentication (T025-T031)
4. Complete Phase 4: User Story 2 - Create/View Todos (T032-T038)
5. Complete Phase 5: User Story 6 - Data Isolation (T039-T042, integrated)
6. **STOP and VALIDATE**: Test MVP (registration, authentication, todo creation/viewing, user isolation)
7. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready (Phases 1-2)
2. Add User Story 1 → Test independently → Deploy/Demo (Authentication working)
3. Add User Stories 2 + 6 → Test independently → Deploy/Demo (MVP complete!)
4. Add User Story 3 → Test independently → Deploy/Demo (Completion toggling)
5. Add User Story 4 → Test independently → Deploy/Demo (Editing)
6. Add User Story 5 → Test independently → Deploy/Demo (Deletion)
7. Add Polish (Phase 9) → Final production-ready release

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (Phases 1-2)
2. Team completes User Story 1 together (Phase 3) - BLOCKS all other stories
3. Once US1 done, split work:
   - Developer A: User Story 2 + 6 (Create/View + Data Isolation)
   - Developer B: User Story 3 (Complete/Incomplete) - starts after US2 done
   - Developer C: Prepare Phase 9 polish (docs, styling)
4. Once US2 done:
   - Developer A: User Story 4 (Update)
   - Developer B: User Story 5 (Delete)
5. Final polish together (Phase 9)

---

## Notes

- **[P] tasks**: Different files, no dependencies - safe to run in parallel
- **[Story] label**: Maps task to specific user story for traceability to spec.md
- **No tests**: Tests not requested in spec.md, therefore NO test tasks included
- **User isolation (US6)**: Integrated into API implementation, not a separate feature layer
- **JWT sub claim**: Exclusive source of user identity - NEVER use URL params or request body for user_id
- **404 vs 403**: Always return 404 for ownership violations (prevents user enumeration)
- **Path structure**: Monorepo with strict `/backend` and `/frontend` separation
- **Commit strategy**: Commit after each task or logical group
- **Checkpoints**: Stop at any checkpoint to validate story independently before proceeding
- **Technology stack**: Constitutionally locked (Next.js 16+ App Router, FastAPI, SQLModel, Better Auth, PostgreSQL) - NO substitutions allowed
- **Constitutional compliance**: All tasks trace to spec.md requirements and plan.md implementation approach
