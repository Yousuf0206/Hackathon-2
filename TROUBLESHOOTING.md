# Troubleshooting Guide for Phase 2 Todo App

## 🚨 CRITICAL: Application Not Accessible

### Issue: App Claims to Run But Browser Shows Nothing
**Last Updated:** 2026-01-23

**Symptoms:**
- Docker containers show "running" status
- No errors in console
- Browser cannot connect to http://localhost:3002
- curl fails with connection refused

**ROOT CAUSE IDENTIFIED:** Docker Desktop not running + Frontend in dev mode binding to 127.0.0.1

**SOLUTION - Quick Fix:**

1. **START DOCKER DESKTOP FIRST:**
   - Press Windows key, type "Docker Desktop"
   - Wait 30-60 seconds for it to fully start
   - Look for "Docker Desktop is running" in system tray
   - Verify with: `docker ps`

2. **Run the automated deployment:**
   ```bash
   cd C:\Users\user\Desktop\Hackathon 2\apps\phase2
   deploy.bat
   ```

3. **Verify it worked:**
   ```bash
   verify-deployment.bat
   ```

**If still not working:**
- Check `DEPLOYMENT-FIXES.md` for detailed fixes applied
- Check `START-HERE.md` for step-by-step guide

---

## Backend Issues

### Issue: Python 3.14 Compatibility
**Problem**: The backend fails to install dependencies because Python 3.14 is too new and many packages don't have pre-compiled wheels available.

**Error**:
```
Building wheel for pydantic-core (pyproject.toml) did not run successfully.
error: linking with `link.exe` failed: exit code: 1
```

**Solutions**:

#### Option 1: Downgrade Python (Recommended)
1. Install Python 3.11 or 3.12 from [python.org](https://www.python.org/downloads/)
2. Create a virtual environment with the compatible Python version:
   ```bash
   python -m venv venv
   venv\Scripts\activate  # On Windows
   ```
3. Install the backend dependencies:
   ```bash
   cd apps/phase2/backend
   pip install -r requirements.txt
   ```

#### Option 2: Install Visual Studio Build Tools
1. Download and install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
2. Make sure to select "C++ build tools" workload during installation
3. Retry the dependency installation

#### Option 3: Use Docker (Recommended)
Docker files have been created for you. Before running, ensure Docker Desktop is installed and running:

1. Install Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/)
2. Start Docker Desktop and wait for it to fully initialize
3. Navigate to the project directory:
   ```bash
   cd C:\Users\user\Desktop\Hackathon 2\apps\phase2
   ```
4. Run the application with docker-compose:
   ```bash
   docker-compose up --build
   ```

This will start both the backend (on port 8000) and frontend (on port 3002) services with compatible Python/Node versions.

## Frontend Status
✅ The frontend is running successfully on http://localhost:3002

## Current Configuration
- Backend expects to run on http://localhost:8000
- Frontend is configured to connect to NEXT_PUBLIC_API_URL=http://localhost:8000
- Frontend is actually running on http://localhost:3002 (due to port 3000 being in use)
- JWT secrets are now synchronized between frontend and backend
- CORS configuration has been updated to include both http://localhost:3000 and http://localhost:3002

## Next Steps
1. Resolve the backend Python compatibility issue using one of the solutions above
2. Start the backend server on port 8000
3. Test the integration between frontend and backend
4. If ports are different, update NEXT_PUBLIC_API_URL in frontend .env.local as needed