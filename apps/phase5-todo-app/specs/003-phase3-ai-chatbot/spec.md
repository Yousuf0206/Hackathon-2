# Phase III — Todo AI Chatbot (MCP + Agents)

---

## 1. SPEC PURPOSE

This specification defines the **exact, enforceable behavior** of the Phase III Todo AI Chatbot.

It translates `/sp.constitution` into:

- Concrete system responsibilities
- Deterministic agent behavior
- Strict MCP tool contracts
- Stateless request execution rules

No requirement in this spec may violate `/sp.constitution`.

---

## 2. SYSTEM OVERVIEW

The system is an **AI-powered, stateless chatbot** that manages Todo tasks through **natural language**, using:

- OpenAI Agents SDK for reasoning
- Official MCP SDK for task operations
- FastAPI as a stateless API layer
- PostgreSQL (Neon) as the sole state store

All task mutations are executed **only via MCP tools**.

---

## 3. HIGH-LEVEL ARCHITECTURE

```
User
  ↓
ChatKit UI (Frontend)
  ↓
POST /api/{user_id}/chat
  ↓
FastAPI Server (Stateless)
  ├─ Load conversation history (DB)
  ├─ Run OpenAI Agent
  ├─ Invoke MCP tools (if needed)
  ├─ Persist messages (DB)
  ↓
Response to Client
```

### Architectural Guarantees
- Server holds **zero state**
- Agents never touch the database
- MCP tools are the only mutation boundary

---

## 4. AUTHENTICATION & IDENTITY

### 4.1 Authentication Source
- Better Auth is the ONLY authentication provider
- Requests MUST be authenticated before processing

### 4.2 Identity Rules
- `user_id` MUST come from auth context
- `user_id` in requests or tools MUST match authenticated user
- Any mismatch results in a hard error

---

## 5. DATABASE MODELS (AUTHORITATIVE)

### Task
| Field | Type | Notes |
|-------|------|-------|
| id | integer | Primary key |
| user_id | string | Auth-bound owner |
| title | string | Required |
| description | string | Optional |
| completed | boolean | Default false |
| created_at | datetime | Auto |
| updated_at | datetime | Auto |

### Conversation
| Field | Type |
|-------|------|
| id | integer |
| user_id | string |
| created_at | datetime |
| updated_at | datetime |

### Message
| Field | Type |
|-------|------|
| id | integer |
| conversation_id | integer |
| user_id | string |
| role | enum(user, assistant) |
| content | text |
| created_at | datetime |

---

## 6. CHAT API SPECIFICATION

### Endpoint
```
POST /api/{user_id}/chat
```

### Request Body
| Field | Type | Required |
|-------|------|----------|
| conversation_id | integer | No |
| message | string | Yes |

### Processing Rules
1. Authenticate request
2. Validate input schema
3. Fetch conversation history (if exists)
4. Store user message
5. Run agent with history + new message
6. Execute MCP tools (if invoked)
7. Store assistant message
8. Return response

### Response
| Field | Type |
|-------|------|
| conversation_id | integer |
| response | string |
| tool_calls | array |

---

## 7. MCP SERVER SPECIFICATION

### 7.1 MCP Rules
- All tools are stateless
- One tool = one operation
- All inputs validated
- All outputs deterministic

---

### 7.2 Tool: `add_task`

**Purpose:** Create a new task

**Parameters**
| Name | Type | Required |
|------|------|----------|
| user_id | string | Yes |
| title | string | Yes |
| description | string | No |

**Validation**
- title must be non-empty
- user_id must match auth user

**Returns**
```json
{ "task_id": 1, "status": "created", "title": "..." }
```

---

### 7.3 Tool: `list_tasks`

**Purpose:** Retrieve tasks

**Parameters**
| Name | Type | Required |
|------|------|----------|
| user_id | string | Yes |
| status | string | No ("all", "pending", "completed") |

**Returns**
```json
[{ "id": 1, "title": "...", "completed": false }]
```

---

### 7.4 Tool: `complete_task`

**Purpose:** Mark task complete

**Parameters**
| Name | Type | Required |
|------|------|----------|
| user_id | string | Yes |
| task_id | integer | Yes |

**Validation**
- Task must exist
- Task must belong to user

**Returns**
```json
{ "task_id": 1, "status": "completed", "title": "..." }
```

---

### 7.5 Tool: `delete_task`

**Purpose:** Delete a task

**Parameters**
| Name | Type | Required |
|------|------|----------|
| user_id | string | Yes |
| task_id | integer | Yes |

**Returns**
```json
{ "task_id": 1, "status": "deleted", "title": "..." }
```

---

### 7.6 Tool: `update_task`

**Purpose:** Update task fields

**Parameters**
| Name | Type | Required |
|------|------|----------|
| user_id | string | Yes |
| task_id | integer | Yes |
| title | string | No |
| description | string | No |

**Returns**
```json
{ "task_id": 1, "status": "updated", "title": "..." }
```

---

## 8. AGENT BEHAVIOR SPEC

### 8.1 Intent → Tool Mapping
| Intent | Tool |
|--------|------|
| Add / remember | add_task |
| Show / list | list_tasks |
| Done / complete | complete_task |
| Delete / remove | delete_task |
| Change / update | update_task |

---

### 8.2 Mandatory Agent Rules
- Never hallucinate IDs
- Resolve ambiguity before mutation
- Use list_tasks before delete/update if unclear
- Confirm every successful action

---

## 9. ERROR HANDLING

### Error Classes
- ValidationError
- AuthorizationError
- NotFoundError
- ToolExecutionError

### Rules
- No silent failures
- No partial writes
- Errors must be user-safe

---

## 10. NON-GOALS (EXPLICITLY EXCLUDED)

- Real-time streaming
- Background jobs
- Client-side task mutation
- Demo or mock auth
- In-memory state

---

## 11. COMPLIANCE CHECK

This spec is compliant ONLY IF:

- All rules in `/sp.constitution` are preserved
- MCP tools are the sole mutation mechanism
- Server is stateless
- Agent behavior is deterministic

Any deviation → **STOP EXECUTION**.
