# The Evolution of ToDo

A hackathon project demonstrating how a simple todo app progressively evolves from a monolithic fullstack application into a fully event-driven, cloud-native distributed system.

## The 4 Phases

| Phase | Name | Architecture | What Changed |
|-------|------|-------------|-------------|
| **2** | Full-Stack Web App | Monolithic (2 services) | Next.js + FastAPI + PostgreSQL with JWT auth |
| **3** | AI Chatbot | Monolithic + AI layer | Natural language task management via OpenAI Agents + MCP |
| **4** | Cloud-Native K8s | Containerized on Kubernetes | Docker + Helm charts + date/time-aware tasks + task state pages |
| **5** | Event-Driven Microservices | 5 distributed services | Kafka + Dapr + recurring tasks + reminders + audit trail + real-time sync |

Each phase builds on top of the previous one. The current codebase is **Phase 5** — the most complete version containing all prior features.

---

## Architecture Overview

```
                         ┌──────────────────┐
                         │    Frontend       │
                         │    (Next.js)      │
                         │  localhost:3002   │
                         └────────┬─────────┘
                                  │ REST API
                         ┌────────▼─────────┐
                         │    Chat API       │  ← only service that writes to DB
                         │    (FastAPI)      │     and publishes events
                         │  localhost:8000   │
                         └────────┬─────────┘
                                  │ CloudEvents via Dapr
                      ┌───────────▼────────────┐
                      │    Apache Kafka         │
                      │  (via Dapr Pub/Sub)     │
                      └───┬──────┬──────┬──────┘
                          │      │      │
              ┌───────────┤      │      ├───────────┐
              │           │      │      │           │
        ┌─────▼─────┐ ┌──▼──────▼─┐ ┌──▼────────┐ ┌▼───────────┐
        │  Audit    │ │Notification│ │ Recurring │ │ WebSocket  │
        │ Service   │ │  Service   │ │   Task    │ │  Service   │
        │ Port 8003 │ │ Port 8001  │ │ Port 8002 │ │ Port 8004  │
        └───────────┘ └────────────┘ └───────────┘ └────────────┘
         Logs every     Schedules &    Auto-creates   Pushes live
         event to DB    delivers       next task on    updates to
         (immutable)    reminders      completion      browsers
```

The **Chat API** is the sole event producer. When a user creates, updates, completes, or deletes a task, it writes to the database and publishes a CloudEvent to Kafka through the Dapr sidecar. The four downstream services are pure consumers that react to events asynchronously.

---

## Services

### Chat API — `services/chat-api/` (Port 8000)

The main backend service. Handles authentication, task CRUD, AI chat, and event publishing.

**What it does:**
- User registration and login (JWT via Better Auth)
- Task create, read, update, complete, delete
- AI-powered natural language task management (DeepSeek API + MCP tools)
- Publishes CloudEvents on every task mutation

**Key endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in, get JWT |
| GET | `/api/tasks` | List tasks (with counts) |
| POST | `/api/tasks` | Create task → publishes `TaskCreated` |
| PUT | `/api/tasks/{id}` | Update task → publishes `TaskUpdated` |
| PATCH | `/api/tasks/{id}/complete` | Toggle done → publishes `TaskCompleted` |
| DELETE | `/api/tasks/{id}` | Remove task → publishes `TaskDeleted` |
| POST | `/api/chat` | AI chat (natural language task management) |
| GET | `/health` | Health check |

**Tech:** Python 3.11, FastAPI, SQLModel, PostgreSQL/SQLite

---

### Frontend — `frontend/` (Port 3002)

Next.js 15 web application with App Router. Provides the user interface for managing tasks and chatting with the AI.

**Pages:**

| Route | Description |
|-------|-------------|
| `/login` | Sign in |
| `/register` | Create account |
| `/todos` | All tasks dashboard |
| `/todos/pending` | Pending tasks only |
| `/todos/completed` | Completed tasks only |
| `/todos/summary` | Task statistics (total, pending, completed) |
| `/chat` | AI chat interface — manage tasks with natural language |

**Tech:** Next.js 15, React 18, TypeScript 5, Better Auth

---

### Audit Service — `services/audit/` (Port 8003)

Subscribes to **all three** Kafka topics. Stores every event as an immutable row in the `audit_entries` table. Events are never updated or deleted.

**Use case:** Compliance, debugging, and full event history reconstruction.

**Query endpoint:** `GET /audit?event_type=TaskCreated&user_id=123&page=1&page_size=50`

---

### Notification Service — `services/notification/` (Port 8001)

Handles reminder scheduling and delivery using the Dapr Jobs API.

**How it works:**
1. When a task has a reminder, Chat API schedules a Dapr Job with a specific trigger time
2. At the scheduled time, Dapr calls back to the Notification Service
3. The service publishes `ReminderTriggered` → `ReminderDelivered` or `ReminderFailed` events
4. When a task is deleted, it cancels any associated reminder job

---

### Recurring Task Service — `services/recurring-task/` (Port 8002)

Listens for `TaskCompleted` events. If the completed task has a recurrence rule (daily, weekly, or monthly), it automatically creates the next task instance.

**How it works:**
1. Receives `TaskCompleted` event with `had_recurrence_rule=true`
2. Looks up the recurrence rule via Dapr Service Invocation to Chat API
3. Checks termination conditions (max occurrences, end date)
4. Calculates the next due date
5. Creates a new task via Service Invocation
6. Publishes `RecurringTaskGenerated` event

---

### WebSocket Service — `services/websocket/` (Port 8004)

Pushes real-time updates to connected browser clients over WebSocket connections.

**How it works:**
1. Consumes `task-events` and `reminder-events` from Kafka
2. Looks up which users are connected
3. Sends the event data as a WebSocket message
4. Queues events for offline users and replays them on reconnect

---

## Quick Start

### Prerequisites

- Docker and Docker Compose

### Run the App

```bash
docker compose up --build -d
```

Once running:
- **Frontend:** http://localhost:3002
- **Backend API:** http://localhost:8000
- **Health check:** http://localhost:8000/health

### Verify

```bash
# Check both services are healthy
docker compose ps

# Test backend
curl http://localhost:8000/health
# → {"status":"healthy","service":"chat-api","version":"5.0.0"}
```

### Stop

```bash
docker compose down
```

### Environment Variables

The app runs with sensible defaults. To customize, create `services/chat-api/.env`:

```env
DATABASE_URL=sqlite:///./todo_app.db
BETTER_AUTH_SECRET=supersecretkeyfordevelopment
DEEPSEEK_API_KEY=your-api-key-here   # optional, enables AI chat
```

---

## Kubernetes Deployment

### Local (Minikube)

```bash
minikube start --driver=docker

# Install Dapr runtime
dapr init -k --wait

# Build all images in Minikube's Docker daemon
eval $(minikube docker-env)
docker build -t todo-chat-api:latest services/chat-api/
docker build -t todo-frontend:latest frontend/
docker build -t todo-notification:latest services/notification/
docker build -t todo-recurring-task:latest services/recurring-task/
docker build -t todo-audit:latest services/audit/
docker build -t todo-websocket:latest services/websocket/

# Apply Dapr components and subscriptions
kubectl apply -f dapr/components/
kubectl apply -f dapr/components/subscriptions/

# Deploy everything with Helm
helm dependency update helm/todo-app
helm install todo-app helm/todo-app -f helm/todo-app/values-local.yaml
```

### Cloud (Managed Kubernetes)

```bash
# Point kubectl at your cluster, then:
helm upgrade --install todo-app helm/todo-app \
  -f helm/todo-app/values-cloud.yaml \
  --set chat-api.image.tag=<git-sha> \
  --set frontend.image.tag=<git-sha> \
  --set notification.image.tag=<git-sha> \
  --set recurring-task.image.tag=<git-sha> \
  --set audit.image.tag=<git-sha> \
  --set websocket.image.tag=<git-sha>
```

Cloud values enable multiple replicas, persistent storage (Kafka 10Gi, Redis 2Gi), and image pulls from ghcr.io.

---

## Event-Driven Architecture

### Kafka Topics and Events

| Topic | Events | Who Consumes |
|-------|--------|-------------|
| `task-events` | TaskCreated, TaskUpdated, TaskCompleted, TaskDeleted | Audit, WebSocket, Recurring Task |
| `reminder-events` | ReminderScheduled, ReminderTriggered, ReminderDelivered, ReminderFailed | Audit, WebSocket, Notification |
| `recurring-events` | RecurringTaskGenerated | Audit |

### Event Flow Example

When a user completes a recurring task:

```
1. User clicks "Complete" on a daily task
2. Chat API:
   - Updates task in PostgreSQL (completed=true)
   - Publishes TaskCompleted event to Kafka
3. Kafka delivers the event to three consumers:
   a. Audit Service     → logs the event (immutable record)
   b. WebSocket Service → pushes update to the user's browser
   c. Recurring Task Service:
      - Sees had_recurrence_rule=true
      - Looks up the daily recurrence rule
      - Calculates tomorrow's date
      - Creates a new task via Chat API
      - Publishes RecurringTaskGenerated event
4. The new task appears in the user's browser via WebSocket
```

### Exactly-Once Delivery

Every consumer checks Redis (via Dapr State Store) before processing:

```
Key:   idempotency:{service-name}:{event-id}
TTL:   24 hours
```

If the key exists, the event is a duplicate and gets dropped. Otherwise, the event is processed and the key is written. This prevents duplicate processing on retries or redelivery.

### Dapr Abstraction

No service talks to Kafka or Redis directly. All communication goes through the Dapr sidecar on `localhost:3500`:

| Operation | Dapr API |
|-----------|----------|
| Publish event | `POST /v1.0/publish/todo-pubsub/{topic}` |
| Read/write state | `GET/POST /v1.0/state/todo-statestore/{key}` |
| Schedule reminder | `POST /v1.0-alpha1/jobs/{name}` |
| Call another service | `GET /v1.0/invoke/{service}/method/{path}` |

Swapping Kafka for RabbitMQ or Redis for Cosmos DB requires only changing the Dapr component YAML files — zero code changes in any service.

---

## CI/CD Pipeline

Three GitHub Actions workflows handle the full lifecycle:

```
build.yml (automatic) → deploy-local.yml (manual) → deploy-cloud.yml (manual)
```

**Build** — Triggered on push/PR to main:
1. Builds all 6 Docker images in parallel (matrix strategy)
2. Pushes to GitHub Container Registry (ghcr.io) tagged by git SHA
3. Packages the Helm chart as an artifact

**Deploy Local** — Manual trigger:
1. Starts Minikube with Dapr
2. Builds images locally
3. Deploys via Helm with `values-local.yaml`
4. Runs smoke tests (health checks on all services)

**Deploy Cloud** — Manual trigger with environment protection:
1. Configures kubectl via secrets
2. Deploys the same images (by SHA) to managed Kubernetes
3. Uses `values-cloud.yaml` (multiple replicas, persistent storage)

The same Docker images flow through all environments without rebuilding, ensuring what you test locally is what runs in production.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 18, TypeScript 5 |
| Backend Services | Python 3.11, FastAPI, SQLModel |
| Database | PostgreSQL (production) / SQLite (local dev) |
| Authentication | Better Auth + JWT |
| AI | DeepSeek API via OpenAI SDK + MCP tools |
| Event Streaming | Apache Kafka via Dapr Pub/Sub |
| State Management | Redis via Dapr State Store |
| Job Scheduling | Dapr Jobs API |
| Containers | Docker (multi-stage builds) |
| Orchestration | Kubernetes + Helm 3 |
| CI/CD | GitHub Actions |

---

## Project Structure

```
phase5-todo-app/
├── frontend/                     # Next.js 15 web application
│   ├── src/
│   │   ├── app/                 # Pages: login, register, todos, chat
│   │   ├── components/          # React components
│   │   └── library/             # API client, WebSocket client
│   └── Dockerfile
│
├── services/
│   ├── chat-api/                # Main API + event publisher
│   │   ├── src/
│   │   │   ├── api/            # REST endpoints (auth, tasks, todos, chat)
│   │   │   ├── events/         # CloudEvents schemas, publisher, idempotency
│   │   │   ├── models/         # Task, Reminder, RecurrenceRule, User, Todo
│   │   │   ├── agent/          # AI agent logic
│   │   │   └── mcp/            # MCP tool definitions
│   │   └── Dockerfile
│   ├── audit/                   # Immutable event log
│   ├── notification/            # Reminder scheduling and delivery
│   ├── recurring-task/          # Recurring task generation
│   └── websocket/               # Real-time push to browsers
│
├── dapr/
│   └── components/
│       ├── pubsub.yaml          # Kafka configuration
│       ├── statestore.yaml      # Redis configuration
│       ├── secrets.yaml         # Kubernetes secrets
│       └── subscriptions/       # Topic-to-service routing
│
├── helm/
│   └── todo-app/                # Umbrella Helm chart
│       ├── charts/             # Subcharts (one per service + Kafka + Redis)
│       ├── values.yaml         # Default values
│       ├── values-local.yaml   # Minikube overrides
│       └── values-cloud.yaml   # Production overrides
│
├── .github/
│   └── workflows/
│       ├── build.yml           # Build images + package Helm chart
│       ├── deploy-local.yml    # Deploy to Minikube
│       └── deploy-cloud.yml    # Deploy to managed K8s
│
├── specs/                       # Design specs for each phase
│   ├── 002-phase2-fullstack-todo/
│   ├── 003-phase3-ai-chatbot/
│   ├── 004-phase4-k8s-todo/
│   └── 005-phase5-event-driven/
│
├── docker-compose.yml           # Local dev: frontend + chat-api
└── README.md
```

---

## Phase-by-Phase Evolution

### Phase 2: Full-Stack Web App

Built the foundation — a multi-user todo app with secure authentication.

- **Frontend:** Next.js with login, registration, and todo dashboard pages
- **Backend:** FastAPI with JWT auth, CRUD endpoints, user data isolation
- **Database:** PostgreSQL with SQLModel ORM
- **Security:** Passwords hashed with bcrypt, JWT tokens with 24h expiry, user identity from JWT only (never from URL params)

### Phase 3: AI Chatbot

Added a natural language interface so users can manage tasks by chatting.

- **AI Agent:** OpenAI Agents SDK maps user intent to MCP tools
- **MCP Tools:** `add_task`, `list_tasks`, `complete_task`, `delete_task`, `update_task` — the agent cannot bypass these
- **Chat UI:** Integrated chat panel on the frontend
- **Stateless:** Conversation history stored in PostgreSQL, reconstructed per request

Example: *"Add buy groceries for tomorrow"* → agent calls `add_task(title="Buy groceries", due_date="2026-02-04")`

### Phase 4: Cloud-Native on Kubernetes

Containerized the app and deployed it to Kubernetes using Helm.

- **Docker:** Multi-stage builds for minimal production images
- **Helm:** Umbrella chart with frontend and backend subcharts — single `helm install` deploys everything
- **Date/Time Tasks:** Extended Task model with optional `due_date` and `due_time` fields
- **Task Pages:** 4 views — All Tasks, Pending, Completed, Summary
- **Health Probes:** Liveness and readiness checks on `/health`

### Phase 5: Event-Driven Microservices

Split into 5 services communicating through Kafka events, abstracted by Dapr.

- **5 Services:** Chat API, Audit, Notification, Recurring Task, WebSocket
- **Kafka:** 3 topics (task-events, reminder-events, recurring-events)
- **Dapr:** Pub/Sub, State Store, Jobs API, Service Invocation, Secrets
- **Recurring Tasks:** Complete a daily task → next instance auto-created
- **Reminders:** Scheduled via Dapr Jobs, delivered via WebSocket
- **Audit Trail:** Every event logged immutably
- **Real-Time:** WebSocket push to connected clients within 2 seconds
- **CI/CD:** GitHub Actions for automated build, test, and deploy
