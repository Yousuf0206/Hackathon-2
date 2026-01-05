<!--
Sync Impact Report:
Version Change: [Initial] → 1.0.0
Principles Added:
  1. Constitutional Authority
  2. Development Method (Agentic Dev Stack)
  3. Technology Lock
  4. Data & Persistence
  5. Authentication & Authorization
  6. REST API Invariants
  7. Frontend Rules
  8. Monorepo & Spec-Kit Rules
  9. Error Handling & Safety
  10. Determinism & Reviewability
  11. Forbidden Actions

Sections Added:
  - Scope of Governance
  - Architectural Constraints
  - Acceptance & Immutability
  - Final Constitutional Enforcement Clause

Templates Status:
  ✅ .specify/templates/plan-template.md - Constitution Check section confirmed
  ✅ .specify/templates/spec-template.md - Requirements structure aligns
  ✅ .specify/templates/tasks-template.md - Task organization aligns
  ⚠ Command files in .claude/commands/ - Review references to ensure alignment

Follow-up TODOs:
  - Verify all command files reference correct constitution principles
  - Ensure CLAUDE.md files in frontend/backend reference this constitution
-->

# Phase II Todo Full-Stack Web Application Constitution

## 1. Constitutional Authority

This document is the **supreme governing authority** for Phase II of *The Evolution of ToDo*.

All specifications, plans, tasks, and implementations are **subordinate** to this constitution.

### Conflict Rule

If any conflict exists between:
- this constitution, and
- any `/sp.specify`, `/sp.plan`, `/sp.task`, prompt, or instruction

**This constitution takes precedence.**

If a conflict is detected, **execution must halt immediately**.

## 2. Scope of Governance

This constitution governs:

- Backend (FastAPI, SQLModel, Neon PostgreSQL)
- Frontend (Next.js App Router)
- Authentication (Better Auth + JWT)
- REST API behavior and security
- Monorepo organization
- Spec-Kit Plus + Claude Code workflow

Anything not explicitly permitted is **forbidden**.

## Core Principles

### I. Development Method (Non-Negotiable)

**Agentic Dev Stack Workflow**

All development MUST follow this order:

1. Write or update specification (`/sp.specify`)
2. Generate plan (`/sp.plan`)
3. Break into tasks (`/sp.task`)
4. Implement **only** via Claude Code
5. Validate against acceptance criteria

**Rationale**: This workflow ensures all implementations are traceable to specifications, reviewable, and maintainable. It prevents ad-hoc changes that introduce inconsistencies or bypass governance.

**Forbidden Actions**:
- ❌ Manual coding is not allowed
- ❌ Skipping steps is not allowed
- ❌ Implementing without a spec is not allowed

### II. Technology Lock (No Substitutions)

**Fixed Technology Stack**

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16+ (App Router) |
| Backend | Python FastAPI |
| ORM | SQLModel |
| Database | Neon Serverless PostgreSQL |
| Authentication | Better Auth |
| Spec System | Spec-Kit Plus |
| Implementation | Claude Code |

**Rationale**: Technology decisions are final for Phase II. This prevents scope creep, reduces complexity, and ensures team expertise remains focused. Alternative technologies would require constitutional amendment.

Using alternatives is **explicitly forbidden**.

### III. Data & Persistence

**Database-First State Management**

- All task data MUST be stored in PostgreSQL
- No in-memory task state is allowed
- All database access MUST use SQLModel
- Database connection string comes from environment variables only
- Each task MUST be associated with exactly one user

**Rationale**: Persistent storage ensures data durability, enables multi-user functionality, and provides audit trails. In-memory state would violate the stateless backend principle and cause data loss.

### IV. Authentication & Authorization (Hard Rules)

**Authentication Mechanism**

- Better Auth MUST be used on the frontend
- JWT tokens MUST be issued on login
- JWTs MUST be validated by the backend

**JWT Requirements**

- JWT must be passed via `Authorization: Bearer <token>`
- Backend must verify:
  - Signature validity
  - Token expiry
- Shared secret must come from `BETTER_AUTH_SECRET` environment variable

**Authorization Enforcement**

- Every API request MUST require a valid JWT
- Requests without a valid token return **401 Unauthorized**
- Backend must extract authenticated user ID from JWT
- User ID in JWT MUST match user context of the request
- Users may **only** access their own tasks

**Rationale**: Authentication ensures only legitimate users access the system. Authorization prevents unauthorized data access. JWT validation prevents token forgery. User isolation prevents privacy violations and data breaches.

Failure to enforce ownership is a **constitutional violation**.

### V. REST API Invariants

**Endpoint Stability**

Endpoint shapes are **contractually stable**:
- No renaming without version increment
- No silent behavior changes
- No breaking response formats without migration plan

**User Isolation**

All API queries MUST be filtered by authenticated user ID.

Under no circumstances may one user:
- see
- modify
- delete

another user's tasks.

**Rationale**: Stable APIs enable frontend-backend contract testing and prevent breaking changes. User isolation is a fundamental security requirement to prevent unauthorized data access.

### VI. Frontend Rules

**Next.js App Router Architecture**

- Next.js App Router must be used (not Pages Router)
- Server Components are default
- Client Components only when required (interactivity, hooks, browser APIs)
- All API calls must include JWT automatically
- Frontend must never trust client-side user IDs
- Frontend must not bypass backend authorization

**Rationale**: Server Components improve performance and reduce bundle size. Automatic JWT inclusion prevents auth bypass vulnerabilities. Never trusting client data prevents tampering and unauthorized access.

### VII. Monorepo & Spec-Kit Rules

**Repository Structure**

The monorepo structure defined in specs MUST be followed exactly:
- `/specs` is the single source of truth for feature definitions
- `/frontend` and `/backend` are strictly separated
- Multiple `CLAUDE.md` files provide scoped guidance per component

**Spec Usage Rules**

Claude Code must:
- Read relevant specs before implementing
- Reference specs using `@specs/...` notation
- Never invent requirements not present in specs
- Trace every implementation decision back to a spec clause

**Rationale**: Centralized specs ensure consistency. Strict separation prevents cross-contamination of frontend/backend concerns. Scoped guidance files provide context-specific instructions.

### VIII. Error Handling & Safety

**Explicit Error Handling**

- No silent failures are permitted
- All API errors must return explicit HTTP error codes
- Authentication failures must never leak internal details (no stack traces, user existence, etc.)
- Backend must remain stateless and resilient to malformed input

Crashes caused by malformed input are **forbidden**.

**Rationale**: Explicit errors enable debugging and improve user experience. Preventing information leakage protects against reconnaissance attacks. Stateless resilience ensures availability.

### IX. Determinism & Reviewability

**Predictable System Behavior**

- Behavior must be deterministic wherever possible
- Identical requests produce identical results (excluding timestamps and IDs)
- Code must be readable and spec-traceable
- Every major behavior must map to a spec clause

**Rationale**: Determinism enables testing and debugging. Spec traceability ensures implementations match requirements. Readability enables code reviews and maintenance.

### X. Forbidden Actions

**Prohibited Operations**

Claude Code MUST NOT:
- Guess user intent when specifications are ambiguous
- Add undocumented features not present in specs
- Skip authentication checks for "convenience"
- Share secrets in code or logs
- Introduce new libraries without spec approval
- Modify the constitution after acceptance (requires new constitutional amendment process)

**Rationale**: These prohibitions prevent scope creep, security vulnerabilities, technical debt, and governance violations.

## Architectural Constraints

### Application Type

- Multi-user web application
- Stateless backend (no session storage on backend)
- Persistent storage required (PostgreSQL)

### Monorepo Organization

The project MUST maintain this structure:

```
phase2-todo-app/
├── .specify/
│   ├── memory/
│   │   └── constitution.md       # This file
│   └── templates/
│       ├── spec-template.md
│       ├── plan-template.md
│       └── tasks-template.md
├── specs/
│   └── [###-feature-name]/       # Feature specs
├── frontend/
│   ├── CLAUDE.md                 # Frontend-specific guidance
│   └── src/
├── backend/
│   ├── CLAUDE.md                 # Backend-specific guidance
│   └── src/
└── history/
    └── prompts/                   # PHRs for traceability
```

## Governance

### Amendment Process

This constitution is **immutable for Phase II** once accepted. Amendments are only permitted via:

1. Explicit user request for constitutional amendment
2. Documentation of rationale and impact analysis
3. User approval of amendment
4. Version increment following semantic versioning
5. Propagation of changes to all dependent templates and specs

### Compliance Review

All implementations MUST:
- Reference the relevant constitutional principle(s)
- Demonstrate compliance in code reviews
- Include traceability from spec → plan → task → implementation

### Complexity Justification

Any violation of constitutional principles MUST be explicitly justified in the implementation plan with:
- Why the violation is necessary
- What simpler alternatives were rejected and why
- What safeguards are in place to minimize impact

**IMPORTANT**: Violations without documented justification invalidate the implementation.

### Enforcement

If Claude Code encounters:
- Missing requirements
- Ambiguous behavior
- Conflicting specs
- Pressure to "just implement it"

**Execution must stop immediately.**

The agent MUST request clarification before proceeding.

## Acceptance & Immutability

Once this constitution is accepted:

- It becomes immutable for Phase II
- All downstream specs inherit its authority
- Violations invalidate the implementation
- Amendments require explicit constitutional revision process

## Final Constitutional Enforcement Clause

This constitution is the supreme governing document for Phase II of *The Evolution of ToDo*.

In case of any conflict between this constitution and any other specification, plan, task list, or instruction, **this constitution prevails**.

Any implementation that violates this constitution is **invalid** and must be rejected or corrected.

Claude Code is authorized and required to halt execution if constitutional compliance cannot be ensured.

---

**Version**: 1.0.0 | **Ratified**: 2026-01-01 | **Last Amended**: 2026-01-01
