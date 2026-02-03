# phase5-todo-app Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-03

## Active Technologies

- Python 3.11+ (backend services), TypeScript 5+ / Node.js 18+ (frontend)
- Apache Kafka (event backbone, via Dapr Pub/Sub)
- Dapr (distributed application runtime — Pub/Sub, State, Service Invocation, Jobs, Secrets)
- Redis (state store, via Dapr State Store)
- Kubernetes + Helm 3 (orchestration)
- GitHub Actions (CI/CD)
- FastAPI (all Python services)
- SQLModel + PostgreSQL (Chat API persistence)

## Project Structure

```text
services/
  chat-api/          # Intent resolution + event publishing
  notification/      # Reminder delivery
  recurring-task/    # Recurring task generation
  audit/             # Immutable event log
  websocket/         # Real-time client sync
frontend/            # Next.js 15 App Router
helm/todo-app/       # Umbrella Helm chart
dapr/components/     # Dapr component definitions
.github/workflows/   # CI/CD pipelines
tests/
```

## Commands

cd services/chat-api/src; pytest; ruff check .

## Code Style

Python 3.11+ (services), TypeScript 5+ (frontend): Follow standard conventions.
All inter-service communication via Dapr HTTP API. No direct Kafka/Redis clients.

## Recent Changes

- 005-phase5-event-driven: Event-driven architecture with Kafka, Dapr, K8s
- 002-phase2-fullstack-todo: Added Python 3.11+ (backend), TypeScript 5+ / Node.js 18+ (frontend)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
