# Research: Phase IV — Cloud-Native Todo AI Chatbot

**Branch**: `001-phase4-k8s-todo` | **Date**: 2026-02-02

## R1: SQLModel Date/Time Column Types

**Decision**: Use `Optional[date]` for `due_date` and `Optional[str]` for `due_time` (stored as "HH:MM" string).

**Rationale**: SQLModel/SQLAlchemy maps Python `date` to SQL `DATE` natively. For `due_time`, storing as a string in "HH:MM" format (per FR-020) avoids timezone complications — the spec explicitly forbids timezone inference. A string field with application-level validation (regex `^\d{2}:\d{2}$`) is simpler than a SQL TIME column and aligns with the spec's normalization requirement.

**Alternatives considered**:
- `Optional[time]` Python type → rejected because SQLAlchemy TIME handling varies across databases (SQLite vs PostgreSQL) and introduces timezone-aware vs naive complications
- `Optional[datetime]` combining both → rejected because spec treats date and time as independent optional fields

## R2: Helm Umbrella Chart Structure

**Decision**: Single umbrella chart at `helm/todo-app/` with `charts/backend/` and `charts/frontend/` as local subcharts (file dependencies, not repository dependencies).

**Rationale**: Local subcharts (embedded in the charts/ directory) are the simplest approach for a monorepo. No Helm repository needed. The umbrella Chart.yaml lists dependencies with `file://` paths. One `helm install todo-app ./helm/todo-app` deploys everything (satisfying SC-004 and FR-024).

**Alternatives considered**:
- Two independent charts with separate `helm install` → rejected because it violates SC-004 ("single helm install command") and FR-024
- Helm library charts → rejected because unnecessary complexity for two services

**Chart structure**:
```
helm/todo-app/
├── Chart.yaml          # type: application, dependencies: [backend, frontend]
├── values.yaml         # Global overrides: image tags, replicas, env vars
└── charts/
    ├── backend/
    │   ├── Chart.yaml
    │   ├── values.yaml
    │   └── templates/
    │       ├── deployment.yaml    # Deployment with health probes
    │       ├── service.yaml       # ClusterIP service
    │       └── _helpers.tpl       # Template helpers
    └── frontend/
        ├── Chart.yaml
        ├── values.yaml
        └── templates/
            ├── deployment.yaml
            ├── service.yaml
            └── _helpers.tpl
```

## R3: Minikube Image Loading Strategy

**Decision**: Use `minikube image load <image>` to load locally-built images directly into Minikube's Docker daemon.

**Rationale**: This is the simplest approach — no local registry setup required. Build images with `docker build`, then `minikube image load` transfers them. Set `imagePullPolicy: Never` in Helm values to prevent Kubernetes from trying to pull from a remote registry.

**Alternatives considered**:
- `eval $(minikube docker-env)` to build directly inside Minikube → rejected because it couples the build environment to Minikube and breaks if Minikube uses containerd instead of Docker
- Local Docker registry → rejected because unnecessary complexity for local development
- `minikube image build` → rejected because it requires Minikube-specific build context handling

## R4: Next.js Standalone Output Mode

**Decision**: Use `output: 'standalone'` in `next.config.js` for minimal production images.

**Rationale**: The existing frontend Dockerfile already uses a multi-stage build that copies `.next/standalone` and `.next/static`. The `output: 'standalone'` config in `next.config.js` must be present for this to work. This produces a self-contained `server.js` that runs without `node_modules`, resulting in much smaller images.

**Verification needed**: Check if `next.config.js` already has `output: 'standalone'`. If not, add it.

**Alternatives considered**:
- Standard Next.js build with full node_modules → rejected because images would be ~500MB+ instead of ~100MB
- Static export → rejected because the app needs server-side API routes (health endpoint, auth proxy)

## R5: Agent System Prompt for Date/Time Clarification

**Decision**: Update the system prompt in `backend/src/agent/prompts.py` to include explicit date/time handling rules aligned with FR-002 and the spec's Section 5.

**Rationale**: The agent's behavior for date/time clarification is governed entirely by the system prompt. The prompt must instruct the agent to:
1. Accept explicit dates (YYYY-MM-DD) and times (HH:MM, 24-hour) without question
2. Ask for clarification when temporal expressions are ambiguous ("tomorrow evening", "later", "soon")
3. Create tasks without dates when no temporal info is provided
4. Note when a provided date is in the past
5. Reject invalid dates (e.g., "February 30th")
6. Normalize all accepted dates to YYYY-MM-DD and times to HH:MM format before calling tools

**Alternatives considered**:
- Application-level date parsing before agent → rejected because the agent needs to handle natural language (the whole point of the AI chatbot)
- Separate date/time validation tool → rejected because the agent should handle this as part of its reasoning, not as a separate tool call

## R6: Environment Tooling Verification

**Decision**: Verify all required tools are available before proceeding.

**Required tools and versions**:
- Docker Desktop: Any recent version with BuildKit enabled
- Minikube: v1.30+ (supports `minikube image load`)
- Helm: v3.12+ (supports local subchart dependencies)
- kubectl: Matching Minikube's Kubernetes version
- kubectl-ai: Latest (advisory only per constitution)
- Kagent: Latest (advisory only per constitution)

**Note**: kubectl-ai and Kagent are advisory per Phase IV constitution. Their absence does not block deployment — they are used only for diagnostics and optimization suggestions.
