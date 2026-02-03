# Phase 2 Todo Application - Docker Deployment

A production-ready, full-stack todo application with JWT authentication, built with FastAPI (backend) and Next.js (frontend), deployable via Docker.

## 🚀 Quick Start (Docker - Recommended)

**⚠️ CRITICAL: Docker Desktop must be running first!**

### One-Command Deployment:
```bash
cd C:\Users\user\Desktop\Hackathon 2\apps\phase2
deploy.bat
```

This automatically:
1. ✅ Checks if Docker is running
2. ✅ Validates environment
3. ✅ Builds and starts services
4. ✅ Verifies deployment
5. ✅ Opens app in browser

**Access:** http://localhost:3002

---

## 📋 Prerequisites

- **Docker Desktop** (MUST be running) - [Install here](https://www.docker.com/products/docker-desktop/)
- **Windows 10/11** with WSL 2, or **Linux/macOS**
- **8 GB RAM** minimum (4 GB allocated to Docker)
- **10 GB disk space**

### First Time? Start Here:

1. **Install Docker Desktop** (if not installed)
2. **Start Docker Desktop** - Wait for "running" status
3. **Verify:**
   ```bash
   docker ps
   ```
   Should list containers (may be empty), not show an error.

Need help? See **[DOCKER-START-INSTRUCTIONS.md](DOCKER-START-INSTRUCTIONS.md)**

---

## 📖 All Documentation

- **[START-HERE.md](START-HERE.md)** - Quickstart guide for new users
- **[DEPLOYMENT-FIXES.md](DEPLOYMENT-FIXES.md)** - Technical fixes for "app not accessible" issue
- **[DOCKER-START-INSTRUCTIONS.md](DOCKER-START-INSTRUCTIONS.md)** - How to start Docker
- **[TROUBLESHOOTING.md](../../TROUBLESHOOTING.md)** - Common problems and solutions
- **[README.md](README.md)** - Original development guide (non-Docker)

---

## 🎯 What's Inside

### Features
- ✅ User registration and login (Better Auth + JWT)
- ✅ Create, read, update, delete todos
- ✅ Mark todos complete/incomplete
- ✅ User data isolation (users only see their own todos)
- ✅ Persistent storage (SQLite in Docker volume)
- ✅ Production-ready (multi-stage builds, health checks)

### Tech Stack
- **Frontend:** Next.js 15, React 18, TypeScript, Better Auth
- **Backend:** FastAPI, Python 3.11, SQLModel, JWT
- **Database:** SQLite (easily swappable to PostgreSQL)
- **Deployment:** Docker with multi-stage builds

---

## 🏗️ Architecture

```
Browser (localhost:3002)
    ↓
Docker Container: Next.js Frontend (port 3000→3002)
    ↓ JWT Authentication
Docker Container: FastAPI Backend (port 8000)
    ↓
Docker Volume: SQLite Database (persistent)
```

---

## 🔧 Usage

### Starting
```bash
deploy.bat  # Automated (recommended)
# OR
docker-compose up --build  # Manual
```

### Stopping
```bash
docker-compose stop  # Keeps data
docker-compose down  # Removes containers, keeps data
docker-compose down -v  # Removes everything including data
```

### Viewing Logs
```bash
docker-compose logs -f  # All services
docker-compose logs -f backend  # Backend only
docker-compose logs -f frontend  # Frontend only
```

### Accessing
- **Frontend:** http://localhost:3002
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

---

## 🧪 Testing

1. Open http://localhost:3002
2. Click "Get Started" → Register
3. Create todos
4. Test edit, complete, delete
5. Logout and login again
6. Verify data persists

**Test User Isolation:**
- Create 2 accounts
- Verify each user sees only their own todos

---

## 🐛 Troubleshooting

### App Not Opening
```bash
# Run verification
verify-deployment.bat

# Check logs
docker-compose logs
```

### Port Already in Use
```bash
docker-compose down
netstat -ano | findstr ":3002"
# Kill process or change port in docker-compose.yml
```

### Authentication Issues
```bash
# Verify secrets match
docker-compose exec backend printenv BETTER_AUTH_SECRET
docker-compose exec frontend printenv BETTER_AUTH_SECRET
```

More help: **[START-HERE.md](START-HERE.md)** and **[TROUBLESHOOTING.md](../../TROUBLESHOOTING.md)**

---

## 🔒 Security

**Implemented:**
- ✅ JWT with 24-hour expiry
- ✅ Bcrypt password hashing
- ✅ User data isolation
- ✅ CORS protection
- ✅ Input validation

**For Production:**
- Change `BETTER_AUTH_SECRET` to strong random value
- Use PostgreSQL instead of SQLite
- Enable HTTPS
- Add rate limiting

---

## 💻 Development (Non-Docker)

See original **[README.md](README.md)** for local development setup without Docker.

---

## 📁 Project Structure

```
apps/phase2/
├── backend/          # FastAPI backend
├── frontend/         # Next.js frontend
├── docker-compose.yml
├── deploy.bat        # Automated deployment
├── preflight.bat     # Pre-deployment checks
├── verify-deployment.bat
└── [Documentation files]
```

---

## ⚡ Quick Commands

```bash
# Deploy everything
deploy.bat

# Pre-flight check
preflight.bat

# Start services
docker-compose up --build

# Stop services
docker-compose stop

# View logs
docker-compose logs -f

# Restart
docker-compose restart

# Clean up
docker-compose down -v
```

---

**Ready?** Run `deploy.bat` and open http://localhost:3002! 🎉

For detailed guides, see **[START-HERE.md](START-HERE.md)**
