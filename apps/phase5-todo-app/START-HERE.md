# 🚀 Phase 2 Todo App - Quick Start Guide

## ⚠️ CRITICAL: Docker Desktop Must Be Running

Before doing anything else, **START DOCKER DESKTOP** and wait for it to fully initialize (30-60 seconds).

---

## Quick Start (3 Steps)

### Step 1: Pre-flight Checks
Run the pre-flight script to verify your environment:

**Windows:**
```bash
cd C:\Users\user\Desktop\Hackathon 2\apps\phase2
preflight.bat
```

**Linux/Mac:**
```bash
cd /path/to/Hackathon\ 2/apps/phase2
bash preflight.sh
```

This will check:
- ✅ Docker Desktop is running
- ✅ Ports 3002 and 8000 are available
- ✅ Environment files exist
- ✅ Configuration is valid

### Step 2: Build and Start Services
```bash
docker-compose up --build
```

This will:
- Build the backend (Python/FastAPI)
- Build the frontend (Next.js)
- Start both services with health checks
- Set up the SQLite database

**Wait for these messages:**
- Backend: `✅ Backend ready on http://0.0.0.0:8000`
- Frontend: `✅ ready - started server on 0.0.0.0:3000`

### Step 3: Verify Deployment
Open a new terminal and run:

**Windows:**
```bash
verify-deployment.bat
```

**Linux/Mac:**
```bash
bash verify-deployment.sh
```

---

## Access the Application

Once verified, open your browser:

- **Frontend (Web App):** http://localhost:3002
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs

---

## Testing the Application

1. **Register a new account:**
   - Go to http://localhost:3002
   - Click "Get Started" or "Sign Up"
   - Enter email and password (min 8 characters)

2. **Create todos:**
   - After registration, you'll be redirected to /todos
   - Add a todo with title and optional description
   - Mark todos as complete/incomplete
   - Edit or delete todos

3. **Test authentication:**
   - Logout and login again
   - Verify todos persist
   - Try accessing /todos without login (should redirect)

---

## Troubleshooting

### Issue: Docker Not Running
**Error:** `The system cannot find the file specified`

**Fix:**
1. Open Docker Desktop from Start Menu
2. Wait 30-60 seconds for it to fully start
3. Verify with: `docker ps`
4. Retry: `docker-compose up --build`

### Issue: Port Already in Use
**Error:** `port is already allocated`

**Fix:**
```bash
# Stop existing containers
docker-compose down

# Check what's using the port
netstat -ano | findstr ":3002"
netstat -ano | findstr ":8000"

# Kill the process or change ports in docker-compose.yml
```

### Issue: Frontend Not Loading
**Fix:**
```bash
# Check frontend logs
docker-compose logs frontend

# Rebuild frontend
docker-compose up --build frontend
```

### Issue: Backend Not Responding
**Fix:**
```bash
# Check backend logs
docker-compose logs backend

# Check database
docker-compose exec backend ls -la /app

# Rebuild backend
docker-compose up --build backend
```

### Issue: Authentication Not Working
**Fix:**
1. Verify BETTER_AUTH_SECRET matches in both services:
   ```bash
   docker-compose exec backend printenv BETTER_AUTH_SECRET
   docker-compose exec frontend printenv BETTER_AUTH_SECRET
   ```
2. Should both show: `supersecretkeyfordevelopment`
3. If not matching, check docker-compose.yml

---

## Development Mode (Optional)

To run in development mode for faster iteration:

### Backend:
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
cd src
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend:
```bash
cd frontend
npm install
npm run dev
```

---

## Stopping the Application

```bash
# Stop containers (keeps data)
docker-compose stop

# Stop and remove containers (keeps data)
docker-compose down

# Stop and remove everything including data
docker-compose down -v
```

---

## Architecture Overview

```
Browser (http://localhost:3002)
    ↓
Next.js Frontend Container (port 3000 inside, 3002 outside)
    ↓ (Better Auth + JWT)
FastAPI Backend Container (port 8000)
    ↓
SQLite Database (persistent volume)
```

### Key Components:
- **Frontend:** Next.js 15 with App Router, Better Auth integration
- **Backend:** FastAPI with SQLModel ORM, JWT authentication
- **Auth:** Better Auth (client) + JWT (backend) with shared secret
- **Database:** SQLite (development) - easily swappable to PostgreSQL
- **Deployment:** Multi-stage Docker builds for production optimization

---

## Security Notes

✅ **Implemented:**
- JWT-based authentication with 24-hour expiry
- Password hashing with bcrypt
- User data isolation (users can only see their own todos)
- CORS protection
- Input validation
- SQL injection prevention (SQLModel ORM)

⚠️ **For Production:**
- Change `BETTER_AUTH_SECRET` to a strong random value
- Use PostgreSQL instead of SQLite
- Enable HTTPS
- Add rate limiting
- Use environment-specific secrets
- Enable Docker security scanning

---

## Next Steps

1. ✅ Start Docker Desktop
2. ✅ Run pre-flight checks
3. ✅ Build and start services
4. ✅ Verify deployment
5. ✅ Open http://localhost:3002
6. ✅ Register and test the app

**Need help?** Check TROUBLESHOOTING.md or the logs with `docker-compose logs`
