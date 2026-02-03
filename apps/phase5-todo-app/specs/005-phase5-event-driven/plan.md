# Implementation Plan: Phase V — Event-Driven Cloud Architecture

**Branch**: `005-phase5-event-driven` | **Date**: 2026-02-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-phase5-event-driven/spec.md`

## Summary

Phase V transforms the Phase IV Kubernetes-deployed Todo AI Chatbot into
a fully event-driven, cloud-native distributed system. The Chat API
publishes domain events to Kafka (via Dapr Pub/Sub) for all task
mutations. Four new downstream services — Notification, Recurring Task,
Audit, and WebSocket — consume these events to deliver reminders
(in-app via WebSocket), generate recurring task instances, maintain an
immutable audit trail, and push real-time updates to connected clients.
All inter-service communication is abstracted through Dapr building
blocks. Deployment is portable across Minikube and managed Kubernetes
via Helm charts and a deterministic GitHub Actions CI/CD pipeline. The
system sustains 100 events/second at hackathon proof-of-concept scale.

## Technical Context

**Language/Version**: Python 3.11+ (all services), TypeScript 5+ / Node.js 18+ (frontend)
**Primary Dependencies**: FastAPI (services), Dapr SDK/HTTP API, Next.js 15 (frontend)
**Event Backbone**: Apache Kafka via Dapr Pub/Sub (`pubsub.kafka`)
**State Store**: Redis via Dapr State Store (`state.redis`)
**Scheduling**: Dapr Jobs API (v1.0-alpha1) for reminders and recurring triggers
**Secrets**: Dapr Secrets API with Kubernetes Secrets backend
**Database**: PostgreSQL (Neon serverless, existing Phase IV)
**ORM**: SQLModel (existing Phase IV)
**Container Runtime**: Docker with multi-stage builds
**Orchestration**: Kubernetes (Minikube local, AKS/GKE/OKE cloud)
**Charts**: Helm 3 umbrella chart (extended from Phase IV)
**CI/CD**: GitHub Actions
**Testing**: pytest (backend services)
**Target Platform**: Kubernetes (Minikube + managed cloud)
**Performance Goals**: 100 events/second sustained throughput (SC-011)
**Constraints**: <2s client sync latency (SC-003), <5s reminder/recurring latency (SC-002, SC-004), <30s service recovery (SC-008)
**Scale/Scope**: Hackathon proof-of-concept; 5 services + frontend + infrastructure

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| III. Agentic Dev Stack | All work follows spec → plan → task → implement | ✅ PASS |
| IV. Architectural Evolution | Phase IV Helm charts preserved; no API regression | ✅ PASS |
| V-A. Kafka Mandate | Kafka is exclusive event backbone via Dapr Pub/Sub | ✅ PASS |
| V-B. Event Ownership | Chat API is sole task mutation producer | ✅ PASS |
| V-C. Event Schema Authority | All events versioned (CloudEvents v1.0 + type versioning) | ✅ PASS |
| VI-A. Dapr Sidecar Mandate | All services use Dapr sidecars; no direct Kafka/DB clients | ✅ PASS |
| VI-B. Mandatory Dapr Blocks | Pub/Sub, State, Service Invocation, Jobs, Secrets all used | ✅ PASS |
| VII-A. Service Responsibility | 5 services, each with single responsibility | ✅ PASS |
| VII-B. Stateless Service | All services stateless; state via Dapr State Store/DB | ✅ PASS |
| VIII-A. Environment Progression | Minikube first, then managed K8s | ✅ PASS |
| VIII-B. Cloud Neutrality | Helm + Dapr; no cloud-specific SDKs | ✅ PASS |
| IX-A. Pipeline Mandate | GitHub Actions; no manual deployment | ✅ PASS |
| IX-B. Deterministic Promotion | Same artifacts across all environments | ✅ PASS |
| X. Observability | Health probes, centralized logging, topic visibility | ✅ PASS |
| XI. Security & Secrets | Dapr Secrets API; no secrets in code/templates/logs | ✅ PASS |
| XII. Forbidden Practices | No direct Kafka clients, no polling, no coupling | ✅ PASS |

**Gate Result**: ALL PASS — proceed to execution.

## Project Structure

### Documentation (this feature)

```text
specs/005-phase5-event-driven/
├── plan.md                  # This file
├── spec.md                  # Feature specification
├── research.md              # Phase 0: technology research
├── data-model.md            # Phase 1: entity & event schemas
├── quickstart.md            # Phase 1: deployment guide
├── contracts/
│   └── event-contracts.md   # Phase 1: event & API contracts
├── checklists/
│   └── requirements.md      # Spec quality checklist
└── tasks.md                 # Phase 2: task decomposition (/sp.tasks)
```

### Source Code (repository root)

```text
phase5-todo-app/
├── services/
│   ├── chat-api/                    # Intent resolution + event publishing
│   │   ├── src/
│   │   │   ├── main.py              # FastAPI app + Dapr pub/sub publish
│   │   │   ├── config.py            # Pydantic settings
│   │   │   ├── events/
│   │   │   │   ├── publisher.py     # Dapr pub/sub publish helper
│   │   │   │   └── schemas.py       # CloudEvents schema definitions
│   │   │   ├── api/                 # Existing endpoints (from backend/)
│   │   │   ├── models/              # SQLModel entities (extended)
│   │   │   ├── auth/                # JWT auth (existing)
│   │   │   ├── agent/               # AI agent (existing)
│   │   │   └── mcp/                 # MCP tools (existing)
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   ├── notification/                # Reminder delivery via WebSocket
│   │   ├── src/
│   │   │   ├── main.py              # FastAPI + Dapr subscription endpoints
│   │   │   ├── config.py
│   │   │   ├── handlers/
│   │   │   │   └── reminder.py      # ReminderScheduled/Triggered handlers
│   │   │   └── events/
│   │   │       ├── publisher.py     # Publish ReminderDelivered/Failed
│   │   │       └── schemas.py
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   ├── recurring-task/              # Recurring task generation
│   │   ├── src/
│   │   │   ├── main.py              # FastAPI + Dapr subscription endpoints
│   │   │   ├── config.py
│   │   │   ├── handlers/
│   │   │   │   └── recurrence.py    # TaskCompleted handler + generation
│   │   │   └── events/
│   │   │       ├── publisher.py     # Publish RecurringTaskGenerated
│   │   │       └── schemas.py
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   ├── audit/                       # Immutable event log
│   │   ├── src/
│   │   │   ├── main.py              # FastAPI + Dapr subscription endpoints
│   │   │   ├── config.py
│   │   │   ├── handlers/
│   │   │   │   └── audit_logger.py  # All-event consumer → DB insert
│   │   │   └── models/
│   │   │       └── audit_entry.py   # AuditEntry SQLModel
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   └── websocket/                   # Real-time client sync
│       ├── src/
│       │   ├── main.py              # FastAPI WebSocket + Dapr subscriptions
│       │   ├── config.py
│       │   ├── handlers/
│       │   │   ├── task_sync.py     # Task event → WebSocket push
│       │   │   └── reminder_push.py # Reminder event → WebSocket push
│       │   └── connections/
│       │       └── manager.py       # WebSocket connection manager (Dapr State)
│       ├── Dockerfile
│       └── requirements.txt
├── frontend/                        # Existing Next.js frontend (extended)
│   ├── src/
│   │   ├── app/                     # Existing pages
│   │   ├── components/              # Existing + WebSocket integration
│   │   └── library/
│   │       ├── api.ts               # Existing API client
│   │       └── websocket.ts         # New: WebSocket client
│   ├── Dockerfile
│   └── package.json
├── helm/
│   └── todo-app/                    # Extended umbrella chart
│       ├── Chart.yaml               # Updated dependencies
│       ├── values.yaml              # Global values
│       └── charts/
│           ├── backend/             # Existing → renamed chat-api
│           ├── frontend/            # Existing
│           ├── notification/        # New subchart
│           ├── recurring-task/      # New subchart
│           ├── audit/               # New subchart
│           ├── websocket/           # New subchart
│           ├── kafka/               # New: Kafka dependency
│           └── redis/               # New: Redis dependency
├── dapr/
│   └── components/
│       ├── pubsub.yaml              # Kafka pub/sub component
│       ├── statestore.yaml          # Redis state store component
│       ├── subscriptions/
│       │   ├── audit-subs.yaml      # Audit subscribes to all topics
│       │   ├── websocket-subs.yaml  # WebSocket subscribes to task + reminder
│       │   ├── notification-subs.yaml # Notification subscribes to reminder
│       │   └── recurring-subs.yaml  # Recurring subscribes to task-events
│       └── secrets.yaml             # Kubernetes secrets component
├── .github/
│   └── workflows/
│       ├── build.yml                # Build + test all services
│       ├── deploy-local.yml         # Deploy to Minikube
│       └── deploy-cloud.yml         # Deploy to managed K8s
└── tests/
    ├── integration/                 # Cross-service event flow tests
    └── contract/                    # Event schema validation tests
```

**Structure Decision**: Microservices architecture with independent
`services/` directory per service (constitution Principle VII-A).
Extends Phase IV `helm/` and `frontend/` in place. The existing
`backend/` code migrates into `services/chat-api/` to align with the
service responsibility model.

## Strategic Execution Phases

### Phase A — Baseline Consolidation (Precondition)

**Objective**: Ensure Phase IV foundations remain intact and compliant.

**Strategy**:
- Verify existing Helm charts deploy cleanly on Minikube
- Confirm frontend + backend health checks pass
- Migrate `backend/` code into `services/chat-api/` without behavior changes
- Preserve all existing API endpoints and authentication

**Traceability**: FR-018 (Phase IV backward compatibility), Constitution IV

**Exit Criteria**:
- Phase IV services deploy and pass health checks on Minikube
- No behavior regressions
- `services/chat-api/` contains all existing backend functionality

---

### Phase B — Event Backbone Enablement

**Objective**: Introduce Kafka + Redis as infrastructure via Dapr.

**Strategy**:
- Deploy Kafka (Bitnami Helm chart, single broker) in Kubernetes
- Deploy Redis (Bitnami Helm chart, standalone) in Kubernetes
- Configure Dapr Pub/Sub component (`todo-pubsub` → Kafka)
- Configure Dapr State Store component (`todo-statestore` → Redis)
- Configure Dapr Secrets component (`todo-secrets` → Kubernetes Secrets)
- Validate pub/sub at infrastructure level (test publish/subscribe)

**Traceability**: FR-007, FR-008, FR-009, Constitution V-A, VI-A, VI-B, XI

**Exit Criteria**:
- Dapr Pub/Sub operational with Kafka
- Dapr State Store operational with Redis
- Dapr Secrets operational with Kubernetes Secrets
- Test message round-trip verified
- No business logic changes yet

---

### Phase C — Service Event Alignment (US1: P1 MVP)

**Objective**: Enable event-driven task lifecycle — the core backbone.

**Strategy**:
- Extend Chat API to publish CloudEvents for all task mutations
  (TaskCreated, TaskUpdated, TaskCompleted, TaskDeleted)
- Implement event schema definitions (CloudEvents v1.0 with versioned types)
- Create Audit Service (consumes all events → immutable DB insert)
- Establish idempotency tracking via Dapr State Store
- Add Dapr sidecar annotations to all service Helm charts
- Create declarative subscriptions for each consumer service

**Traceability**: FR-001, FR-002, FR-006, FR-014, FR-015, FR-016,
FR-019, SC-001, SC-005, SC-009

**Exit Criteria**:
- All task mutations publish events
- Audit Service logs every event with zero gaps
- Idempotent event processing verified
- No service mutates core task state except Chat API

---

### Phase D — Distributed State & Temporal Logic (US2: P2, US3: P3)

**Objective**: Enable reliable reminders and recurring tasks.

**Strategy**:
- Implement Notification Service (consumes ReminderScheduled events)
- Use Dapr Jobs API for scheduling reminders at exact times
- Implement reminder delivery via event → WebSocket Service
- Implement Recurring Task Service (consumes TaskCompleted events)
- Generate next task instances with idempotent de-duplication
- Support recurrence end conditions (end-after-N, end-by-date)
  per clarification Q2

**Traceability**: FR-003, FR-004, FR-016, FR-017, SC-002, SC-004,
SC-008, Clarification Q1 (WebSocket delivery), Clarification Q2
(recurrence termination)

**Exit Criteria**:
- Reminders fire within 5 seconds of scheduled time
- Reminders deliver via in-app WebSocket push
- Offline reminders queued and delivered on reconnection
- Recurring tasks generate correctly with termination conditions
- All temporal operations survive service restarts

---

### Phase E — Real-Time Sync & Observability (US4: P4, US6: P6)

**Objective**: Real-time client synchronization and system observability.

**Strategy**:
- Implement WebSocket Service (consumes task + reminder events)
- Push updates to connected clients via FastAPI WebSocket
- Track connections via Dapr State Store
- Handle client disconnection/reconnection with missed-event replay
- Add centralized logging across all services
- Configure Kubernetes liveness/readiness probes for all services
- Add Kafka topic visibility (consumer lag monitoring)

**Traceability**: FR-005, FR-012, FR-013, SC-003, SC-008, SC-011,
Clarification Q3 (100 events/sec throughput)

**Exit Criteria**:
- Connected clients see updates within 2 seconds
- Disconnected clients receive missed updates on reconnection
- All services have health endpoints
- Centralized logging operational
- 100 events/second sustained without backlog

---

### Phase F — CI/CD & Multi-Environment Promotion (US5: P5)

**Objective**: Deterministic CI/CD pipeline and portable deployment.

**Strategy**:
- Create GitHub Actions workflow for build → test → package
- Build all service images in single pipeline run
- Package Helm charts with image references
- Create Minikube deployment workflow (local validation)
- Create cloud deployment workflow (artifact promotion)
- Verify same artifacts pass tests in both environments

**Traceability**: FR-010, FR-011, SC-006, SC-007, Constitution IX-A,
IX-B, VIII-A, VIII-B

**Exit Criteria**:
- Pipeline builds, tests, and packages all services
- Same artifacts deploy to Minikube and cloud
- No manual deployment steps
- No environment-specific code paths

## Event Topology

```
User ─→ Frontend ─→ (Dapr Service Invocation) ─→ Chat API
                                                      │
                                        ┌──── Publish ────┐
                                        ▼                  ▼
                                   task-events      reminder-events
                                        │                  │
                    ┌───────────────────┼──────────┐       │
                    ▼                   ▼          ▼       ▼
              Audit Service    WebSocket Svc   Recurring  Notification
                    │               │          Task Svc      Svc
                    ▼               ▼              │          │
              Immutable Log   Client Push          │      Dapr Jobs
                                                   ▼          │
                                           recurring-events   ▼
                                                   │     WebSocket Svc
                                                   ▼          │
                                             Audit Service    ▼
                                                         Client Push
```

## Risk Control

| Risk | Mitigation | Constitution Ref |
|------|-----------|-----------------|
| Event duplication | Idempotent consumers + Dapr State Store tracking | FR-016, V-B |
| Consumer lag | 100 evt/sec target; monitor via Kafka consumer groups | SC-011, X |
| Schema drift | Versioned CloudEvents types; no silent changes | FR-019, V-C |
| State coupling | All state via Dapr State Store/DB; no in-memory auth state | VII-B, FR-015 |
| Reminder loss | Dapr Jobs API persisted by Scheduler; restart-safe | FR-003, FR-017 |
| Offline user | Reminder queue in Dapr State Store; deliver on reconnect | Clarification Q1 |

## Complexity Tracking

No constitution violations detected. No complexity justifications required.

---

**Plan Status**: Complete — ready for `/sp.tasks` decomposition.
