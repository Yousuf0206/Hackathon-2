# API Contract: User Registration

**Endpoint**: `POST /api/auth/register`
**Feature**: 002-phase2-fullstack-todo
**Purpose**: Register a new user account and return JWT token

---

## Overview

Creates a new user account with email and password credentials. Validates email format and uniqueness, hashes the password, stores the user in the database, and returns a JWT token for immediate authentication.

**Authentication Required**: No (public endpoint)

---

## Request

### HTTP Method
`POST`

### Endpoint
```
/api/auth/register
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
| `email` | string | Yes | Valid email format, max 255 chars | User's email address (used for login) |
| `password` | string | Yes | Min 8 characters | User's password (will be hashed) |

#### Validation Rules

1. **email**:
   - Must be valid email format (e.g., `user@example.com`)
   - Case-insensitive (normalized to lowercase)
   - Maximum 255 characters
   - Must be unique (not already registered)

2. **password**:
   - Minimum 8 characters
   - No maximum length (hash is fixed size)
   - Will be hashed with bcrypt before storage (never stored as plaintext)

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
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "created_at": "2026-01-01T00:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1NTBlODQwMC1lMjliLTQxZDQtYTcxNi00NDY2NTU0NDAwMDAiLCJpYXQiOjE3MDQwNjcyMDAsImV4cCI6MTcwNDE1MzYwMCwiaXNzIjoicGhhc2UyLXRvZG8tYXBwIiwiYXVkIjoiYXBpIn0.signature"
}
```

#### Response Schema

| Field | Type | Description |
|-------|------|-------------|
| `user` | object | Created user information |
| `user.id` | UUID | Unique user identifier (used in JWT `sub` claim) |
| `user.email` | string | User's email address (lowercase) |
| `user.created_at` | ISO 8601 datetime | Account creation timestamp (UTC) |
| `token` | string | JWT token for authentication (24-hour expiry) |

**Note**: `password_hash` is never included in response for security reasons.

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

#### 400 Bad Request - Invalid Email Format

```json
{
  "detail": "Invalid email format"
}
```

**Trigger**: Email does not match valid email pattern
**Example Invalid Emails**: `"not-an-email"`, `"@example.com"`, `"user@"`, `""`

---

#### 400 Bad Request - Password Too Short

```json
{
  "detail": "Password must be at least 8 characters"
}
```

**Trigger**: Password length < 8 characters

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

#### 409 Conflict - Email Already Registered

```json
{
  "detail": "Email already registered"
}
```

**Trigger**: User with this email already exists in the database
**User Action**: Try logging in instead, or use a different email

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
   - Check password length (≥ 8 characters)
   - Check required fields

2. **Check Email Uniqueness**:
   - Query database: `SELECT * FROM users WHERE email = <normalized_email>`
   - Return 409 Conflict if user exists

3. **Hash Password**:
   - Use bcrypt via passlib: `bcrypt.hashpw(password.encode(), bcrypt.gensalt())`
   - Never store plaintext password

4. **Create User**:
   - Insert into database with auto-generated UUID, email, password_hash, timestamps
   - Commit transaction

5. **Generate JWT**:
   - Payload: `{"sub": user.id, "iat": now, "exp": now + 24h, "iss": "phase2-todo-app", "aud": "api"}`
   - Sign with `BETTER_AUTH_SECRET` and HS256 algorithm

6. **Return Response**:
   - 201 Created with user object and JWT token

### Frontend Flow

```typescript
// Registration form submission
async function handleRegister(email: string, password: string) {
  try {
    const response = await fetch('/api/auth/register', {
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
    } else if (response.status === 409) {
      setError('Email already registered. Try logging in.')
    } else if (response.status === 400) {
      const { detail } = await response.json()
      setError(detail)
    }
  } catch (error) {
    setError('Registration failed. Please try again.')
  }
}
```

---

## Security Considerations

1. **Password Hashing**: Always hash passwords with bcrypt (never plaintext)
2. **Email Normalization**: Convert to lowercase to prevent duplicate accounts (`USER@example.com` vs `user@example.com`)
3. **No Password in Response**: Never return password or password_hash
4. **Rate Limiting**: Consider rate limiting to prevent abuse (future enhancement)
5. **HTTPS**: Always use HTTPS in production to protect credentials in transit

---

## Testing

### Test Cases

| Test Case | Input | Expected Output |
|-----------|-------|-----------------|
| Valid registration | `{"email": "test@example.com", "password": "password123"}` | 201 Created with user and token |
| Duplicate email | Same email as existing user | 409 Conflict |
| Invalid email format | `{"email": "not-an-email", "password": "password123"}` | 400 Bad Request |
| Password too short | `{"email": "test@example.com", "password": "short"}` | 400 Bad Request |
| Missing email | `{"password": "password123"}` | 400 Bad Request |
| Missing password | `{"email": "test@example.com"}` | 400 Bad Request |

### Example cURL Request

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepassword123"
  }'
```

---

## Contract Version
**Version**: 1.0.0
**Status**: Stable
**Breaking Changes**: None (initial version)

---

**Specification Traceability**: spec.md "User registration" (User Story 1)
**Constitutional Compliance**: Principle IV (Authentication), Principle VIII (Error Handling)
