---
id: PHR-002-003
title: Phase II Full-Stack Todo Task Generation
stage: tasks
date: 2026-01-01
surface: cli
model: claude-opus-4-5
feature: 002-phase2-fullstack-todo
branch: 002-phase2-fullstack-todo
user: user
command: /sp.tasks
labels: [tasks, implementation, user-stories, monorepo, jwt, security]
links:
  spec: specs/002-phase2-fullstack-todo/spec.md
  ticket: N/A
  adr: N/A
  pr: N/A
files:
  - path: specs/002-phase2-fullstack-todo/tasks.md
    action: created
    lines: ~650
tests:
  - type: N/A
    path: N/A
    status: N/A
---

## Prompt

User requested task breakdown for Phase II Full-Stack Todo Web Application based on specification (PHR-002-001) and implementation plan (PHR-002-002).

**User Stories from spec.md** (6 stories, prioritized):
1. **US1 (P1)**: User Registration & Authentication - foundational for all features
2. **US2 (P1)**: Create and View Personal Todos - core value proposition
3. **US3 (P2)**: Mark Todos Complete/Incomplete - productivity enhancement
4. **US4 (P2)**: Update Todo Details - usability improvement
5. **US5 (P3)**: Delete Todos - list management
6. **US6 (P1)**: User Data Isolation - security requirement (constitutional)

**Technical Stack from plan.md**:
- Backend: Python 3.11+, FastAPI, SQLModel, PostgreSQL, python-jose (JWT), passlib (bcrypt)
- Frontend: Next.js 16+, Better Auth, React 18+, TypeScript 5+
- Monorepo: `/backend` and `/frontend` strict separation

**Key Constraints**:
- Backend stateless (no server-side sessions)
- JWT `sub` claim is sole source of user identity (never URL params)
- 404 on ownership violations (not 403, prevents enumeration)
- All API requests require valid JWT (401 without)
- Monorepo structure required
- Tests NOT requested in spec (no test generation)

**Design Artifacts Available**:
- plan.md (741 lines): Technical context, constitution check, project structure
- spec.md (267 lines): User stories, functional requirements, success criteria
- research.md (450 lines): Technology integration patterns (JWT, SQLModel, Better Auth)
- data-model.md: User and Todo entities with SQLModel specs
- quickstart.md: Developer onboarding guide
- contracts/ (8 files): API contracts for auth and todo operations

**Task Generation Requirements**:
1. Strict checklist format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
2. Tasks organized by user story (one phase per story)
3. Foundational phase must BLOCK all user stories (database, JWT middleware, models)
4. Parallel markers [P] only when tasks touch different files with no dependencies
5. Story labels ([US1]-[US6]) required for user story phases only
6. Sequential task IDs starting at T001
7. Exact file paths from repo root

## Response snapshot

Generated comprehensive tasks.md file at `specs/002-phase2-fullstack-todo/tasks.md` with 60 tasks organized into 9 phases.

**Task Breakdown by Phase**:

1. **Phase 1: Setup (T001-T008)** - 8 tasks
   - Project structure (backend/, frontend/, .gitignore)
   - Dependency initialization (requirements.txt, package.json)
   - Environment templates (.env.example)
   - Scoped guidance files (backend/CLAUDE.md, frontend/CLAUDE.md)

2. **Phase 2: Foundational (T009-T024)** - 16 tasks ⚠️ BLOCKS ALL USER STORIES
   - Database: SQLModel engine (T009), User model (T011), Todo model (T012), Alembic migrations (T013)
   - JWT Backend: Token creation (T014), verification (T015), middleware (T016), FastAPI dependency (T017)
   - JWT Frontend: Better Auth config (T018), session provider (T019), centralized API client (T020)
   - Route Protection: Next.js middleware (T021), error handling (T022), env var validation (T023), database connection test (T024)

3. **Phase 3: User Story 1 - Authentication (T025-T031)** - 7 tasks [US1] [P1]
   - Backend: Register endpoint (T025), login endpoint (T026)
   - Frontend: Register page (T028), login page (T029), navbar with logout (T030), landing page (T031)
   - Features: JWT issuance with `sub` = user_id, password bcrypt hashing, 409 on duplicate email

4. **Phase 4: User Story 2 - Create/View Todos (T032-T038)** - 7 tasks [US2] [P1]
   - Backend: POST /api/todos (T032), GET /api/todos (T033)
   - Frontend: TodoList component (T034), TodoForm component (T035), TodoItem component (T036), dashboard page (T037), empty state (T038)
   - Features: User-scoped queries (`WHERE user_id = <jwt_user_id>`), validation (title required, max lengths)

5. **Phase 5: User Story 6 - Data Isolation (T039-T042)** - 4 tasks [US6] [P1]
   - Backend: GET /api/todos/{id} with ownership check (T039)
   - Security: Enforce user_id from JWT only (T040), 404 on violations (T041), documentation (T042)
   - Features: Never read user_id from URL/body, return 404 (not 403) to prevent enumeration

6. **Phase 6: User Story 3 - Mark Complete/Incomplete (T043-T046)** - 4 tasks [US3] [P2]
   - Backend: PATCH /api/todos/{id}/complete (T043)
   - Frontend: Checkbox in TodoItem (T044), visual styling (T045), optimistic updates (T046)
   - Features: Idempotent toggling, strikethrough for completed

7. **Phase 7: User Story 4 - Update Todo Details (T047-T049)** - 3 tasks [US4] [P2]
   - Backend: PUT /api/todos/{id} (T047)
   - Frontend: TodoEditForm component (T048), edit mode toggle (T049)
   - Features: Cancel without saving, validation errors

8. **Phase 8: User Story 5 - Delete Todos (T050-T051)** - 2 tasks [US5] [P3]
   - Backend: DELETE /api/todos/{id} (T050)
   - Frontend: Delete button with confirmation (T051)
   - Features: 204 No Content on success, confirmation dialog

9. **Phase 9: Polish & Cross-Cutting Concerns (T052-T060)** - 9 tasks
   - Loading states (T052), error handling (T053), toast notifications (T054)
   - Quickstart documentation (T055), security hardening (T056)
   - Code cleanup (T057), performance optimization (T058)
   - End-to-end validation (T059), README update (T060)

**Task Format Compliance**:
- ✅ All 60 tasks use strict checklist format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
- ✅ 23 tasks marked [P] for parallel execution (different files, no dependencies)
- ✅ Story labels ([US1]-[US6]) applied to user story phases (T025-T051)
- ✅ Sequential IDs (T001-T060)
- ✅ Exact file paths (e.g., `backend/src/models/user.py`, `frontend/src/app/todos/page.tsx`)

**Dependency Management**:

**Critical Path**:
```
Setup (Phase 1)
  ↓
Foundation (Phase 2) ← BLOCKS ALL USER STORIES
  ↓
US1 Authentication (Phase 3) ← BLOCKS US2-US5
  ↓
US2 Create/View (Phase 4) + US6 Isolation (Phase 5) [parallel]
  ↓
US3 Complete (Phase 6) [can run parallel with US4, US5]
  ↓
US4 Update (Phase 7) [can run parallel with US3, US5]
  ↓
US5 Delete (Phase 8) [can run parallel with US3, US4]
  ↓
Polish (Phase 9)
```

**MVP Scope (P1 Stories)**:
- Phases 1-5: T001-T042 (42 tasks)
- Covers: Setup, Foundation, Authentication, Create/View Todos, Data Isolation
- Estimated ~2 weeks for solo developer, ~1 week for team

**Parallel Execution Examples**:

**Foundation Phase (after Setup)**:
```bash
# Parallel: Database models (different files)
T011: backend/src/models/user.py
T012: backend/src/models/todo.py

# Parallel: JWT implementation (different files)
T014: backend/src/auth/jwt.py
T015: backend/src/auth/password.py

# Parallel: Frontend auth setup (different files)
T018: frontend/src/lib/auth.ts
T019: frontend/src/app/layout.tsx (AuthProvider)
T020: frontend/src/lib/api.ts (API client)
```

**User Story 1 (after Foundation)**:
```bash
# Parallel: Auth pages (different files)
T028: frontend/src/app/register/page.tsx
T029: frontend/src/app/login/page.tsx
```

**User Story 2 + 6 (after US1)**:
```bash
# Can work on US2 and US6 simultaneously (separate files)
T032-T038: User Story 2 tasks
T039-T042: User Story 6 tasks (integrate into US2 endpoints)
```

**Security Implementation (US6)**:
- User identity extracted EXCLUSIVELY from JWT `sub` claim
- Backend NEVER reads user_id from URL parameters, query strings, or request body
- All todo queries include `WHERE user_id = <jwt_user_id>` filter
- Ownership violations return 404 (not 403) to prevent user enumeration
- Documented in backend/src/auth/README.md (T042)

**NO Test Tasks**:
- Tests not requested in spec.md
- No test generation included (per requirements)
- Focus on implementation only

## Outcome

- ✅ Impact: Comprehensive task breakdown generated with 60 implementation-ready tasks organized by user story. Tasks enable independent implementation and testing of each story. MVP clearly identified (42 tasks, P1 stories). All tasks follow strict checklist format with sequential IDs, parallel markers, story labels, and exact file paths.
- 🧪 Tests: N/A (tests not requested in spec)
- 📁 Files: Created tasks.md (~650 lines)
- 🔁 Next prompts: Use `/sp.implement` to execute tasks in order. Start with MVP (Phases 1-5, T001-T042) for fastest time-to-value. Can parallelize Foundation phase tasks and user story phases once dependencies are satisfied.
- 🧠 Reflection: Task organization by user story enables incremental delivery. Each user story phase is independently completable and testable. Foundational phase (16 tasks) properly blocks all user stories ensuring JWT middleware and database models are ready. Security requirements (US6) integrated into implementation tasks rather than separate phase. Parallel markers (23 tasks) identify opportunities for team velocity. MVP scope (42 tasks) delivers authentication + core todo CRUD + data isolation.

## Evaluation notes (flywheel)

- Failure modes observed: None. All 60 tasks follow strict checklist format. Story labels correctly applied. Parallel markers appropriate (different files, no deps). File paths exact and absolute from repo root.
- Graders run and results (PASS/FAIL): Format validation - PASS (all tasks have checkbox, ID, optional markers, description, file path)
- Prompt variant (if applicable): N/A (first use)
- Next experiment (smallest change to try): Validate that `/sp.implement` correctly parses task IDs and executes in dependency order. Test that parallel tasks can be launched simultaneously. Verify that completing MVP (T001-T042) results in functional authentication + todo CRUD system with data isolation.
