# API Contract: Update Todo

**Endpoint**: `PUT /api/todos/{todo_id}`
**Feature**: 002-phase2-fullstack-todo
**Purpose**: Update title and/or description of an existing todo (with ownership verification)

---

## Overview

Updates an existing todo's title and/or description. Automatically verifies ownership: returns 404 if todo doesn't exist OR belongs to a different user. The `completed` status is NOT updated by this endpoint (use PATCH /api/todos/{id}/complete for that).

**Authentication Required**: Yes (JWT token)

---

## Request

### HTTP Method
`PUT`

### Endpoint
```
/api/todos/{todo_id}
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
  "title": "Buy groceries and cook",
  "description": "Updated description"
}
```

#### Request Schema

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `title` | string | Yes | Non-empty after trim, max 500 chars | New task title |
| `description` | string | No | Max 5000 chars | New task description (optional) |

#### Validation Rules

1. **title**:
   - Required (cannot be missing, null, or empty after trimming)
   - Maximum 500 characters after trimming
   - Whitespace trimmed from both ends
   - Example valid: `"Buy groceries"`, `"  Updated task  "` (trimmed to `"Updated task"`)
   - Example invalid: `""`, `"   "`, `null`, `undefined`

2. **description**:
   - Optional (can be omitted, null, or empty string)
   - Maximum 5000 characters if provided
   - To clear description, send `null` or `""`

#### Minimal Request (Title Only)

```json
{
  "title": "New title"
}
```

**Note**: If `description` is omitted, existing description is preserved.

#### Clear Description

```json
{
  "title": "New title",
  "description": null
}
```

or

```json
{
  "title": "New title",
  "description": ""
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
  "title": "Buy groceries and cook",
  "description": "Updated description",
  "completed": false,
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T10:30:00Z"
}
```

#### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique todo identifier (unchanged) |
| `user_id` | UUID | Owner's user ID (unchanged) |
| `title` | string | Updated task title |
| `description` | string \| null | Updated task description (or null) |
| `completed` | boolean | Completion status (unchanged by this endpoint) |
| `created_at` | ISO 8601 datetime | Todo creation timestamp (unchanged) |
| `updated_at` | ISO 8601 datetime | Last modification timestamp (updated to current UTC time) |

**Note**: `updated_at` is automatically updated to current timestamp when todo is modified.

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
   - Check `title` is present and non-empty after trimming
   - Check `title` length ≤ 500 characters
   - Check `description` length ≤ 5000 characters (if provided)

4. **Query Todo with Ownership Check**:
   - Execute: `SELECT * FROM todos WHERE id = <todo_id> AND user_id = <user_id_from_jwt>`
   - If no result → return 404 (does not distinguish "not found" vs "unauthorized")

5. **Update Todo**:
   - Trim `title`
   - Update `title` and `description` fields
   - Set `updated_at` to current UTC timestamp
   - Commit to database

6. **Return Response**:
   - 200 OK with updated todo object

### Frontend Flow

```typescript
// Update todo form submission
async function handleUpdateTodo(todoId: string, title: string, description?: string) {
  try {
    // api.put() automatically attaches JWT from Better Auth session
    const updatedTodo = await api.put<Todo>(`/api/todos/${todoId}`, {
      title: title.trim(),
      description: description || null
    })

    // Update local state
    setTodos(todos.map(t => t.id === todoId ? updatedTodo : t))

    // Show success message
    setSuccess('Todo updated successfully')
  } catch (error) {
    if (error.message.includes('400')) {
      setError('Invalid todo data')
    } else if (error.message.includes('404')) {
      setError('Todo not found')
      router.push('/todos')
    } else if (error.message.includes('401')) {
      router.push('/login')  // Token expired
    } else {
      setError('Failed to update todo')
    }
  }
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

   # Update fields
   todo.title = validated_data.title.strip()
   todo.description = validated_data.description
   todo.updated_at = datetime.utcnow()
   db.commit()
   ```

3. **404 on unauthorized access**: Return 404 (not 403) to prevent enumeration

### Example Scenario

- User A (ID: `aaa-111`) owns todo `todo-123`
- User B (ID: `bbb-222`) tries to update `PUT /api/todos/todo-123` with their JWT
- Backend extracts `user_id = bbb-222` from User B's JWT
- Query: `SELECT * FROM todos WHERE id = todo-123 AND user_id = bbb-222`
- Result: No match (todo belongs to User A)
- Response: 404 Not Found (update blocked)

---

## Field Update Behavior

| Request | Existing Todo | Result |
|---------|---------------|--------|
| `{"title": "New"}` | `{title: "Old", description: "Text"}` | `{title: "New", description: "Text"}` (description preserved) |
| `{"title": "New", "description": null}` | `{title: "Old", description: "Text"}` | `{title: "New", description: null}` (description cleared) |
| `{"title": "New", "description": ""}` | `{title: "Old", description: "Text"}` | `{title: "New", description: ""}` (description cleared) |
| `{"title": "  New  "}` | `{title: "Old", description: "Text"}` | `{title: "New", description: "Text"}` (title trimmed) |

---

## What This Endpoint Does NOT Update

- **completed status**: Use `PATCH /api/todos/{id}/complete` instead
- **user_id**: Cannot be changed (todo ownership is permanent)
- **id**: Cannot be changed (immutable primary key)
- **created_at**: Cannot be changed (immutable creation timestamp)

---

## Testing

### Test Cases

| Test Case | Request | Expected Output |
|-----------|---------|-----------------|
| Valid update (title + description) | `{"title": "New", "description": "Updated"}` | 200 OK with updated todo |
| Valid update (title only) | `{"title": "New"}` | 200 OK, description unchanged |
| Clear description | `{"title": "New", "description": null}` | 200 OK, description set to null |
| Title with whitespace | `{"title": "  New  "}` | 200 OK, title trimmed to "New" |
| Missing title | `{"description": "Text"}` | 400 Bad Request |
| Empty title | `{"title": ""}` | 400 Bad Request |
| Title too long | `{"title": "<501 chars>"}` | 400 Bad Request |
| Description too long | `{"description": "<5001 chars>"}` | 400 Bad Request |
| Non-existent todo | (valid data, wrong ID) | 404 Not Found |
| Unauthorized access | (User B updating User A's todo) | 404 Not Found |
| Invalid JWT | (expired token) | 401 Unauthorized |

### Example cURL Request

```bash
curl -X PUT http://localhost:8000/api/todos/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries and cook",
    "description": "Updated description"
  }'
```

### Example Success Response

```bash
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "title": "Buy groceries and cook",
  "description": "Updated description",
  "completed": false,
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T10:30:00Z"
}
```

---

## Contract Version
**Version**: 1.0.0
**Status**: Stable
**Breaking Changes**: None (initial version)

---

**Specification Traceability**: spec.md "Edit existing tasks" (User Story 2)
**Constitutional Compliance**: Principle IV (JWT authentication), Principle V (user isolation, 404 on violations)
