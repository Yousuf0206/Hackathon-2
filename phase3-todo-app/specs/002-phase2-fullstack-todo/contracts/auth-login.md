# API Contract: User Login

**Endpoint**: `POST /api/auth/login`
**Feature**: 002-phase2-fullstack-todo
**Purpose**: Authenticate user with email and password, return JWT token

---

## Overview

Authenticates a user with email and password credentials. Verifies password hash, generates a JWT token, and returns user information for session management.

**Authentication Required**: No (public endpoint)

---

## Request

### HTTP Method
`POST`

### Endpoint
```
/api/auth/login
```

### Headers
```
Content-Type: application/json
```

### Request Body

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

#### Request Schema

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `email` | string | Yes | Valid email format | User's email address |
| `password` | string | Yes | Any length | User's password (plaintext, will be verified against hash) |

#### Validation Rules

1. **email**:
   - Must be valid email format
   - Case-insensitive (normalized to lowercase)
   - Must match registered user

2. **password**:
   - Compared against stored bcrypt hash
   - Timing-safe comparison to prevent timing attacks

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
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJpYXQiOjE3MDQwNjcyMDAsImV4cCI6MTcwNDE1MzYwMCwiaXNzIjoicGhhc2UyLXRvZG8tYXBwIiwiYXVkIjoiYXBpIn0.signature"
}
```

#### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `user` | object | Authenticated user information |
| `user.id` | UUID | Unique user identifier (used in JWT `sub` claim) |
| `user.email` | string | User's email address (lowercase) |
| `token` | string | JWT token for authentication (24-hour expiry) |

**Note**: `password_hash` and `created_at` are not included in login response (only in registration).

#### JWT Token Structure

```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",  // user.id
  "iat": 1704067200,                               // issued at (Unix timestamp)
  "exp": 1704153600,                               // expires at (Unix timestamp, 24h later)
  "iss": "phase2-todo-app",                        // issuer
  "aud": "api"                                     // audience
}
```

**Token Expiry**: 24 hours from issuance (no refresh tokens in MVP)

---

### Error Responses

#### 401 Unauthorized - Invalid Credentials

```json
{
  "detail": "Invalid credentials"
}
```

**Trigger**:
- Email not found in database, OR
- Password does not match stored hash

**Security Note**: Do not distinguish between "user not found" and "wrong password" to prevent user enumeration attacks. Always return the same generic message.

---

#### 400 Bad Request - Missing Fields

```json
{
  "detail": "email is required"
}
```

```json
{
  "detail": "password is required"
}
```

**Trigger**: Required field is missing or null

---

#### 400 Bad Request - Invalid Email Format

```json
{
  "detail": "Invalid email format"
}
```

**Trigger**: Email does not match valid email pattern

---

#### 500 Internal Server Error - Database Error

```json
{
  "detail": "Internal server error"
}
```

**Trigger**: Database connection failure or unexpected error
**Note**: Does not leak internal error details for security

---

## Implementation Notes

### Backend Flow

1. **Validate Request**:
   - Check email format (Pydantic validator)
   - Check required fields

2. **Find User by Email**:
   - Query database: `SELECT * FROM users WHERE email = <normalized_email>`
   - If not found → return 401 Unauthorized

3. **Verify Password**:
   - Use bcrypt: `bcrypt.checkpw(password.encode(), user.password_hash.encode())`
   - If mismatch → return 401 Unauthorized
   - Use timing-safe comparison (bcrypt.checkpw is already timing-safe)

4. **Generate JWT**:
   - Payload: `{"sub": user.id, "iat": now, "exp": now + 24h, "iss": "phase2-todo-app", "aud": "api"}`
   - Sign with `BETTER_AUTH_SECRET` and HS256 algorithm

5. **Return Response**:
   - 200 OK with user object and JWT token

### Frontend Flow

```typescript
// Login form submission
async function handleLogin(email: string, password: string) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    if (response.ok) {
      const { user, token } = await response.json()
      // Store token in Better Auth session
      await authClient.setSession({ user, token })
      // Redirect to todos page
      router.push('/todos')
    } else if (response.status === 401) {
      setError('Invalid email or password')
    } else if (response.status === 400) {
      const { detail } = await response.json()
      setError(detail)
    }
  } catch (error) {
    setError('Login failed. Please try again.')
  }
}
```

---

## Security Considerations

1. **No User Enumeration**: Return same error message for "user not found" and "wrong password"
   - Always respond with "Invalid credentials" (never "User not found")

2. **Timing-Safe Password Comparison**: Use bcrypt.checkpw (prevents timing attacks)

3. **Rate Limiting**: Consider rate limiting to prevent brute-force attacks (future enhancement)

4. **Account Lockout**: Consider locking account after N failed attempts (future enhancement)

5. **HTTPS**: Always use HTTPS in production to protect credentials in transit

6. **No Password in Logs**: Never log plaintext passwords (even in error messages)

---

## Comparison with Registration

| Aspect | Register | Login |
|--------|----------|-------|
| HTTP Method | POST | POST |
| Endpoint | /api/auth/register | /api/auth/login |
| Success Status | 201 Created | 200 OK |
| User Not Found | N/A | 401 Unauthorized |
| Duplicate Email | 409 Conflict | N/A |
| Password Handling | Hash and store | Verify against hash |
| Response Fields | user + token | user + token |
| user.created_at | Included | Not included |

---

## Testing

### Test Cases

| Test Case | Input | Expected Output |
|-----------|-------|-----------------|
| Valid login | Existing user's email/password | 200 OK with user and token |
| Wrong password | Correct email, wrong password | 401 Unauthorized |
| Non-existent user | Email not in database | 401 Unauthorized |
| Invalid email format | `{"email": "not-an-email", "password": "password123"}` | 400 Bad Request |
| Missing email | `{"password": "password123"}` | 400 Bad Request |
| Missing password | `{"email": "test@example.com"}` | 400 Bad Request |
| Case-insensitive email | `USER@EXAMPLE.COM` (registered as lowercase) | 200 OK |

### Example cURL Request

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepassword123"
  }'
```

### Example Success Response

```bash
HTTP/1.1 200 OK
Content-Type: application/json

{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "test@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Contract Version
**Version**: 1.0.0
**Status**: Stable
**Breaking Changes**: None (initial version)

---

**Specification Traceability**: spec.md "User login" (User Story 1)
**Constitutional Compliance**: Principle IV (Authentication), Principle VIII (Error Handling)
