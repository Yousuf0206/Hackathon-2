---
id: PHR-002-002
title: Phase II Full-Stack Todo Implementation Plan
stage: plan
date: 2026-01-01
surface: cli
model: claude-opus-4-5
feature: 002-phase2-fullstack-todo
branch: 002-phase2-fullstack-todo
user: user
command: /sp.plan
labels: [plan, phase2, full-stack, implementation, jwt, user-isolation, monorepo]
links:
  spec: specs/002-phase2-fullstack-todo/spec.md
  ticket: N/A
  adr: N/A
  pr: N/A
files:
  - path: specs/002-phase2-fullstack-todo/plan.md
    action: created
    lines: 741
  - path: specs/002-phase2-fullstack-todo/research.md
    action: created
    lines: 450
  - path: specs/002-phase2-fullstack-todo/data-model.md
    action: created
    lines: ~200
  - path: specs/002-phase2-fullstack-todo/quickstart.md
    action: created
    lines: ~300
  - path: specs/002-phase2-fullstack-todo/contracts/auth-register.md
    action: created
    lines: ~50
  - path: specs/002-phase2-fullstack-todo/contracts/auth-login.md
    action: created
    lines: ~40
  - path: specs/002-phase2-fullstack-todo/contracts/todos-list.md
    action: created
    lines: ~45
  - path: specs/002-phase2-fullstack-todo/contracts/todos-create.md
    action: created
    lines: ~45
  - path: specs/002-phase2-fullstack-todo/contracts/todos-get.md
    action: created
    lines: ~45
  - path: specs/002-phase2-fullstack-todo/contracts/todos-update.md
    action: created
    lines: ~50
  - path: specs/002-phase2-fullstack-todo/contracts/todos-delete.md
    action: created
    lines: ~35
  - path: specs/002-phase2-fullstack-todo/contracts/todos-toggle-complete.md
    action: created
    lines: ~45
  - path: CLAUDE.md
    action: updated
    lines: N/A
tests:
  - type: N/A
    path: N/A
    status: N/A
---

## Prompt

User requested implementation plan for Phase II Full-Stack Todo Web Application following the feature specification created in PHR-002-001. The plan must be strictly subordinate to both `/sp.constitution` and `/sp.specify`, with any conflicts requiring immediate halt and clarification.

**Planning Constraints**:
- Technology stack constitutionally locked (Next.js App Router, FastAPI, SQLModel, PostgreSQL, Better Auth)
- Backend must be stateless (no server-side sessions)
- User isolation is non-negotiable (constitutional violation if breached)
- All API requests require valid JWT
- JWT `sub` claim is sole source of user identity
- Monorepo structure required (`/frontend`, `/backend`, `/specs`)

**Key Technical Challenges**:
1. Better Auth + FastAPI JWT integration (frontend issues, backend verifies)
2. User data isolation enforcement at query level
3. URL user ID neutralization (backend ignores URL params, JWT only)
4. Next.js App Router + Better Auth integration
5. Environment variable management (shared `BETTER_AUTH_SECRET`)

**User Input Emphasis**:
User provided detailed "Execution Plan (Spec-Compliant, Risk-Resolved)" outlining phased approach:
- Phase 0-2: Monorepo setup and constitution check
- Phase 3: Database & ORM specification lock
- Phase 4: Backend API implementation
- Phase 5: Frontend integration
- Phase 6: Security & determinism validation
- Phase 7: Acceptance verification

## Response snapshot

Created comprehensive implementation plan at `specs/002-phase2-fullstack-todo/plan.md` (741 lines) with full constitutional compliance check, project structure, research tasks, and design artifacts.

**Plan Structure**:

1. **Summary**: Multi-user web todo app with JWT auth, user isolation, PostgreSQL persistence

2. **Technical Context**:
   - Languages: Python 3.11+ (backend), TypeScript 5+ (frontend)
   - Dependencies: FastAPI, SQLModel, python-jose, passlib, Next.js 16+, Better Auth
   - Performance: <500ms API p95, <2s page load, 100+ concurrent users
   - Scale: MVP ~1000 todos/user, 2 entities, 6 user stories, 5-6 endpoints

3. **Constitution Check (10 Principles)**: ✅ ALL PASS
   - Principle I: Agentic Dev Stack workflow (spec → plan → tasks)
   - Principle II: Technology lock (all mandated tech used)
   - Principle III: PostgreSQL only, SQLModel only, user_id FK on todos
   - Principle IV: JWT auth with `sub` claim, stateless backend
   - Principle V: REST API stable, user isolation, 404 on violations
   - Principle VI: App Router, Server Components, auto JWT
   - Principle VII: Monorepo structure, scoped CLAUDE.md files
   - Principle VIII: Explicit errors, no leakage, resilient
   - Principle IX: Deterministic, spec-traceable
   - Principle X: No forbidden actions

4. **Project Structure**:
   - Documentation: plan.md, research.md, data-model.md, quickstart.md, contracts/
   - Source code: `/backend` (FastAPI), `/frontend` (Next.js), strict separation

5. **Phase 0: Research & Technology Validation** (5 research tasks):
   - Better Auth + JWT integration (HS256, shared secret, `sub` claim)
   - FastAPI JWT verification (python-jose, HTTPBearer dependency)
   - SQLModel user isolation (indexed foreign key, query-level filtering)
   - Next.js App Router + Better Auth (AuthProvider, centralized API client)
   - Environment variable management (separate .env files, .env.example)

6. **Phase 1: Design & Contracts**:
   - Data model: User (email, password_hash) + Todo (user_id FK, title, description, completed)
   - 8 API contracts: register, login, list/create/get/update/delete/toggle-complete todos
   - Quickstart guide: setup, run, test, troubleshoot

7. **Implementation Risks & Mitigations**:
   - JWT secret mismatch: single source of truth, validation on startup
   - User ID from URL: backend ignores, JWT only, 404 on violations
   - Frontend bypass: centralized API client enforced
   - SQL injection: SQLModel only, no raw SQL
   - Migration conflicts: Alembic versioning

**Phase 0 Execution (research.md)**:

Researched and documented 5 integration patterns:

1. **Better Auth + JWT**: HS256 symmetric signing, shared `BETTER_AUTH_SECRET`, JWT payload with `sub` claim containing user_id
2. **FastAPI JWT Verification**: python-jose with HTTPBearer dependency, automatic 401, stateless auth
3. **SQLModel User Isolation**: Explicit user_id filtering, indexed FK, 404 on ownership violations (prevents enumeration)
4. **Next.js + Better Auth**: AuthProvider, centralized API client with auto JWT attachment, middleware for protected routes
5. **Environment Variables**: Separate .env files per service, .env.example committed, same secret in both

**Phase 1 Execution (design artifacts)**:

Generated 11 design artifacts via autonomous agent:

1. **data-model.md**: User and Todo entities with SQLModel specs, validation rules, indexes, referential integrity
2. **8 API contracts** (auth-register, auth-login, todos-list/create/get/update/delete/toggle-complete): Request/response schemas, error codes, security notes
3. **quickstart.md**: Prerequisites, environment setup, database init, run commands, test flow, 15+ troubleshooting items

**Agent Context Update**:

Updated `CLAUDE.md` with:
- Language: Python 3.11+ (backend), TypeScript 5+ (frontend)
- Database: Neon Serverless PostgreSQL
- Project type: Web application monorepo

**Post-Design Constitution Re-check**: ✅ PASS
- Principle IV: JWT structure defined (`sub` = user_id), backend extracts from JWT only
- Principle V: 8 contracts stable, Authorization required, 404 on violations

## Outcome

- ✅ Impact: Comprehensive implementation plan created with constitutional compliance, technology research, and complete design artifacts. Plan successfully bridges spec.md (user requirements) to implementation-ready contracts and data models. All 10 constitutional principles validated as satisfied. Zero violations requiring justification.
- 🧪 Tests: N/A (planning phase, testing strategy embedded in contracts and quickstart)
- 📁 Files: plan.md (741 lines), research.md (450 lines), data-model.md, quickstart.md, 8 API contracts, CLAUDE.md updated
- 🔁 Next prompts: Use `/sp.tasks` to generate task breakdown from plan. Tasks will be organized by user story (P1: auth, create/view, isolation; P2: complete/edit; P3: delete) with foundational phase (setup, database, auth middleware) blocking all user stories.
- 🧠 Reflection: Plan successfully resolved all technical unknowns through Phase 0 research. JWT integration pattern (Better Auth issues, FastAPI verifies) validated as compatible. User isolation pattern (indexed FK + query-level filtering → 404 on violations) prevents enumeration attacks. Centralized API client ensures consistent JWT attachment. Monorepo structure enables independent frontend/backend deployment. All risks identified with mitigations documented.

## Evaluation notes (flywheel)

- Failure modes observed: None. Constitution check passed all 10 principles pre- and post-design. Technology research found zero incompatibilities. Agent successfully generated all Phase 1 artifacts matching plan specifications.
- Graders run and results (PASS/FAIL): Constitution Check - PASS (pre-design and post-design)
- Prompt variant (if applicable): N/A (first use)
- Next experiment (smallest change to try): Validate that `/sp.tasks` correctly converts user stories (P1/P2/P3) into independently implementable task phases. Test that foundational tasks (database setup, JWT middleware) correctly block user story tasks. Verify task parallelization markers ([P]) align with independent files in monorepo structure.
