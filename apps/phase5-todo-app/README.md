# Phase II Full-Stack Todo Web Application

A secure, multi-user todo application built with FastAPI, Next.js, and PostgreSQL. Features JWT-based authentication, complete CRUD operations, and robust user data isolation.

## 🌟 Features

### Core Functionality
- ✅ **User Authentication**: Secure registration and login with JWT tokens
- ✅ **Create Todos**: Add tasks with title and optional description
- ✅ **View Todos**: See all your personal todos in one place
- ✅ **Edit Todos**: Update task titles and descriptions inline
- ✅ **Toggle Completion**: Mark tasks as complete or incomplete
- ✅ **Delete Todos**: Remove tasks with confirmation dialog
- ✅ **User Isolation**: Each user can only access their own todos

### Technical Features
- 🔒 **Security**: JWT authentication, password hashing with bcrypt, user data isolation
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- ⚡ **Real-time Updates**: Instant UI updates after any operation
- 🎨 **Modern UI**: Clean, intuitive interface with loading states and error handling
- 🔄 **Auto JWT Handling**: Automatic token attachment to all API requests
- 🚨 **Comprehensive Error Handling**: User-friendly error messages throughout

## 🏗️ Technology Stack

### Backend
- **Framework**: FastAPI 0.104+
- **ORM**: SQLModel 0.14+
- **Database**: PostgreSQL (Neon Serverless)
- **Authentication**: JWT with python-jose
- **Password Hashing**: passlib with bcrypt
- **Server**: Uvicorn

### Frontend
- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript 5+
- **Authentication**: Better Auth 1.0+
- **Styling**: CSS-in-JS (styled-jsx)
- **HTTP Client**: Fetch API with custom wrapper

## 📁 Project Structure

```
phase2-todo-app/
├── backend/                    # FastAPI backend
│   ├── src/
│   │   ├── api/               # API endpoints
│   │   │   ├── auth.py        # Authentication endpoints
│   │   │   └── todos.py       # Todo CRUD endpoints
│   │   ├── auth/              # Auth utilities
│   │   │   ├── jwt.py         # JWT creation/verification
│   │   │   ├── password.py    # Password hashing
│   │   │   └── middleware.py  # JWT middleware
│   │   ├── models/            # Database models
│   │   │   ├── user.py        # User model
│   │   │   └── todo.py        # Todo model
│   │   ├── config.py          # Configuration
│   │   ├── database.py        # Database connection
│   │   ├── dependencies.py    # FastAPI dependencies
│   │   └── main.py            # Application entry point
│   ├── migrations/            # Alembic migrations
│   ├── requirements.txt       # Python dependencies
│   ├── .env.example          # Environment variables template
│   └── CLAUDE.md             # Backend documentation
│
├── frontend/                  # Next.js frontend
│   ├── src/
│   │   ├── app/              # Next.js pages
│   │   │   ├── login/        # Login page
│   │   │   ├── register/     # Registration page
│   │   │   ├── todos/        # Todo dashboard
│   │   │   ├── layout.tsx    # Root layout
│   │   │   └── page.tsx      # Landing page
│   │   ├── components/       # React components
│   │   │   ├── TodoForm.tsx      # Create todo form
│   │   │   ├── TodoList.tsx      # Todo list display
│   │   │   ├── TodoItem.tsx      # Individual todo item
│   │   │   ├── TodoEditForm.tsx  # Edit todo form
│   │   │   └── Navbar.tsx        # Navigation bar
│   │   └── lib/              # Utilities
│   │       ├── api.ts        # API client
│   │       ├── auth.ts       # Auth helpers
│   │       └── types.ts      # TypeScript types
│   ├── package.json          # Node dependencies
│   ├── .env.example         # Environment variables template
│   └── CLAUDE.md            # Frontend documentation
│
├── specs/                    # Design documentation
│   └── 002-phase2-fullstack-todo/
│       ├── spec.md          # Feature specification
│       ├── plan.md          # Implementation plan
│       ├── data-model.md    # Database schema
│       ├── tasks.md         # Task breakdown
│       ├── research.md      # Technical research
│       ├── quickstart.md    # Developer guide
│       └── contracts/       # API contracts
│
└── README.md                # This file
```

## 🎯 Integrated Dashboard

For the best development experience, use the **integrated dashboard** that combines both frontend and backend in one view:

```bash
# Make sure both servers are running, then:
start dashboard.html
```

**Features:**
- 📱 Frontend application in main view
- 📚 API documentation accessible via tabs
- 📊 System information sidebar
- ❤️ Health monitoring
- 🔗 Quick links to all services
- ⚡ Seamless switching between views

**Alternative:** Use `start.bat` to launch both servers and open the dashboard automatically.

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:
- **Python** 3.11 or higher
- **Node.js** 18 or higher
- **PostgreSQL** 14 or higher (or Neon Serverless account)
- **Git**

### 1. Clone the Repository

```bash
git clone <repository-url>
cd phase2-todo-app
```

### 2. Set Up Environment Variables

#### Backend Environment

Create `backend/.env`:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and add:

```env
# Generate with: openssl rand -base64 32
BETTER_AUTH_SECRET=your-secret-key-here

# PostgreSQL connection string
DATABASE_URL=postgresql://user:password@host:port/database

# CORS origins (comma-separated)
CORS_ORIGINS=http://localhost:3000
```

#### Frontend Environment

Create `frontend/.env.local`:

```bash
cd ../frontend
cp .env.example .env.local
```

Edit `frontend/.env.local` and add:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Same secret as backend!
BETTER_AUTH_SECRET=your-secret-key-here
```

> **Important**: The `BETTER_AUTH_SECRET` must be identical in both files!

#### Generate Shared Secret

```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 3. Set Up Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Initialize database migrations
alembic upgrade head

# Start the backend server
uvicorn src.main:app --reload
```

The backend will be running at http://localhost:8000

**Verify backend is running:**
- Health check: http://localhost:8000/health
- API documentation: http://localhost:8000/docs

### 4. Set Up Frontend

Open a **new terminal** window:

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be running at http://localhost:3000

### 5. Access the Application

#### Option A: Integrated Dashboard (Recommended) 🎯

Simply open `dashboard.html` in your browser for a unified view with both frontend and backend:

```bash
# Open the integrated dashboard
start dashboard.html
```

The dashboard provides:
- **Frontend Application** in the main view
- **API Documentation** accessible via tabs
- **System Information** sidebar with quick links
- **Health monitoring** for both services

#### Option B: Individual Access

1. **Frontend**: Open http://localhost:3000
2. **Backend API**: Open http://localhost:8000/docs
3. **Health Check**: http://localhost:8000/health

#### Quick Start:

1. Click "Sign Up" to create a new account
2. Enter your email and password (min 8 characters)
3. You'll be automatically logged in and redirected to the todo dashboard
4. Start creating todos!

## 📖 Usage Guide

### Creating Todos

1. Navigate to the todo dashboard at http://localhost:3000/todos
2. Enter a title (required, max 500 characters)
3. Optionally add a description (max 5000 characters)
4. Click "Add Todo"

### Managing Todos

- **Mark as Complete**: Click the checkbox next to any todo
- **Edit Todo**: Click the "Edit" button, modify title/description, then "Save"
- **Delete Todo**: Click the "Delete" button and confirm the action
- **View Details**: See creation and update timestamps for each todo

### User Isolation

- Each user can only see and manage their own todos
- Attempting to access another user's todo returns a 404 error (not 403) to prevent user enumeration
- All data queries are automatically filtered by user_id from the JWT token

## 🔒 Security Features

### Authentication
- Passwords are hashed with bcrypt before storage
- JWT tokens issued on login with 24-hour expiration
- Tokens include user_id in the `sub` (subject) claim
- Automatic token validation on every API request

### Authorization
- User identity extracted exclusively from JWT `sub` claim
- Never reads user_id from URL parameters or request body
- All database queries filtered by authenticated user_id
- Ownership violations return 404 to prevent enumeration attacks

### Data Protection
- PostgreSQL foreign key constraints ensure referential integrity
- ON DELETE CASCADE removes todos when user is deleted
- Input validation on all endpoints (title length, description length, etc.)
- CORS configured to only allow requests from frontend origin

## 🧪 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}

Response: 201 Created
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2026-01-01T00:00:00Z"
  },
  "token": "jwt_token_string"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}

Response: 200 OK
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "token": "jwt_token_string"
}
```

### Todo Endpoints

All todo endpoints require authentication via `Authorization: Bearer <token>` header.

#### List Todos
```http
GET /api/todos
Authorization: Bearer <token>

Response: 200 OK
{
  "todos": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "completed": false,
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Todo
```http
POST /api/todos
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}

Response: 201 Created
{
  "id": "uuid",
  "user_id": "uuid",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}
```

#### Update Todo
```http
PUT /api/todos/{todo_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Buy groceries and cook",
  "description": "Updated description"
}

Response: 200 OK
{
  "id": "uuid",
  "user_id": "uuid",
  "title": "Buy groceries and cook",
  "description": "Updated description",
  "completed": false,
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T10:30:00Z"
}
```

#### Toggle Completion
```http
PATCH /api/todos/{todo_id}/complete
Authorization: Bearer <token>
Content-Type: application/json

{
  "completed": true
}

Response: 200 OK
{
  "id": "uuid",
  "user_id": "uuid",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": true,
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T11:00:00Z"
}
```

#### Delete Todo
```http
DELETE /api/todos/{todo_id}
Authorization: Bearer <token>

Response: 204 No Content
```

See complete API documentation at http://localhost:8000/docs (Swagger UI)

## 🐛 Troubleshooting

### Backend Won't Start

**Error**: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**:
```bash
cd backend
pip install -r requirements.txt
```

---

**Error**: `sqlalchemy.exc.OperationalError: could not connect to server`

**Solution**:
- Verify `DATABASE_URL` in `backend/.env` is correct
- Check PostgreSQL is running
- Test connection: `psql <DATABASE_URL>`

---

**Error**: `ValueError: DATABASE_URL environment variable is required`

**Solution**:
- Ensure `backend/.env` file exists
- Check `DATABASE_URL` is set in the file

### Frontend Won't Start

**Error**: `Error: Cannot find module 'next'`

**Solution**:
```bash
cd frontend
npm install
```

---

**Error**: `Error: NEXT_PUBLIC_API_URL is not defined`

**Solution**:
- Create `frontend/.env.local` from `.env.example`
- Restart Next.js: `npm run dev`

### Authentication Issues

**Error**: `401 Unauthorized: Invalid or missing token`

**Possible Causes**:

1. **Secret Mismatch**: `BETTER_AUTH_SECRET` differs between frontend and backend
   - **Solution**: Ensure both `.env` files have the exact same secret

2. **Token Expired**: JWT tokens expire after 24 hours
   - **Solution**: Logout and login again

3. **Backend Not Running**: Frontend can't reach backend API
   - **Solution**: Check `http://localhost:8000/health` is accessible

### CORS Errors

**Error**: `Access to fetch at 'http://localhost:8000' has been blocked by CORS policy`

**Solution**:
- Verify `CORS_ORIGINS` in `backend/.env` includes `http://localhost:3000`
- Check backend CORS middleware in `src/main.py`
- Restart backend server

### Database Migration Issues

**Error**: `alembic.util.exc.CommandError: Can't locate revision`

**Solution**:
```bash
cd backend

# Option 1: Run migrations
alembic upgrade head

# Option 2: Create initial migration (first time only)
alembic revision --autogenerate -m "Initial schema"
alembic upgrade head
```

### Port Already in Use

**Error**: `OSError: [Errno 48] Address already in use: 8000`

**Solution**:
```bash
# Find process using port 8000
lsof -i :8000  # Mac/Linux
netstat -ano | findstr :8000  # Windows

# Kill the process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows

# OR use a different port
uvicorn src.main:app --reload --port 8001
# Then update frontend NEXT_PUBLIC_API_URL to http://localhost:8001
```

## 🧪 Testing

### Manual Testing Checklist

1. **Registration**
   - [ ] Can register with valid email and password
   - [ ] Cannot register with duplicate email (409 error)
   - [ ] Cannot register with invalid email format (400 error)
   - [ ] Cannot register with password < 8 chars (400 error)

2. **Login**
   - [ ] Can login with correct credentials
   - [ ] Cannot login with wrong password (401 error)
   - [ ] Cannot login with non-existent email (401 error)
   - [ ] Automatically redirected to /todos after login

3. **Create Todos**
   - [ ] Can create todo with title only
   - [ ] Can create todo with title and description
   - [ ] Cannot create todo with empty title (400 error)
   - [ ] Character counts update as typing
   - [ ] Form clears after successful creation

4. **View Todos**
   - [ ] See all personal todos on dashboard
   - [ ] Todos sorted by newest first
   - [ ] Empty state shows when no todos
   - [ ] Loading state shows while fetching

5. **Toggle Completion**
   - [ ] Can mark todo as complete (checkbox checked, strikethrough)
   - [ ] Can mark todo as incomplete (checkbox unchecked, no strikethrough)
   - [ ] Completion persists after page refresh

6. **Edit Todos**
   - [ ] Click "Edit" shows edit form inline
   - [ ] Can update title and description
   - [ ] "Cancel" button reverts to original values
   - [ ] Cannot save with empty title
   - [ ] Changes persist after page refresh

7. **Delete Todos**
   - [ ] Confirmation dialog appears before deletion
   - [ ] "Cancel" keeps the todo
   - [ ] "OK" removes the todo permanently
   - [ ] Todo disappears from list immediately

8. **User Isolation**
   - [ ] Create 2 different user accounts
   - [ ] User A cannot see User B's todos
   - [ ] Attempting to access another user's todo via API returns 404

9. **Session Management**
   - [ ] Logout button clears session and redirects to /login
   - [ ] Cannot access /todos without being logged in
   - [ ] Token expiration redirects to /login

### Running Automated Tests

```bash
# Backend tests (when implemented)
cd backend
pytest tests/

# Frontend tests (when implemented)
cd frontend
npm test
```

## 📚 Additional Documentation

- **Feature Specification**: `specs/002-phase2-fullstack-todo/spec.md`
- **Implementation Plan**: `specs/002-phase2-fullstack-todo/plan.md`
- **Data Model**: `specs/002-phase2-fullstack-todo/data-model.md`
- **API Contracts**: `specs/002-phase2-fullstack-todo/contracts/`
- **Developer Quickstart**: `specs/002-phase2-fullstack-todo/quickstart.md`
- **Backend Guide**: `backend/CLAUDE.md`
- **Frontend Guide**: `frontend/CLAUDE.md`

## 🎯 Future Enhancements

Potential features for future versions:

- [ ] Pagination for todo lists (when > 50 todos)
- [ ] Filter todos by completion status
- [ ] Search todos by title/description
- [ ] Todo categories/tags
- [ ] Due dates and reminders
- [ ] Priority levels (high/medium/low)
- [ ] Rich text editor for descriptions
- [ ] File attachments
- [ ] Shared todos between users
- [ ] Email notifications
- [ ] Dark mode theme
- [ ] Export todos (CSV, JSON)
- [ ] Undo/redo functionality
- [ ] Keyboard shortcuts
- [ ] PWA support for offline access

## 🤝 Contributing

This project follows the **Agentic Dev Stack** workflow:

1. Update feature specification in `specs/`
2. Run `/sp.plan` to update implementation plan
3. Run `/sp.tasks` to generate task breakdown
4. Run `/sp.implement` to execute tasks
5. Commit changes with descriptive messages
6. Create pull requests for review

## 📝 License

[Add your license here]

## 💬 Support

For issues, questions, or contributions:
- Check the troubleshooting section above
- Review the documentation in `specs/`
- Check backend logs in Terminal 1
- Check frontend console in browser DevTools

## 🙏 Acknowledgments

Built with:
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [Next.js](https://nextjs.org/) - React framework for production
- [SQLModel](https://sqlmodel.tiangolo.com/) - SQL databases with Python type annotations
- [Better Auth](https://www.better-auth.com/) - Authentication for web applications
- [PostgreSQL](https://www.postgresql.org/) - Advanced open source database

---

**Version**: 1.0.0
**Last Updated**: 2026-01-01
**Status**: ✅ Production Ready
