# Backend Implementation Guidance

## Technology Stack
- **Framework**: FastAPI 0.104+
- **ORM**: SQLModel 0.14+ (exclusively, no raw SQL)
- **Database**: PostgreSQL (via DATABASE_URL env var)
- **Authentication**: JWT verification with python-jose
- **Password Hashing**: passlib with bcrypt

## Constitutional Requirements

### Authentication & Authorization (CRITICAL)
1. **JWT Sub Claim Only**: User identity MUST be extracted exclusively from JWT `sub` claim
2. **Never from URL/Body**: NEVER read user_id from URL parameters, query strings, or request body
3. **Every Request**: All /api/todos endpoints MUST require valid JWT (401 without token)
4. **Ownership Verification**: All queries MUST filter by `WHERE user_id = <jwt_user_id>`
5. **404 not 403**: Return 404 (not 403) on ownership violations to prevent enumeration

### Database Access
- All database operations MUST use SQLModel ORM (no raw SQL)
- All todo queries MUST include user_id filter from JWT
- Use session from dependency injection pattern
- Enable connection pooling for performance

### Security
- Hash passwords with bcrypt before storage
- Validate JWT signature with BETTER_AUTH_SECRET
- Verify JWT expiration (24h max)
- Sanitize all inputs to prevent injection
- Return 401 for missing/invalid/expired tokens
- Never leak user existence in error messages

### Error Handling
- Use explicit HTTP status codes: 400, 401, 404, 500, 503
- Never crash on malformed input
- Log errors but return safe messages to client
- Handle database connection failures gracefully

## Project Structure
```
backend/
├── src/
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Environment config
│   ├── database.py          # SQLModel engine + session
│   ├── dependencies.py      # FastAPI dependencies
│   ├── models/
│   │   ├── user.py          # User SQLModel
│   │   └── todo.py          # Todo SQLModel
│   ├── auth/
│   │   ├── jwt.py           # JWT creation/verification
│   │   ├── password.py      # Password hashing
│   │   └── middleware.py    # JWT auth middleware
│   └── api/
│       ├── auth.py          # Register/login endpoints
│       └── todos.py         # Todo CRUD endpoints
└── migrations/              # Alembic migrations
```

## Key Patterns

### JWT Verification
```python
from jose import JWTError, jwt
from fastapi import HTTPException, status

def verify_token(token: str) -> str:
    try:
        payload = jwt.decode(token, SECRET, algorithms=["HS256"])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401)
        return user_id
    except JWTError:
        raise HTTPException(status_code=401)
```

### User Isolation Pattern
```python
# CORRECT: User ID from JWT only
@router.get("/api/todos")
def get_todos(user_id: str = Depends(get_current_user)):
    todos = session.exec(
        select(Todo).where(Todo.user_id == user_id)
    ).all()
    return todos

# WRONG: Never read user_id from URL/body
@router.get("/api/todos")
def get_todos(user_id: str):  # ❌ NEVER DO THIS
    ...
```

### Ownership Check Pattern
```python
# Always return 404 on ownership violations
@router.get("/api/todos/{todo_id}")
def get_todo(todo_id: str, user_id: str = Depends(get_current_user)):
    todo = session.exec(
        select(Todo).where(
            Todo.id == todo_id,
            Todo.user_id == user_id  # CRITICAL: user isolation
        )
    ).first()
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo
```

## Running the Backend
```bash
# Install dependencies
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start server
uvicorn src.main:app --reload --port 8000
```

## Common Issues
- **JWT secret mismatch**: Ensure BETTER_AUTH_SECRET matches frontend
- **Database connection**: Check DATABASE_URL format and PostgreSQL is running
- **CORS errors**: Configure CORS middleware with frontend origin
- **401 errors**: Verify JWT token format and expiration
