# Tasks: Phase V — Event-Driven Cloud Architecture

**Input**: Design documents from `/specs/005-phase5-event-driven/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/event-contracts.md, research.md, quickstart.md

**Tests**: Not explicitly requested in the specification. Test tasks are omitted.

**Organization**: Tasks are grouped by strategic execution phase (A-F from plan.md), which map to user stories from spec.md.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Microservices**: `services/<name>/src/` per service
- **Frontend**: `frontend/src/`
- **Infrastructure**: `helm/`, `dapr/`, `.github/workflows/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the microservices directory structure and migrate existing backend code

- [X] T001 Create services directory structure per plan.md: `services/chat-api/`, `services/notification/`, `services/recurring-task/`, `services/audit/`, `services/websocket/`
- [X] T002 Migrate existing `backend/` code into `services/chat-api/` preserving all files under `src/`, `Dockerfile`, `requirements.txt`, and `migrations/`
- [X] T003 Update `services/chat-api/Dockerfile` to reflect new directory paths and verify build succeeds
- [X] T004 [P] Create `dapr/` directory structure: `dapr/components/`, `dapr/components/subscriptions/`
- [X] T005 [P] Create `.github/workflows/` directory structure
- [X] T006 [P] Create `tests/integration/` and `tests/contract/` directories
- [X] T007 Update `docker-compose.yml` to reference `services/chat-api/` instead of `backend/`
- [X] T008 Verify existing frontend and chat-api services build and start correctly after migration

**Checkpoint**: Directory structure matches plan.md. Existing functionality preserved.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Deploy Kafka, Redis, and Dapr infrastructure. Configure all Dapr components. MUST complete before any user story work begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T009 Create Dapr Pub/Sub component definition in `dapr/components/pubsub.yaml` targeting Kafka with component name `todo-pubsub` and type `pubsub.kafka`
- [X] T010 [P] Create Dapr State Store component definition in `dapr/components/statestore.yaml` targeting Redis with component name `todo-statestore` and type `state.redis`
- [X] T011 [P] Create Dapr Secrets component definition in `dapr/components/secrets.yaml` targeting Kubernetes Secrets with component name `todo-secrets`
- [X] T012 Create shared CloudEvents schema definitions in `services/chat-api/src/events/schemas.py` with all 9 event types from data-model.md (TaskCreated.v1, TaskUpdated.v1, TaskCompleted.v1, TaskDeleted.v1, ReminderScheduled.v1, ReminderTriggered.v1, ReminderDelivered.v1, ReminderFailed.v1, RecurringTaskGenerated.v1)
- [X] T013 Create Dapr Pub/Sub publish helper in `services/chat-api/src/events/publisher.py` using HTTP POST to `http://localhost:3500/v1.0/publish/todo-pubsub/<topic>` with CloudEvents envelope
- [X] T014 Create idempotency helper module using Dapr State Store in `services/chat-api/src/events/idempotency.py` with key pattern `idempotency:{service}:{event_id}` and 24h TTL
- [X] T015 Extend Task SQLModel in `services/chat-api/src/models/todo.py` with new fields: `due_date` (datetime, nullable), `reminder_time` (datetime, nullable), `recurrence_rule_id` (UUID FK, nullable), `status` enum (pending/completed/deleted replacing boolean `completed`)
- [X] T016 Create RecurrenceRule SQLModel in `services/chat-api/src/models/recurrence_rule.py` with fields from data-model.md: id, task_id, frequency (enum: daily/weekly/monthly), end_after_count, end_by_date, occurrences_generated, is_active, created_at
- [X] T017 [P] Create Reminder SQLModel in `services/chat-api/src/models/reminder.py` with fields from data-model.md: id, task_id, user_id, trigger_time, status (enum: pending/delivered/failed), dapr_job_name, delivered_at, created_at
- [X] T018 Create Alembic migration for new Task fields, RecurrenceRule table, and Reminder table in `services/chat-api/migrations/`
- [X] T019 Update Helm umbrella chart `helm/todo-app/Chart.yaml` to add dependencies for Kafka (bitnami), Redis (bitnami), and new service subcharts (notification, recurring-task, audit, websocket)
- [X] T020 Update Helm root values in `helm/todo-app/values.yaml` with global Dapr, Kafka, and Redis configuration
- [X] T021 Rename existing `helm/todo-app/charts/backend/` subchart to `helm/todo-app/charts/chat-api/` and update all references (Chart.yaml name, values, templates) to reflect `chat-api` naming
- [X] T022 Add Dapr sidecar annotations to `helm/todo-app/charts/chat-api/templates/deployment.yaml`: `dapr.io/enabled: "true"`, `dapr.io/app-id: "chat-api"`, `dapr.io/app-port: "8000"`
- [X] T023 [P] Add Dapr sidecar annotations to `helm/todo-app/charts/frontend/templates/deployment.yaml`: `dapr.io/enabled: "true"`, `dapr.io/app-id: "frontend"`, `dapr.io/app-port: "3000"`
- [X] T024 Deploy Kafka and Redis to Minikube using Helm and verify Dapr components connect successfully (validate with `dapr components -k`)

**Checkpoint**: Foundation ready — Kafka, Redis, Dapr components operational. Extended data model migrated. User story implementation can begin.

---

## Phase 3: User Story 1 — Event-Driven Task Lifecycle (Priority: P1) 🎯 MVP

**Goal**: All task mutations (create, update, complete, delete) publish CloudEvents to Kafka via Dapr Pub/Sub. Audit Service consumes and logs all events immutably.

**Independent Test**: Create, update, complete, delete tasks via chat. Verify audit log entries appear for every mutation. Restart audit service and confirm no events lost.

### Implementation for User Story 1

- [X] T025 [US1] Integrate event publishing into task creation endpoint in `services/chat-api/src/api/todos.py` — after successful DB insert, publish `TaskCreated.v1` to `task-events` topic via publisher helper
- [X] T026 [US1] Integrate event publishing into task update endpoint in `services/chat-api/src/api/todos.py` — after successful DB update, publish `TaskUpdated.v1` to `task-events` topic
- [X] T027 [US1] Integrate event publishing into task completion endpoint in `services/chat-api/src/api/todos.py` — after marking complete, publish `TaskCompleted.v1` to `task-events` topic (include `had_recurrence_rule` and `recurrence_rule_id` in payload)
- [X] T028 [US1] Integrate event publishing into task deletion endpoint in `services/chat-api/src/api/todos.py` — after deletion, publish `TaskDeleted.v1` to `task-events` topic
- [X] T029 [P] [US1] Create Audit Service FastAPI app in `services/audit/src/main.py` with `/health` endpoint and Dapr subscription route `/events/task-events` for receiving CloudEvents
- [X] T030 [P] [US1] Create Audit Service config in `services/audit/src/config.py` with Pydantic settings for database URL and service name
- [X] T031 [US1] Create AuditEntry SQLModel in `services/audit/src/models/audit_entry.py` with fields from data-model.md: id, event_type, event_id (unique), source, actor_id, payload (JSON), timestamp, received_at
- [X] T032 [US1] Implement audit event handler in `services/audit/src/handlers/audit_logger.py` — parse CloudEvent, check idempotency via Dapr State Store, INSERT into audit_entries table, return 200
- [X] T033 [US1] Create declarative Dapr subscription for Audit Service in `dapr/components/subscriptions/audit-subs.yaml` subscribing to `task-events`, `reminder-events`, and `recurring-events` topics with scope `audit-service`
- [X] T034 [US1] Create `services/audit/requirements.txt` with FastAPI, SQLModel, uvicorn, httpx, pydantic-settings, psycopg2-binary
- [X] T035 [US1] Create `services/audit/Dockerfile` with Python 3.11-slim base, matching structure of chat-api Dockerfile
- [X] T036 [US1] Create Helm subchart for Audit Service in `helm/todo-app/charts/audit/` with Chart.yaml, values.yaml, and templates (deployment.yaml with Dapr annotations `app-id: audit-service`, service.yaml, _helpers.tpl)
- [X] T037 [US1] Deploy Chat API + Audit Service to Minikube and verify end-to-end: create a task via chat → confirm `TaskCreated.v1` event is logged in audit_entries table

**Checkpoint**: US1 complete. All task mutations publish events. Audit Service logs every event immutably. Idempotent processing verified.

---

## Phase 4: User Story 2 — Asynchronous Reminders (Priority: P2)

**Goal**: Users can set reminders on tasks. Reminders fire at the scheduled time via Dapr Jobs API and are delivered as in-app push notifications through the WebSocket channel.

**Independent Test**: Set a reminder on a task, wait for trigger time, verify in-app notification arrives exactly once via WebSocket. Restart notification service before trigger and confirm reminder still fires.

### Implementation for User Story 2

- [X] T038 [US2] Integrate reminder scheduling into Chat API — when a task is created/updated with `reminder_time`, create Reminder record in DB and publish `ReminderScheduled.v1` to `reminder-events` topic in `services/chat-api/src/api/todos.py`
- [X] T039 [US2] Implement Dapr Jobs API integration in Chat API — schedule one-shot job via `POST /v1.0-alpha1/jobs/reminder-<id>` with `dueTime` set to reminder trigger time in `services/chat-api/src/events/publisher.py`
- [X] T040 [P] [US2] Create Notification Service FastAPI app in `services/notification/src/main.py` with `/health` endpoint and Dapr job callback endpoint `/job/reminder-<name>`
- [X] T041 [P] [US2] Create Notification Service config in `services/notification/src/config.py` with Pydantic settings
- [X] T042 [US2] Implement reminder trigger handler in `services/notification/src/handlers/reminder.py` — on Dapr Jobs callback, publish `ReminderTriggered.v1` to `reminder-events`, then publish reminder data to WebSocket Service via Dapr pub/sub for client delivery
- [X] T043 [US2] Implement reminder delivery tracking in `services/notification/src/handlers/reminder.py` — publish `ReminderDelivered.v1` on success or `ReminderFailed.v1` on failure to `reminder-events` topic
- [X] T044 [US2] Implement reminder cancellation — when `TaskDeleted.v1` is received by Notification Service, cancel the associated Dapr job via `DELETE /v1.0-alpha1/jobs/reminder-<id>` in `services/notification/src/handlers/reminder.py`
- [X] T045 [US2] Create `services/notification/src/events/publisher.py` with Dapr Pub/Sub publish helper for reminder events
- [X] T046 [P] [US2] Create `services/notification/src/events/schemas.py` with ReminderTriggered, ReminderDelivered, ReminderFailed CloudEvents schemas
- [X] T047 [US2] Create declarative Dapr subscription for Notification Service in `dapr/components/subscriptions/notification-subs.yaml` subscribing to `reminder-events` (for ReminderScheduled) and `task-events` (for TaskDeleted cancellation) with scope `notification-service`
- [X] T048 [US2] Create `services/notification/requirements.txt` with FastAPI, uvicorn, httpx, pydantic-settings
- [X] T049 [P] [US2] Create `services/notification/Dockerfile` with Python 3.11-slim base
- [X] T050 [US2] Create Helm subchart for Notification Service in `helm/todo-app/charts/notification/` with Chart.yaml, values.yaml, and templates (deployment.yaml with Dapr annotations `app-id: notification-service`, service.yaml, _helpers.tpl)
- [X] T051 [US2] Deploy and verify: set a reminder → Dapr Job fires at scheduled time → ReminderTriggered event published → notification delivered via WebSocket → ReminderDelivered event logged in audit

**Checkpoint**: US2 complete. Reminders schedule via Dapr Jobs API, fire reliably, deliver via WebSocket, survive service restarts.

---

## Phase 5: User Story 3 — Recurring Task Generation (Priority: P3)

**Goal**: When a recurring task is completed, the Recurring Task Service automatically generates the next instance with the correct due date, respecting termination conditions.

**Independent Test**: Create a task with a recurrence rule, complete it, verify next instance generated with correct due date. Complete the same task again to verify idempotency (no duplicate).

### Implementation for User Story 3

- [X] T052 [P] [US3] Create Recurring Task Service FastAPI app in `services/recurring-task/src/main.py` with `/health` endpoint and Dapr subscription route `/events/task-events`
- [X] T053 [P] [US3] Create Recurring Task Service config in `services/recurring-task/src/config.py` with Pydantic settings
- [X] T054 [US3] Implement recurrence handler in `services/recurring-task/src/handlers/recurrence.py` — on `TaskCompleted.v1` with `had_recurrence_rule=true`, look up recurrence rule, check termination conditions (end_after_count, end_by_date, is_active), calculate next due date, create new task via Dapr Service Invocation to Chat API
- [X] T055 [US3] Implement idempotent generation tracking in `services/recurring-task/src/handlers/recurrence.py` — use Dapr State Store key `idempotency:recurring-task:{event_id}` to prevent duplicate generation on redelivered events
- [X] T056 [US3] Implement recurrence termination logic in `services/recurring-task/src/handlers/recurrence.py` — increment `occurrences_generated`, check against `end_after_count` and `end_by_date`, mark `is_active=false` when termination condition met
- [X] T057 [US3] Create `services/recurring-task/src/events/publisher.py` with Dapr Pub/Sub publish helper for `RecurringTaskGenerated.v1` events to `recurring-events` topic
- [X] T058 [P] [US3] Create `services/recurring-task/src/events/schemas.py` with RecurringTaskGenerated CloudEvents schema
- [X] T059 [US3] Create declarative Dapr subscription for Recurring Task Service in `dapr/components/subscriptions/recurring-subs.yaml` subscribing to `task-events` topic with scope `recurring-task-service`
- [X] T060 [US3] Create `services/recurring-task/requirements.txt` with FastAPI, uvicorn, httpx, pydantic-settings
- [X] T061 [P] [US3] Create `services/recurring-task/Dockerfile` with Python 3.11-slim base
- [X] T062 [US3] Create Helm subchart for Recurring Task Service in `helm/todo-app/charts/recurring-task/` with Chart.yaml, values.yaml, and templates (deployment.yaml with Dapr annotations `app-id: recurring-task-service`, service.yaml, _helpers.tpl)
- [X] T063 [US3] Deploy and verify: create recurring task (daily) → complete it → verify new task appears with next due date → complete again → verify second instance → test termination with end_after_count=2

**Checkpoint**: US3 complete. Recurring tasks generate reliably with correct due dates and termination. Idempotent against redelivered events.

---

## Phase 6: User Story 4 — Real-Time Client Synchronization (Priority: P4)

**Goal**: Connected clients receive task and reminder updates in near-real-time (<2s) via WebSocket. Disconnected clients receive missed updates on reconnection.

**Independent Test**: Open app in two browser windows, create/update/complete a task in one, verify the other reflects changes within 2 seconds without manual refresh.

### Implementation for User Story 4

- [X] T064 [P] [US4] Create WebSocket Service FastAPI app in `services/websocket/src/main.py` with `/health` endpoint, WebSocket endpoint `/ws`, and Dapr subscription routes `/events/task-events` and `/events/reminder-events`
- [X] T065 [P] [US4] Create WebSocket Service config in `services/websocket/src/config.py` with Pydantic settings
- [X] T066 [US4] Implement WebSocket connection manager in `services/websocket/src/connections/manager.py` — maintain user_id → WebSocket mapping, track connections in Dapr State Store with key `ws-connections:{user_id}`, handle connect/disconnect lifecycle
- [X] T067 [US4] Implement task event sync handler in `services/websocket/src/handlers/task_sync.py` — on task lifecycle events from Dapr subscription, look up connected user by user_id, push JSON update via WebSocket
- [X] T068 [US4] Implement reminder push handler in `services/websocket/src/handlers/reminder_push.py` — on reminder events, push notification to connected user via WebSocket. If user offline, queue in Dapr State Store with key `reminder-queue:{user_id}`
- [X] T069 [US4] Implement missed-event replay on reconnection in `services/websocket/src/connections/manager.py` — when client connects, check `reminder-queue:{user_id}` in Dapr State Store, deliver queued items, then clear queue
- [X] T070 [US4] Create declarative Dapr subscription for WebSocket Service in `dapr/components/subscriptions/websocket-subs.yaml` subscribing to `task-events` and `reminder-events` topics with scope `websocket-service`
- [X] T071 [US4] Create WebSocket client library in `frontend/src/library/websocket.ts` — connect to WebSocket Service, handle incoming task/reminder updates, auto-reconnect on disconnect
- [X] T072 [US4] Integrate WebSocket client into frontend components — update `frontend/src/components/TodoList.tsx` and `frontend/src/components/ChatPanel.tsx` to receive real-time updates and re-render task list
- [X] T073 [US4] Create `services/websocket/requirements.txt` with FastAPI, uvicorn, httpx, pydantic-settings, websockets
- [X] T074 [P] [US4] Create `services/websocket/Dockerfile` with Python 3.11-slim base
- [X] T075 [US4] Create Helm subchart for WebSocket Service in `helm/todo-app/charts/websocket/` with Chart.yaml, values.yaml, and templates (deployment.yaml with Dapr annotations `app-id: websocket-service`, service.yaml, _helpers.tpl)
- [X] T076 [US4] Deploy and verify: open two browser windows → create task in one → verify other window updates within 2 seconds → test disconnect/reconnect with missed-event replay

**Checkpoint**: US4 complete. Real-time sync works across multiple clients. Disconnected clients receive missed updates on reconnection.

---

## Phase 7: User Story 5 — Portable Multi-Environment Deployment (Priority: P5)

**Goal**: Deterministic CI/CD pipeline builds, tests, and promotes identical artifacts across local (Minikube) and cloud (managed K8s) environments.

**Independent Test**: Run CI/CD pipeline end-to-end. Verify same artifacts deploy to Minikube and cloud. Run acceptance tests on both environments and confirm identical behavior.

### Implementation for User Story 5

- [X] T077 [P] [US5] Create GitHub Actions build workflow in `.github/workflows/build.yml` — build Docker images for all 5 services + frontend, run unit tests per service, push images to container registry with SHA tag
- [X] T078 [P] [US5] Create GitHub Actions Helm packaging step in `.github/workflows/build.yml` — package Helm chart with image tag references, upload as artifact
- [X] T079 [US5] Create GitHub Actions local deploy workflow in `.github/workflows/deploy-local.yml` — deploy to Minikube using packaged Helm chart, run smoke tests (health checks on all services)
- [X] T080 [US5] Create GitHub Actions cloud deploy workflow in `.github/workflows/deploy-cloud.yml` — promote same artifacts to managed K8s, run identical smoke tests
- [X] T081 [US5] Create environment-specific Helm values files: `helm/todo-app/values-local.yaml` (Minikube: imagePullPolicy Never, single replicas) and `helm/todo-app/values-cloud.yaml` (managed K8s: imagePullPolicy Always, registry reference)
- [X] T082 [US5] Verify deterministic promotion: build once → deploy to Minikube → deploy to cloud → confirm same image SHAs in both environments

**Checkpoint**: US5 complete. CI/CD pipeline operational. Same artifacts verified across both environments.

---

## Phase 8: User Story 6 — Immutable Audit Trail (Priority: P6)

**Goal**: Complete audit trail with all domain events from all services, queryable by administrators.

**Independent Test**: Perform a full sequence of task operations (create, remind, complete with recurrence, delete). Query audit log and verify every operation has a corresponding entry with zero gaps.

### Implementation for User Story 6

- [X] T083 [US6] Extend Audit Service to handle all event types — update handler in `services/audit/src/handlers/audit_logger.py` to process reminder events (ReminderScheduled, ReminderTriggered, ReminderDelivered, ReminderFailed) and recurring events (RecurringTaskGenerated) in addition to task events
- [X] T084 [US6] Add audit query endpoint to Audit Service in `services/audit/src/main.py` — `GET /audit?event_type=<type>&user_id=<id>&from=<date>&to=<date>` with pagination, returning AuditEntry records
- [X] T085 [US6] Verify audit completeness: run full task lifecycle (create with reminder and recurrence → reminder fires → complete → recurring generates → delete) and confirm every event has a corresponding audit entry with zero gaps

**Checkpoint**: US6 complete. Immutable audit trail covers all 9 event types with zero gaps.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Observability, security hardening, and final validation across all services

- [X] T086 [P] Add structured JSON logging to all 5 services with event-level correlation IDs (service name, event_id, timestamp)
- [X] T087 [P] Configure Kubernetes liveness and readiness probes for all new service Helm charts (notification, recurring-task, audit, websocket) — liveness: `GET /health` period 10s threshold 3, readiness: `GET /health` period 5s threshold 1
- [X] T088 Verify all secrets are accessed exclusively via Dapr Secrets API — audit all service code for hardcoded credentials, environment variable leaks, and Helm template secrets
- [X] T089 Run quickstart.md validation — execute all 9 steps from quickstart.md on a fresh Minikube cluster and verify all services start and communicate correctly
- [X] T090 End-to-end acceptance test — execute complete user journey: create task with reminder and recurrence → verify audit log → wait for reminder → verify WebSocket delivery → complete task → verify recurring generation → verify all events in audit trail → restart each service and confirm no data loss
- [X] T091 Verify 100 events/second throughput — generate burst of task mutations and confirm all consumers process without backlog accumulation (SC-011)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — can start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user stories
- **Phase 3 (US1: Event Lifecycle)**: Depends on Phase 2 — BLOCKS US2, US3, US4, US6
- **Phase 4 (US2: Reminders)**: Depends on Phase 3 (needs event backbone + audit)
- **Phase 5 (US3: Recurring)**: Depends on Phase 3 (needs TaskCompleted events flowing)
- **Phase 6 (US4: Real-Time Sync)**: Depends on Phase 3 (needs task events flowing)
- **Phase 7 (US5: CI/CD)**: Can start after Phase 2 (infra only) but full validation requires Phase 3+
- **Phase 8 (US6: Audit Trail)**: Depends on Phase 3 (base audit), Phase 4, Phase 5 (all event types)
- **Phase 9 (Polish)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — No dependencies on other stories
- **US2 (P2)**: Depends on US1 (event backbone must be operational)
- **US3 (P3)**: Depends on US1 (needs TaskCompleted events). Can run in parallel with US2
- **US4 (P4)**: Depends on US1 (needs task events flowing). Can run in parallel with US2/US3
- **US5 (P5)**: Partially independent (pipeline structure after Phase 2). Full validation after US1+
- **US6 (P6)**: Depends on US1 base. Full completion requires US2+US3 events flowing

### Within Each User Story

- Models/schemas before service logic
- Service logic before Helm charts
- Helm charts before deployment verification
- Each story independently deployable after its phase completes

### Parallel Opportunities

- Phase 2: T009-T011 (Dapr components) can run in parallel. T016-T017 (models) can run in parallel. T022-T023 (Dapr annotations) can run in parallel.
- Phase 3: T029-T030 (Audit Service scaffolding) can run in parallel with T025-T028 (Chat API event publishing)
- Phase 4-6: US2, US3, US4 can run in parallel after US1 completes (different services, different files)
- Phase 7: T077-T078 (build + package workflows) can run in parallel

---

## Parallel Example: After Phase 3 (US1) Completes

```bash
# Launch US2, US3, US4 in parallel (different services, no file conflicts):
Task: "T040 [US2] Create Notification Service in services/notification/src/main.py"
Task: "T052 [US3] Create Recurring Task Service in services/recurring-task/src/main.py"
Task: "T064 [US4] Create WebSocket Service in services/websocket/src/main.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (migrate backend → chat-api)
2. Complete Phase 2: Foundational (Kafka + Redis + Dapr + models)
3. Complete Phase 3: User Story 1 (event publishing + audit)
4. **STOP and VALIDATE**: Create/update/complete/delete tasks → verify audit entries
5. Deploy/demo if ready — event-driven backbone operational

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. US1 → Event backbone + Audit → Deploy/Demo (MVP!)
3. US2 → Reminders → Deploy/Demo
4. US3 → Recurring tasks → Deploy/Demo
5. US4 → Real-time sync → Deploy/Demo
6. US5 → CI/CD pipeline → Deploy/Demo
7. US6 → Complete audit trail → Deploy/Demo
8. Polish → Observability + validation → Final Demo

### Parallel Team Strategy

With multiple developers after US1 completes:

1. Team completes Setup + Foundational + US1 together
2. Once US1 is done:
   - Developer A: US2 (Reminders — Notification Service)
   - Developer B: US3 (Recurring — Recurring Task Service)
   - Developer C: US4 (Real-Time — WebSocket Service)
   - Developer D: US5 (CI/CD — GitHub Actions)
3. US6 integrates after US2+US3 complete
4. Polish after all stories done

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story is independently deployable and testable after its phase
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All services communicate via Dapr HTTP API — no direct Kafka/Redis clients
- All events follow CloudEvents v1.0 format with versioned type strings
