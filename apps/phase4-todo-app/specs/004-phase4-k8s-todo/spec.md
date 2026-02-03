# Feature Specification: Phase IV — Cloud-Native Todo AI Chatbot (Local Kubernetes + AIOps)

**Feature Branch**: `001-phase4-k8s-todo`
**Created**: 2026-02-02
**Status**: Draft
**Input**: User description: "Phase IV Cloud-Native Todo AI Chatbot with Local Kubernetes deployment, Helm charts, date/time-aware tasks, explicit task state pages, and AI-governed DevOps"

## Clarifications

### Session 2026-02-02

- Q: How should tasks be sorted on the task view pages? → A: Sort by last updated (most recently modified first). Additionally, each task displays a visual checkbox reflecting its completion status.
- Q: Should Helm use an umbrella chart with subcharts or two independent charts? → A: Umbrella chart with frontend and backend as subcharts, deployed via a single `helm install` command.
- Q: What health check endpoints should services expose for Kubernetes probes? → A: Dedicated `/health` endpoint on both frontend and backend services.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Tasks with Date and Time (Priority: P1)

A user opens the chat panel and tells the AI assistant "Remind me to submit my report on 2026-02-15 at 14:00." The assistant creates a task with the specified due date and time. If the user says something ambiguous like "Remind me tomorrow evening," the assistant asks for clarification rather than guessing a time. Tasks without explicit dates are created without due dates.

**Why this priority**: Date and time awareness is the core functional enhancement of Phase IV. Without it, the system is identical to Phase III. This unlocks the "Android-level reminder" capability that defines the feature.

**Independent Test**: Can be fully tested by sending chat messages with various date/time combinations and verifying the created tasks have correct due_date and due_time fields in the database. Delivers the ability to schedule time-sensitive reminders.

**Acceptance Scenarios**:

1. **Given** a logged-in user in the chat panel, **When** they say "Add a task to call dentist on 2026-03-01 at 09:00", **Then** a task is created with title "Call dentist", due_date "2026-03-01", and due_time "09:00"
2. **Given** a logged-in user in the chat panel, **When** they say "Remind me to buy groceries tomorrow evening", **Then** the assistant asks "What time should I set?" before creating the task
3. **Given** a logged-in user in the chat panel, **When** they say "Add a task to read a book", **Then** a task is created with no due_date and no due_time
4. **Given** a logged-in user in the chat panel, **When** they say "Update task 5 to be due on 2026-04-01", **Then** the task's due_date is updated to "2026-04-01"

---

### User Story 2 - Browse Tasks by State (Priority: P1)

A user navigates to different task pages to see their tasks organized by status. They can view all tasks, only pending tasks, only completed tasks, or a summary with total counts. Each page fetches data directly from the backend — no client-side filtering or caching.

**Why this priority**: Explicit task state pages are a mandatory UI requirement. Users need organized views to manage their tasks effectively, especially as tasks accumulate with dates and times.

**Independent Test**: Can be fully tested by creating a mix of pending and completed tasks, then navigating to each page and verifying only the correct subset appears. Delivers organized task management views.

**Acceptance Scenarios**:

1. **Given** a user with 3 pending and 2 completed tasks, **When** they navigate to the "All Tasks" page, **Then** all 5 tasks are displayed sorted by last updated (most recently modified first), each with a checkbox reflecting completion status
2. **Given** a user with 3 pending and 2 completed tasks, **When** they navigate to the "Pending Tasks" page, **Then** only the 3 pending tasks are displayed sorted by last updated, each with an unchecked checkbox
3. **Given** a user with 3 pending and 2 completed tasks, **When** they navigate to the "Completed Tasks" page, **Then** only the 2 completed tasks are displayed sorted by last updated, each with a checked checkbox
4. **Given** a user with 3 pending and 2 completed tasks, **When** they navigate to the "Total Tasks" page, **Then** a summary showing "5 total, 3 pending, 2 completed" is displayed

---

### User Story 3 - Deploy to Local Kubernetes via Helm (Priority: P1)

A developer runs a single Helm install command against a clean Minikube cluster using an umbrella chart (with frontend and backend as subcharts) and the entire system comes up and is accessible. Both services expose a `/health` endpoint used by Kubernetes liveness and readiness probes. Configuration is driven entirely through Helm values. Restarting pods does not lose data or break functionality. Upgrading the Helm release produces predictable results.

**Why this priority**: Kubernetes deployment is the defining infrastructure goal of Phase IV. Without deterministic Helm-based deployment on Minikube, the project does not meet its cloud-native mandate.

**Independent Test**: Can be fully tested by starting a clean Minikube cluster, running `helm install`, and verifying both frontend and backend respond to requests. Delivers production-grade, repeatable deployment.

**Acceptance Scenarios**:

1. **Given** a clean Minikube cluster, **When** a developer runs a single `helm install` using the umbrella chart, **Then** both frontend and backend pods reach "Running" status and their `/health` endpoints respond successfully to liveness and readiness probes
2. **Given** a running deployment, **When** a pod is deleted, **Then** Kubernetes recreates it and the system resumes normal operation without data loss
3. **Given** a running deployment, **When** `helm upgrade` is run with updated values, **Then** the deployment updates predictably without downtime or configuration drift
4. **Given** a running deployment, **When** the Minikube cluster is stopped and restarted, **Then** the system recovers to a functional state after pods restart

---

### User Story 4 - Containerize Frontend and Backend Independently (Priority: P2)

Each service (frontend and backend) is packaged as an independent container image. Images contain no environment-specific logic — all configuration is injected via environment variables at runtime. Images are minimal and deterministic.

**Why this priority**: Containerization is a prerequisite for Kubernetes deployment. Independent images enable separate scaling, versioning, and deployment of each service.

**Independent Test**: Can be fully tested by building each container image and running it standalone with environment variables, verifying it starts and responds. Delivers portable, reproducible service images.

**Acceptance Scenarios**:

1. **Given** the backend source code, **When** the container image is built, **Then** it produces a deterministic image that starts with only environment variables provided
2. **Given** the frontend source code, **When** the container image is built, **Then** it produces a deterministic image that starts with only environment variables provided
3. **Given** a built backend image, **When** run with different database connection strings, **Then** it connects to whichever database is specified without image changes

---

### User Story 5 - Manage Tasks via Chat with All MCP Operations (Priority: P2)

A user interacts with the AI chatbot to perform all task operations: add, list (all/pending/completed), update, complete, and delete. The agent never hallucinates task IDs, confirms actions explicitly, and lists tasks before modifying ambiguous references.

**Why this priority**: Full MCP tool coverage ensures the chat interface is the primary interaction method and all operations are available through natural language. This builds on Phase III capabilities with the new date/time fields.

**Independent Test**: Can be fully tested by performing each MCP operation through the chat interface and verifying the database reflects the correct state after each operation. Delivers complete natural-language task management.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they say "Show my pending tasks", **Then** the assistant calls list_tasks with status "pending" and displays only incomplete tasks
2. **Given** a user with task "Buy milk" (id: 3), **When** they say "Mark buy milk as done", **Then** the assistant calls complete_task for task 3 and confirms completion
3. **Given** a user who says "Delete my meeting task", **When** multiple tasks match, **Then** the assistant lists matching tasks and asks which one to delete
4. **Given** a user, **When** they say "Update task 7 description to include venue details", **Then** the assistant calls update_task with the new description and confirms

---

### User Story 6 - Configure Deployment via Helm Values (Priority: P3)

A DevOps operator adjusts replica counts, resource limits, environment variables, and service configuration by modifying Helm values files — no direct YAML editing required. Secrets are never hardcoded in charts or images.

**Why this priority**: Parameterized Helm configuration is essential for production-grade deployment but is secondary to getting the basic deployment working.

**Independent Test**: Can be fully tested by changing values.yaml entries (e.g., replica count from 1 to 3) and running `helm upgrade`, then verifying the cluster reflects the new configuration. Delivers configurable, production-ready deployment.

**Acceptance Scenarios**:

1. **Given** a values.yaml with backend replicas set to 1, **When** the operator changes it to 3 and runs `helm upgrade`, **Then** 3 backend pods are running
2. **Given** a Helm chart, **When** deployed, **Then** no secrets are present in the chart files, images, or version control
3. **Given** a values.yaml, **When** the database connection string is changed, **Then** `helm upgrade` updates the backend pods to use the new connection without rebuilding images

---

### Edge Cases

- What happens when a user provides a date in the past? The system accepts it (user may be logging completed work) but the assistant notes "This date is in the past."
- What happens when a user provides an invalid date format (e.g., "February 30th")? The assistant rejects it and asks for a valid date.
- What happens when Minikube runs out of resources during deployment? Pod scheduling fails visibly with clear error messages in pod status; no silent crashes.
- What happens when the database is unreachable during a chat request? The backend returns an explicit error message to the user; no partial writes occur.
- What happens when a user tries to complete/delete a task that does not exist? The assistant responds with "Task not found" — never hallucinates a success.
- What happens when Helm install is run twice? The second run fails gracefully with "release already exists" — idempotent upgrade is used instead.
- What happens when a pod crashes mid-request? The response fails for that request, but the pod restarts and subsequent requests succeed. No data corruption occurs.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create tasks with optional due_date (YYYY-MM-DD) and due_time (HH:MM, 24-hour format) through the chat interface
- **FR-002**: System MUST ask for clarification when temporal expressions are ambiguous (e.g., "evening", "later", "soon")
- **FR-003**: System MUST create tasks without due dates when no temporal information is provided by the user
- **FR-004**: System MUST expose four distinct task view pages: All Tasks, Pending Tasks, Completed Tasks, and Total Tasks (summary with counts)
- **FR-005**: All task view pages MUST fetch data from the backend on each load — no client-side state caching for task data
- **FR-006**: System MUST support all MCP tool operations through the chat interface: add_task, list_tasks (with status filter), complete_task, update_task, delete_task
- **FR-007**: The AI assistant MUST confirm all successful task mutations explicitly to the user
- **FR-008**: The AI assistant MUST list matching tasks before performing delete or update when the user's reference is ambiguous
- **FR-009**: The AI assistant MUST never fabricate or guess task IDs
- **FR-010**: System MUST store all state exclusively in the database — backend and frontend are fully stateless
- **FR-011**: Frontend and backend MUST be packaged as independent container images with no environment-specific logic baked in
- **FR-012**: All configuration MUST be injected via environment variables at runtime, never hardcoded
- **FR-013**: All Kubernetes resources MUST be deployed via Helm charts — no raw YAML manifests applied directly
- **FR-014**: Helm charts MUST be parameterized to support configurable replica counts, resource limits, and environment variables through values files
- **FR-015**: Deployment MUST target Minikube exclusively — no cloud-managed cluster dependencies
- **FR-016**: Pods MUST be stateless — pod restart or replacement MUST NOT cause data loss or functional degradation
- **FR-017**: System MUST persist user messages and assistant responses to the database for conversation continuity
- **FR-018**: All errors MUST be explicit, logged, user-safe, and non-destructive — no silent failures, partial writes, or hidden retries
- **FR-019**: The update_task MCP tool MUST support updating due_date and due_time fields in addition to title and description
- **FR-020**: System MUST normalize all temporal data before storage (dates as YYYY-MM-DD, times as HH:MM in 24-hour format)
- **FR-021**: Secrets MUST never be hardcoded in container images, Helm charts, or version control
- **FR-022**: All task view pages MUST sort tasks by last updated timestamp (most recently modified first)
- **FR-023**: Each task displayed on a task view page MUST include a visual checkbox that reflects its completion status (checked = completed, unchecked = pending)
- **FR-024**: Helm deployment MUST use an umbrella chart structure with frontend and backend as subcharts, deployable via a single `helm install` command
- **FR-025**: Both frontend and backend services MUST expose a `/health` endpoint used by Kubernetes liveness and readiness probes

### Key Entities

- **User**: Authenticated owner of tasks and conversations. Key attributes: unique identifier, email, credentials. One user owns many tasks and conversations.
- **Task**: A unit of work with an optional schedule. Key attributes: title, optional description, optional due date, optional due time, completion status, creation and update timestamps. Belongs to one user.
- **Conversation**: A chat session between a user and the AI assistant. Key attributes: user association, creation timestamp. Contains an ordered sequence of messages.
- **Message**: A single exchange within a conversation. Key attributes: role (user or assistant), content text, timestamp. Belongs to one conversation.

## Assumptions

- The existing Phase III application (FastAPI backend, Next.js frontend, SQLite/PostgreSQL database, Docker Compose setup) serves as the foundation — Phase IV extends it rather than replacing it.
- Docker Desktop is available on the developer's machine for building container images.
- Minikube is installed and configured on the developer's machine for local Kubernetes deployment.
- Helm v3 is installed for chart management.
- The AI agent uses the DeepSeek API (OpenAI-compatible) as configured in the existing codebase. An API key must be provided via environment variable.
- Authentication continues to use JWT tokens as implemented in Phase III.
- The database for Kubernetes deployment will be an external PostgreSQL instance (e.g., Neon) referenced via connection string in Helm values — the database itself is not deployed inside Kubernetes.
- All date/time values are stored without timezone information. The system does not infer or convert timezones.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create, view, update, complete, and delete tasks with optional due dates and times through natural-language chat, with 100% of supported intents producing correct database state
- **SC-002**: 100% of ambiguous temporal expressions (defined as expressions lacking a specific date or specific time) trigger a clarification prompt from the assistant before task creation
- **SC-003**: All four task view pages (All, Pending, Completed, Total) display accurate, server-fetched data that matches the database state within one page load
- **SC-004**: A clean Minikube cluster reaches a fully operational state (all pods running, all health checks passing, frontend and backend accessible) from a single `helm install` command
- **SC-005**: System survives pod restart, pod deletion, and `helm upgrade` without data loss, configuration drift, or functional degradation
- **SC-006**: Zero secrets are present in container images, Helm chart files, or version-controlled code
- **SC-007**: Deployment is fully repeatable: running `helm uninstall` followed by `helm install` on the same Minikube cluster produces an identical, functional system
- **SC-008**: All user-facing errors provide clear, non-technical feedback — no stack traces, silent failures, or ambiguous error messages reach the user
