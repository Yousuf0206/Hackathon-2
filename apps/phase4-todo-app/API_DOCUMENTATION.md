# TaskFlow API Documentation

## Base URL
```
http://localhost:8000
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Table of Contents
1. [Authentication Endpoints](#authentication-endpoints)
2. [Todo Endpoints](#todo-endpoints)
3. [Health Check](#health-check)
4. [Error Responses](#error-responses)
5. [Request/Response Examples](#requestresponse-examples)

---

## Authentication Endpoints

### 1. Register User

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "string (valid email)",
  "password": "string (min 8 characters)"
}
```

**Success Response:** `201 Created`
```json
{
  "user": {
    "id": "63ccc090-684d-4b98-8bcf-a3fb5369de43",
    "email": "user@example.com",
    "created_at": "2026-01-03T00:00:00.000000"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400 Bad Request` - Invalid email format or password too short
- `409 Conflict` - Email already registered

**Example:**
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123"
  }'
```

---

### 2. Login

Authenticate and receive a JWT token.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Success Response:** `200 OK`
```json
{
  "user": {
    "id": "63ccc090-684d-4b98-8bcf-a3fb5369de43",
    "email": "user@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `400 Bad Request` - Missing email or password

**Example:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

**JWT Token Details:**
- Algorithm: HS256
- Expiration: 24 hours from issue time
- Claims:
  - `sub` (subject): User ID (UUID)
  - `exp` (expiration): Unix timestamp
  - `iat` (issued at): Unix timestamp

---

## Todo Endpoints

All todo endpoints require authentication via Bearer token.

### 3. Get All Todos

Retrieve all todos for the authenticated user.

**Endpoint:** `GET /api/todos`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response:** `200 OK`
```json
{
  "todos": [
    {
      "id": "82284687-3ca6-4d34-807a-5ecb568a0d63",
      "user_id": "63ccc090-684d-4b98-8bcf-a3fb5369de43",
      "title": "Complete project documentation",
      "description": "Write comprehensive README",
      "completed": false,
      "created_at": "2026-01-03T00:00:00.000000",
      "updated_at": "2026-01-03T00:00:00.000000"
    },
    {
      "id": "5e40a9f2-ae39-419b-a8d8-4e10719947b6",
      "user_id": "63ccc090-684d-4b98-8bcf-a3fb5369de43",
      "title": "Fix authentication bugs",
      "description": "Review JWT implementation",
      "completed": true,
      "created_at": "2026-01-02T12:00:00.000000",
      "updated_at": "2026-01-03T10:30:00.000000"
    }
  ]
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token

**Example:**
```bash
curl -X GET http://localhost:8000/api/todos \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Notes:**
- Returns only todos belonging to the authenticated user
- Todos are ordered by creation date (newest first)
- Empty array returned if user has no todos

---

### 4. Create Todo

Create a new todo for the authenticated user.

**Endpoint:** `POST /api/todos`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "string (required, max 500 chars)",
  "description": "string (optional, max 2000 chars)"
}
```

**Success Response:** `201 Created`
```json
{
  "id": "82284687-3ca6-4d34-807a-5ecb568a0d63",
  "user_id": "63ccc090-684d-4b98-8bcf-a3fb5369de43",
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API documentation",
  "completed": false,
  "created_at": "2026-01-03T00:00:00.000000",
  "updated_at": "2026-01-03T00:00:00.000000"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid request body (missing title, title too long, etc.)
- `401 Unauthorized` - Invalid or missing token
- `422 Unprocessable Entity` - Validation error

**Example:**
```bash
curl -X POST http://localhost:8000/api/todos \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New task",
    "description": "Task description here"
  }'
```

**Notes:**
- `user_id` is automatically set from the JWT token
- `completed` defaults to `false`
- Timestamps are automatically set

---

### 5. Update Todo

Update an existing todo's title and/or description.

**Endpoint:** `PUT /api/todos/{todo_id}`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters:**
- `todo_id` (UUID, required): The ID of the todo to update

**Request Body:**
```json
{
  "title": "string (required, max 500 chars)",
  "description": "string (optional, max 2000 chars)"
}
```

**Success Response:** `200 OK`
```json
{
  "id": "82284687-3ca6-4d34-807a-5ecb568a0d63",
  "user_id": "63ccc090-684d-4b98-8bcf-a3fb5369de43",
  "title": "Updated title",
  "description": "Updated description",
  "completed": false,
  "created_at": "2026-01-03T00:00:00.000000",
  "updated_at": "2026-01-03T10:30:00.000000"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid request body
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - Todo not found or doesn't belong to user

**Example:**
```bash
curl -X PUT http://localhost:8000/api/todos/82284687-3ca6-4d34-807a-5ecb568a0d63 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated task title",
    "description": "Updated description"
  }'
```

**Notes:**
- `updated_at` timestamp is automatically updated
- Cannot change `user_id`, `id`, `completed`, or `created_at`
- To toggle completion, use the dedicated completion endpoint

---

### 6. Toggle Todo Completion

Mark a todo as complete or incomplete.

**Endpoint:** `PATCH /api/todos/{todo_id}/complete`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**URL Parameters:**
- `todo_id` (UUID, required): The ID of the todo to update

**Request Body:**
```json
{
  "completed": true
}
```

**Success Response:** `200 OK`
```json
{
  "id": "82284687-3ca6-4d34-807a-5ecb568a0d63",
  "user_id": "63ccc090-684d-4b98-8bcf-a3fb5369de43",
  "title": "Complete project documentation",
  "description": "Write comprehensive README",
  "completed": true,
  "created_at": "2026-01-03T00:00:00.000000",
  "updated_at": "2026-01-03T10:30:00.000000"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid request body (missing `completed` field)
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - Todo not found or doesn't belong to user

**Example:**
```bash
# Mark as complete
curl -X PATCH http://localhost:8000/api/todos/82284687-3ca6-4d34-807a-5ecb568a0d63/complete \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# Mark as incomplete
curl -X PATCH http://localhost:8000/api/todos/82284687-3ca6-4d34-807a-5ecb568a0d63/complete \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"completed": false}'
```

**Notes:**
- `updated_at` timestamp is automatically updated
- Use `true` to mark complete, `false` to mark incomplete

---

### 7. Delete Todo

Permanently delete a todo.

**Endpoint:** `DELETE /api/todos/{todo_id}`

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `todo_id` (UUID, required): The ID of the todo to delete

**Success Response:** `204 No Content`
(Empty response body)

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `404 Not Found` - Todo not found or doesn't belong to user

**Example:**
```bash
curl -X DELETE http://localhost:8000/api/todos/82284687-3ca6-4d34-807a-5ecb568a0d63 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Notes:**
- Deletion is permanent and cannot be undone
- Frontend should show confirmation dialog before deleting

---

## Health Check

### 8. Health Check

Check if the API is running.

**Endpoint:** `GET /health`

**Success Response:** `200 OK`
```json
{
  "status": "healthy",
  "service": "phase2-todo-api"
}
```

**Example:**
```bash
curl http://localhost:8000/health
```

**Notes:**
- No authentication required
- Use for monitoring and deployment verification

---

## Error Responses

All error responses follow this format:

### Standard Error Format
```json
{
  "detail": "Error message description"
}
```

### Validation Error Format (422)
```json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "title"],
      "msg": "Field required",
      "input": null
    }
  ]
}
```

### Common HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 204 | No Content | Deletion successful |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid token |
| 404 | Not Found | Resource doesn't exist or access denied |
| 409 | Conflict | Resource already exists (e.g., duplicate email) |
| 422 | Unprocessable Entity | Validation error |
| 500 | Internal Server Error | Server-side error |

---

## Request/Response Examples

### Complete User Flow Example

```bash
# 1. Register a new user
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"Demo123456"}')

# Extract token
TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.token')

# 2. Create a todo
curl -X POST http://localhost:8000/api/todos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My first todo",
    "description": "Learning the API"
  }'

# 3. Get all todos
curl -X GET http://localhost:8000/api/todos \
  -H "Authorization: Bearer $TOKEN"

# 4. Update the todo
curl -X PUT http://localhost:8000/api/todos/REPLACE_WITH_TODO_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My updated todo",
    "description": "Updated description"
  }'

# 5. Mark as complete
curl -X PATCH http://localhost:8000/api/todos/REPLACE_WITH_TODO_ID/complete \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# 6. Delete the todo
curl -X DELETE http://localhost:8000/api/todos/REPLACE_WITH_TODO_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## Rate Limiting

Currently, there is no rate limiting implemented. For production deployment, consider adding:
- Rate limiting middleware
- Request throttling per user
- API key management

---

## CORS Configuration

The API is configured to accept requests from:
- `http://localhost:3000` (development frontend)

For production, update `CORS_ORIGINS` in backend `.env` file:
```env
CORS_ORIGINS=https://your-frontend-domain.com
```

---

## Security Considerations

### Authentication Best Practices
1. **Never expose JWT secret** - Keep `BETTER_AUTH_SECRET` secure
2. **Use HTTPS in production** - Encrypt token transmission
3. **Rotate secrets regularly** - Change JWT secret periodically
4. **Implement token refresh** - Consider refresh token pattern for long sessions
5. **Validate input** - API validates all inputs, but client should too

### Data Isolation
- User IDs are extracted **only** from JWT tokens
- Never trust user_id from request body or URL parameters
- All queries filter by authenticated user's ID
- 404 returned instead of 403 to prevent user enumeration

---

## Interactive Documentation

For an interactive API explorer, visit:
```
http://localhost:8000/docs
```

This provides:
- Interactive API testing
- Request/response schemas
- Authentication testing
- Real-time validation

Alternative documentation format:
```
http://localhost:8000/redoc
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Todos Table
```sql
CREATE TABLE todos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_todos_user_id ON todos(user_id);
```

---

## Postman Collection

Import this collection into Postman for easy testing:

```json
{
  "info": {
    "name": "TaskFlow API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:8000"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```

---

## Support

For issues or questions:
1. Check this documentation
2. Review error responses
3. Check backend logs
4. Visit interactive docs at `/docs`
5. Review README.md for setup issues

---

**Version**: 1.0.0
**Last Updated**: 2026-01-03
**Status**: ✅ Production Ready
