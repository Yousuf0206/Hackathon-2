# Hackathon 2 — The Evolution of ToDo

A progressive architecture demonstration showing how a simple todo application evolves from an in-memory CLI tool into a fully event-driven, cloud-native distributed system across 5 phases.

## The 5 Phases

```
Phase 1          Phase 2            Phase 3             Phase 4              Phase 5
CLI App    →   Web App       →   AI Chatbot     →   Kubernetes      →   Event-Driven
(Python)       (Next.js +        (+ MCP +            (+ Docker +         (+ Kafka +
               FastAPI)          OpenAI Agents)       Helm charts)        Dapr + 5
                                                                          microservices)
```

| Phase | Name | Architecture | Key Addition |
|-------|------|-------------|-------------|
| **1** | CLI Todo App | In-memory Python console | Spec-driven development, 68 unit tests |
| **2** | Full-Stack Web App | Next.js + FastAPI + PostgreSQL | JWT auth, CRUD, user isolation |
| **3** | AI Chatbot | + OpenAI Agents + MCP | Natural language task management |
| **4** | Cloud-Native K8s | + Docker + Helm | Containerization, date/time tasks, task views |
| **5** | Event-Driven | + Kafka + Dapr + 5 services | Recurring tasks, reminders, audit, real-time sync |

Each phase builds on the previous one. The code in each directory is self-contained and runnable independently.

## Directory Structure

```
Hackathon 2/
├── apps/
│   ├── phase1-cli/            # Python CLI todo app (in-memory)
│   ├── phase2/                # Full-stack web app (Next.js + FastAPI)
│   ├── phase3-todo-app/       # + AI chatbot (MCP + Agents)
│   ├── phase4-todo-app/       # + Kubernetes deployment (Helm)
│   └── phase5-todo-app/       # + Event-driven microservices (Kafka + Dapr)
│
├── specs/                     # Shared specifications
│   ├── 001-phase4-k8s-todo/
│   └── 005-phase5-event-driven/
│
├── TROUBLESHOOTING.md         # Common issues and fixes
└── README.md                  # This file
```

## Quick Reference

### Phase 1 — CLI App

```bash
cd apps/phase1-cli
uv sync
uv run python src/main.py
```

No external dependencies. Python 3.13+. In-memory only (no persistence).

---

### Phase 2 — Web App

```bash
cd apps/phase2
docker compose up --build
```

- **Frontend:** http://localhost:3002
- **Backend:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

Register an account, log in, create/edit/complete/delete todos.

---

### Phase 3 — AI Chatbot

```bash
cd apps/phase3-todo-app
docker compose up --build
```

Same as Phase 2, plus:
- **Chat:** http://localhost:3002/chat — manage tasks with natural language

Requires `DEEPSEEK_API_KEY` in `.env` to enable AI chat.

---

### Phase 4 — Kubernetes

```bash
cd apps/phase4-todo-app

# Docker Compose (local)
docker compose up --build

# OR Kubernetes (Minikube)
minikube start --driver=docker
eval $(minikube docker-env)
docker build -t todo-backend:latest backend/
docker build -t todo-frontend:latest frontend/
helm install todo-app helm/todo-app -f helm/todo-app/values-local.yaml
```

Same as Phase 3, plus:
- Date/time-aware tasks
- Task filter pages: `/todos/pending`, `/todos/completed`, `/todos/summary`

---

### Phase 5 — Event-Driven Microservices

```bash
cd apps/phase5-todo-app
docker compose up --build -d
```

- **Frontend:** http://localhost:3002
- **Backend API:** http://localhost:8000
- **Health Check:** http://localhost:8000/health

For the full 5-service deployment on Kubernetes:
```bash
minikube start --driver=docker
dapr init -k --wait
# Build images, apply Dapr components, helm install
# See apps/phase5-todo-app/README.md for full instructions
```

5 microservices communicating via Kafka events through Dapr:
- Chat API (8000) — CRUD + event publishing
- Notification (8001) — reminder scheduling
- Recurring Task (8002) — auto-generates next task on completion
- Audit (8003) — immutable event log
- WebSocket (8004) — real-time browser push

## Technology Evolution

| Technology | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 |
|-----------|---------|---------|---------|---------|---------|
| Python | CLI | FastAPI backend | FastAPI backend | FastAPI backend | 5 FastAPI services |
| Next.js | - | Frontend | Frontend + chat | Frontend + views | Frontend + WebSocket |
| Database | In-memory | PostgreSQL/SQLite | PostgreSQL/SQLite | PostgreSQL/SQLite | PostgreSQL/SQLite |
| Auth | - | JWT + Better Auth | JWT + Better Auth | JWT + Better Auth | JWT + Better Auth |
| AI | - | - | OpenAI Agents + MCP | OpenAI Agents + MCP | OpenAI Agents + MCP |
| Containers | - | Docker Compose | Docker Compose | Docker + K8s + Helm | Docker + K8s + Helm |
| Events | - | - | - | - | Kafka via Dapr |
| State Store | - | - | - | - | Redis via Dapr |
| CI/CD | - | - | - | - | GitHub Actions |

## Detailed Documentation

Each phase has its own README with full setup instructions, architecture details, and API documentation:

- [Phase 1 README](apps/phase1-cli/README.md) — CLI app, commands, architecture, tests
- [Phase 2 README](apps/phase2/README.md) — Web app, API docs, auth, troubleshooting
- [Phase 3 README](apps/phase3-todo-app/README.md) — AI chat, MCP tools, agent guardrails
- [Phase 4 README](apps/phase4-todo-app/README.md) — Docker, Helm, K8s deployment, date/time tasks
- [Phase 5 README](apps/phase5-todo-app/README.md) — Event-driven architecture, Kafka, Dapr, CI/CD

## Troubleshooting

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues including:
- Docker Desktop not running
- Python version compatibility
- Port conflicts
- Authentication secret mismatches
