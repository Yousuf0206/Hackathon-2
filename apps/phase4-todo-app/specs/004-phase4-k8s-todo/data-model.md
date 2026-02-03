# Data Model: Phase IV — Cloud-Native Todo AI Chatbot

**Branch**: `001-phase4-k8s-todo` | **Date**: 2026-02-02

## Entities

### User (no changes from Phase III)

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| id | UUID | Yes | Primary key, auto-generated | |
| email | string | Yes | Unique, max 255 chars, indexed | |
| password_hash | string | Yes | bcrypt hash | |
| created_at | datetime | Yes | Auto-generated on create | |
| updated_at | datetime | Yes | Auto-generated on create/update | |

**Relationships**: One User → Many Tasks, One User → Many Conversations

---

### Task (MODIFIED — Phase IV additions)

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| id | integer | Yes | Primary key, auto-increment | |
| user_id | string | Yes | Indexed, not nullable | FK to User (logical, not SQL FK due to UUID vs string mismatch) |
| title | string | Yes | Min 1, max 500 chars | |
| description | string | No | Max 5000 chars | |
| due_date | date | No | Format: YYYY-MM-DD | **NEW in Phase IV** |
| due_time | string | No | Format: HH:MM (24-hour), regex `^\d{2}:\d{2}$` | **NEW in Phase IV** — stored as string to avoid timezone issues |
| completed | boolean | Yes | Default: false | |
| created_at | datetime | Yes | Auto-generated on create | |
| updated_at | datetime | Yes | Auto-generated on create/update | **Sort key for all task views (DESC)** |

**Validation Rules**:
- `due_date`: Must be a valid calendar date if provided. Past dates are accepted (user may log completed work).
- `due_time`: Must match `HH:MM` 24-hour format (00:00–23:59) if provided. Stored without timezone.
- `due_time` without `due_date` is allowed (recurring daily reminder pattern).
- `due_date` without `due_time` is allowed (all-day task).
- On any mutation (title, description, due_date, due_time, completed), `updated_at` MUST be refreshed.

**State Transitions**:
```
created (completed=false)
    ↓ complete_task
completed (completed=true)
    ↓ (no uncomplete via MCP — only via direct API if needed)
```

**Relationships**: Many Tasks → One User

---

### Conversation (no changes from Phase III)

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| id | integer | Yes | Primary key, auto-increment | |
| user_id | string | Yes | Indexed, not nullable | |
| created_at | datetime | Yes | Auto-generated on create | |
| updated_at | datetime | Yes | Auto-generated on create/update | |

**Relationships**: One Conversation → Many Messages, Many Conversations → One User

---

### Message (no changes from Phase III)

| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| id | integer | Yes | Primary key, auto-increment | |
| conversation_id | integer | Yes | FK → conversations.id, indexed | |
| user_id | string | Yes | Indexed | |
| role | enum | Yes | Values: "user", "assistant" | |
| content | string | Yes | Not nullable | |
| created_at | datetime | Yes | Auto-generated on create | |

**Relationships**: Many Messages → One Conversation

---

## Migration Plan

**New columns on `tasks` table**:

```sql
ALTER TABLE tasks ADD COLUMN due_date DATE;
ALTER TABLE tasks ADD COLUMN due_time VARCHAR(5);
```

Both columns are nullable — no default needed. Existing tasks will have `NULL` for both, which is correct behavior (tasks without dates per FR-003).

**Index consideration**: No index on due_date/due_time needed for Phase IV (no date-range queries specified). The primary query pattern is `WHERE user_id = ? ORDER BY updated_at DESC`, which is already indexed on `user_id`.

## Entity Relationship Diagram

```
User (UUID)
 ├── 1:N → Task (int PK, user_id string)
 │         ├── title
 │         ├── description?
 │         ├── due_date?      ← NEW
 │         ├── due_time?      ← NEW
 │         ├── completed
 │         ├── created_at
 │         └── updated_at     ← SORT KEY
 │
 └── 1:N → Conversation (int PK, user_id string)
            └── 1:N → Message (int PK, conversation_id FK)
                       ├── role (user|assistant)
                       ├── content
                       └── created_at
```
