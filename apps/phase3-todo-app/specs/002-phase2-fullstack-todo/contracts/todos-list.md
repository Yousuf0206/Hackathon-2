# API Contract: List User's Todos

**Endpoint**: `GET /api/todos`
**Feature**: 002-phase2-fullstack-todo
**Purpose**: Retrieve all todos belonging to the authenticated user

---

## Overview

Returns a list of all todos owned by the authenticated user. Results are automatically filtered by user_id extracted from JWT token. Only the authenticated user's todos are returned (user isolation enforced).

**Authentication Required**: Yes (JWT token)

---

## Request

### HTTP Method
`GET`

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

### Query Parameters

**Current Version**: None

**Future Enhancements** (out of scope for MVP):
- `?completed=true|false` - Filter by completion status
- `?sort=created_at|updated_at` - Sort order
- `?limit=N&offset=M` - Pagination

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
  "todos": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "completed": false,
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-01T00:00:00Z"
    },
    {
      "id": "660e9500-f39c-52e5-b827-557766550111",
      "user_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "title": "Finish project report",
      "description": null,
      "completed": true,
      "created_at": "2026-01-01T10:30:00Z",
      "updated_at": "2026-01-01T15:45:00Z"
    }
  ]
}
```

#### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `todos` | array | List of todo objects (may be empty) |
| `todos[].id` | UUID | Unique todo identifier |
| `todos[].user_id` | UUID | Owner's user ID (matches JWT `sub` claim) |
| `todos[].title` | string | Task title (max 500 chars) |
| `todos[].description` | string \| null | Task description (max 5000 chars, optional) |
| `todos[].completed` | boolean | Completion status (true = done, false = pending) |
| `todos[].created_at` | ISO 8601 datetime | Todo creation timestamp (UTC) |
| `todos[].updated_at` | ISO 8601 datetime | Last modification timestamp (UTC) |

#### Empty List Response

```json
{
  "todos": []
}
```

**Note**: Returns empty array (not 404) when user has no todos.

---

### Error Responses

#### 401 Unauthorized - Missing Token

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

2. **Query User's Todos**:
   - Execute: `SELECT * FROM todos WHERE user_id = <user_id_from_jwt>`
   - **Critical**: Never use user_id from URL or query params (only from JWT)

3. **Return Response**:
   - 200 OK with todos array (empty if none exist)

### Frontend Flow

```typescript
// Fetch todos on page load
async function fetchTodos() {
  try {
    // api.get() automatically attaches JWT from Better Auth session
    const { todos } = await api.get<{ todos: Todo[] }>('/api/todos')
    setTodos(todos)
  } catch (error) {
    if (error.message.includes('401')) {
      // Token expired, redirect to login
      router.push('/login')
    } else {
      setError('Failed to load todos')
    }
  }
}
```

---

## User Isolation Enforcement

### Security Guarantees

1. **user_id from JWT only**: Backend MUST extract user_id from JWT `sub` claim (never from URL, query params, or request body)

2. **Automatic filtering**: All queries filtered by authenticated user's ID
   ```python
   user_id = get_current_user(jwt_token)  # From JWT middleware
   todos = db.query(Todo).filter(Todo.user_id == user_id).all()
   ```

3. **No cross-user access**: User A cannot see User B's todos, even if they know the todo IDs

4. **Zero trust**: Backend does not trust any user-provided identifiers (only JWT)

### Example Scenario

- User A (ID: `aaa-111`) has 5 todos
- User B (ID: `bbb-222`) has 3 todos
- User A calls `GET /api/todos` with their JWT
- Response contains only User A's 5 todos (User B's 3 todos are never visible)

---

## Sorting and Ordering

**Current Behavior**: Todos returned in natural database order (typically by creation time)

**Future Enhancement**: Add `?sort=created_at|updated_at&order=asc|desc` query params

---

## Performance Considerations

- **Index Usage**: Query uses index on `todos.user_id` (O(log n) lookup)
- **Expected Response Time**: <100ms for up to 1000 todos
- **Pagination**: Not implemented in MVP (fetch all todos)
  - For users with >1000 todos, consider adding `?limit=50&offset=0` in future

---

## Testing

### Test Cases

| Test Case | JWT User ID | Todos in DB | Expected Output |
|-----------|-------------|-------------|-----------------|
| User with todos | `user-1` | 3 todos for user-1, 2 todos for user-2 | 200 OK with 3 todos (only user-1's) |
| User with no todos | `user-3` | No todos for user-3 | 200 OK with empty array |
| Invalid JWT | (invalid token) | N/A | 401 Unauthorized |
| Expired JWT | (expired token) | N/A | 401 Unauthorized |
| Missing Authorization header | (no token) | N/A | 401 Unauthorized |

### Example cURL Request

```bash
curl -X GET http://localhost:8000/api/todos \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

### Example Success Response

```bash
HTTP/1.1 200 OK
Content-Type: application/json

{
  "todos": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "completed": false,
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```

---

## Contract Version
**Version**: 1.0.0
**Status**: Stable
**Breaking Changes**: None (initial version)

---

**Specification Traceability**: spec.md "View all their tasks" (User Story 2)
**Constitutional Compliance**: Principle IV (JWT authentication), Principle V (user isolation)
