# 🚀 Quick Start Guide - Phase II Todo App

## Easiest Way to Run

### Option 1: One-Click Start (Windows)

Double-click `start.bat` - it will:
1. Start the backend server (FastAPI)
2. Start the frontend server (Next.js)
3. Open your browser automatically

### Option 2: Integrated Dashboard

1. Make sure both servers are running (use `start.bat` or start manually)
2. Open `dashboard.html` in your browser
3. Enjoy the integrated view with:
   - Frontend app
   - API documentation
   - System info sidebar
   - Quick links

## Manual Start (if needed)

### Terminal 1 - Backend
```bash
cd backend
venv312\Scripts\python -m uvicorn src.main:app --reload
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Then open: http://localhost:3000 or `dashboard.html`

## First Time Use

1. **Register an account:**
   - Click "Sign Up"
   - Email: `test@example.com`
   - Password: `password123` (min 8 chars)

2. **Start creating todos:**
   - Enter a title (required)
   - Add description (optional)
   - Click "Add Todo"

3. **Manage your todos:**
   - ✅ Check the box to mark complete
   - ✏️ Click "Edit" to modify
   - 🗑️ Click "Delete" to remove

## URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:3000 | Main application |
| **Backend API** | http://localhost:8000 | REST API |
| **API Docs** | http://localhost:8000/docs | Interactive API documentation |
| **Health Check** | http://localhost:8000/health | Server status |
| **Dashboard** | `dashboard.html` | Integrated view |

## Features Available

✅ User registration and login
✅ Create todos with title and description
✅ View all your personal todos
✅ Mark todos as complete/incomplete
✅ Edit todo details
✅ Delete todos with confirmation
✅ User data isolation (secure)
✅ Automatic JWT authentication
✅ Persistent storage (SQLite)

## Troubleshooting

### Servers won't start?
- Make sure Python 3.12 is installed
- Make sure Node.js 18+ is installed
- Check if ports 3000 and 8000 are available

### Can't login?
- Register a new account first
- Check that backend is running (http://localhost:8000/health)
- Ensure both servers have the same `BETTER_AUTH_SECRET`

### Frontend shows errors?
- Wait for compilation to finish (~30 seconds first time)
- Check browser console for errors
- Verify backend is accessible

## Need Help?

1. Check the full [README.md](README.md) for detailed instructions
2. Visit API docs at http://localhost:8000/docs
3. Check the [troubleshooting section](README.md#-troubleshooting)

---

**Tip:** Use the integrated dashboard (`dashboard.html`) for the best experience! 🎯
