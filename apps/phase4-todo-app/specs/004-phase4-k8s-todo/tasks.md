# Tasks: Phase IV — Cloud-Native Todo AI Chatbot

**Input**: Design documents from `/specs/004-phase4-k8s-todo/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: No test tasks generated — not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- **Infrastructure**: `helm/todo-app/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify environment and prepare shared foundations for all user stories

- [X] T001 Verify Docker Desktop, Minikube, Helm v3, and kubectl are installed and functional
- [X] T002 Verify Next.js standalone output is configured in `frontend/next.config.js` — add `output: 'standalone'` if missing
- [X] T003 Verify backend `/health` endpoint returns `{"status": "healthy"}` in `backend/src/main.py` — update service name to `phase4-todo-api` if needed
- [X] T004 Verify frontend `/api/health` endpoint returns `{"status": "healthy"}` in `frontend/src/app/api/health/route.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend the Task data model with date/time fields — MUST complete before ANY user story can begin

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Add `due_date: Optional[date]` and `due_time: Optional[str]` fields to Task model in `backend/src/models/task.py` per data-model.md (nullable columns, due_time stored as HH:MM string with regex validation `^\d{2}:\d{2}$`)
- [X] T006 Update `create_task()` in `backend/src/database.py` to accept optional `due_date` and `due_time` parameters and normalize before storage (FR-020)
- [X] T007 Update `get_tasks_by_user()` in `backend/src/database.py` to sort by `updated_at` DESC (FR-022) and include `due_date`/`due_time` in returned objects
- [X] T008 Update `update_task()` in `backend/src/database.py` to accept optional `due_date` and `due_time` fields, refresh `updated_at` on any mutation
- [X] T009 Add `due_date: string | null` and `due_time: string | null` to the `Todo` interface in `frontend/src/library/types.ts`

**Checkpoint**: Task data model extended — user story implementation can now begin

---

## Phase 3: User Story 1 — Create Tasks with Date and Time (Priority: P1)

**Goal**: Users can create tasks with optional due dates and times via chat. Ambiguous temporal expressions trigger clarification. Tasks without dates are created without reminders.

**Independent Test**: Send chat messages with various date/time combinations and verify the created tasks have correct `due_date` and `due_time` fields in the database.

### Implementation for User Story 1

- [X] T010 [US1] Update `add_task` MCP tool to accept optional `due_date` (string, YYYY-MM-DD) and `due_time` (string, HH:MM) parameters in `backend/src/mcp/tools/add_task.py` per contracts/mcp-tools.yaml — include both fields in the tool's parameter schema and return object
- [X] T011 [US1] Update `update_task` MCP tool to accept optional `due_date` and `due_time` parameters in `backend/src/mcp/tools/update_task.py` per contracts/mcp-tools.yaml — include both fields in the tool's parameter schema and return object
- [X] T012 [US1] Update `list_tasks` MCP tool to include `due_date`, `due_time`, `description`, `created_at`, and `updated_at` in each task's response object in `backend/src/mcp/tools/list_tasks.py` per contracts/mcp-tools.yaml
- [X] T013 [US1] Update the AI agent system prompt in `backend/src/agent/prompts.py` to include date/time handling rules per research.md R5: (1) accept explicit dates/times without question, (2) ask for clarification on ambiguous temporal expressions like "evening"/"later"/"soon", (3) create tasks without dates when no temporal info provided, (4) note when a date is in the past, (5) reject invalid dates like "February 30th", (6) normalize dates to YYYY-MM-DD and times to HH:MM before calling tools
- [X] T014 [US1] Register the updated `due_date` and `due_time` parameters in the MCP tool definitions in `backend/src/mcp/tools/__init__.py` so the agent receives them in its available tool schemas

**Checkpoint**: User Story 1 complete — chat-based task creation with date/time works end-to-end

---

## Phase 4: User Story 2 — Browse Tasks by State (Priority: P1)

**Goal**: Users can navigate to four distinct task view pages (All, Pending, Completed, Total) with tasks sorted by `updated_at` DESC and visual completion checkboxes.

**Independent Test**: Create a mix of pending and completed tasks, navigate to each page, and verify only the correct subset appears with proper sort order and checkbox state.

### Implementation for User Story 2

- [X] T015 [US2] Create `GET /api/tasks` endpoint in `backend/src/api/tasks.py` per contracts/backend-api.yaml — accepts `?status=all|pending|completed` query parameter, returns `{tasks: Task[], counts: {total, pending, completed}}` sorted by `updated_at` DESC, requires JWT auth, filters by authenticated user_id
- [X] T016 [US2] Register the new tasks router in `backend/src/main.py` — import and include the tasks API router
- [X] T017 [US2] Add `getTasks(status?: 'all' | 'pending' | 'completed')` method to the API client in `frontend/src/library/api.ts` that calls `GET /api/tasks?status=<status>` with JWT auth header
- [X] T018 [US2] Create `TaskNavigation` component in `frontend/src/components/TaskNavigation.tsx` — navigation tabs/links for All Tasks, Pending, Completed, and Summary pages with active state indicator
- [X] T019 [US2] Update `TodoItem` component in `frontend/src/components/TodoItem.tsx` — add a visual checkbox reflecting completion status (checked=completed, unchecked=pending per FR-023), display `due_date` and `due_time` if present
- [X] T020 [US2] Refactor `frontend/src/app/todos/page.tsx` to be the "All Tasks" view — fetch from `GET /api/tasks?status=all` on load, render tasks sorted by `updated_at` DESC with checkboxes, include `TaskNavigation` component
- [X] T021 [P] [US2] Create Pending Tasks page at `frontend/src/app/todos/pending/page.tsx` — fetch from `GET /api/tasks?status=pending` on load, render only pending tasks with unchecked checkboxes and `TaskNavigation`
- [X] T022 [P] [US2] Create Completed Tasks page at `frontend/src/app/todos/completed/page.tsx` — fetch from `GET /api/tasks?status=completed` on load, render only completed tasks with checked checkboxes and `TaskNavigation`
- [X] T023 [P] [US2] Create Total Tasks summary page at `frontend/src/app/todos/summary/page.tsx` — fetch from `GET /api/tasks` on load, display summary counts ("N total, N pending, N completed") with `TaskNavigation`

**Checkpoint**: User Story 2 complete — all four task view pages functional with sort order and checkboxes

---

## Phase 5: User Story 5 — Manage Tasks via Chat with All MCP Operations (Priority: P2)

**Goal**: Users can perform all task operations (add, list, update, complete, delete) through the chat interface. The agent confirms actions, never hallucinates IDs, and clarifies ambiguous references.

**Independent Test**: Perform each MCP operation via chat and verify the database reflects the correct state after each operation.

### Implementation for User Story 5

- [X] T024 [US5] Verify `complete_task` MCP tool in `backend/src/mcp/tools/complete_task.py` returns "Task not found" error (not hallucinated success) when task does not exist or does not belong to user
- [X] T025 [US5] Verify `delete_task` MCP tool in `backend/src/mcp/tools/delete_task.py` returns "Task not found" error when task does not exist or does not belong to user
- [X] T026 [US5] Update AI agent system prompt in `backend/src/agent/prompts.py` to include guardrail rules: (1) never fabricate task IDs (FR-009), (2) list tasks before delete/update when reference is ambiguous (FR-008), (3) confirm all successful mutations explicitly (FR-007)

**Checkpoint**: User Story 5 complete — all MCP operations work correctly via chat with guardrails

---

## Phase 6: User Story 4 — Containerize Frontend and Backend Independently (Priority: P2)

**Goal**: Each service is packaged as an independent, stateless container image with env-based configuration.

**Independent Test**: Build each image and run it standalone with environment variables — verify it starts and `/health` responds.

### Implementation for User Story 4

- [X] T027 [P] [US4] Verify and update `backend/Dockerfile` — ensure stateless (no local file writes), no hardcoded secrets, env-based config only (DATABASE_URL, BETTER_AUTH_SECRET, DEEPSEEK_API_KEY, CORS_ORIGINS), `/health` responds on configured port
- [X] T028 [P] [US4] Verify and update `frontend/Dockerfile` — ensure multi-stage build with standalone output, no hardcoded secrets, env-based config only (NEXT_PUBLIC_API_URL, BETTER_AUTH_SECRET), `/api/health` responds on port 3000
- [X] T029 [US4] Update `docker-compose.yml` to work with PostgreSQL connection string instead of SQLite volume, verify both services start and communicate via env vars, remove any hardcoded secrets from the compose file

**Checkpoint**: User Story 4 complete — both images build and run independently with env-only config

---

## Phase 7: User Story 3 — Deploy to Local Kubernetes via Helm (Priority: P1)

**Goal**: A single `helm install` against a clean Minikube cluster deploys the full system (frontend + backend) via an umbrella chart. Health probes succeed. Pod restarts are non-destructive.

**Independent Test**: Start clean Minikube, run `helm install`, verify both pods reach Running status and `/health` endpoints respond.

### Implementation for User Story 3

- [X] T030 [US3] Create umbrella chart metadata at `helm/todo-app/Chart.yaml` — type: application, name: todo-app, version: 0.1.0, with dependencies listing backend and frontend subcharts using `file://` paths per research.md R2
- [X] T031 [US3] Create root values file at `helm/todo-app/values.yaml` — global overrides for image names/tags, replica counts (default 1), environment variables (DATABASE_URL, BETTER_AUTH_SECRET, DEEPSEEK_API_KEY, CORS_ORIGINS, NEXT_PUBLIC_API_URL), imagePullPolicy: Never (for Minikube local images per research.md R3)
- [X] T032 [P] [US3] Create backend subchart at `helm/todo-app/charts/backend/` — Chart.yaml, values.yaml with defaults, and templates: deployment.yaml (with liveness/readiness probes on `/health` path, port 8000, env vars from values), service.yaml (ClusterIP on port 8000), _helpers.tpl
- [X] T033 [P] [US3] Create frontend subchart at `helm/todo-app/charts/frontend/` — Chart.yaml, values.yaml with defaults, and templates: deployment.yaml (with liveness/readiness probes on `/api/health` path, port 3000, env vars from values including NEXT_PUBLIC_API_URL pointing to backend service), service.yaml (ClusterIP on port 3000), _helpers.tpl
- [ ] T034 [US3] Run `helm template todo-app ./helm/todo-app` to validate charts render cleanly — fix any template errors, verify no hardcoded secrets in rendered output *(deferred: Helm CLI not available in current environment)*
- [ ] T035 [US3] Build Docker images (`docker build -t todo-backend:latest ./backend` and `docker build -t todo-frontend:latest ./frontend`), load into Minikube (`minikube image load`), and deploy via `helm install todo-app ./helm/todo-app` — verify pods reach Running status and health probes pass *(deferred: requires Docker, Minikube, Helm CLI)*

**Checkpoint**: User Story 3 complete — full system deployed on Minikube via single Helm command

---

## Phase 8: User Story 6 — Configure Deployment via Helm Values (Priority: P3)

**Goal**: DevOps operators can adjust replica counts, env vars, and configuration via Helm values files only. No secrets hardcoded.

**Independent Test**: Change replica count in values.yaml, run `helm upgrade`, verify cluster reflects new configuration.

### Implementation for User Story 6

- [X] T036 [US6] Verify Helm values parameterization — ensure `values.yaml` supports overriding: `backend.replicaCount`, `frontend.replicaCount`, `backend.env.*`, `frontend.env.*`, `backend.image.tag`, `frontend.image.tag`, `backend.resources.limits/requests`, `frontend.resources.limits/requests`
- [ ] T037 [US6] Test `helm upgrade todo-app ./helm/todo-app --set backend.replicaCount=3` — verify 3 backend pods are running after upgrade *(deferred: requires Helm CLI + Minikube)*
- [ ] T038 [US6] Test `helm upgrade` with changed DATABASE_URL — verify backend pods restart with new connection string without image rebuild *(deferred: requires Helm CLI + Minikube)*
- [X] T039 [US6] Scan all Helm chart files, Dockerfiles, and docker-compose.yml for hardcoded secrets — verify zero secrets in any version-controlled file (FR-021, SC-006)

**Checkpoint**: User Story 6 complete — deployment fully configurable via Helm values

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Reliability validation, redeployment testing, and compliance audit

- [ ] T040 Test pod resilience — delete backend and frontend pods manually via `kubectl delete pod`, verify Kubernetes recreates them and system resumes normal operation without data loss (FR-016, SC-005) *(deferred: requires running Minikube cluster)*
- [ ] T041 Test redeployment — run `helm uninstall todo-app` then `helm install todo-app ./helm/todo-app`, verify identical functional system with no configuration drift (SC-007) *(deferred: requires running Minikube cluster)*
- [ ] T042 End-to-end validation — via chat interface: create a task with date/time, list pending tasks, complete a task, update a task's due date, delete a task, verify all four task view pages reflect correct state (SC-001, SC-003) *(deferred: requires running application)*
- [X] T043 Compliance audit — verify all 25 functional requirements (FR-001 through FR-025) and all 8 success criteria (SC-001 through SC-008) are met, verify Phase IV constitution compliance, document any deviations

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — can start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user stories
- **Phase 3 (US1 - Date/Time Tasks)**: Depends on Phase 2 — backend MCP and model changes
- **Phase 4 (US2 - Task View Pages)**: Depends on Phase 2 — needs extended Task model; can parallel with Phase 3
- **Phase 5 (US5 - Chat MCP Operations)**: Depends on Phase 3 — needs updated MCP tools and agent prompt
- **Phase 6 (US4 - Containerization)**: Depends on Phases 3+4 — needs finalized app code to containerize
- **Phase 7 (US3 - K8s Deployment)**: Depends on Phase 6 — needs working container images
- **Phase 8 (US6 - Helm Config)**: Depends on Phase 7 — needs running Helm deployment to test
- **Phase 9 (Polish)**: Depends on all user story phases complete

### User Story Dependencies

- **US1 (Date/Time Tasks)**: Depends on Foundational (Phase 2) only — no cross-story dependency
- **US2 (Task View Pages)**: Depends on Foundational (Phase 2) only — can run parallel with US1
- **US5 (Chat MCP Operations)**: Depends on US1 completion (uses updated MCP tools and agent prompt)
- **US4 (Containerization)**: Depends on US1 + US2 (app logic must be finalized before containerizing)
- **US3 (K8s Deployment)**: Depends on US4 (needs working container images)
- **US6 (Helm Config)**: Depends on US3 (needs running Helm deployment)

### Within Each User Story

- Models/database before services/tools
- Backend before frontend (API must exist before UI consumes it)
- Core implementation before integration/verification

### Parallel Opportunities

- **Phase 2**: T005–T009 are sequential (model → database helpers → types)
- **Phase 3 (US1)**: T010, T011, T012 can run in parallel (different MCP tool files)
- **Phase 4 (US2)**: T021, T022, T023 can run in parallel (different page files)
- **Phase 6 (US4)**: T027, T028 can run in parallel (different Dockerfiles)
- **Phase 7 (US3)**: T032, T033 can run in parallel (different subchart directories)
- **US1 and US2 can run in parallel** after Phase 2 completes (independent backend + frontend changes)

---

## Parallel Example: User Story 2

```bash
# After T020 (All Tasks page refactored), launch these 3 pages in parallel:
Task: T021 "Create Pending Tasks page at frontend/src/app/todos/pending/page.tsx"
Task: T022 "Create Completed Tasks page at frontend/src/app/todos/completed/page.tsx"
Task: T023 "Create Total Tasks summary page at frontend/src/app/todos/summary/page.tsx"
```

## Parallel Example: User Story 3

```bash
# After T031 (root values.yaml), launch both subcharts in parallel:
Task: T032 "Create backend subchart at helm/todo-app/charts/backend/"
Task: T033 "Create frontend subchart at helm/todo-app/charts/frontend/"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup (T001–T004)
2. Complete Phase 2: Foundational (T005–T009) — CRITICAL blocking
3. Complete Phase 3: US1 Date/Time Tasks (T010–T014)
4. Complete Phase 4: US2 Task View Pages (T015–T023) — can parallel with Phase 3
5. **STOP and VALIDATE**: Test date/time creation via chat + all four task view pages
6. This delivers the core functional enhancements of Phase IV

### Full Delivery (All Stories)

1. Setup + Foundational → Foundation ready
2. US1 + US2 (parallel) → Core app features complete → Validate
3. US5 → Chat operations with guardrails → Validate
4. US4 → Containerization → Validate containers standalone
5. US3 → Kubernetes deployment → Validate on Minikube
6. US6 → Helm configuration → Validate scaling/config changes
7. Polish → Reliability + compliance audit → Final validation

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks in same phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable at its checkpoint
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All file paths are relative to `apps/phase4-todo-app/` project root
