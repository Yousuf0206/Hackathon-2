# Implementation Plan: Phase IV — Cloud-Native Todo AI Chatbot

**Branch**: `001-phase4-k8s-todo` | **Date**: 2026-02-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-phase4-k8s-todo/spec.md`

## Summary

Phase IV extends the existing Phase III Todo AI Chatbot with three pillars: (1) date/time-aware tasks via extended data model and MCP tools, (2) explicit task state view pages with sort-by-updated and completion checkboxes, and (3) cloud-native deployment on local Kubernetes (Minikube) via a Helm umbrella chart with frontend and backend subcharts. The existing FastAPI backend, Next.js frontend, Docker images, and DeepSeek-powered agent serve as the foundation — changes are additive, not replacements.

## Technical Context

**Language/Version**: Python 3.11 (backend), TypeScript 5.3 / Node.js 18 (frontend)
**Primary Dependencies**: FastAPI 0.104.1, SQLModel 0.0.14, Next.js 15.1.0, python-jose (JWT), DeepSeek API (OpenAI-compatible)
**Storage**: PostgreSQL (Neon, external to cluster) via SQLModel ORM; SQLite for local dev
**Testing**: pytest (backend), manual verification (frontend); contract tests against API schemas
**Target Platform**: Minikube (local Kubernetes); Docker Desktop for image builds
**Project Type**: Web application (separate frontend + backend)
**Performance Goals**: Standard web app expectations; health checks respond within 5 seconds
**Constraints**: Minikube-only deployment; Helm-only resource management; stateless pods; no secrets in images/charts
**Scale/Scope**: Single-user local deployment; configurable replica counts via Helm values

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Agentic Dev Stack | PASS | Following specify → plan → tasks → implement via Claude Code |
| II. Technology Lock | PASS with justification | Phase IV adds Docker, Helm, Minikube, kubectl-ai, Kagent per Phase IV constitution. Core stack (FastAPI, Next.js, SQLModel, PostgreSQL) unchanged. See Complexity Tracking. |
| III. Data & Persistence | PASS | All state in PostgreSQL; pods are stateless; no in-memory task state |
| IV. Authentication & Authorization | PASS | JWT via Better Auth continues unchanged; user isolation enforced |
| V. REST API Invariants | PASS | Existing endpoints stable; new fields are additive (optional due_date, due_time) |
| VI. Frontend Rules | PASS | Next.js App Router; server-fetched data; JWT auto-attached |
| VII. Monorepo & Spec-Kit Rules | PASS | Specs in /specs/; frontend/ and backend/ separated; CLAUDE.md present |
| VIII. Error Handling & Safety | PASS | Explicit errors; no silent failures; user-safe messages per FR-018 |
| IX. Determinism & Reviewability | PASS | All behavior spec-traceable; Helm deployments idempotent |
| X. Forbidden Actions | PASS | No undocumented features; no auth bypass; no secret leakage |

**Phase IV Constitution (sp.constitution) Additional Gates:**

| Gate | Status | Notes |
|------|--------|-------|
| Containerization Law | PASS | Independent images; no env-specific logic; Claude Code generates Dockerfiles |
| Kubernetes Deployment Law | PASS | Minikube only; Helm only; no raw kubectl apply |
| Helm Chart Supremacy | PASS | Umbrella chart with subcharts; parameterized values |
| Stateless Pod Law | PASS | No local persistence; no in-pod caching |
| AI DevOps Governance | PASS | kubectl-ai and Kagent advisory only; human approval required |
| Configuration & Secrets Law | PASS | Env vars and Helm values only; no hardcoded secrets |
| Deployment Determinism | PASS | helm install repeatable; helm upgrade predictable |

## Project Structure

### Documentation (this feature)

```text
specs/004-phase4-k8s-todo/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── backend-api.yaml # OpenAPI contract for backend
│   └── mcp-tools.yaml   # MCP tool schemas
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (created by /sp.tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── main.py              # FastAPI app + /health endpoint (exists)
│   ├── config.py            # Settings class (exists)
│   ├── database.py          # ORM helpers (extend for date/time)
│   ├── models/
│   │   ├── task.py          # Task model (ADD due_date, due_time fields)
│   │   ├── user.py          # User model (no changes)
│   │   ├── conversation.py  # Conversation model (no changes)
│   │   └── message.py       # Message model (no changes)
│   ├── api/
│   │   ├── chat.py          # Chat endpoint (no changes)
│   │   ├── todos.py         # Todo CRUD (ADD sort by updated_at, add filter endpoints)
│   │   └── tasks.py         # NEW: Task API endpoints for frontend pages
│   ├── agent/
│   │   ├── runner.py        # Agent runner (no changes)
│   │   └── prompts.py       # System prompt (UPDATE for date/time awareness)
│   └── mcp/tools/
│       ├── add_task.py      # ADD due_date, due_time parameters
│       ├── list_tasks.py    # ADD due_date/due_time in response
│       ├── update_task.py   # ADD due_date, due_time parameters
│       ├── complete_task.py # No changes
│       └── delete_task.py   # No changes
├── Dockerfile               # EXISTS (verify stateless, env-only config)
└── requirements.txt         # No changes expected

frontend/
├── src/
│   ├── app/
│   │   ├── todos/
│   │   │   ├── page.tsx         # REFACTOR: All Tasks view (sorted, checkboxes)
│   │   │   ├── pending/
│   │   │   │   └── page.tsx     # NEW: Pending Tasks view
│   │   │   ├── completed/
│   │   │   │   └── page.tsx     # NEW: Completed Tasks view
│   │   │   └── summary/
│   │   │       └── page.tsx     # NEW: Total Tasks summary view
│   │   └── api/health/route.ts  # EXISTS (no changes)
│   ├── components/
│   │   ├── TodoList.tsx         # UPDATE: Sort by updated_at, add checkboxes
│   │   ├── TodoItem.tsx         # UPDATE: Add checkbox, display due_date/due_time
│   │   ├── TaskNavigation.tsx   # NEW: Navigation between task view pages
│   │   └── TaskSummary.tsx      # NEW: Summary component for Total Tasks page
│   └── library/
│       ├── api.ts               # UPDATE: Add task endpoints with status filter
│       └── types.ts             # UPDATE: Add due_date, due_time to Task type
├── Dockerfile                   # EXISTS (verify multi-stage, stateless)
└── next.config.js               # May need update for standalone output

helm/
├── todo-app/                    # NEW: Umbrella chart
│   ├── Chart.yaml               # Umbrella chart metadata
│   ├── values.yaml              # Root values (image tags, replicas, env vars)
│   └── charts/
│       ├── backend/
│       │   ├── Chart.yaml
│       │   ├── values.yaml
│       │   └── templates/
│       │       ├── deployment.yaml
│       │       ├── service.yaml
│       │       └── _helpers.tpl
│       └── frontend/
│           ├── Chart.yaml
│           ├── values.yaml
│           └── templates/
│               ├── deployment.yaml
│               ├── service.yaml
│               └── _helpers.tpl
```

**Structure Decision**: Web application structure (Option 2) with existing backend/ and frontend/ directories. New helm/ directory at project root for Kubernetes deployment artifacts. All Helm charts generated via Claude Code per constitution mandate (no manual YAML).

## Complexity Tracking

> **Constitution Check violations requiring justification**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Technology additions (Docker, Helm, Minikube, kubectl-ai, Kagent) beyond Phase II lock | Phase IV constitution explicitly mandates these for cloud-native deployment. Phase IV constitution supersedes Phase II technology lock for infrastructure tooling only. Core application stack (FastAPI, Next.js, SQLModel, PostgreSQL) remains locked. | Deploying without Kubernetes/Helm would violate Phase IV constitution sections IV and V. |

## Implementation Phases

### Phase 0 — Research & Environment Verification

**Objective**: Resolve all unknowns; verify tooling readiness.

**Inputs**: spec.md, constitution, existing codebase analysis
**Outputs**: research.md

**Research Items**:
1. SQLModel date/time column types for optional date and optional time fields
2. Helm umbrella chart structure with subchart dependency management
3. Minikube image loading strategy (minikube image load vs. local registry)
4. Next.js standalone output mode for minimal container images
5. Agent system prompt patterns for date/time clarification behavior

**Environment Verification**:
- Docker Desktop running with BuildKit
- Minikube installed and startable
- Helm v3 installed
- kubectl configured for Minikube context

### Phase 1 — Application Logic (Spec Compliance)

**Objective**: Make application behavior match spec exactly.

**Dependencies**: Phase 0 complete (research.md)
**Outputs**: data-model.md, contracts/, quickstart.md

**Backend Changes**:

1. **Task Model Extension** (FR-001, FR-019, FR-020)
   - Add `due_date: Optional[date]` field to Task model
   - Add `due_time: Optional[str]` field to Task model (stored as HH:MM string)
   - Add database migration for new columns
   - File: `backend/src/models/task.py`

2. **MCP Tool Updates** (FR-001, FR-006, FR-019)
   - `add_task`: Add optional `due_date` and `due_time` parameters
   - `update_task`: Add optional `due_date` and `due_time` parameters
   - `list_tasks`: Include `due_date` and `due_time` in response objects
   - Files: `backend/src/mcp/tools/add_task.py`, `update_task.py`, `list_tasks.py`

3. **Database Helpers** (FR-020, FR-022)
   - Update `create_task()` to accept and normalize date/time
   - Update `get_tasks_by_user()` to sort by `updated_at` DESC
   - Update `update_task()` to accept date/time fields
   - File: `backend/src/database.py`

4. **Agent Prompt Update** (FR-002, FR-007, FR-008, FR-009)
   - Update system prompt to instruct agent about date/time clarification rules
   - Agent must ask for clarification on ambiguous temporal expressions
   - Agent must confirm all mutations
   - Agent must never fabricate task IDs
   - File: `backend/src/agent/prompts.py`

5. **Task API Endpoints** (FR-004, FR-005, FR-022)
   - Add `GET /api/tasks?status=all|pending|completed` endpoint for frontend pages
   - Enforce sort by `updated_at` DESC
   - Return tasks with due_date, due_time, completion status
   - File: `backend/src/api/tasks.py` (new)

6. **Health Endpoint Verification** (FR-025)
   - Backend `/health` already exists — verify response format
   - File: `backend/src/main.py` (verify only)

**Frontend Changes**:

7. **Type Updates** (data model alignment)
   - Add `due_date: string | null` and `due_time: string | null` to Task/Todo interfaces
   - File: `frontend/src/library/types.ts`

8. **API Client Updates** (FR-004, FR-005)
   - Add `getTasks(status?: 'all' | 'pending' | 'completed')` method
   - Add `toggleTaskComplete(taskId: number, completed: boolean)` method
   - File: `frontend/src/library/api.ts`

9. **Task View Pages** (FR-004, FR-005, FR-022, FR-023)
   - Refactor `todos/page.tsx` → All Tasks page (sorted by updated_at, checkboxes)
   - New `todos/pending/page.tsx` → Pending Tasks page
   - New `todos/completed/page.tsx` → Completed Tasks page
   - New `todos/summary/page.tsx` → Total Tasks summary page
   - Each page fetches from backend on load (no client-side cache)

10. **Component Updates** (FR-022, FR-023)
    - `TodoItem.tsx`: Add visual checkbox for completion status; display due_date/due_time
    - `TodoList.tsx`: Sort by updated_at; render checkboxes
    - New `TaskNavigation.tsx`: Navigation tabs/links between task view pages
    - New `TaskSummary.tsx`: Summary counts for Total Tasks page

11. **Health Endpoint Verification** (FR-025)
    - Frontend `/api/health` already exists — verify response format
    - File: `frontend/src/app/api/health/route.ts` (verify only)

### Phase 2 — Containerization

**Objective**: Produce deterministic, stateless Docker images.

**Dependencies**: Phase 1 complete (app logic correct)

**Tasks**:

12. **Backend Dockerfile Verification** (FR-011, FR-012)
    - Verify existing `backend/Dockerfile` is stateless
    - Verify no hardcoded secrets
    - Verify env-based configuration
    - Verify `/health` responds in container
    - File: `backend/Dockerfile` (verify/update)

13. **Frontend Dockerfile Verification** (FR-011, FR-012)
    - Verify existing `frontend/Dockerfile` multi-stage build
    - Verify standalone output mode for minimal image
    - Verify no hardcoded secrets
    - Verify `/api/health` responds in container
    - File: `frontend/Dockerfile` (verify/update)

14. **Docker Compose Update** (integration testing)
    - Update `docker-compose.yml` for PostgreSQL instead of SQLite
    - Verify both services start and communicate
    - File: `docker-compose.yml`

### Phase 3 — Helm Packaging

**Objective**: Establish Helm as sole deployment mechanism.

**Dependencies**: Phase 2 complete (working containers)

**Tasks**:

15. **Umbrella Chart Structure** (FR-013, FR-024)
    - Create `helm/todo-app/Chart.yaml` with subchart dependencies
    - Create root `values.yaml` with image tags, replicas, env vars
    - File: `helm/todo-app/Chart.yaml`, `helm/todo-app/values.yaml`

16. **Backend Subchart** (FR-014, FR-025)
    - Create `helm/todo-app/charts/backend/Chart.yaml`
    - Create deployment template with health probes on `/health`
    - Create service template
    - Create `values.yaml` with defaults
    - Files: `helm/todo-app/charts/backend/`

17. **Frontend Subchart** (FR-014, FR-025)
    - Create `helm/todo-app/charts/frontend/Chart.yaml`
    - Create deployment template with health probes on `/api/health`
    - Create service template
    - Create `values.yaml` with defaults
    - Files: `helm/todo-app/charts/frontend/`

18. **Helm Template Validation**
    - Run `helm template` to verify clean rendering
    - Verify no raw YAML outside Helm
    - Verify all config driven via values.yaml
    - No hardcoded secrets (FR-021)

### Phase 4 — Kubernetes Deployment

**Objective**: Run full system on Minikube.

**Dependencies**: Phase 3 complete (valid Helm charts)

**Tasks**:

19. **Minikube Setup & Image Loading** (FR-015)
    - Start clean Minikube cluster
    - Build images and load into Minikube
    - File: deployment commands only

20. **Helm Deploy** (FR-013, FR-024, SC-004)
    - Run single `helm install` command
    - Verify all pods reach Running status
    - Verify health probes succeed
    - Verify frontend-to-backend communication

21. **End-to-End Verification** (SC-001, SC-003)
    - Test chat with date/time task creation
    - Test all four task view pages
    - Test MCP tool operations
    - Verify sort order and checkboxes

### Phase 5 — Reliability & Scaling

**Objective**: Validate Android-level reliability.

**Dependencies**: Phase 4 complete (running on K8s)

**Tasks**:

22. **Pod Resilience Testing** (FR-016, SC-005)
    - Delete pods manually; verify recreation
    - Verify no data loss after pod restart
    - Verify no duplicate tasks or lost updates

23. **Scaling Testing** (FR-014, SC-005)
    - Scale backend replicas via Helm upgrade
    - Scale frontend replicas via Helm upgrade
    - Verify correctness under scaled deployment

24. **Redeployment Testing** (SC-007)
    - Run `helm uninstall` then `helm install`
    - Verify identical functional system
    - Verify no configuration drift

### Phase 6 — Validation & Compliance

**Objective**: Prove full spec and constitution compliance.

**Dependencies**: Phase 5 complete

**Tasks**:

25. **Compliance Audit**
    - Verify all 25 functional requirements (FR-001 through FR-025)
    - Verify all 8 success criteria (SC-001 through SC-008)
    - Verify Phase IV constitution compliance
    - Verify no forbidden practices

26. **Secret Scan** (FR-021, SC-006)
    - Scan images for hardcoded secrets
    - Scan Helm chart files for secrets
    - Scan version-controlled code for secrets

## Dependency Graph

```
Phase 0 (Research)
    ↓
Phase 1 (App Logic) → data-model.md, contracts/, quickstart.md
    ↓
Phase 2 (Containers)
    ↓
Phase 3 (Helm Charts)
    ↓
Phase 4 (K8s Deploy)
    ↓
Phase 5 (Reliability)
    ↓
Phase 6 (Compliance)
```

All phases are strictly sequential. No parallel execution across phases.
Within Phase 1, backend changes (1-6) must complete before frontend changes (7-11) that depend on the API.
