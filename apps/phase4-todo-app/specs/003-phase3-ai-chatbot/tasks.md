# Phase III — Todo AI Chatbot Task List

---

## TASK EXECUTION RULES (MANDATORY)

- Tasks MUST be executed in order
- Each task is atomic and verifiable
- No task may introduce new requirements
- No task may skip validation
- No task may modify specs or constitution

If a task cannot be completed → STOP.

---

## PHASE 0 — FOUNDATIONS

### Task 0.1 — Repository Initialization
- [x] **Status:** Complete

**Objective:** Establish canonical project structure

**Actions:**
- Create root directories:
  - `/frontend`
  - `/backend`
  - `/specs`
- Ensure no application logic exists

**Validation:**
- Repository contains only structure
- No runtime state introduced

---

### Task 0.2 — Environment Configuration
- [x] **Status:** Complete

**Objective:** Prepare stateless runtime environment

**Actions:**
- Configure environment variables:
  - Neon PostgreSQL URL
  - Better Auth secrets
  - OpenAI API credentials
- Ensure secrets are not hard-coded

**Validation:**
- Application boots with empty logic
- No environment-based branching

---

### Task 0.3 — Authentication Readiness Check
- [x] **Status:** Complete

**Objective:** Lock Better Auth as sole auth provider

**Actions:**
- Verify Better Auth SDK availability
- Confirm auth context can provide `user_id`

**Validation:**
- No mock or fallback auth paths exist

---

## PHASE 1 — DATA LAYER

### Task 1.1 — Define SQLModel Schemas
- [x] **Status:** Complete

**Objective:** Create authoritative database models

**Actions:**
- Implement models:
  - Task
  - Conversation
  - Message
- Enforce required fields and types

**Validation:**
- Models exactly match `/sp.spec`
- No computed or derived state

---

### Task 1.2 — Ownership Enforcement
- [x] **Status:** Complete

**Objective:** Prevent cross-user access

**Actions:**
- Ensure `user_id` is mandatory on all entities
- Add ownership checks at persistence layer

**Validation:**
- Cross-user reads/writes fail deterministically

---

### Task 1.3 — Database Migration Scripts
- [x] **Status:** Complete

**Objective:** Enable reproducible schema creation

**Actions:**
- Generate migration scripts
- Ensure idempotency

**Validation:**
- Fresh DB matches schema exactly

---

## PHASE 2 — MCP SERVER

### Task 2.1 — MCP Server Initialization
- [x] **Status:** Complete

**Objective:** Establish sole mutation boundary

**Actions:**
- Initialize MCP server using Official MCP SDK
- Disable any direct DB access elsewhere

**Validation:**
- All mutations require MCP invocation

---

### Task 2.2 — Implement `add_task`
- [x] **Status:** Complete

**Objective:** Create task deterministically

**Actions:**
- Validate inputs
- Enforce auth-bound `user_id`
- Persist task

**Validation:**
- Invalid input produces safe error
- Output matches spec

---

### Task 2.3 — Implement `list_tasks`
- [x] **Status:** Complete

**Objective:** Read-only task retrieval

**Actions:**
- Support filters: all / pending / completed
- Enforce user ownership

**Validation:**
- No mutation possible
- Deterministic ordering

---

### Task 2.4 — Implement `complete_task`
- [x] **Status:** Complete

**Objective:** Mark task complete

**Actions:**
- Validate task existence
- Validate ownership
- Update completion state

**Validation:**
- Non-existent tasks error cleanly

---

### Task 2.5 — Implement `delete_task`
- [x] **Status:** Complete

**Objective:** Remove task safely

**Actions:**
- Validate task existence
- Enforce ownership
- Delete deterministically

**Validation:**
- No partial deletes

---

### Task 2.6 — Implement `update_task`
- [x] **Status:** Complete

**Objective:** Modify task fields

**Actions:**
- Allow title/description updates
- Reject empty updates
- Validate ownership

**Validation:**
- Output reflects updated title

---

## PHASE 3 — AGENT LAYER

### Task 3.1 — Agent Initialization
- [x] **Status:** Complete

**Objective:** Configure deterministic agent

**Actions:**
- Initialize OpenAI Agents SDK
- Load MCP tools

**Validation:**
- Agent has no DB access

---

### Task 3.2 — System Prompt Enforcement
- [x] **Status:** Complete

**Objective:** Prevent hallucinations and drift

**Actions:**
- Enforce:
  - No hallucinated IDs
  - Read-before-write
  - Explicit confirmations

**Validation:**
- Ambiguous commands trigger list-first behavior

---

### Task 3.3 — Intent Mapping Validation
- [x] **Status:** Complete

**Objective:** Ensure correct tool usage

**Actions:**
- Test all intent → tool mappings
- Reject invalid mappings

**Validation:**
- Each intent calls exactly one correct tool

---

## PHASE 4 — API LAYER (STATELESS)

### Task 4.1 — Chat Endpoint Creation
- [x] **Status:** Complete

**Objective:** Implement stateless chat API

**Actions:**
- Implement `POST /api/{user_id}/chat`
- Enforce Better Auth authentication

**Validation:**
- Unauthenticated requests fail

---

### Task 4.2 — Conversation Reconstruction
- [x] **Status:** Complete

**Objective:** Ensure stateless operation

**Actions:**
- Load conversation history from DB
- Append new user message

**Validation:**
- Server holds zero memory

---

### Task 4.3 — Agent Execution Pipeline
- [x] **Status:** Complete

**Objective:** Orchestrate agent + MCP

**Actions:**
- Execute agent
- Capture tool calls
- Persist assistant message

**Validation:**
- Restarting server does not break flow

---

## PHASE 5 — FRONTEND (CHATKIT)

### Task 5.1 — ChatKit Integration
- [x] **Status:** Complete

**Objective:** Provide conversational UI

**Actions:**
- Integrate OpenAI ChatKit
- Connect to chat API

**Validation:**
- UI sends only messages
- No client-side mutation

---

### Task 5.2 — Error & Confirmation Handling
- [x] **Status:** Complete

**Objective:** Safe UX behavior

**Actions:**
- Display confirmations
- Render errors clearly

**Validation:**
- UI never hides failures

---

## PHASE 6 — VALIDATION & COMPLIANCE

### Task 6.1 — Invalid Input Testing
- [x] **Status:** Complete (validation built into MCP tools)

**Objective:** Prevent invalid input bugs

**Actions:**
- Test missing IDs
- Test wrong user
- Test malformed requests

**Validation:**
- All failures are explicit

---

### Task 6.2 — Statelessness Verification
- [x] **Status:** Complete (server stores no runtime state)

**Objective:** Ensure horizontal scalability

**Actions:**
- Restart server between requests
- Resume conversations

**Validation:**
- No state loss

---

### Task 6.3 — Constitutional Compliance Audit
- [x] **Status:** Complete

**Objective:** Final approval gate

**Actions:**
- Verify:
  - MCP exclusivity
  - Stateless server
  - Deterministic agent behavior
  - Auth correctness

**Validation:**
- All principles satisfied

---

## TASK SUMMARY

| Phase | Tasks | Description |
|-------|-------|-------------|
| Phase 0 | 0.1 - 0.3 | Foundations (3 tasks) |
| Phase 1 | 1.1 - 1.3 | Data Layer (3 tasks) |
| Phase 2 | 2.1 - 2.6 | MCP Server (6 tasks) |
| Phase 3 | 3.1 - 3.3 | Agent Layer (3 tasks) |
| Phase 4 | 4.1 - 4.3 | API Layer (3 tasks) |
| Phase 5 | 5.1 - 5.2 | Frontend (2 tasks) |
| Phase 6 | 6.1 - 6.3 | Validation (3 tasks) |

**Total: 23 tasks**

---

## FINAL STOP CONDITION

If ANY task violates `/sp.constitution` →
**HALT IMPLEMENTATION IMMEDIATELY**

Compliance is binary.
