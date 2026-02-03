# API Contract: Create Todo

**Endpoint**: `POST /api/todos`
**Feature**: 002-phase2-fullstack-todo
**Purpose**: Create a new todo item for the authenticated user

---

## Overview

Creates a new todo item owned by the authenticated user. The user_id is automatically extracted from the JWT token and associated with the new todo. Validates title (required) and description (optional).

**Authentication Required**: Yes (JWT token)

---

## Request

### HTTP Method
`POST`

### Endpoint
```
/api/todos
```

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Required Header**: `Authorization` with valid JWT token from login/register

### Request Body

```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

#### Request Schema

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `title` | string | Yes | Non-empty after trim, max 500 chars | Task title |
| `description` | string | No | Max 5000 chars | Task description (optional) |

#### Validation Rules

1. **title**:
   - Required (cannot be missing, null, or empty after trimming)
   - Maximum 500 characters after trimming
   - Whitespace trimmed from both ends
   - Example valid: `"Buy groceries"`, `"  Task with spaces  "` (trimmed to `"Task with spaces"`)
   - Example invalid: `""`, `"   "`, `null`, `undefined`

2. **description**:
   - Optional (can be omitted, null, or empty string)
   - Maximum 5000 characters if provided
   - Not trimmed (whitespace preserved)

#### Minimal Request (No Description)

```json
{
  "title": "Buy groceries"
}
```

---

## Response

### Success Response (201 Created)

#### Status Code
`201 Created`

#### Headers
```
Content-Type: application/json
```

#### Response Body

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}
```

#### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique todo identifier (auto-generated) |
| `user_id` | UUID | Owner's user ID (from JWT `sub` claim) |
| `title` | string | Task title (trimmed) |
| `description` | string \| null | Task description (null if not provided) |
| `completed` | boolean | Always `false` for new todos |
| `created_at` | ISO 8601 datetime | Todo creation timestamp (UTC) |
| `updated_at` | ISO 8601 datetime | Last modification timestamp (UTC, same as created_at initially) |

**Note**: `completed` always starts as `false` (use PATCH /api/todos/{id}/complete to toggle later)

---

### Error Responses

#### 400 Bad Request - Title Missing or Empty

```json
{
  "detail": "Title is required"
}
```

**Trigger**:
- `title` field missing from request body
- `title` is null
- `title` is empty string (`""`)
- `title` is only whitespace (`"   "`)

---

#### 400 Bad Request - Title Too Long

```json
{
  "detail": "Title must be 500 characters or less"
}
```

**Trigger**: `title` length > 500 characters after trimming

---

#### 400 Bad Request - Description Too Long

```json
{
  "detail": "Description must be 5000 characters or less"
}
```

**Trigger**: `description` length > 5000 characters

---

#### 401 Unauthorized - Missing or Invalid Token

```json
{
  "detail": "Invalid or missing token"
}
```

**Trigger**:
- `Authorization` header missing
- Token is empty or malformed
- Token signature is invalid
- Token has expired (>24 hours old)
- Token `sub` claim is missing

**User Action**: Re-authenticate (login again)

---

#### 500 Internal Server Error - Database Error

```json
{
  "detail": "Internal server error"
}
```

**Trigger**: Database connection failure or unexpected error

---

## Implementation Notes

### Backend Flow

1. **Verify JWT Token**:
   - Extract token from `Authorization: Bearer <token>` header
   - Verify signature with `BETTER_AUTH_SECRET`
   - Verify expiration (must be within 24 hours)
   - Extract user_id from `sub` claim

2. **Validate Request Body**:
   - Check `title` is present and non-empty after trimming
   - Check `title` length ≤ 500 characters
   - Check `description` length ≤ 5000 characters (if provided)

3. **Trim Title**:
   - Remove leading/trailing whitespace from title
   - Example: `"  Buy groceries  "` → `"Buy groceries"`

4. **Create Todo**:
   - Generate UUID for `id`
   - Set `user_id` from JWT (never from request body)
   - Set `completed` to `false`
   - Set `created_at` and `updated_at` to current UTC timestamp
   - Insert into database

5. **Return Response**:
   - 201 Created with full todo object

### Frontend Flow

```typescript
// Create todo form submission
async function handleCreateTodo(title: string, description?: string) {
  try {
    // api.post() automatically attaches JWT from Better Auth session
    const todo = await api.post<Todo>('/api/todos', {
      title: title.trim(),  // Trim on frontend too (better UX)
      description: description || null
    })

    // Add to local state
    setTodos([...todos, todo])

    // Clear form
    setTitle('')
    setDescription('')
  } catch (error) {
    if (error.message.includes('400')) {
      setError('Invalid todo data')
    } else if (error.message.includes('401')) {
      router.push('/login')  // Token expired
    } else {
      setError('Failed to create todo')
    }
  }
}
```

---

## User Isolation Enforcement

### Security Guarantees

1. **user_id from JWT only**: Backend MUST extract user_id from JWT `sub` claim (never from request body)

2. **No user_id in request**: Client should never send `user_id` in request body (backend ignores it if present)

3. **Automatic ownership**: New todo automatically owned by authenticated user

### Example Scenario

- User A (ID: `aaa-111`) creates todo with JWT token
- Backend extracts `user_id = aaa-111` from JWT
- New todo saved with `user_id = aaa-111`
- User A can access this todo; User B cannot

---

## Trimming Behavior

| Input Title | Stored Title | Notes |
|-------------|--------------|-------|
| `"Buy groceries"` | `"Buy groceries"` | No change |
| `"  Buy groceries  "` | `"Buy groceries"` | Leading/trailing spaces removed |
| `"Buy  groceries"` | `"Buy  groceries"` | Internal spaces preserved |
| `"   "` | (rejected) | Empty after trim → 400 Bad Request |
| `""` | (rejected) | Empty → 400 Bad Request |

---

## Testing

### Test Cases

| Test Case | Request Body | Expected Output |
|-----------|--------------|-----------------|
| Valid todo with description | `{"title": "Buy groceries", "description": "Milk, eggs"}` | 201 Created with todo |
| Valid todo without description | `{"title": "Buy groceries"}` | 201 Created with `description: null` |
| Title with whitespace | `{"title": "  Task  "}` | 201 Created with `title: "Task"` (trimmed) |
| Missing title | `{"description": "Some text"}` | 400 Bad Request |
| Empty title | `{"title": ""}` | 400 Bad Request |
| Whitespace-only title | `{"title": "   "}` | 400 Bad Request |
| Title too long | `{"title": "<501 chars>"}` | 400 Bad Request |
| Description too long | `{"description": "<5001 chars>"}` | 400 Bad Request |
| Invalid JWT | (expired token) | 401 Unauthorized |

### Example cURL Request

```bash
curl -X POST http://localhost:8000/api/todos \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries",
    "description": "Milk, eggs, bread"
  }'
```

### Example Success Response

```bash
HTTP/1.1 201 Created
Content-Type: application/json

{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}
```

---

## Contract Version
**Version**: 1.0.0
**Status**: Stable
**Breaking Changes**: None (initial version)

---

**Specification Traceability**: spec.md "Add new tasks" (User Story 2)
**Constitutional Compliance**: Principle IV (JWT authentication), Principle V (user isolation)
