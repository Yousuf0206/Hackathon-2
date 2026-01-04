# Implementation Plan: Phase II Full-Stack Todo Web Application

**Branch**: `002-phase2-fullstack-todo` | **Date**: 2026-01-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-phase2-fullstack-todo/spec.md`

**Note**: This plan is strictly subordinate to `/sp.constitution` and `/sp.specify`. Any conflict with either document requires immediate halt and clarification.

## Summary

Build a multi-user web-based todo application with secure JWT authentication, user data isolation, and persistent PostgreSQL storage. The system enables users to register, authenticate, and perform full CRUD operations on their personal todo lists while ensuring zero cross-user data access. Implementation follows constitutional requirements for technology stack (Next.js App Router frontend, FastAPI backend, SQLModel ORM, Better Auth, Neon PostgreSQL) and enforces stateless backend architecture with JWT-based authorization.

**Primary Technical Approach**:
- Frontend: Next.js 16+ App Router with Server Components and Better Auth for JWT management
- Backend: Python FastAPI with JWT verification middleware extracting user_id from JWT `sub` claim only
- Database: PostgreSQL with SQLModel ORM enforcing user_id foreign keys on all todo queries
- Auth Flow: Better Auth issues JWT → Frontend auto-attaches via centralized API client → Backend validates and extracts user identity
- Security: URL user_id parameters explicitly ignored; all data scoping derived from JWT; 404 on ownership violations (never 403 to prevent enumeration)

## Technical Context

**Language/Version**: Python 3.11+ (backend), TypeScript 5+ / Node.js 18+ (frontend)
**Primary Dependencies**:
- Backend: FastAPI 0.104+, SQLModel 0.14+, python-jose[cryptography] (JWT), passlib[bcrypt] (password hashing), psycopg2-binary (PostgreSQL driver)
- Frontend: Next.js 16+, Better Auth 1.0+, React 18+, TypeScript 5+

**Storage**: Neon Serverless PostgreSQL (via `DATABASE_URL` env var)
**Testing**: pytest (backend), Jest + React Testing Library (frontend)
**Target Platform**: Web application (browser-based), deployed to cloud (backend: Python ASGI server, frontend: Vercel/Node.js)
**Project Type**: Web application (monorepo with `/frontend` and `/backend` separation)
**Performance Goals**:
- API response time <500ms p95 for todo operations
- Page load <2s for 95% of requests
- Support 100+ concurrent authenticated users
- Todo creation visible within 3 seconds

**Constraints**:
- Technology stack constitutionally locked (no substitutions)
- Backend must be stateless (no server-side sessions)
- User isolation is non-negotiable (constitutional violation if breached)
- All API requests require valid JWT (401 without token)
- JWT `sub` claim is sole source of user identity
- No in-memory state for todos
- Monorepo structure required (`/frontend`, `/backend`, `/specs`)

**Scale/Scope**:
- MVP: Single-tenant per user, ~1000 todos per user before pagination needed
- 2 core entities (User, Todo)
- 6 user stories (3 P1, 2 P2, 1 P3)
- 5-6 REST API endpoints
- Estimated ~2-3K LOC backend, ~3-4K LOC frontend

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Development Method (Non-Negotiable) ✅
- **Status**: PASS
- **Compliance**: Following Agentic Dev Stack workflow (spec → plan → tasks → implement)
- **Evidence**: This plan is generated after spec.md completion and will be followed by /sp.task

### Principle II: Technology Lock (No Substitutions) ✅
- **Status**: PASS
- **Compliance**: Using constitutionally mandated stack
- **Technology Stack**:
  - Frontend: Next.js 16+ App Router ✅
  - Backend: Python FastAPI ✅
  - ORM: SQLModel ✅
  - Database: Neon Serverless PostgreSQL ✅
  - Authentication: Better Auth ✅
- **Violations**: None

### Principle III: Data & Persistence ✅
- **Status**: PASS
- **Compliance**:
  - All todo data stored in PostgreSQL ✅
  - No in-memory task state ✅
  - All database access via SQLModel ✅
  - Database connection from `DATABASE_URL` env var ✅
  - Each todo associated with exactly one user_id ✅

### Principle IV: Authentication & Authorization (Hard Rules) ✅
- **Status**: PASS
- **Compliance**:
  - Better Auth used on frontend ✅
  - JWT tokens issued on login ✅
  - JWT validated by backend on every request ✅
  - JWT passed via `Authorization: Bearer <token>` ✅
  - Backend verifies signature and expiry ✅
  - Shared secret from `BETTER_AUTH_SECRET` env var ✅
  - Every API request requires valid JWT (401 without) ✅
  - User ID extracted exclusively from JWT `sub` claim ✅
  - Users can only access their own todos ✅
- **Implementation**: JWT verification middleware + query-level user_id filtering

### Principle V: REST API Invariants ✅
- **Status**: PASS
- **Compliance**:
  - Endpoint shapes contractually stable (documented in /contracts/) ✅
  - All API queries filtered by authenticated user_id ✅
  - Cross-user access returns 404 (not 403 to prevent enumeration) ✅
- **Endpoints**: GET/POST /api/todos, GET/PUT/DELETE /api/todos/{id}, PATCH /api/todos/{id}/complete

### Principle VI: Frontend Rules ✅
- **Status**: PASS
- **Compliance**:
  - Next.js App Router (not Pages Router) ✅
  - Server Components as default ✅
  - Client Components only when required (forms, interactivity) ✅
  - All API calls include JWT automatically (via centralized client) ✅
  - Frontend never trusts client-side user IDs ✅
  - Frontend does not bypass backend authorization ✅

### Principle VII: Monorepo & Spec-Kit Rules ✅
- **Status**: PASS
- **Compliance**:
  - `/specs` is single source of truth ✅
  - `/frontend` and `/backend` strictly separated ✅
  - Scoped `CLAUDE.md` files per component ✅
  - All implementation decisions traced to spec clauses ✅

### Principle VIII: Error Handling & Safety ✅
- **Status**: PASS
- **Compliance**:
  - No silent failures ✅
  - Explicit HTTP error codes (400, 401, 403, 404, 500, 503) ✅
  - Auth failures don't leak internal details ✅
  - Backend stateless and resilient to malformed input ✅
  - No crashes from malformed input ✅

### Principle IX: Determinism & Reviewability ✅
- **Status**: PASS
- **Compliance**:
  - Deterministic behavior (same request → same result except timestamps/IDs) ✅
  - Code is spec-traceable ✅
  - Every major behavior maps to spec clause ✅

### Principle X: Forbidden Actions ✅
- **Status**: PASS
- **Compliance**: This plan does not:
  - Guess user intent (all requirements from spec) ✅
  - Add undocumented features ✅
  - Skip authentication checks ✅
  - Share secrets in code ✅
  - Introduce unauthorized libraries ✅
  - Modify constitution ✅

### **GATE RESULT: PASS ✅**
All constitutional principles satisfied. No violations requiring justification. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/002-phase2-fullstack-todo/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   ├── auth-register.md
│   ├── auth-login.md
│   ├── todos-list.md
│   ├── todos-create.md
│   ├── todos-get.md
│   ├── todos-update.md
│   ├── todos-delete.md
│   └── todos-toggle-complete.md
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
phase2-todo-app/
├── backend/
│   ├── CLAUDE.md                     # Backend-specific guidance
│   ├── src/
│   │   ├── main.py                   # FastAPI app entry point
│   │   ├── config.py                 # Environment config
│   │   ├── database.py               # SQLModel engine + session
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py               # User SQLModel
│   │   │   └── todo.py               # Todo SQLModel
│   │   ├── auth/
│   │   │   ├── __init__.py
│   │   │   ├── jwt.py                # JWT verification
│   │   │   ├── password.py           # Password hashing
│   │   │   └── middleware.py         # JWT auth middleware
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py               # Register/login endpoints
│   │   │   └── todos.py              # Todo CRUD endpoints
│   │   └── dependencies.py           # FastAPI dependencies
│   ├── tests/
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   ├── test_todos.py
│   │   └── test_isolation.py         # User isolation tests
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
│
├── frontend/
│   ├── CLAUDE.md                     # Frontend-specific guidance
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx            # Root layout
│   │   │   ├── page.tsx              # Landing page
│   │   │   ├── login/
│   │   │   │   └── page.tsx          # Login page
│   │   │   ├── register/
│   │   │   │   └── page.tsx          # Register page
│   │   │   └── todos/
│   │   │       └── page.tsx          # Todo dashboard (protected)
│   │   ├── components/
│   │   │   ├── TodoList.tsx
│   │   │   ├── TodoItem.tsx
│   │   │   ├── TodoForm.tsx
│   │   │   └── Navbar.tsx
│   │   ├── lib/
│   │   │   ├── api.ts                # Centralized API client
│   │   │   ├── auth.ts               # Better Auth config
│   │   │   └── types.ts              # TypeScript types
│   │   └── middleware.ts             # Next.js middleware (auth checks)
│   ├── tests/
│   │   └── components/
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── .env.example
│   └── README.md
│
├── .specify/
│   ├── memory/
│   │   └── constitution.md
│   └── templates/
│
├── specs/
│   └── 002-phase2-fullstack-todo/
│
├── history/
│   └── prompts/
│
├── .gitignore
└── README.md
```

**Structure Decision**: Selected Option 2 (Web application) with `/backend` and `/frontend` separation as required by constitutional Principle VII (Monorepo & Spec-Kit Rules). This structure enforces strict separation of concerns, enables scoped `CLAUDE.md` guidance files, and aligns with multi-user web application architecture.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No constitutional violations detected.** This section is intentionally empty. All implementation choices comply with constitutional principles.

---

## Phase 0: Research & Technology Validation

### Objectives
- Validate constitutional technology choices work together
- Resolve integration patterns between Better Auth (frontend) and FastAPI JWT verification (backend)
- Establish best practices for SQLModel with PostgreSQL
- Define JWT structure and claims usage

### Research Tasks

#### 1. Better Auth + JWT Integration Pattern
**Question**: How does Better Auth issue JWTs that FastAPI can verify?

**Research Focus**:
- Better Auth JWT plugin configuration
- JWT signing algorithm (RS256 vs HS256)
- Shared secret mechanism between frontend and backend
- JWT payload structure (which claim contains user ID)
- Token expiration and refresh strategy (MVP: no refresh, 24h expiry)

**Expected Outcome**: Documented JWT flow from Better Auth issuance to FastAPI verification

#### 2. FastAPI JWT Verification Best Practices
**Question**: What is the canonical way to verify JWTs in FastAPI and extract user identity?

**Research Focus**:
- python-jose vs PyJWT library choice
- JWT verification middleware pattern
- FastAPI dependency injection for authenticated user
- Error handling for expired/invalid tokens (401)
- Performance implications of per-request JWT verification

**Expected Outcome**: Code pattern for JWT verification middleware + dependency

#### 3. SQLModel Query-Level User Isolation
**Question**: How to enforce user_id filtering on all todo queries without repetition?

**Research Focus**:
- SQLModel query patterns with foreign key filtering
- Session management with FastAPI
- Preventing N+1 queries with relationships
- Index strategy for `todos.user_id`
- Alembic integration for migrations

**Expected Outcome**: Query patterns ensuring automatic user_id filtering

#### 4. Next.js App Router + Better Auth Integration
**Question**: How to integrate Better Auth with Next.js 16 App Router (Server/Client Components)?

**Research Focus**:
- Better Auth provider setup in App Router
- Session management across Server/Client Components
- Centralized API client pattern with automatic JWT attachment
- Protected routes with middleware
- Handling 401 responses (session expiration)

**Expected Outcome**: Auth flow pattern for App Router

#### 5. Environment Variable Management (Shared Secret)
**Question**: How to securely share `BETTER_AUTH_SECRET` between frontend and backend?

**Research Focus**:
- Environment variable best practices for monorepo
- Secret management in dev vs production
- Key rotation strategy (out of scope for MVP but document)
- HTTPS enforcement for production

**Expected Outcome**: Environment configuration pattern

### Exit Criteria
- ✅ All 5 research questions answered with documented patterns
- ✅ No incompatibilities discovered between constitutional technologies
- ✅ JWT flow fully specified (Better Auth → Frontend → Backend)
- ✅ User isolation pattern confirmed viable
- ✅ `research.md` file created with all findings

---

## Phase 1: Design & Contracts

### Prerequisites
- Phase 0 research.md complete
- All research questions resolved

### Deliverables

#### 1. Data Model (data-model.md)

**Entities from spec.md**:

##### User Entity
- **Purpose**: Represents an authenticated user account
- **Fields**:
  - `id`: UUID (primary key, auto-generated)
  - `email`: string (unique, required, max 255 chars, validated email format)
  - `password_hash`: string (required, bcrypt hash)
  - `created_at`: datetime (auto-generated on insert)
  - `updated_at`: datetime (auto-updated on modification)
- **Relationships**: One-to-many with Todo
- **Indexes**: Unique index on `email`
- **Validation Rules**:
  - Email must be valid format
  - Password must be hashed before storage (never plaintext)
  - Email must be unique (409 Conflict on duplicate)

##### Todo Entity
- **Purpose**: Represents a task item owned by a user
- **Fields**:
  - `id`: UUID (primary key, auto-generated)
  - `user_id`: UUID (foreign key to User.id, required, ON DELETE CASCADE)
  - `title`: string (required, max 500 chars, trimmed, non-empty)
  - `description`: text (optional, max 5000 chars)
  - `completed`: boolean (default false)
  - `created_at`: datetime (auto-generated on insert)
  - `updated_at`: datetime (auto-updated on modification)
- **Relationships**: Many-to-one with User
- **Indexes**: Index on `user_id` (critical for query performance)
- **Validation Rules**:
  - Title required (400 Bad Request if missing or empty after trim)
  - Title length ≤ 500 chars (400 if exceeded)
  - Description length ≤ 5000 chars (400 if exceeded)
  - user_id must exist (foreign key constraint)
- **State Transitions**: completed: false ↔ true (toggle allowed)

**Referential Integrity**: Deleting a user cascades to their todos (ON DELETE CASCADE)

#### 2. API Contracts (contracts/ directory)

All endpoints require `Authorization: Bearer <jwt>` header (except register/login).

##### contract: auth-register.md
```
POST /api/auth/register

Request:
{
  "email": "user@example.com",
  "password": "securepassword123"
}

Response 201 Created:
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2026-01-01T00:00:00Z"
  },
  "token": "jwt_token_string"
}

Response 400 Bad Request:
{
  "detail": "Invalid email format"
}

Response 409 Conflict:
{
  "detail": "Email already registered"
}
```

##### contract: auth-login.md
```
POST /api/auth/login

Request:
{
  "email": "user@example.com",
  "password": "securepassword123"
}

Response 200 OK:
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "token": "jwt_token_string"
}

Response 401 Unauthorized:
{
  "detail": "Invalid credentials"
}
```

##### contract: todos-list.md
```
GET /api/todos
Authorization: Bearer <jwt>

Query Parameters:
- None (future: filter by completed status)

Response 200 OK:
{
  "todos": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "completed": false,
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-01T00:00:00Z"
    }
  ]
}

Response 401 Unauthorized:
{
  "detail": "Invalid or missing token"
}
```

##### contract: todos-create.md
```
POST /api/todos
Authorization: Bearer <jwt>

Request:
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"  // optional
}

Response 201 Created:
{
  "id": "uuid",
  "user_id": "uuid",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}

Response 400 Bad Request:
{
  "detail": "Title is required"
}

Response 401 Unauthorized:
{
  "detail": "Invalid or missing token"
}
```

##### contract: todos-get.md
```
GET /api/todos/{todo_id}
Authorization: Bearer <jwt>

Response 200 OK:
{
  "id": "uuid",
  "user_id": "uuid",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}

Response 404 Not Found:
{
  "detail": "Todo not found"
}
// Note: Returns 404 (not 403) even if todo exists but belongs to another user
// This prevents user enumeration attacks

Response 401 Unauthorized:
{
  "detail": "Invalid or missing token"
}
```

##### contract: todos-update.md
```
PUT /api/todos/{todo_id}
Authorization: Bearer <jwt>

Request:
{
  "title": "Buy groceries and cook",
  "description": "Updated description"  // optional
}

Response 200 OK:
{
  "id": "uuid",
  "user_id": "uuid",
  "title": "Buy groceries and cook",
  "description": "Updated description",
  "completed": false,
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T10:30:00Z"
}

Response 400 Bad Request:
{
  "detail": "Title is required"
}

Response 404 Not Found:
{
  "detail": "Todo not found"
}

Response 401 Unauthorized:
{
  "detail": "Invalid or missing token"
}
```

##### contract: todos-delete.md
```
DELETE /api/todos/{todo_id}
Authorization: Bearer <jwt>

Response 204 No Content
// Empty body

Response 404 Not Found:
{
  "detail": "Todo not found"
}

Response 401 Unauthorized:
{
  "detail": "Invalid or missing token"
}
```

##### contract: todos-toggle-complete.md
```
PATCH /api/todos/{todo_id}/complete
Authorization: Bearer <jwt>

Request:
{
  "completed": true
}

Response 200 OK:
{
  "id": "uuid",
  "user_id": "uuid",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": true,
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T11:00:00Z"
}

Response 404 Not Found:
{
  "detail": "Todo not found"
}

Response 401 Unauthorized:
{
  "detail": "Invalid or missing token"
}
```

#### 3. Quickstart Guide (quickstart.md)

Document developer onboarding:
- Prerequisites (Python 3.11+, Node.js 18+, PostgreSQL access)
- Environment setup (.env files for frontend/backend)
- Database initialization (Alembic migrations)
- Running backend (uvicorn)
- Running frontend (npm run dev)
- Testing the full flow (register → login → create todo → view list)
- Common troubleshooting (JWT secret mismatch, database connection errors)

### Exit Criteria
- ✅ data-model.md created with User and Todo entities fully specified
- ✅ All 8 API contracts created in /contracts/ directory
- ✅ quickstart.md created with developer onboarding steps
- ✅ Agent context updated (CLAUDE.md files reference new technologies)
- ✅ Constitution Check re-evaluated (PASS required to proceed)

---

## Constitution Check (Post-Design)

*Re-evaluation after Phase 1 design artifacts created*

### Principle IV: Authentication & Authorization ✅
- **Re-check**: JWT structure defined (Better Auth issues with `sub` claim = user_id)
- **Re-check**: Backend extracts user_id from JWT `sub` claim only (URL params ignored)
- **Re-check**: All /api/todos endpoints enforce JWT requirement via middleware
- **Status**: PASS ✅

### Principle V: REST API Invariants ✅
- **Re-check**: 8 API contracts documented with stable shapes
- **Re-check**: All contracts specify Authorization header requirement
- **Re-check**: Ownership violations return 404 (not 403) to prevent enumeration
- **Status**: PASS ✅

### **FINAL GATE RESULT: PASS ✅**
All constitutional principles remain satisfied after design phase. Ready for `/sp.tasks`.

---

## Summary of Artifacts to be Generated

| File | Phase | Description |
|------|-------|-------------|
| research.md | 0 | Technology integration patterns and best practices |
| data-model.md | 1 | User and Todo entities with SQLModel specifications |
| contracts/auth-register.md | 1 | POST /api/auth/register contract |
| contracts/auth-login.md | 1 | POST /api/auth/login contract |
| contracts/todos-list.md | 1 | GET /api/todos contract |
| contracts/todos-create.md | 1 | POST /api/todos contract |
| contracts/todos-get.md | 1 | GET /api/todos/{id} contract |
| contracts/todos-update.md | 1 | PUT /api/todos/{id} contract |
| contracts/todos-delete.md | 1 | DELETE /api/todos/{id} contract |
| contracts/todos-toggle-complete.md | 1 | PATCH /api/todos/{id}/complete contract |
| quickstart.md | 1 | Developer onboarding guide |
| backend/CLAUDE.md | 1 | Backend-specific implementation guidance |
| frontend/CLAUDE.md | 1 | Frontend-specific implementation guidance |

---

## Implementation Risks & Mitigations

### Risk 1: JWT Secret Mismatch Between Frontend and Backend
**Severity**: High (breaks authentication entirely)
**Mitigation**:
- Single source of truth: `BETTER_AUTH_SECRET` environment variable
- Validation on startup (both frontend and backend check secret exists)
- Documented in quickstart.md with .env.example

### Risk 2: User ID Leaked from URL Parameters
**Severity**: Critical (constitutional violation, security breach)
**Mitigation**:
- Backend NEVER reads user_id from URL, query params, or request body
- User identity ONLY derived from JWT `sub` claim
- Ownership violations return 404 (not 403) to prevent enumeration
- Contract tests verify this behavior

### Risk 3: Frontend Bypassing Centralized API Client
**Severity**: Medium (auth token not attached, requests fail)
**Mitigation**:
- Centralized API client in /frontend/src/lib/api.ts
- Code review enforces no direct fetch() calls outside api.ts
- ESLint rule to flag direct fetch usage (future enhancement)

### Risk 4: SQL Injection via ORM Misuse
**Severity**: High (data breach)
**Mitigation**:
- SQLModel ORM exclusively (constitutional requirement)
- No raw SQL queries
- Input validation on all endpoints (Pydantic models)

### Risk 5: Database Migration Conflicts
**Severity**: Medium (schema inconsistencies)
**Mitigation**:
- Alembic migrations versioned and committed
- migrations/ directory in backend
- Quickstart.md documents migration commands

---

## Next Steps

1. **User Approval**: Review this plan for constitutional compliance and technical soundness
2. **Phase 0 Execution**: Generate research.md with all technology integration patterns
3. **Phase 1 Execution**: Generate data-model.md, contracts/, and quickstart.md
4. **Agent Context Update**: Run update-agent-context.ps1 to propagate technology choices to CLAUDE.md files
5. **Task Generation**: Execute `/sp.tasks` to break plan into actionable implementation tasks

---

**Plan Status**: Ready for Phase 0 execution
**Constitutional Compliance**: ✅ PASS (all 10 principles satisfied)
**Spec Traceability**: ✅ All requirements from spec.md addressed
**Technology Stack**: ✅ Locked per constitution (Next.js, FastAPI, SQLModel, Better Auth, PostgreSQL)
