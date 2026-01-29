# Phase III — Todo AI Chatbot Implementation Plan

---

## 1. PLAN PURPOSE

This plan defines the **ordered execution strategy** for implementing the Phase III Todo AI Chatbot.

It translates `/sp.spec` into:
- Deterministic implementation phases
- Clear dependency ordering
- Explicit verification checkpoints

This plan introduces **no new requirements** and makes **no architectural changes**.

---

## 2. EXECUTION PRINCIPLES (NON-NEGOTIABLE)

- Follow Agentic Dev Stack strictly
- No manual coding
- No implementation outside `/sp.task`
- No deviation from stateless + MCP-first design
- All work must be reviewable and auditable

---

## 3. PHASE BREAKDOWN OVERVIEW

| Phase | Name | Outcome |
|-------|------|---------|
| Phase 0 | Foundations | Environment + DB ready |
| Phase 1 | Data Layer | Schema + persistence |
| Phase 2 | MCP Server | Canonical task tools |
| Phase 3 | Agent Layer | Deterministic AI behavior |
| Phase 4 | API Layer | Stateless chat endpoint |
| Phase 5 | Frontend | ChatKit UI |
| Phase 6 | Validation | Compliance & failure testing |

Each phase must be **fully complete** before proceeding.

---

## 4. PHASE 0 — FOUNDATIONS

### Objectives
- Prepare environment for stateless execution
- Lock technology stack
- Prevent drift from the start

### Tasks
- Initialize repository structure:
  - `/frontend`
  - `/backend`
  - `/specs`
- Configure environment variables:
  - Database URL (Neon)
  - Better Auth secrets
  - OpenAI API credentials
- Verify Better Auth integration readiness

### Exit Criteria
- App can start with no runtime state
- No business logic implemented yet

---

## 5. PHASE 1 — DATA LAYER

### Objectives
- Define authoritative schema
- Ensure persistence-first architecture

### Tasks
- Implement SQLModel models:
  - Task
  - Conversation
  - Message
- Create database migration scripts
- Validate ownership constraints (`user_id`)

### Exit Criteria
- Database schema matches `/sp.spec`
- No agent or API logic present

---

## 6. PHASE 2 — MCP SERVER

### Objectives
- Establish the ONLY mutation boundary
- Enforce deterministic task operations

### Tasks
- Initialize MCP server using Official MCP SDK
- Implement tools:
  - add_task
  - list_tasks
  - complete_task
  - delete_task
  - update_task
- Add strict input validation for each tool
- Enforce auth-bound `user_id` checks

### Exit Criteria
- All task mutations work via MCP tools only
- No direct DB access outside MCP layer

---

## 7. PHASE 3 — AGENT LAYER

### Objectives
- Implement deterministic AI behavior
- Enforce intent-to-tool mapping

### Tasks
- Configure OpenAI Agents SDK
- Define agent system prompt enforcing:
  - No hallucinated IDs
  - Read-before-write rule
  - Explicit confirmations
- Register MCP tools with agent runner
- Validate ambiguity resolution logic

### Exit Criteria
- Agent calls correct MCP tools for all intents
- No direct DB or API access by agent

---

## 8. PHASE 4 — API LAYER (STATELESS)

### Objectives
- Provide single stateless chat endpoint
- Orchestrate agent + MCP + persistence

### Tasks
- Implement `POST /api/{user_id}/chat`
- Authenticate request using Better Auth
- Validate request schema
- Load conversation history from DB
- Store user message
- Execute agent
- Store assistant response
- Return response payload

### Exit Criteria
- Server holds ZERO state between requests
- Requests are fully reproducible

---

## 9. PHASE 5 — FRONTEND (CHATKIT)

### Objectives
- Provide conversational UI
- No business logic in frontend

### Tasks
- Integrate OpenAI ChatKit
- Connect to chat API endpoint
- Handle responses and confirmations
- Display errors gracefully

### Exit Criteria
- User can manage todos via natural language
- Frontend never mutates state directly

---

## 10. PHASE 6 — VALIDATION & COMPLIANCE

### Objectives
- Prove system correctness
- Prevent invalid input bugs

### Tasks
- Test invalid inputs (missing IDs, wrong user)
- Test ambiguous commands
- Test server restart recovery
- Verify stateless behavior
- Verify MCP exclusivity
- Validate constitutional compliance checklist

### Exit Criteria
- All failures are explicit and safe
- System passes compliance checklist

---

## 11. FAILURE & STOP CONDITIONS

STOP execution immediately if:
- Agent accesses DB directly
- Server stores in-memory state
- MCP tools perform multiple operations
- Demo or mock auth appears
- Spec or constitution is altered

---

## 12. PLAN COMPLETION DEFINITION

This plan is complete ONLY WHEN:
- All phases meet exit criteria
- All rules in `/sp.constitution` are upheld
- System behavior is deterministic and auditable

If uncertainty exists → **DO NOT IMPLEMENT**.

---

## CONSTITUTION CHECK

| Principle | Status |
|-----------|--------|
| Stateless Server Law | Plan enforces zero in-memory state |
| MCP Exclusivity Law | All mutations via MCP tools only |
| Tool Determinism Law | One tool = one operation |
| Input Validation | Strict validation at all boundaries |
| Agent Guardrails | No hallucinated IDs, read-before-write |
| Conversation State Law | DB-persisted, reconstructed per request |
| Technology Lock | OpenAI ChatKit, FastAPI, Agents SDK, MCP SDK, SQLModel, Neon, Better Auth |
| Authentication Law | Better Auth only, user_id from auth context |
| Error Handling | Explicit, logged, non-destructive |

**Plan is COMPLIANT with constitution.**
