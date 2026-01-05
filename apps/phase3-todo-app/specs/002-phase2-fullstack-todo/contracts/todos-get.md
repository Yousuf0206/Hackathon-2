# API Contract: Get Single Todo

**Endpoint**: `GET /api/todos/{todo_id}`
**Feature**: 002-phase2-fullstack-todo
**Purpose**: Retrieve a specific todo by ID (with ownership verification)

---

## Overview

Retrieves a single todo by its unique ID. Automatically verifies ownership: returns 404 if todo doesn't exist OR belongs to a different user (prevents user enumeration attacks).

**Authentication Required**: Yes (JWT token)

---

## Request

### HTTP Method
`GET`

### Endpoint
```
/api/todos/{todo_id}
```

**Path Parameter**: `todo_id` (UUID) - Unique identifier of the todo to retrieve

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Required Header**: `Authorization` with valid JWT token from login/register

### Request Body
None (GET request has no body)

---

## Response

### Success Response (200 OK)

#### Status Code
`200 OK`

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
| `id` | UUID | Unique todo identifier (matches path parameter) |
| `user_id` | UUID | Owner's user ID (matches JWT `sub` claim) |
| `title` | string | Task title (max 500 chars) |
| `description` | string \| null | Task description (max 5000 chars, optional) |
| `completed` | boolean | Completion status (true = done, false = pending) |
| `created_at` | ISO 8601 datetime | Todo creation timestamp (UTC) |
| `updated_at` | ISO 8601 datetime | Last modification timestamp (UTC) |

---

### Error Responses

#### 404 Not Found - Todo Not Found or Unauthorized

```json
{
  "detail": "Todo not found"
}
```

**Trigger**:
- Todo with `todo_id` does not exist in database, OR
- Todo exists but belongs to a different user (ownership violation)

**Security Note**: Returns same 404 response for both cases to prevent user enumeration. Attacker cannot determine if todo exists but belongs to another user.

**Example Scenarios**:
- User A tries to access todo that doesn't exist → 404
- User A tries to access User B's todo → 404 (same response, no information leak)

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

#### 400 Bad Request - Invalid UUID Format

```json
{
  "detail": "Invalid todo ID format"
}
```

**Trigger**: `todo_id` in URL is not a valid UUID

**Example Invalid UUIDs**: `"123"`, `"not-a-uuid"`, `""`

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

2. **Validate Path Parameter**:
   - Check `todo_id` is valid UUID format
   - Return 400 Bad Request if invalid

3. **Query Todo with Ownership Check**:
   - Execute: `SELECT * FROM todos WHERE id = <todo_id> AND user_id = <user_id_from_jwt>`
   - **Critical**: Query includes both `id` and `user_id` filter (ownership check)
   - If no result → return 404 (does not distinguish "not found" vs "unauthorized")

4. **Return Response**:
   - 200 OK with todo object if found and owned by authenticated user
   - 404 Not Found if not found or ownership mismatch

### Frontend Flow

```typescript
// Fetch single todo (e.g., for detail page)
async function fetchTodoById(todoId: string) {
  try {
    // api.get() automatically attaches JWT from Better Auth session
    const todo = await api.get<Todo>(`/api/todos/${todoId}`)
    setTodo(todo)
  } catch (error) {
    if (error.message.includes('404')) {
      setError('Todo not found')
      router.push('/todos')  // Redirect to list page
    } else if (error.message.includes('401')) {
      router.push('/login')  // Token expired
    } else {
      setError('Failed to load todo')
    }
  }
}
```

---

## User Isolation Enforcement

### Security Guarantees

1. **user_id from JWT only**: Backend MUST extract user_id from JWT `sub` claim (never from URL or query params)

2. **Ownership check in query**: SQL query includes `AND user_id = <user_id_from_jwt>`
   ```python
   user_id = get_current_user(jwt_token)  # From JWT middleware
   todo = db.query(Todo).filter(
       Todo.id == todo_id,
       Todo.user_id == user_id  # Ownership verification
   ).first()
   ```

3. **404 on unauthorized access**: Return 404 (not 403) to prevent enumeration
   - Attacker cannot distinguish "todo doesn't exist" from "todo belongs to someone else"
   - Prevents discovery of other users' todo IDs

4. **No information leakage**: Error message is generic ("Todo not found")

### Example Scenario

- User A (ID: `aaa-111`) owns todo `todo-123`
- User B (ID: `bbb-222`) tries to access `GET /api/todos/todo-123` with their JWT
- Backend extracts `user_id = bbb-222` from User B's JWT
- Query: `SELECT * FROM todos WHERE id = todo-123 AND user_id = bbb-222`
- Result: No match (todo belongs to User A)
- Response: 404 Not Found (User B cannot see todo)

---

## Why 404 Instead of 403?

| Status Code | Meaning | Information Leak |
|-------------|---------|------------------|
| **404 Not Found** | "I don't know what you're talking about" | No leak (could mean todo doesn't exist OR unauthorized) |
| **403 Forbidden** | "I know it exists, but you can't access it" | Leaks existence (attacker learns todo exists) |

**Constitutional Requirement**: Use 404 for ownership violations (Principle V: REST API Invariants)

---

## Testing

### Test Cases

| Test Case | JWT User ID | Todo Owner | Expected Output |
|-----------|-------------|------------|-----------------|
| Valid access (own todo) | `user-1` | `user-1` | 200 OK with todo |
| Unauthorized access (other user's todo) | `user-1` | `user-2` | 404 Not Found |
| Non-existent todo | `user-1` | (doesn't exist) | 404 Not Found |
| Invalid UUID format | `user-1` | N/A | 400 Bad Request |
| Invalid JWT | (invalid token) | N/A | 401 Unauthorized |
| Expired JWT | (expired token) | N/A | 401 Unauthorized |

### Example cURL Request

```bash
curl -X GET http://localhost:8000/api/todos/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

### Example Success Response

```bash
HTTP/1.1 200 OK
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

### Example 404 Response (Not Found or Unauthorized)

```bash
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "detail": "Todo not found"
}
```

---

## Contract Version
**Version**: 1.0.0
**Status**: Stable
**Breaking Changes**: None (initial version)

---

**Specification Traceability**: spec.md "View all their tasks" (User Story 2)
**Constitutional Compliance**: Principle IV (JWT authentication), Principle V (user isolation, 404 on violations)
