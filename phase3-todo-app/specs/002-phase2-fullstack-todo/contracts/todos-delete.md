# API Contract: Delete Todo

**Endpoint**: `DELETE /api/todos/{todo_id}`
**Feature**: 002-phase2-fullstack-todo
**Purpose**: Delete an existing todo (with ownership verification)

---

## Overview

Permanently deletes a todo by its unique ID. Automatically verifies ownership: returns 404 if todo doesn't exist OR belongs to a different user. Deletion is permanent and cannot be undone.

**Authentication Required**: Yes (JWT token)

---

## Request

### HTTP Method
`DELETE`

### Endpoint
```
/api/todos/{todo_id}
```

**Path Parameter**: `todo_id` (UUID) - Unique identifier of the todo to delete

### Headers
```
Authorization: Bearer <jwt_token>
```

**Required Header**: `Authorization` with valid JWT token from login/register

### Request Body
None (DELETE request has no body)

---

## Response

### Success Response (204 No Content)

#### Status Code
`204 No Content`

#### Headers
None (or minimal headers)

#### Response Body
**Empty** (no body for 204 status)

**Note**: Successful deletion returns empty response. Frontend should not expect JSON body.

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

4. **Delete Todo**:
   - Execute: `DELETE FROM todos WHERE id = <todo_id> AND user_id = <user_id_from_jwt>`
   - Commit transaction

5. **Return Response**:
   - 204 No Content (empty body)

### Frontend Flow

```typescript
// Delete todo
async function handleDeleteTodo(todoId: string) {
  if (!confirm('Are you sure you want to delete this todo?')) {
    return  // User cancelled
  }

  try {
    // api.delete() automatically attaches JWT from Better Auth session
    await api.delete(`/api/todos/${todoId}`)

    // Remove from local state
    setTodos(todos.filter(t => t.id !== todoId))

    // Show success message
    setSuccess('Todo deleted successfully')
  } catch (error) {
    if (error.message.includes('404')) {
      setError('Todo not found')
      // Refresh list (may have been deleted already)
      fetchTodos()
    } else if (error.message.includes('401')) {
      router.push('/login')  // Token expired
    } else {
      setError('Failed to delete todo')
    }
  }
}
```

---

## User Isolation Enforcement

### Security Guarantees

1. **user_id from JWT only**: Backend MUST extract user_id from JWT `sub` claim (never from URL or query params)

2. **Ownership check before deletion**: Query includes `AND user_id = <user_id_from_jwt>`
   ```python
   user_id = get_current_user(jwt_token)  # From JWT middleware
   todo = db.query(Todo).filter(
       Todo.id == todo_id,
       Todo.user_id == user_id  # Ownership verification
   ).first()

   if not todo:
       raise HTTPException(status_code=404, detail="Todo not found")

   db.delete(todo)
   db.commit()
   ```

3. **404 on unauthorized access**: Return 404 (not 403) to prevent enumeration
   - Attacker cannot distinguish "todo doesn't exist" from "todo belongs to someone else"

4. **Permanent deletion**: No "soft delete" or trash (out of scope for MVP)

### Example Scenario

- User A (ID: `aaa-111`) owns todo `todo-123`
- User B (ID: `bbb-222`) tries to delete `DELETE /api/todos/todo-123` with their JWT
- Backend extracts `user_id = bbb-222` from User B's JWT
- Query: `SELECT * FROM todos WHERE id = todo-123 AND user_id = bbb-222`
- Result: No match (todo belongs to User A)
- Response: 404 Not Found (deletion blocked, User A's todo is safe)

---

## Idempotency

**Question**: What happens if you delete the same todo twice?

**Answer**:
- First delete: 204 No Content (todo deleted)
- Second delete: 404 Not Found (todo no longer exists)

**Non-idempotent**: DELETE is not idempotent in this implementation (second call returns different status). This is acceptable for todo deletion.

**Alternative Design** (not implemented): Always return 204 for idempotency, even if todo already deleted. Current design preferred for clarity.

---

## Cascading Behavior

**User Deletion**: If a user is deleted, all their todos are automatically deleted via `ON DELETE CASCADE` foreign key constraint. No orphaned todos remain in the database.

---

## Confirmation Behavior

**Backend**: No confirmation required (if request is authenticated and authorized, deletion proceeds immediately)

**Frontend**: Should implement confirmation dialog (e.g., "Are you sure you want to delete this todo?") to prevent accidental deletions

---

## Testing

### Test Cases

| Test Case | JWT User ID | Todo Owner | Expected Output |
|-----------|-------------|------------|-----------------|
| Valid deletion (own todo) | `user-1` | `user-1` | 204 No Content |
| Unauthorized deletion (other user's todo) | `user-1` | `user-2` | 404 Not Found |
| Non-existent todo | `user-1` | (doesn't exist) | 404 Not Found |
| Double deletion | `user-1` | `user-1` (already deleted) | 404 Not Found |
| Invalid UUID format | `user-1` | N/A | 400 Bad Request |
| Invalid JWT | (invalid token) | N/A | 401 Unauthorized |
| Expired JWT | (expired token) | N/A | 401 Unauthorized |

### Example cURL Request

```bash
curl -X DELETE http://localhost:8000/api/todos/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Example Success Response

```bash
HTTP/1.1 204 No Content
```

**Note**: No response body (empty)

### Example 404 Response (Not Found or Unauthorized)

```bash
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "detail": "Todo not found"
}
```

---

## Frontend Considerations

### Optimistic UI Update

```typescript
// Optimistic deletion (remove from UI immediately)
async function handleDeleteTodoOptimistic(todoId: string) {
  // Remove from local state immediately
  const originalTodos = [...todos]
  setTodos(todos.filter(t => t.id !== todoId))

  try {
    await api.delete(`/api/todos/${todoId}`)
    // Success - UI already updated
  } catch (error) {
    // Failure - restore original state
    setTodos(originalTodos)
    setError('Failed to delete todo')
  }
}
```

### Pessimistic UI Update

```typescript
// Pessimistic deletion (wait for server confirmation)
async function handleDeleteTodoPessimistic(todoId: string) {
  setDeleting(true)

  try {
    await api.delete(`/api/todos/${todoId}`)
    // Success - now remove from UI
    setTodos(todos.filter(t => t.id !== todoId))
  } catch (error) {
    setError('Failed to delete todo')
  } finally {
    setDeleting(false)
  }
}
```

**Recommendation**: Use pessimistic approach for deletion (wait for server confirmation) to ensure data consistency.

---

## Contract Version
**Version**: 1.0.0
**Status**: Stable
**Breaking Changes**: None (initial version)

---

**Specification Traceability**: spec.md "Delete tasks" (User Story 2)
**Constitutional Compliance**: Principle IV (JWT authentication), Principle V (user isolation, 404 on violations)
