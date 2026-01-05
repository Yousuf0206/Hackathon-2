# Quickstart Guide: Phase II Full-Stack Todo Web Application

**Feature**: 002-phase2-fullstack-todo
**Date**: 2026-01-01
**Purpose**: Developer onboarding and local development setup

This guide helps developers set up and run the multi-user todo application on their local machine. Follow these steps to go from zero to a fully functional development environment.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure Overview](#project-structure-overview)
3. [Environment Setup](#environment-setup)
4. [Database Setup](#database-setup)
5. [Backend Setup](#backend-setup)
6. [Frontend Setup](#frontend-setup)
7. [Running the Application](#running-the-application)
8. [Testing the Full Flow](#testing-the-full-flow)
9. [Troubleshooting](#troubleshooting)
10. [Next Steps](#next-steps)

---

## Prerequisites

Before starting, ensure you have the following installed:

### Required Software

| Software | Minimum Version | Check Command | Installation |
|----------|-----------------|---------------|--------------|
| **Python** | 3.11+ | `python --version` | [python.org](https://www.python.org/downloads/) |
| **Node.js** | 18+ | `node --version` | [nodejs.org](https://nodejs.org/) |
| **npm** | 9+ | `npm --version` | (included with Node.js) |
| **PostgreSQL** | 14+ | `psql --version` | [Neon Serverless](https://neon.tech/) (recommended) or [postgresql.org](https://www.postgresql.org/download/) |
| **Git** | Any | `git --version` | [git-scm.com](https://git-scm.com/) |

### Optional (Recommended)

- **uv** (Python package manager): `pip install uv` - Faster alternative to pip
- **PostgreSQL GUI**: [pgAdmin](https://www.pgadmin.org/) or [TablePlus](https://tableplus.com/) for database inspection
- **REST Client**: [Postman](https://www.postman.com/) or [Insomnia](https://insomnia.rest/) for API testing

### Verify Installation

```bash
# Check all prerequisites
python --version   # Should be 3.11 or higher
node --version     # Should be 18 or higher
npm --version      # Should be 9 or higher
psql --version     # Should be 14 or higher
git --version      # Any version
```

---

## Project Structure Overview

```
phase2-todo-app/
├── backend/                 # FastAPI backend
│   ├── src/                 # Source code
│   ├── tests/               # Backend tests
│   ├── .env                 # Backend environment variables (create this)
│   ├── requirements.txt     # Python dependencies
│   └── alembic/             # Database migrations
│
├── frontend/                # Next.js frontend
│   ├── src/                 # Source code
│   ├── tests/               # Frontend tests
│   ├── .env.local           # Frontend environment variables (create this)
│   ├── package.json         # Node.js dependencies
│   └── next.config.js       # Next.js configuration
│
└── specs/                   # Design documentation
    └── 002-phase2-fullstack-todo/
        ├── spec.md          # Feature specification
        ├── plan.md          # Implementation plan
        ├── data-model.md    # Database schema
        ├── quickstart.md    # This file
        └── contracts/       # API contracts
```

---

## Environment Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd phase2-todo-app
```

### Step 2: Get a PostgreSQL Database

#### Option A: Neon Serverless (Recommended)

1. Sign up at [neon.tech](https://neon.tech/) (free tier available)
2. Create a new project
3. Copy the connection string (looks like: `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`)

#### Option B: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database:
   ```bash
   psql -U postgres
   CREATE DATABASE phase2_todo;
   \q
   ```
3. Connection string: `postgresql://postgres:password@localhost:5432/phase2_todo`

### Step 3: Generate Shared Secret

Generate a secure secret for JWT signing:

```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Example output: dGhpc2lzYXNlY3JldGtleWZvcmp3dHNpZ25pbmc=
```

**Copy this secret** - you'll need it for both backend and frontend.

---

## Database Setup

### Step 1: Configure Backend Database Connection

Create `backend/.env` file:

```bash
cd backend
```

Create `.env` file with the following content:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Authentication (use the secret generated above)
BETTER_AUTH_SECRET=dGhpc2lzYXNlY3JldGtleWZvcmp3dHNpZ25pbmc=

# Development
DEBUG=true
```

**Important**: Replace `DATABASE_URL` with your actual PostgreSQL connection string.

### Step 2: Install Backend Dependencies

```bash
# Using uv (recommended, faster)
uv pip install -r requirements.txt

# OR using pip
pip install -r requirements.txt
```

### Step 3: Initialize Database with Alembic

```bash
# Initialize Alembic (if not already initialized)
alembic init alembic

# Generate migration from SQLModel models
alembic revision --autogenerate -m "Create users and todos tables"

# Apply migrations to database
alembic upgrade head
```

**Verify**: Check your database - you should see `users` and `todos` tables.

```bash
# Using psql
psql <DATABASE_URL>
\dt  # List tables (should show users and todos)
\q
```

---

## Backend Setup

### Step 1: Verify Environment Variables

Ensure `backend/.env` contains:
- `DATABASE_URL` (PostgreSQL connection string)
- `BETTER_AUTH_SECRET` (shared JWT secret)

### Step 2: Test Backend

```bash
# From backend/ directory
python -m pytest tests/  # Run tests (optional)

# Start the backend server
uvicorn src.main:app --reload --port 8000
```

**Expected Output**:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### Step 3: Verify Backend is Running

Open browser and navigate to:
- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **Health Check**: http://localhost:8000/api/health (should return `{"status": "ok"}`)

**Leave the backend running** and open a new terminal for frontend setup.

---

## Frontend Setup

### Step 1: Configure Frontend Environment

Open a **new terminal** and navigate to frontend:

```bash
cd frontend
```

Create `.env.local` file:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Authentication (SAME secret as backend!)
BETTER_AUTH_SECRET=dGhpc2lzYXNlY3JldGtleWZvcmp3dHNpZ25pbmc=
```

**Critical**: The `BETTER_AUTH_SECRET` must match the backend secret exactly.

### Step 2: Install Frontend Dependencies

```bash
npm install
```

**Expected**: Downloads all dependencies from package.json (~1-2 minutes)

### Step 3: Start Frontend Development Server

```bash
npm run dev
```

**Expected Output**:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- event compiled client and server successfully in 2.3s
```

### Step 4: Verify Frontend is Running

Open browser and navigate to:
- **Landing Page**: http://localhost:3000 (should show todo app homepage)

---

## Running the Application

You should now have **both servers running**:

| Service | URL | Port | Terminal |
|---------|-----|------|----------|
| **Backend** (FastAPI) | http://localhost:8000 | 8000 | Terminal 1 |
| **Frontend** (Next.js) | http://localhost:3000 | 3000 | Terminal 2 |

**Development Workflow**:
- Backend: Auto-reloads on file changes (uvicorn --reload)
- Frontend: Auto-reloads on file changes (Next.js hot reload)
- Database: Persistent (data survives server restarts)

---

## Testing the Full Flow

### Step 1: Register a User

1. Navigate to: http://localhost:3000/register
2. Enter email: `test@example.com`
3. Enter password: `password123` (min 8 characters)
4. Click "Register"

**Expected**:
- Redirect to http://localhost:3000/todos (todo dashboard)
- User is logged in automatically (JWT stored in Better Auth session)

### Step 2: Create a Todo

1. In the todo dashboard, enter a task title: `"Buy groceries"`
2. (Optional) Enter description: `"Milk, eggs, bread"`
3. Click "Add Todo"

**Expected**:
- New todo appears in the list immediately
- Backend logs show: `POST /api/todos` with 201 status

### Step 3: Mark Todo as Complete

1. Click the checkbox next to "Buy groceries"

**Expected**:
- Todo title shows strikethrough styling
- Backend logs show: `PATCH /api/todos/{id}/complete` with 200 status

### Step 4: Edit Todo

1. Click "Edit" button on the todo
2. Update title to: `"Buy groceries and cook"`
3. Click "Save"

**Expected**:
- Todo title updates in the list
- Backend logs show: `PUT /api/todos/{id}` with 200 status

### Step 5: Delete Todo

1. Click "Delete" button on the todo
2. Confirm deletion

**Expected**:
- Todo disappears from the list
- Backend logs show: `DELETE /api/todos/{id}` with 204 status

### Step 6: Verify User Isolation

1. Open a new **incognito/private browser window**
2. Register a different user: `test2@example.com`
3. Create a todo: `"Second user's todo"`
4. Switch back to first browser window (still logged in as `test@example.com`)

**Expected**:
- First user's dashboard shows only their todos (no "Second user's todo")
- User isolation is enforced by backend (user_id from JWT)

### Step 7: Test Logout and Login

1. Click "Logout" button
2. Verify redirect to login page
3. Login with: `test@example.com` / `password123`

**Expected**:
- Redirect back to todo dashboard
- All previously created todos are visible (data persisted in database)

---

## Troubleshooting

### Issue: Backend Won't Start

**Error**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**:
```bash
cd backend
pip install -r requirements.txt
```

---

**Error**: `sqlalchemy.exc.OperationalError: could not connect to server`

**Solution**:
- Check `DATABASE_URL` in `backend/.env` is correct
- Verify PostgreSQL is running (Neon: check neon.tech dashboard)
- Test connection: `psql <DATABASE_URL>`

---

**Error**: `alembic.util.exc.CommandError: Can't locate revision identified by 'head'`

**Solution**:
```bash
cd backend
alembic upgrade head
```

---

### Issue: Frontend Won't Start

**Error**: `Error: Cannot find module 'next'`

**Solution**:
```bash
cd frontend
npm install
```

---

**Error**: `Error: NEXT_PUBLIC_API_URL is not defined`

**Solution**:
- Create `frontend/.env.local` file (see [Frontend Setup](#frontend-setup))
- Restart Next.js server: `npm run dev`

---

### Issue: JWT Token Errors

**Error**: `401 Unauthorized: Invalid or missing token`

**Possible Causes**:

1. **Secret Mismatch**: `BETTER_AUTH_SECRET` in `backend/.env` and `frontend/.env.local` are different
   - **Solution**: Ensure both files have the **exact same secret**

2. **Token Expired**: JWT tokens expire after 24 hours
   - **Solution**: Logout and login again

3. **Backend Not Running**: Frontend can't reach backend
   - **Solution**: Ensure `http://localhost:8000` is running (check terminal 1)

---

### Issue: User Isolation Not Working

**Error**: User A can see User B's todos

**Solution**:
- This is a **critical bug** (constitutional violation)
- Verify backend code extracts `user_id` from JWT (not from URL or request body)
- Check logs: Backend should log `user_id` extracted from JWT for each request

---

### Issue: Database Migration Conflicts

**Error**: `alembic.util.exc.CommandError: Can't locate revision`

**Solution**:
```bash
cd backend
# Delete all migrations (BE CAREFUL - only in development!)
rm alembic/versions/*.py

# Regenerate from scratch
alembic revision --autogenerate -m "Initial schema"
alembic upgrade head
```

**Warning**: This will **drop all data**. Only use in development.

---

### Issue: Port Already in Use

**Error**: `OSError: [Errno 48] Address already in use: 8000`

**Solution**:
```bash
# Find process using port 8000
lsof -i :8000  # Mac/Linux
netstat -ano | findstr :8000  # Windows

# Kill process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows

# OR use a different port
uvicorn src.main:app --reload --port 8001
```

Update `frontend/.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:8001`

---

### Issue: CORS Errors

**Error**: `Access to fetch at 'http://localhost:8000' ... has been blocked by CORS policy`

**Solution**:
- Verify backend has CORS middleware configured (should allow `http://localhost:3000`)
- Check `src/main.py` includes:
  ```python
  from fastapi.middleware.cors import CORSMiddleware

  app.add_middleware(
      CORSMiddleware,
      allow_origins=["http://localhost:3000"],
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```

---

### Issue: Todos Not Persisting

**Error**: Todos disappear after server restart

**Possible Causes**:

1. **Database Connection Lost**: Backend not connected to PostgreSQL
   - **Solution**: Check `DATABASE_URL` in `backend/.env`

2. **Using In-Memory Database**: (should not happen in this project)
   - **Solution**: Verify `DATABASE_URL` uses PostgreSQL (not SQLite)

3. **Migrations Not Applied**: Database tables don't exist
   - **Solution**: Run `alembic upgrade head`

---

## Development Tips

### Viewing Logs

**Backend Logs** (Terminal 1):
- All HTTP requests logged with status codes
- SQL queries logged (if `echo=True` in engine config)
- Errors show full stack traces

**Frontend Logs** (Browser Console):
- Network tab: See all API requests and responses
- Console: JavaScript errors and logs

### Database Inspection

**Using psql**:
```bash
psql <DATABASE_URL>
\dt              # List tables
\d users         # Describe users table
\d todos         # Describe todos table
SELECT * FROM users;
SELECT * FROM todos;
\q
```

**Using GUI** (pgAdmin or TablePlus):
- Connect with `DATABASE_URL`
- Browse tables visually
- Run SQL queries

### API Testing with cURL

**Register User**:
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

**Login**:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

**Create Todo** (replace `<JWT>` with token from login):
```bash
curl -X POST http://localhost:8000/api/todos \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test todo", "description": "Testing API"}'
```

**List Todos**:
```bash
curl -X GET http://localhost:8000/api/todos \
  -H "Authorization: Bearer <JWT>"
```

### Hot Reload

**Backend**: Automatically reloads on file changes (uvicorn --reload)
- Edit `src/` files → Server restarts automatically
- Changes visible immediately (no manual restart)

**Frontend**: Automatically reloads on file changes (Next.js fast refresh)
- Edit `src/` files → Browser updates automatically
- State preserved during refresh (when possible)

### Running Tests

**Backend Tests**:
```bash
cd backend
pytest tests/              # Run all tests
pytest tests/test_auth.py  # Run specific test file
pytest -v                  # Verbose output
pytest --cov=src           # Coverage report
```

**Frontend Tests**:
```bash
cd frontend
npm test                   # Run all tests
npm test -- TodoList       # Run specific test
npm test -- --coverage     # Coverage report
```

---

## Next Steps

Once you have the application running locally, you can:

1. **Explore the API**: Visit http://localhost:8000/docs for interactive API documentation (Swagger UI)

2. **Review Design Artifacts**:
   - `specs/002-phase2-fullstack-todo/spec.md` - Feature specification
   - `specs/002-phase2-fullstack-todo/data-model.md` - Database schema
   - `specs/002-phase2-fullstack-todo/contracts/` - API contracts

3. **Implement New Features**: Follow the Agentic Dev Stack workflow:
   - Update spec.md with new requirements
   - Run `/sp.plan` to update implementation plan
   - Run `/sp.tasks` to generate task breakdown
   - Run `/sp.implement` to execute tasks

4. **Deploy to Production**:
   - Backend: Deploy to Railway, Render, or Fly.io
   - Frontend: Deploy to Vercel or Netlify
   - Database: Use Neon Serverless PostgreSQL (already configured)

5. **Add Tests**: Write comprehensive tests for new features
   - Backend: pytest with coverage
   - Frontend: Jest + React Testing Library

6. **Monitor and Debug**: Use logging and monitoring tools
   - Backend: FastAPI built-in logs, Sentry for error tracking
   - Frontend: Next.js logs, Vercel Analytics

---

## Environment Variables Reference

### Backend (`backend/.env`)

```env
# Database connection string
DATABASE_URL=postgresql://user:password@host:port/database

# JWT signing secret (MUST match frontend secret)
BETTER_AUTH_SECRET=<32-byte-base64-encoded-secret>

# Development mode (optional)
DEBUG=true
```

### Frontend (`frontend/.env.local`)

```env
# Backend API base URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# JWT signing secret (MUST match backend secret)
BETTER_AUTH_SECRET=<32-byte-base64-encoded-secret>
```

**Security Notes**:
- Never commit `.env` or `.env.local` to Git (already in `.gitignore`)
- Use different secrets for dev/staging/production
- In production, set environment variables via hosting platform (not .env files)

---

## Useful Commands

### Backend

```bash
# Start server
uvicorn src.main:app --reload --port 8000

# Run tests
pytest tests/

# Generate migration
alembic revision --autogenerate -m "Migration message"

# Apply migrations
alembic upgrade head

# Rollback last migration
alembic downgrade -1

# Check database schema
psql <DATABASE_URL> -c "\dt"
```

### Frontend

```bash
# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Run production build locally
npm start

# Lint code
npm run lint
```

### Database

```bash
# Connect to database
psql <DATABASE_URL>

# Backup database
pg_dump <DATABASE_URL> > backup.sql

# Restore database
psql <DATABASE_URL> < backup.sql
```

---

## Additional Resources

- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **Next.js Documentation**: https://nextjs.org/docs
- **SQLModel Documentation**: https://sqlmodel.tiangolo.com/
- **Better Auth Documentation**: https://www.better-auth.com/docs
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Alembic Documentation**: https://alembic.sqlalchemy.org/

---

## Support

If you encounter issues not covered in this guide:

1. Check the **Troubleshooting** section above
2. Review backend logs (Terminal 1) and frontend console (Browser DevTools)
3. Verify environment variables are set correctly
4. Ensure all prerequisites are installed with correct versions
5. Search the API documentation: http://localhost:8000/docs

---

**Quickstart Status**: ✅ Complete and tested
**Last Updated**: 2026-01-01
**Estimated Setup Time**: 15-20 minutes (first time)
