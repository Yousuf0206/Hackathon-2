# Research: Phase V — Event-Driven Cloud Architecture

**Feature Branch**: `005-phase5-event-driven`
**Date**: 2026-02-03

## R1: Dapr Pub/Sub with Kafka for Python/FastAPI Services

**Decision**: Use Dapr HTTP pub/sub API with declarative YAML subscriptions.

**Rationale**: Dapr provides two subscription models — programmatic (via
`/dapr/subscribe` endpoint) and declarative (via YAML component files).
Declarative subscriptions are preferred because they keep subscription
configuration outside application code, align with the constitution's
Dapr Supremacy Law, and enable Helm-managed configuration.

For Python services, each service exposes an HTTP POST endpoint matching
the subscription route. Dapr delivers CloudEvents to these endpoints.
Services respond with 200 (success), 404 (drop), or error (retry).

**Alternatives Considered**:
- Direct Kafka client (confluent-kafka-python): Forbidden by
  Constitution Principle VI-A (Dapr Sidecar Mandate)
- Dapr Python gRPC SDK (`dapr.ext.grpc`): Adds complexity; HTTP API
  is simpler and sufficient for our throughput target (100 events/sec)
- Programmatic subscriptions: Works but mixes infrastructure concerns
  into application code

## R2: Dapr Jobs API for Reminders and Recurring Triggers

**Decision**: Use Dapr Jobs API (v1.0-alpha1) via HTTP for scheduling
reminders and recurring task triggers.

**Rationale**: The Dapr Jobs API supports:
- One-shot jobs via `dueTime` (for reminders at specific times)
- Recurring jobs via `schedule` (cron expressions) or `@every` notation
- Repeat limits via `repeats` parameter
- TTL-based expiration via `ttl` parameter
- Job data payload for context

Jobs are persisted by the Dapr Scheduler control plane service, making
them restart-safe. When a job triggers, Dapr sends an HTTP callback to
the owning service.

**Key API**:
- `POST /v1.0-alpha1/jobs/<name>` — Schedule a job
- `GET /v1.0-alpha1/jobs/<name>` — Get job status
- `DELETE /v1.0-alpha1/jobs/<name>` — Cancel a job

**Alternatives Considered**:
- Database polling with cron: Forbidden by Constitution Principle XII
  (Forbidden Practices)
- APScheduler (Python): Direct library usage; bypasses Dapr abstraction
- Celery + Redis: Adds infrastructure not mandated by constitution;
  Dapr Jobs API is the designated building block

## R3: Dapr State Store for Non-Ephemeral State

**Decision**: Use Dapr State Store API with Redis as the backing store.

**Rationale**: Redis provides fast key-value access suitable for:
- Idempotency tracking (event ID → processed flag)
- Reminder delivery status
- Recurring task generation tracking (last generated instance)
- WebSocket session state (connected user → connection mapping)

The Dapr State Store API (`/v1.0/state/<store>`) provides GET, POST,
and DELETE operations with optional ETags for optimistic concurrency.

**Configuration**: Redis deployed as a Kubernetes pod alongside Kafka.
Dapr component YAML configures the state store.

**Alternatives Considered**:
- PostgreSQL as state store: Already used for task data; using it for
  distributed state creates coupling. Redis is better for ephemeral
  operational state
- In-memory state: Forbidden by Constitution Principle VII-B (Stateless
  Service Law)

## R4: Kafka Deployment Strategy in Kubernetes

**Decision**: Deploy Strimzi Kafka operator or Bitnami Kafka Helm chart
in Minikube; use managed Kafka (Confluent Cloud, Event Hubs) for cloud.

**Rationale**: For local development (Minikube), Bitnami Kafka Helm
chart provides a lightweight single-broker Kafka deployment. For cloud
environments, managed Kafka services reduce operational burden.

Dapr Pub/Sub component YAML abstracts the difference — only metadata
(broker address) changes between environments, fulfilling the Cloud
Neutrality Law (Constitution Principle VIII-B).

**Topic Design**:
- `task-events` — TaskCreated, TaskUpdated, TaskCompleted, TaskDeleted
- `reminder-events` — ReminderScheduled, ReminderTriggered,
  ReminderDelivered, ReminderFailed
- `recurring-events` — RecurringRuleDefined, RecurringTaskGenerated

**Alternatives Considered**:
- Redpanda: Compatible but less ecosystem support in Helm
- RabbitMQ: Not Kafka-compatible; constitution mandates Kafka
- Single topic for all events: Poor consumer isolation; multi-topic
  enables independent scaling per concern

## R5: WebSocket Service Architecture

**Decision**: Standalone Python service using FastAPI WebSocket support,
subscribing to Dapr pub/sub topics for task and reminder events.

**Rationale**: The WebSocket service consumes events from Dapr pub/sub
and pushes them to connected clients. It maintains a mapping of
authenticated user IDs to WebSocket connections using Dapr State Store.

Reminder delivery (clarification Q1) routes through the WebSocket
channel — the Notification Service publishes to the WebSocket Service
via events, and the WebSocket Service delivers to the client.

For offline users (no active WebSocket), reminders are queued in the
Dapr State Store and delivered on reconnection.

**Alternatives Considered**:
- Socket.IO: Adds a non-mandated library; native FastAPI WebSocket
  is sufficient
- Server-Sent Events (SSE): Unidirectional; WebSocket provides
  bidirectional capability for future use
- Direct Kafka consumer in frontend: Forbidden by Constitution
  Principle VI-A

## R6: CI/CD Pipeline Design

**Decision**: GitHub Actions with multi-stage pipeline:
build → test → package → deploy.

**Rationale**: Constitution Principle IX mandates GitHub Actions.
Pipeline builds container images once, packages Helm charts, and
promotes the same artifacts across environments.

**Pipeline Stages**:
1. **Build**: Multi-stage Docker builds for each service
2. **Test**: Unit tests per service, integration tests with Dapr sidecar
3. **Package**: Push images to container registry, package Helm charts
4. **Deploy (Minikube)**: Automated local validation
5. **Deploy (Cloud)**: Promote same artifacts to managed K8s

**Alternatives Considered**:
- GitLab CI: Not mandated; GitHub Actions is constitutional requirement
- ArgoCD for GitOps: Complementary but not required for Phase V MVP
- Manual deployment: Forbidden by Constitution Principle IX-A

## R7: Event Schema Versioning Strategy

**Decision**: CloudEvents envelope with embedded schema version in event
type string (e.g., `com.todo.task.created.v1`).

**Rationale**: CloudEvents is the standard event format used by Dapr
pub/sub. Embedding version in the event type enables:
- Topic-level routing by version
- Consumer-side version detection without parsing payload
- Backward-compatible evolution (new version = new type string)

**Schema Structure**:
```json
{
  "specversion": "1.0",
  "type": "com.todo.task.created.v1",
  "source": "chat-api",
  "id": "<uuid>",
  "time": "<ISO8601>",
  "datacontenttype": "application/json",
  "data": { ... }
}
```

**Alternatives Considered**:
- Avro schema registry: Overhead for hackathon scale; CloudEvents +
  JSON is sufficient for 100 events/sec
- Protobuf: Binary format adds complexity without benefit at this scale
- Unversioned events: Forbidden by Constitution Principle V-C
