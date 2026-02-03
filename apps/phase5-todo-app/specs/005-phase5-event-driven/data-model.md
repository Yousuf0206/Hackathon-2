# Data Model: Phase V — Event-Driven Cloud Architecture

**Feature Branch**: `005-phase5-event-driven`
**Date**: 2026-02-03

## Entities

### Task (Extended from Phase IV)

Existing Phase IV entity with new fields for Phase V.

| Field | Type | Constraints | Notes |
|-------|------|------------|-------|
| id | UUID | PK, auto-generated | Existing |
| user_id | UUID | FK → User, NOT NULL | Existing |
| title | string | max 500 chars, NOT NULL | Existing |
| description | string | max 5000 chars, nullable | Existing |
| status | enum | pending/completed/deleted | Existing (was boolean) |
| due_date | datetime | nullable | New in Phase V |
| reminder_time | datetime | nullable | New in Phase V |
| recurrence_rule_id | UUID | FK → RecurrenceRule, nullable | New in Phase V |
| created_at | datetime | auto-set | Existing |
| updated_at | datetime | auto-set | Existing |

**State Transitions**:
- `pending` → `completed` (via TaskCompleted event)
- `pending` → `deleted` (via TaskDeleted event)
- `completed` → `deleted` (via TaskDeleted event)

### RecurrenceRule

| Field | Type | Constraints | Notes |
|-------|------|------------|-------|
| id | UUID | PK, auto-generated | |
| task_id | UUID | FK → Task, NOT NULL | Origin task |
| frequency | enum | daily/weekly/monthly | |
| end_after_count | integer | nullable | Max occurrences |
| end_by_date | datetime | nullable | Expiration date |
| occurrences_generated | integer | default 0 | Counter |
| is_active | boolean | default true | False when terminated |
| created_at | datetime | auto-set | |

**Termination Logic**:
- If `end_after_count` is set and `occurrences_generated >= end_after_count` → `is_active = false`
- If `end_by_date` is set and `now >= end_by_date` → `is_active = false`
- If neither is set → indefinite (always active)

### Reminder

| Field | Type | Constraints | Notes |
|-------|------|------------|-------|
| id | UUID | PK, auto-generated | |
| task_id | UUID | FK → Task, NOT NULL | |
| user_id | UUID | FK → User, NOT NULL | |
| trigger_time | datetime | NOT NULL | When to fire |
| status | enum | pending/delivered/failed | |
| dapr_job_name | string | unique, NOT NULL | Jobs API reference |
| delivered_at | datetime | nullable | Actual delivery time |
| created_at | datetime | auto-set | |

**State Transitions**:
- `pending` → `delivered` (via ReminderDelivered event)
- `pending` → `failed` (via ReminderFailed event)

### AuditEntry

| Field | Type | Constraints | Notes |
|-------|------|------------|-------|
| id | UUID | PK, auto-generated | |
| event_type | string | NOT NULL | e.g., com.todo.task.created.v1 |
| event_id | string | NOT NULL, unique | CloudEvents ID |
| source | string | NOT NULL | Originating service |
| actor_id | UUID | nullable | User who triggered |
| payload | JSON | NOT NULL | Full event data |
| timestamp | datetime | NOT NULL | Event timestamp |
| received_at | datetime | auto-set | Processing time |

**Immutability**: INSERT only. No UPDATE or DELETE permitted.

## Domain Events (CloudEvents Format)

### Task Lifecycle Events (Topic: `task-events`)

#### TaskCreated.v1

```json
{
  "specversion": "1.0",
  "type": "com.todo.task.created.v1",
  "source": "chat-api",
  "id": "<uuid>",
  "time": "<ISO8601>",
  "datacontenttype": "application/json",
  "data": {
    "task_id": "<uuid>",
    "user_id": "<uuid>",
    "title": "string",
    "description": "string|null",
    "due_date": "ISO8601|null",
    "reminder_time": "ISO8601|null",
    "recurrence_rule": {
      "frequency": "daily|weekly|monthly",
      "end_after_count": "integer|null",
      "end_by_date": "ISO8601|null"
    }
  }
}
```

#### TaskUpdated.v1

```json
{
  "specversion": "1.0",
  "type": "com.todo.task.updated.v1",
  "source": "chat-api",
  "id": "<uuid>",
  "time": "<ISO8601>",
  "datacontenttype": "application/json",
  "data": {
    "task_id": "<uuid>",
    "user_id": "<uuid>",
    "changes": {
      "title": "string|null",
      "description": "string|null",
      "due_date": "ISO8601|null",
      "reminder_time": "ISO8601|null"
    }
  }
}
```

#### TaskCompleted.v1

```json
{
  "specversion": "1.0",
  "type": "com.todo.task.completed.v1",
  "source": "chat-api",
  "id": "<uuid>",
  "time": "<ISO8601>",
  "datacontenttype": "application/json",
  "data": {
    "task_id": "<uuid>",
    "user_id": "<uuid>",
    "had_recurrence_rule": true,
    "recurrence_rule_id": "<uuid>|null"
  }
}
```

#### TaskDeleted.v1

```json
{
  "specversion": "1.0",
  "type": "com.todo.task.deleted.v1",
  "source": "chat-api",
  "id": "<uuid>",
  "time": "<ISO8601>",
  "datacontenttype": "application/json",
  "data": {
    "task_id": "<uuid>",
    "user_id": "<uuid>"
  }
}
```

### Reminder Events (Topic: `reminder-events`)

#### ReminderScheduled.v1

```json
{
  "specversion": "1.0",
  "type": "com.todo.reminder.scheduled.v1",
  "source": "chat-api",
  "id": "<uuid>",
  "time": "<ISO8601>",
  "datacontenttype": "application/json",
  "data": {
    "reminder_id": "<uuid>",
    "task_id": "<uuid>",
    "user_id": "<uuid>",
    "trigger_time": "ISO8601"
  }
}
```

#### ReminderTriggered.v1

```json
{
  "specversion": "1.0",
  "type": "com.todo.reminder.triggered.v1",
  "source": "notification-service",
  "id": "<uuid>",
  "time": "<ISO8601>",
  "datacontenttype": "application/json",
  "data": {
    "reminder_id": "<uuid>",
    "task_id": "<uuid>",
    "user_id": "<uuid>"
  }
}
```

#### ReminderDelivered.v1

```json
{
  "specversion": "1.0",
  "type": "com.todo.reminder.delivered.v1",
  "source": "notification-service",
  "id": "<uuid>",
  "time": "<ISO8601>",
  "datacontenttype": "application/json",
  "data": {
    "reminder_id": "<uuid>",
    "task_id": "<uuid>",
    "user_id": "<uuid>",
    "delivered_via": "websocket"
  }
}
```

#### ReminderFailed.v1

```json
{
  "specversion": "1.0",
  "type": "com.todo.reminder.failed.v1",
  "source": "notification-service",
  "id": "<uuid>",
  "time": "<ISO8601>",
  "datacontenttype": "application/json",
  "data": {
    "reminder_id": "<uuid>",
    "task_id": "<uuid>",
    "user_id": "<uuid>",
    "reason": "string"
  }
}
```

### Recurring Events (Topic: `recurring-events`)

#### RecurringTaskGenerated.v1

```json
{
  "specversion": "1.0",
  "type": "com.todo.recurring.generated.v1",
  "source": "recurring-task-service",
  "id": "<uuid>",
  "time": "<ISO8601>",
  "datacontenttype": "application/json",
  "data": {
    "original_task_id": "<uuid>",
    "new_task_id": "<uuid>",
    "user_id": "<uuid>",
    "recurrence_rule_id": "<uuid>",
    "occurrence_number": "integer"
  }
}
```

## Dapr State Store Keys

### Idempotency Tracking

Key pattern: `idempotency:{service}:{event_id}`
Value: `{"processed_at": "ISO8601"}`
TTL: 24 hours

### Reminder Queue (Offline Users)

Key pattern: `reminder-queue:{user_id}`
Value: `[{"reminder_id": "uuid", "task_id": "uuid", "triggered_at": "ISO8601"}]`

### WebSocket Connections

Key pattern: `ws-connections:{user_id}`
Value: `{"service_instance": "string", "connected_at": "ISO8601"}`

## Kafka Topic Configuration

| Topic | Partitions | Retention | Consumers |
|-------|-----------|-----------|-----------|
| task-events | 3 | 7 days | Audit, WebSocket, Recurring Task |
| reminder-events | 2 | 3 days | Audit, WebSocket |
| recurring-events | 2 | 3 days | Audit |
