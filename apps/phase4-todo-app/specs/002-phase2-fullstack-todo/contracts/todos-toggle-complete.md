# API Contract: Toggle Todo Completion Status

**Endpoint**: `PATCH /api/todos/{todo_id}/complete`
**Feature**: 002-phase2-fullstack-todo
**Purpose**: Toggle or set the completion status of a todo (with ownership verification)

---

## Overview

Updates the `completed` status of a todo. Can be used to mark a todo as complete (`true`) or reopen it (`false`). Automatically verifies ownership: returns 404 if todo doesn't exist OR belongs to a different user.

**Authentication Required**: Yes (JWT token)

---

## Request

### HTTP Method
`PATCH`

### Endpoint
```
/api/todos/{todo_id}/complete
```

**Path Parameter**: `todo_id` (UUID) - Unique identifier of the todo to update

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Required Header**: `Authorization` with valid JWT token from login/register

### Request Body

```json
{
  "completed": true
}
```

#### Request Schema

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `completed` | boolean | Yes | `true` or `false` | New completion status |

#### Validation Rules

1. **completed**:
   - Required (cannot be missing or null)
   - Must be boolean (`true` or `false`)
   - Accepts either value (can toggle in both directions)

#### Examples

**Mark as complete**:
```json
{
  "completed": true
}
```

**Reopen (mark as incomplete)**:
```json
{
  "completed": false
}
```

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
  "completed": true,
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T11:00:00Z"
}
```

#### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique todo identifier (unchanged) |
| `user_id` | UUID | Owner's user ID (unchanged) |
| `title` | string | Task title (unchanged) |
| `description` | string \| null | Task description (unchanged) |
| `completed` | boolean | Updated completion status |
| `created_at` | ISO 8601 datetime | Todo creation timestamp (unchanged) |
| `updated_at` | ISO 8601 datetime | Last modification timestamp (updated to current UTC time) |

**Note**: Only `completed` and `updated_at` are modified. Title and description remain unchanged.

---

### Error Responses

#### 400 Bad Request - Missing or Invalid Completed Field

```json
{
  "detail": "completed is required and must be a boolean"
}
```

**Trigger**:
- `completed` field missing from request body
- `completed` is null
- `completed` is not a boolean (e.g., `"true"` as string, `1`, `0`)

---

#### 404 Not Found - Todo Not Found or Unauthorized

```json
{
  "detail": "Todo not found"
}
```

**Trigger**:
- Todo with `todo_id` does not exist in database, OR
- Todo exists but belongs to a different user (ownership violation)

**Security Note**: Returns same 404 response for both cases to prevent user enumeration.

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

3. **Validate Request Body**:
   - Check `completed` field is present
   - Check `completed` is boolean type (not string or number)

4. **Query Todo with Ownership Check**:
   - Execute: `SELECT * FROM todos WHERE id = <todo_id> AND user_id = <user_id_from_jwt>`
   - If no result → return 404 (does not distinguish "not found" vs "unauthorized")

5. **Update Completion Status**:
   - Set `completed` to request value
   - Set `updated_at` to current UTC timestamp
   - Commit to database

6. **Return Response**:
   - 200 OK with updated todo object

### Frontend Flow

```typescript
// Toggle todo completion
async function handleToggleComplete(todoId: string, currentCompleted: boolean) {
  try {
    // Toggle to opposite state
    const updatedTodo = await api.patch<Todo>(`/api/todos/${todoId}/complete`, {
      completed: !currentCompleted
    })

    // Update local state
    setTodos(todos.map(t => t.id === todoId ? updatedTodo : t))
  } catch (error) {
    if (error.message.includes('404')) {
      setError('Todo not found')
      fetchTodos()  // Refresh list
    } else if (error.message.includes('401')) {
      router.push('/login')  // Token expired
    } else {
      setError('Failed to update todo')
    }
  }
}

// UI component
function TodoItem({ todo }: { todo: Todo }) {
  return (
    <div>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => handleToggleComplete(todo.id, todo.completed)}
      />
      <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
        {todo.title}
      </span>
    </div>
  )
}
```

---

## User Isolation Enforcement

### Security Guarantees

1. **user_id from JWT only**: Backend MUST extract user_id from JWT `sub` claim (never from URL, query params, or request body)

2. **Ownership check before update**: Query includes `AND user_id = <user_id_from_jwt>`
   ```python
   user_id = get_current_user(jwt_token)  # From JWT middleware
   todo = db.query(Todo).filter(
       Todo.id == todo_id,
       Todo.user_id == user_id  # Ownership verification
   ).first()

   if not todo:
       raise HTTPException(status_code=404, detail="Todo not found")

   # Update completion status
   todo.completed = validated_data.completed
   todo.updated_at = datetime.utcnow()
   db.commit()
   ```

3. **404 on unauthorized access**: Return 404 (not 403) to prevent enumeration

---

## Idempotency

**Question**: What happens if you set `completed: true` when todo is already complete?

**Answer**:
- Request succeeds with 200 OK
- `updated_at` is updated (even though `completed` didn't change)
- Response contains current state

**Idempotent**: Setting the same value multiple times is safe and produces consistent results.

```json
// Todo is already completed: true
// Request: {"completed": true}
// Result: Still completed: true, updated_at changes
```

---

## State Transitions

| Current State | Request | New State | Notes |
|---------------|---------|-----------|-------|
| `false` | `{"completed": true}` | `true` | Mark as complete |
| `true` | `{"completed": false}` | `false` | Reopen todo |
| `false` | `{"completed": false}` | `false` | Idempotent (no change) |
| `true` | `{"completed": true}` | `true` | Idempotent (no change) |

**All transitions are allowed** (can toggle in both directions, idempotent operations allowed)

---

## Why PATCH Instead of PUT?

| Method | Typical Use | This Endpoint |
|--------|-------------|---------------|
| **PATCH** | Partial update (one or few fields) | Used here (only updates `completed`) |
| **PUT** | Full replacement (all fields) | Used for title/description updates |

**Rationale**: PATCH is semantically correct because we're only modifying one field (`completed`), not replacing the entire resource.

---

## Comparison with Update Endpoint

| Aspect | PUT /api/todos/{id} | PATCH /api/todos/{id}/complete |
|--------|---------------------|--------------------------------|
| Updates | title, description | completed |
| Method | PUT | PATCH |
| Required Fields | title | completed |
| Use Case | Edit task details | Toggle task completion |

**Separation of Concerns**: Keep completion toggling separate from content editing for cleaner API design.

---

## Testing

### Test Cases

| Test Case | Request | Current State | Expected Output |
|-----------|---------|---------------|-----------------|
| Mark as complete | `{"completed": true}` | `completed: false` | 200 OK, `completed: true` |
| Reopen todo | `{"completed": false}` | `completed: true` | 200 OK, `completed: false` |
| Idempotent (already complete) | `{"completed": true}` | `completed: true` | 200 OK, `completed: true` |
| Idempotent (already incomplete) | `{"completed": false}` | `completed: false` | 200 OK, `completed: false` |
| Missing field | `{}` | Any | 400 Bad Request |
| Invalid type (string) | `{"completed": "true"}` | Any | 400 Bad Request |
| Invalid type (number) | `{"completed": 1}` | Any | 400 Bad Request |
| Non-existent todo | `{"completed": true}` | (doesn't exist) | 404 Not Found |
| Unauthorized access | `{"completed": true}` | (other user's todo) | 404 Not Found |
| Invalid JWT | `{"completed": true}` | Any | 401 Unauthorized |

### Example cURL Request (Mark as Complete)

```bash
curl -X PATCH http://localhost:8000/api/todos/550e8400-e29b-41d4-a716-446655440000/complete \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "completed": true
  }'
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
  "completed": true,
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T11:00:00Z"
}
```

---

## Frontend Best Practices

### Optimistic UI Update

```typescript
// Optimistic toggle (update UI immediately, rollback on error)
async function handleToggleCompleteOptimistic(todoId: string, currentCompleted: boolean) {
  const newCompleted = !currentCompleted

  // Update UI immediately
  setTodos(todos.map(t =>
    t.id === todoId ? { ...t, completed: newCompleted } : t
  ))

  try {
    // Confirm with server
    await api.patch(`/api/todos/${todoId}/complete`, { completed: newCompleted })
  } catch (error) {
    // Rollback on error
    setTodos(todos.map(t =>
      t.id === todoId ? { ...t, completed: currentCompleted } : t
    ))
    setError('Failed to update todo')
  }
}
```

**Benefit**: Instant UI feedback (feels faster to user)

---

## Contract Version
**Version**: 1.0.0
**Status**: Stable
**Breaking Changes**: None (initial version)

---

**Specification Traceability**: spec.md "Mark tasks as complete or incomplete" (User Story 2)
**Constitutional Compliance**: Principle IV (JWT authentication), Principle V (user isolation, 404 on violations)
