# Phase IV — Cloud-Native Todo AI Chatbot (Kubernetes + Helm)

Containerized the Phase III todo app and deployed it to Kubernetes using Helm charts. Added date/time-aware tasks and task state pages for filtering by status.

## What's New in Phase 4

Everything from Phase 3 (AI chat, MCP tools, authentication, CRUD) plus:

- **Docker Containerization** — multi-stage builds for both frontend and backend
- **Kubernetes Deployment** — runs on Minikube (local) or any managed K8s cluster
- **Helm Charts** — umbrella chart with subcharts; single `helm install` deploys everything
- **Date/Time Tasks** — optional `due_date` and `due_time` fields on tasks
- **Task State Pages** — 4 views: All, Pending, Completed, Summary
- **Health Probes** — liveness and readiness checks on `/health` endpoints

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Sign in |
| `/register` | Create account |
| `/todos` | All tasks (sorted by last updated) |
| `/todos/pending` | **NEW** — Pending tasks only |
| `/todos/completed` | **NEW** — Completed tasks only |
| `/todos/summary` | **NEW** — Statistics (total, pending, completed counts) |
| `/chat` | AI chat interface |

## Task Model (Extended)

Tasks now support optional scheduling:

| Field | Type | Description |
|-------|------|-------------|
| title | string | Task title (required, 1-500 chars) |
| description | string | Optional description (0-5000 chars) |
| completed | boolean | Completion status |
| due_date | date | Optional due date (YYYY-MM-DD) |
| due_time | string | Optional due time (HH:MM, 24-hour) |
| created_at | datetime | Creation timestamp |
| updated_at | datetime | Last update timestamp |

The AI agent handles temporal expressions:
- *"Add meeting tomorrow at 3pm"* → `due_date: 2026-02-05, due_time: 15:00`
- *"Remind me to call dentist next Monday"* → `due_date: 2026-02-09`

## Tech Stack

### Inherited from Phase 3
- **Frontend:** Next.js 15+, TypeScript 5+, React 18+, Better Auth
- **Backend:** FastAPI, SQLModel, PostgreSQL/SQLite, JWT auth
- **AI:** OpenAI Agents SDK, MCP tools, DeepSeek API

### New in Phase 4
- **Containers:** Docker with multi-stage builds
- **Orchestration:** Kubernetes (Minikube for local, extensible to cloud)
- **Packaging:** Helm 3 umbrella chart with frontend + backend subcharts
- **Health Checks:** `/health` endpoints with liveness/readiness probes

## Project Structure

```
phase4-todo-app/
├── backend/
│   ├── src/
│   │   ├── api/              # REST endpoints (tasks now include date/time)
│   │   ├── agent/            # AI agent logic
│   │   ├── mcp/              # MCP tool definitions
│   │   ├── auth/             # JWT utilities
│   │   ├── models/           # Database models (Task extended)
│   │   └── main.py
│   ├── migrations/
│   ├── Dockerfile            # Multi-stage Python build
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── todos/        # All tasks
│   │   │   │   ├── pending/  # Pending filter (NEW)
│   │   │   │   ├── completed/# Completed filter (NEW)
│   │   │   │   └── summary/  # Statistics (NEW)
│   │   │   ├── chat/         # AI chat
│   │   │   ├── login/
│   │   │   └── register/
│   │   └── components/
│   ├── Dockerfile            # Multi-stage Node build
│   └── package.json
│
├── helm/
│   └── todo-app/             # Umbrella Helm chart
│       ├── Chart.yaml        # Chart metadata + dependencies
│       ├── values.yaml       # Default values
│       ├── values-local.yaml # Minikube overrides
│       ├── values-cloud.yaml # Production overrides
│       └── charts/
│           ├── backend/      # Backend subchart
│           └── frontend/     # Frontend subchart
│
├── specs/
│   ├── 002-phase2-fullstack-todo/
│   ├── 003-phase3-ai-chatbot/
│   └── 004-phase4-k8s-todo/     # Phase 4 spec
│
├── docker-compose.yml
└── README.md
```

## Quick Start

### Option 1: Docker Compose (Local Development)

```bash
docker compose up --build -d
```

- **Frontend:** http://localhost:3002
- **Backend:** http://localhost:8000

### Option 2: Kubernetes (Minikube)

```bash
# Start Minikube
minikube start --driver=docker

# Build images in Minikube's Docker
eval $(minikube docker-env)
docker build -t todo-backend:latest backend/
docker build -t todo-frontend:latest frontend/

# Deploy with Helm
helm dependency update helm/todo-app
helm install todo-app helm/todo-app -f helm/todo-app/values-local.yaml

# Check status
kubectl get pods
```

### Option 3: Cloud Kubernetes

```bash
# Point kubectl at your cluster, then:
helm upgrade --install todo-app helm/todo-app \
  -f helm/todo-app/values-cloud.yaml \
  --set backend.image.tag=<sha> \
  --set frontend.image.tag=<sha>
```

### Environment Variables

```env
DATABASE_URL=sqlite:///./todo_app.db
BETTER_AUTH_SECRET=supersecretkeyfordevelopment
DEEPSEEK_API_KEY=your-api-key   # optional, enables AI chat
```

## Helm Chart Configuration

### values-local.yaml (Minikube)
- Single replica per service
- `imagePullPolicy: Never` (use locally built images)
- No persistent storage

### values-cloud.yaml (Production)
- Multiple replicas for high availability
- `imagePullPolicy: Always` (pull from registry)
- Persistent storage enabled

### Deploying

```bash
# Install
helm install todo-app helm/todo-app -f helm/todo-app/values-local.yaml

# Upgrade
helm upgrade todo-app helm/todo-app -f helm/todo-app/values-local.yaml

# Uninstall
helm uninstall todo-app
```

## What Changed from Phase 3

| Aspect | Phase 3 | Phase 4 |
|--------|---------|---------|
| Deployment | Docker Compose only | Docker Compose + Kubernetes + Helm |
| Task Model | title, description, completed | + due_date, due_time |
| Task Views | Single todo list | 4 views (all, pending, completed, summary) |
| Container Images | None | Multi-stage Docker builds |
| Health Monitoring | None | Liveness + readiness probes on /health |
| Configuration | .env files | Helm values (parameterized) |
| Scaling | Single instance | Configurable replica counts |

## API Endpoints

All endpoints from Phase 2/3 plus updated task endpoints:

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/tasks` | List tasks (with counts) |
| POST | `/api/tasks` | Create task (now with due_date, due_time) |
| PUT | `/api/tasks/{id}` | Update task |
| PATCH | `/api/tasks/{id}/complete` | Toggle completion |
| DELETE | `/api/tasks/{id}` | Delete task |
| POST | `/api/chat` | AI chat |
| GET | `/health` | Health check |

## Documentation

- **Phase 4 Spec:** `specs/004-phase4-k8s-todo/spec.md`
- **Phase 4 Plan:** `specs/004-phase4-k8s-todo/plan.md`
- **Phase 3 Spec:** `specs/003-phase3-ai-chatbot/spec.md`
- **Phase 2 Spec:** `specs/002-phase2-fullstack-todo/spec.md`
