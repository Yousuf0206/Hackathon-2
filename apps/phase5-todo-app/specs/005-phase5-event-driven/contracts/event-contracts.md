# Event Contracts: Phase V — Event-Driven Architecture

**Feature Branch**: `005-phase5-event-driven`
**Date**: 2026-02-03

## Contract Rules

1. All events use CloudEvents v1.0 envelope
2. Event types follow: `com.todo.<domain>.<action>.v<N>`
3. All payloads are JSON (`application/json`)
4. Event IDs are UUIDv4
5. Timestamps are ISO 8601 with timezone
6. Schema changes require version increment (new type string)

## Producer → Consumer Matrix

| Event Type | Producer | Consumers |
|------------|----------|-----------|
| com.todo.task.created.v1 | Chat API | Audit, WebSocket |
| com.todo.task.updated.v1 | Chat API | Audit, WebSocket |
| com.todo.task.completed.v1 | Chat API | Audit, WebSocket, Recurring Task |
| com.todo.task.deleted.v1 | Chat API | Audit, WebSocket, Notification (cancel) |
| com.todo.reminder.scheduled.v1 | Chat API | Notification, Audit |
| com.todo.reminder.triggered.v1 | Notification | Audit, WebSocket |
| com.todo.reminder.delivered.v1 | Notification | Audit |
| com.todo.reminder.failed.v1 | Notification | Audit |
| com.todo.recurring.generated.v1 | Recurring Task | Audit |

## Topic → Event Type Mapping

| Kafka Topic | Event Types |
|-------------|-------------|
| task-events | task.created.v1, task.updated.v1, task.completed.v1, task.deleted.v1 |
| reminder-events | reminder.scheduled.v1, reminder.triggered.v1, reminder.delivered.v1, reminder.failed.v1 |
| recurring-events | recurring.generated.v1 |

## Dapr Pub/Sub Component Contract

**Component Name**: `todo-pubsub`
**Type**: `pubsub.kafka`

### Publish (HTTP)

```
POST http://localhost:3500/v1.0/publish/todo-pubsub/<topic>
Content-Type: application/cloudevents+json

{CloudEvents envelope}
```

### Subscribe (Declarative YAML)

```yaml
apiVersion: dapr.io/v2alpha1
kind: Subscription
metadata:
  name: <service>-<topic>-sub
spec:
  topic: <topic>
  routes:
    default: /events/<topic>
  pubsubname: todo-pubsub
scopes:
  - <service-app-id>
```

## Dapr Service Invocation Contract

### Frontend → Chat API

```
POST http://localhost:3500/v1.0/invoke/chat-api/method/api/chat
Authorization: Bearer <jwt>
Content-Type: application/json

{"message": "string"}
```

## Dapr State Store Contract

**Component Name**: `todo-statestore`
**Type**: `state.redis`

### Save State

```
POST http://localhost:3500/v1.0/state/todo-statestore
Content-Type: application/json

[{"key": "<key>", "value": <value>}]
```

### Get State

```
GET http://localhost:3500/v1.0/state/todo-statestore/<key>
```

## Dapr Jobs API Contract

### Schedule Reminder

```
POST http://localhost:3500/v1.0-alpha1/jobs/reminder-<reminder_id>
Content-Type: application/json

{
  "dueTime": "<ISO8601>",
  "data": {
    "reminder_id": "<uuid>",
    "task_id": "<uuid>",
    "user_id": "<uuid>"
  }
}
```

### Schedule Recurring Trigger

```
POST http://localhost:3500/v1.0-alpha1/jobs/recurring-<rule_id>
Content-Type: application/json

{
  "schedule": "@every 24h",
  "data": {
    "recurrence_rule_id": "<uuid>",
    "task_id": "<uuid>",
    "user_id": "<uuid>"
  }
}
```

### Cancel Job

```
DELETE http://localhost:3500/v1.0-alpha1/jobs/<job-name>
```

## Dapr Secrets Contract

**Component Name**: `todo-secrets`

### Get Secret

```
GET http://localhost:3500/v1.0/secrets/todo-secrets/<secret-name>
```

### Required Secrets

| Secret Name | Used By | Purpose |
|-------------|---------|---------|
| database-url | Chat API | PostgreSQL connection |
| better-auth-secret | Chat API, Frontend | JWT signing |
| deepseek-api-key | Chat API | AI model access |

## Health Endpoint Contract

All services MUST expose:

```
GET /health
Response: 200 OK
Body: {"status": "healthy", "service": "<name>", "version": "<semver>"}
```

Kubernetes probes:
- Liveness: `GET /health` (period: 10s, threshold: 3)
- Readiness: `GET /health` (period: 5s, threshold: 1)
