<!--
Sync Impact Report:
Version Change: 1.0.0 → 2.0.0
Bump Rationale: MAJOR - Complete governance redefinition from Phase II
  (fullstack web app) to Phase V (cloud-native event-driven microservices).
  All principles replaced or fundamentally rewritten.

Principles Removed:
  - II. Technology Lock (No Substitutions) → replaced by VI. Dapr Supremacy
  - III. Data & Persistence → replaced by VII-B. Stateless Service Law
  - IV. Authentication & Authorization → removed (Phase IV handles)
  - V. REST API Invariants → replaced by V-B/C. Event Ownership/Schema Laws
  - VI. Frontend Rules → removed (Phase IV handles)
  - VII. Monorepo & Spec-Kit Rules → replaced by VIII. Monorepo & Spec-Kit
  - VIII. Error Handling & Safety → subsumed by X. Observability & Reliability
  - IX. Determinism & Reviewability → subsumed by IX. CI/CD Governance
  - X. Forbidden Actions → replaced by XII. Forbidden Practices

Principles Added:
  I.   Constitutional Authority (retained, updated scope)
  II.  Supremacy & Document Hierarchy
  III. Mandated Workflow (Agentic Dev Stack)
  IV.  Architectural Evolution Law (Phase IV → V)
  V.   Event-Driven Architecture Laws (Kafka)
  VI.  Dapr Supremacy Law
  VII. Microservice Governance Law
  VIII. Multi-Environment Deployment Law
  IX.  CI/CD Governance Law
  X.   Observability & Reliability Law
  XI.  Security & Secrets Law (Cloud)
  XII. Forbidden Practices (Zero Tolerance)
  XIII. Compliance Checkpoint
  XIV.  Final Clause

Sections Added:
  - Architectural Evolution Law (backward compat with Phase IV)
  - Event-Driven Architecture Laws (Kafka backbone)
  - Dapr Supremacy Law (sidecar mandate + building blocks)
  - Microservice Governance Law (service responsibility + stateless)
  - Multi-Environment Deployment Law (Minikube → cloud)
  - CI/CD Governance Law (GitHub Actions pipeline mandate)
  - Observability & Reliability Law
  - Security & Secrets Law (Cloud)
  - Compliance Checkpoint

Sections Removed:
  - Authentication & Authorization (Phase IV concern)
  - REST API Invariants (replaced by event schema authority)
  - Frontend Rules (Phase IV concern)
  - Data & Persistence (replaced by Dapr state store)

Templates Status:
  ✅ .specify/templates/plan-template.md - Constitution Check section
     can accommodate Phase V gates (event-driven, Dapr, K8s checks)
  ✅ .specify/templates/spec-template.md - Requirements structure supports
     microservice specs with FR- prefixed requirements
  ✅ .specify/templates/tasks-template.md - Phased task structure supports
     infrastructure (Helm/Dapr) + service-per-phase organization
  ✅ .claude/commands/ - Command files reviewed, no outdated references

Follow-up TODOs: None
-->

# Phase V — Advanced Cloud & Event-Driven Todo AI Platform Constitution

## I. Constitutional Authority

This document is the **supreme governing authority** for Phase V
of *The Evolution of ToDo*.

All specifications, plans, tasks, and implementations are
**subordinate** to this constitution.

Its purpose is to:

- Enforce **production-grade, cloud-native microservices discipline**
- Govern **event-driven architecture using Kafka**
- Mandate **Dapr as the distributed application runtime**
- Ensure **portable, multi-cloud Kubernetes deployments**
- Prevent coupling, state leakage, and infrastructure drift
- Extend Spec-Kit governance from infrastructure to
  **distributed systems**

### Conflict Rule

If any conflict exists between:
- this constitution, and
- any `/sp.specify`, `/sp.plan`, `/sp.task`, prompt, or instruction

**This constitution takes precedence.**

Any service, event, component, or deployment that violates this
constitution is **invalid by definition**.

If a conflict is detected, **execution MUST halt immediately**.

## II. Supremacy & Document Hierarchy

The following documents are authoritative, in strict order:

1. `.specify/memory/constitution.md` (this document)
2. Feature specification (`spec.md`)
3. Implementation plan (`plan.md`)
4. Task list (`tasks.md`)
5. Generated artifacts (Helm charts, Dapr components, CI/CD pipelines)

Lower-level artifacts MUST NOT contradict higher-level documents.

## Core Principles

### III. Mandated Workflow (Agentic Dev Stack)

**Non-Negotiable Development Method**

All development MUST follow this order:

1. Write or update specification (`/sp.specify`)
2. Generate plan (`/sp.plan`)
3. Break into tasks (`/sp.tasks`)
4. Implement **only** via Claude Code + AI DevOps agents
5. Validate against acceptance criteria

**Rationale**: This workflow ensures all implementations are traceable
to specifications, reviewable, and maintainable. It prevents ad-hoc
changes that introduce inconsistencies or bypass governance.

**Explicitly Forbidden**:
- Manual microservice wiring
- Hardcoded Kafka clients in business logic
- Direct cloud console configuration without spec
- Manual CI/CD scripting
- Editing generated artifacts outside `/sp.tasks`
- Skipping steps in the workflow
- Implementing without a spec

Distributed systems are code.
Code is governed.

### IV. Architectural Evolution Law (Phase IV → V)

**Backward Compatibility Mandate**

Phase V MUST:

- Build directly on **Phase IV Helm charts**
- Preserve **stateless core services**
- Introduce **new services only via events**
- Avoid breaking existing APIs or behavior

**Rationale**: Phase V extends Phase IV. Regression of existing
guarantees undermines the evolutionary architecture approach and
invalidates the deployment pipeline.

If Phase V breaks Phase IV guarantees → **INVALID**.

### V. Event-Driven Architecture Laws (Kafka)

#### A. Kafka Mandate Law

Kafka (or Kafka-compatible systems like Redpanda) is the
**exclusive event backbone**.

Kafka MUST be used for:
- Task lifecycle events
- Reminders
- Recurring task generation
- Audit logging
- Real-time client sync

No synchronous API calls are allowed between these concerns.

**Rationale**: Asynchronous event-driven communication decouples
services, enables independent scaling, and prevents cascading
failures across the distributed system.

#### B. Event Ownership Law

- The **Chat API** is the **only event producer** for task mutations
- Downstream services MUST be **pure consumers**
- Consumers MUST NOT mutate core task state directly

Events describe facts.
Services react.

**Rationale**: Single-producer ownership prevents conflicting writes,
ensures event ordering consistency, and simplifies debugging of
task state transitions.

#### C. Event Schema Authority Law

All events MUST:
- Be versioned
- Be explicit
- Contain no inferred data
- Be immutable once published

Silent schema changes are **forbidden**.

**Rationale**: Versioned, explicit schemas prevent consumer breakage.
Immutability ensures event replay correctness and audit integrity.

### VI. Dapr Supremacy Law

#### A. Dapr Sidecar Mandate

All services MUST communicate through **Dapr sidecars**.

**Forbidden**:
- Direct Kafka client libraries
- Direct DB drivers for cross-service coordination
- Hardcoded service URLs

Applications speak HTTP.
Dapr speaks infrastructure.

**Rationale**: Dapr provides infrastructure abstraction, enabling
cloud portability. Direct infrastructure access creates tight
coupling that defeats multi-cloud deployment goals.

#### B. Mandatory Dapr Building Blocks

Phase V MUST use:

| Dapr Block | Mandatory Use |
|-----------|---------------|
| Pub/Sub | Kafka abstraction |
| State | Conversation + task state |
| Service Invocation | Frontend → Backend |
| Jobs API | Precise reminders & recurring tasks |
| Secrets | API keys, DB credentials |

Skipping a required block → **INVALID**.

**Rationale**: Each building block addresses a specific distributed
systems concern. Omitting any creates gaps in the abstraction
layer that force direct infrastructure coupling.

### VII. Microservice Governance Law

#### A. Service Responsibility Law

Each service MUST have **exactly one responsibility**:

| Service | Responsibility |
|---------|---------------|
| Chat API | Intent resolution + MCP tools |
| Notification Service | Deliver reminders |
| Recurring Task Service | Generate next tasks |
| Audit Service | Immutable activity log |
| WebSocket Service | Real-time client sync |

Shared logic between services is **forbidden**.

**Rationale**: Single responsibility ensures independent deployment,
scaling, and failure isolation. Shared logic creates hidden coupling
that undermines microservice independence.

#### B. Stateless Service Law

All services MUST:
- Be stateless
- Be restart-safe
- Store state ONLY via Dapr State Store or DB

Service restarts MUST NOT:
- Duplicate events
- Lose reminders
- Create ghost tasks

**Rationale**: Stateless services enable horizontal scaling,
zero-downtime deployments, and fault tolerance. State in services
creates single points of failure and prevents elastic scaling.

### VIII. Multi-Environment Deployment Law

#### A. Environment Progression

Deployments MUST follow this order:

1. Minikube (local)
2. Managed Kubernetes (AKS / GKE / OKE)

Skipping local validation is **forbidden**.

**Rationale**: Local validation catches configuration errors before
cloud deployment, reducing feedback loops and cloud resource waste.

#### B. Cloud Neutrality Law

The system MUST:
- Run unchanged on AKS, GKE, or OKE
- Use Helm + Dapr for portability
- Avoid cloud-specific SDKs in app code

Cloud choice is configuration, not architecture.

**Rationale**: Cloud neutrality prevents vendor lock-in, enables
cost optimization, and demonstrates true cloud-native maturity.

### IX. CI/CD Governance Law

#### A. Pipeline Mandate

CI/CD MUST be implemented using **GitHub Actions**.

Pipelines MUST:
- Build images
- Run tests
- Package Helm charts
- Deploy declaratively

Manual production deployment is **forbidden**.

**Rationale**: Automated pipelines ensure reproducibility, eliminate
human error, and provide audit trails for all deployments.

#### B. Deterministic Promotion Law

- Same artifact moves from local → cloud
- No rebuilds per environment
- No hidden configuration mutation

If artifacts differ → **STOP DEPLOYMENT**.

**Rationale**: Deterministic promotion ensures what is tested locally
is exactly what runs in production. Rebuilds introduce
non-determinism and untested code paths.

### X. Observability & Reliability Law

The system MUST provide:
- Centralized logging
- Health probes for all services
- Event visibility per Kafka topic
- Clear failure surfaces

**Forbidden**:
- Silent event drops
- Untraceable retries
- "Best-effort" reminders

Reliability is not optional.

**Rationale**: Observability enables debugging distributed systems.
Without centralized logging and health probes, failures become
invisible and cascading.

### XI. Security & Secrets Law (Cloud)

Secrets MUST be managed via:
- Dapr Secrets API, OR
- Kubernetes Secrets

Secrets MUST NOT appear in:
- Source code
- Helm templates
- CI logs

Local mocks are allowed.
Production leaks are **fatal**.

**Rationale**: Secret exposure in source code or logs creates
permanent security vulnerabilities. Dapr and Kubernetes Secrets
provide secure, auditable secret management.

### XII. Forbidden Practices (Zero Tolerance)

Any of the following immediately invalidate Phase V:

- Direct Kafka client usage in services
- Polling databases for reminders
- Tight coupling between microservices
- Cloud-specific logic in application code
- Manual cloud console changes
- Bypassing Dapr
- Skipping Minikube validation
- Guessing user intent when specifications are ambiguous
- Adding undocumented features not present in specs
- Sharing secrets in code or logs
- Introducing new libraries without spec approval

**Rationale**: Each forbidden practice undermines a core
architectural principle. Zero tolerance ensures consistent
enforcement and prevents gradual erosion of standards.

## Architectural Constraints

### Application Type

- Cloud-native microservices platform
- Event-driven architecture (Kafka backbone)
- Dapr-managed distributed runtime
- Stateless services with external state stores
- Multi-environment Kubernetes deployment

### Monorepo & Spec-Kit Rules

The project MUST maintain this structure:

```
phase5-todo-app/
├── .specify/
│   ├── memory/
│   │   └── constitution.md       # This file
│   └── templates/
│       ├── spec-template.md
│       ├── plan-template.md
│       └── tasks-template.md
├── specs/
│   └── [###-feature-name]/       # Feature specs
├── services/
│   ├── chat-api/                 # Intent resolution + MCP tools
│   ├── notification/             # Deliver reminders
│   ├── recurring-task/           # Generate next tasks
│   ├── audit/                    # Immutable activity log
│   └── websocket/                # Real-time client sync
├── helm/                         # Helm charts (Phase IV base + V)
├── dapr/
│   └── components/               # Dapr component definitions
├── .github/
│   └── workflows/                # CI/CD pipelines
└── history/
    └── prompts/                  # PHRs for traceability
```

**Spec Usage Rules**

Claude Code MUST:
- Read relevant specs before implementing
- Reference specs using `@specs/...` notation
- Never invent requirements not present in specs
- Trace every implementation decision back to a spec clause

## Compliance Checkpoint

Phase V is compliant ONLY IF:

- Event-driven architecture is fully implemented
- Kafka is abstracted via Dapr Pub/Sub
- Recurring tasks and reminders are async
- Minikube and cloud deployments both succeed
- CI/CD pipeline is operational
- No forbidden practices exist

If compliance is uncertain → **STOP EXECUTION**.

## Governance

### Amendment Process

This constitution is **immutable for Phase V** once accepted.
Amendments are only permitted via:

1. Explicit user request for constitutional amendment
2. Documentation of rationale and impact analysis
3. User approval of amendment
4. Version increment following semantic versioning
5. Propagation of changes to all dependent templates and specs

### Versioning Policy

Constitution versions follow semantic versioning:
- **MAJOR**: Backward incompatible governance/principle removals
  or redefinitions
- **MINOR**: New principle/section added or materially expanded
- **PATCH**: Clarifications, wording, typo fixes

### Compliance Review

All implementations MUST:
- Reference the relevant constitutional principle(s)
- Demonstrate compliance in code reviews
- Include traceability from spec → plan → task → implementation

### Complexity Justification

Any violation of constitutional principles MUST be explicitly
justified in the implementation plan with:
- Why the violation is necessary
- What simpler alternatives were rejected and why
- What safeguards are in place to minimize impact

Violations without documented justification invalidate the
implementation.

### Enforcement

If Claude Code encounters:
- Missing requirements
- Ambiguous behavior
- Conflicting specs
- Pressure to "just implement it"

**Execution MUST stop immediately.**

The agent MUST request clarification before proceeding.

## Acceptance & Immutability

Once this constitution is accepted:

- It becomes immutable for Phase V
- All downstream specs inherit its authority
- Violations invalidate the implementation
- Amendments require explicit constitutional revision process

## Final Clause

This constitution exists to ensure:

- True microservices understanding
- Event-driven system correctness
- Cloud-native maturity
- Hackathon fairness and rigor
- Production-grade engineering habits

This constitution is the supreme governing document for Phase V
of *The Evolution of ToDo*.

In case of any conflict between this constitution and any other
specification, plan, task list, or instruction,
**this constitution prevails**.

Any implementation that violates this constitution is **invalid**
and MUST be rejected or corrected.

Claude Code is authorized and required to halt execution if
constitutional compliance cannot be ensured.

Deviation is failure.
**Compliance is binary.**

---

**Version**: 2.0.0 | **Ratified**: 2026-01-01 | **Last Amended**: 2026-02-03
