# How to Run TaskFlow Application

## Quick Start (Recommended)

### Option 1: Double-click `run.bat`
Simply double-click the `run.bat` file in this folder. This will:
- Open 2 separate windows (Backend and Frontend)
- Start both servers automatically
- Show you the URLs to access the app

### Option 2: Use `start.bat`
Double-click `start.bat` for an alternative startup method.

---

## Manual Start (If needed)

### Start Backend (Terminal 1)
```bash
cd backend
python -m uvicorn src.main:app --reload --port 8000
```

### Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

---

## Access the Application

Once both servers are running, open your browser:

**Frontend**: http://localhost:3000

**Backend API**: http://localhost:8000

---

## Test Account

You can test with this existing account:
- **Email**: demo@taskflow.com
- **Password**: Demo123456

---

## Troubleshooting

### Error: Port already in use

Kill the processes using the ports:
```bash
# Windows
taskkill /F /PID <process-id>

# Find process using port
netstat -ano | findstr :3000
netstat -ano | findstr :8000
```

### Error: EPERM .next/trace

Close all running Next.js instances and delete the `.next` folder:
```bash
cd frontend
rm -rf .next
```

### Error: Module not found

Reinstall dependencies:
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

---

## Features

✅ Modern professional UI with glassmorphism effects
✅ Secure JWT authentication
✅ Task CRUD operations (Create, Read, Update, Delete)
✅ Task completion tracking
✅ Statistics dashboard
✅ Responsive design

---

## Tech Stack

**Backend**: FastAPI + SQLModel + PostgreSQL/SQLite
**Frontend**: Next.js 15 + TypeScript + styled-jsx
**Authentication**: JWT tokens

---

## Support

If you encounter any issues, check:
1. Python 3.11+ is installed
2. Node.js 18+ is installed
3. All dependencies are installed
4. Ports 3000 and 8000 are free
