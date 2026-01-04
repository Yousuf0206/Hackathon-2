# Data Model: Phase II Full-Stack Todo Web Application

**Feature**: 002-phase2-fullstack-todo
**Date**: 2026-01-01
**Purpose**: Complete data model specification with SQLModel definitions

This document defines the database schema for the multi-user todo application. All entities are implemented using SQLModel ORM with PostgreSQL as the backing database.

---

## Database Technology

- **Database**: PostgreSQL 14+ (Neon Serverless)
- **ORM**: SQLModel 0.14+
- **Migrations**: Alembic (auto-generated from SQLModel)
- **Connection**: Via `DATABASE_URL` environment variable

---

## Entity: User

### Purpose
Represents an authenticated user account with secure credential storage.

### SQLModel Definition

```python
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from uuid import UUID, uuid4

class User(SQLModel, table=True):
    __tablename__ = "users"

    # Primary Key
    id: UUID = Field(default_factory=uuid4, primary_key=True)

    # Authentication Fields
    email: str = Field(max_length=255, unique=True, index=True, nullable=False)
    password_hash: str = Field(nullable=False)  # bcrypt hash, never plaintext

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationships
    todos: List["Todo"] = Relationship(back_populates="user", cascade_delete=True)
```

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | Primary Key | Auto-generated unique identifier |
| `email` | string | UNIQUE, NOT NULL, max 255 chars, indexed | User's email address (used for login) |
| `password_hash` | string | NOT NULL | bcrypt hash of password (never store plaintext) |
| `created_at` | datetime | NOT NULL, auto-generated | Timestamp of account creation |
| `updated_at` | datetime | NOT NULL, auto-updated | Timestamp of last modification |

### Indexes

- **Primary Index**: `id` (UUID, automatic)
- **Unique Index**: `email` (for fast login lookup and duplicate prevention)

### Validation Rules

1. **Email Format**: Must be valid email format (validated via Pydantic)
   - Example valid: `user@example.com`
   - Example invalid: `not-an-email`, `@example.com`
   - HTTP 400 Bad Request on invalid format

2. **Email Uniqueness**: Must be unique across all users
   - HTTP 409 Conflict on duplicate registration attempt

3. **Password Hashing**: Password must be hashed before storage
   - Use bcrypt via passlib[bcrypt] library
   - Never store plaintext passwords
   - Hash computed before database insert

4. **Password Requirements** (enforced at API layer):
   - Minimum 8 characters
   - No maximum length (hash is fixed size)

### Relationships

- **One-to-Many with Todo**: A user can have multiple todos
- **Cascade Delete**: Deleting a user deletes all their todos (ON DELETE CASCADE)

### Security Considerations

- Password hash is never returned in API responses
- Email is case-insensitive for login (normalize to lowercase)
- User ID is exposed in JWT `sub` claim (not sensitive)

---

## Entity: Todo

### Purpose
Represents a task item owned by a specific user. Enforces user isolation at the database level via foreign key.

### SQLModel Definition

```python
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime
from uuid import UUID, uuid4

class Todo(SQLModel, table=True):
    __tablename__ = "todos"

    # Primary Key
    id: UUID = Field(default_factory=uuid4, primary_key=True)

    # Foreign Key (User Isolation)
    user_id: UUID = Field(
        foreign_key="users.id",
        nullable=False,
        index=True,  # Critical for query performance
        ondelete="CASCADE"
    )

    # Task Fields
    title: str = Field(max_length=500, nullable=False)
    description: Optional[str] = Field(default=None, max_length=5000)
    completed: bool = Field(default=False, nullable=False)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationships
    user: "User" = Relationship(back_populates="todos")
```

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | Primary Key | Auto-generated unique identifier |
| `user_id` | UUID | Foreign Key (users.id), NOT NULL, indexed, ON DELETE CASCADE | Owner of the todo (user isolation) |
| `title` | string | NOT NULL, max 500 chars | Task title (trimmed, non-empty) |
| `description` | text | OPTIONAL, max 5000 chars | Detailed task description |
| `completed` | boolean | NOT NULL, default false | Task completion status |
| `created_at` | datetime | NOT NULL, auto-generated | Timestamp of todo creation |
| `updated_at` | datetime | NOT NULL, auto-updated | Timestamp of last modification |

### Indexes

- **Primary Index**: `id` (UUID, automatic)
- **Foreign Key Index**: `user_id` (CRITICAL for performance)
  - All queries filter by user_id (SELECT, UPDATE, DELETE)
  - Without index, queries become O(n) table scans
  - With index, queries are O(log n) lookups

### Validation Rules

1. **Title Required**: Cannot be missing, null, or empty after trimming
   - HTTP 400 Bad Request if violated
   - Example invalid: `""`, `"   "`, `null`
   - Example valid: `"Buy groceries"`, `"  Task with spaces  "` (trimmed to `"Task with spaces"`)

2. **Title Length**: Maximum 500 characters after trimming
   - HTTP 400 Bad Request if exceeded
   - Enforced at database and API layer

3. **Description Length**: Maximum 5000 characters if provided
   - HTTP 400 Bad Request if exceeded
   - Optional field (can be null or empty)

4. **User ID Existence**: Must reference valid user
   - Foreign key constraint enforces referential integrity
   - Database-level protection against orphaned todos

### State Transitions

The `completed` field supports boolean toggle:
- `false` → `true`: Mark task as complete
- `true` → `false`: Reopen task
- Toggling is idempotent (setting to current value is allowed)

### Relationships

- **Many-to-One with User**: Each todo belongs to exactly one user
- **Cascade Delete**: If user is deleted, all their todos are deleted (ON DELETE CASCADE)

### User Isolation Enforcement

**Constitutional Requirement**: Users can ONLY access their own todos.

#### Query Pattern (Always Enforced)

```python
# List user's todos
def get_user_todos(db: Session, user_id: UUID) -> List[Todo]:
    return db.query(Todo).filter(Todo.user_id == user_id).all()

# Get specific todo (ownership check)
def get_user_todo_by_id(db: Session, user_id: UUID, todo_id: UUID) -> Optional[Todo]:
    return db.query(Todo).filter(
        Todo.id == todo_id,
        Todo.user_id == user_id  # Ownership verification
    ).first()  # Returns None if not found OR belongs to different user

# Update todo (ownership check)
def update_user_todo(db: Session, user_id: UUID, todo_id: UUID, data: dict) -> Optional[Todo]:
    todo = get_user_todo_by_id(db, user_id, todo_id)
    if not todo:
        return None  # Not found or unauthorized (both return 404)
    for key, value in data.items():
        setattr(todo, key, value)
    todo.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(todo)
    return todo

# Delete todo (ownership check)
def delete_user_todo(db: Session, user_id: UUID, todo_id: UUID) -> bool:
    todo = get_user_todo_by_id(db, user_id, todo_id)
    if not todo:
        return False  # Not found or unauthorized (both return 404)
    db.delete(todo)
    db.commit()
    return True
```

#### Security Guarantees

1. **user_id from JWT only**: Never accept user_id from URL, query params, or request body
2. **404 on ownership violations**: Return 404 (not 403) to prevent user enumeration
   - Attacker cannot determine if todo exists but belongs to another user
3. **Indexed queries**: `user_id` index ensures filtering is performant
4. **Database-level enforcement**: Foreign key constraint prevents orphaned todos

---

## Referential Integrity

### Cascade Rules

- **User → Todo**: ON DELETE CASCADE
  - Deleting a user automatically deletes all their todos
  - Prevents orphaned todos in database
  - Application does not need to manually clean up

### Foreign Key Constraints

- `todos.user_id` → `users.id`
  - NOT NULL (every todo must have an owner)
  - FOREIGN KEY (must reference existing user)
  - ON DELETE CASCADE (delete propagates to todos)

---

## Schema Migration (Alembic)

### Initial Migration

```python
# alembic/versions/001_create_users_and_todos.py
# Auto-generated via: alembic revision --autogenerate -m "Create users and todos tables"

def upgrade():
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_index('ix_users_email', 'users', ['email'])

    # Create todos table
    op.create_table(
        'todos',
        sa.Column('id', postgresql.UUID(), nullable=False),
        sa.Column('user_id', postgresql.UUID(), nullable=False),
        sa.Column('title', sa.String(length=500), nullable=False),
        sa.Column('description', sa.String(length=5000), nullable=True),
        sa.Column('completed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE')
    )
    op.create_index('ix_todos_user_id', 'todos', ['user_id'])

def downgrade():
    op.drop_table('todos')
    op.drop_table('users')
```

### Migration Commands

```bash
# Initialize Alembic (first time)
alembic init alembic

# Configure alembic/env.py to import SQLModel metadata
# (Set target_metadata = SQLModel.metadata)

# Generate migration from SQLModel models
alembic revision --autogenerate -m "Create users and todos tables"

# Apply migrations
alembic upgrade head

# Rollback migrations (if needed)
alembic downgrade -1
```

---

## Database Connection

### Connection String Format

```
DATABASE_URL=postgresql://username:password@host:port/database
```

### Neon Serverless Connection

```
DATABASE_URL=postgresql://user:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### SQLModel Engine Configuration

```python
# backend/src/database.py
from sqlmodel import create_engine, Session
import os

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is required")

# Connection pooling for production
engine = create_engine(
    DATABASE_URL,
    echo=True,  # Log SQL queries (disable in production)
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True  # Verify connections before use (important for Neon)
)

def get_db():
    """FastAPI dependency for database sessions"""
    with Session(engine) as session:
        yield session
```

---

## Performance Considerations

### Indexes

1. **users.email**: Unique index for fast login lookups (O(log n))
2. **todos.user_id**: Index for fast user isolation queries (O(log n))
3. **Optional**: Composite index on `(user_id, created_at)` for sorted listings

### Query Optimization

- Use `filter()` instead of `where()` for compatibility
- Add `limit()` for pagination (future enhancement)
- Use `selectinload()` to prevent N+1 queries when loading user + todos

### Connection Pooling

- Pool size: 5 connections (sufficient for <100 concurrent users)
- Max overflow: 10 additional connections during traffic spikes
- Pool pre-ping: Verify connection health before use (prevents stale connections)

---

## Data Model Traceability

| Entity | Spec Clause | Constitutional Principle |
|--------|-------------|--------------------------|
| User | spec.md "User account with email authentication" | Principle IV (Authentication) |
| Todo | spec.md "Task with title, description, completion status" | Principle III (Persistence) |
| user_id foreign key | spec.md "Each todo belongs to exactly one user" | Principle III (User association) |
| Indexes on user_id | spec.md "Users can only access their own todos" | Principle V (User isolation) |
| ON DELETE CASCADE | Implicit from user-todo ownership | Principle III (Referential integrity) |

---

## Validation Summary

| Validation Rule | Entity | HTTP Status on Violation |
|-----------------|--------|--------------------------|
| Email format | User | 400 Bad Request |
| Email uniqueness | User | 409 Conflict |
| Password minimum length | User | 400 Bad Request |
| Title required | Todo | 400 Bad Request |
| Title max length (500) | Todo | 400 Bad Request |
| Description max length (5000) | Todo | 400 Bad Request |
| user_id existence | Todo | Foreign key constraint error (500 if bypassed) |

---

**Data Model Status**: ✅ Complete and specification-compliant
**Constitutional Compliance**: ✅ Satisfies Principles III, IV, V
**Ready for Implementation**: ✅ Yes
