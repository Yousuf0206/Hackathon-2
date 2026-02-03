@echo off
REM ============================================
REM Complete Deployment Script (Windows)
REM Handles the entire deployment process
REM ============================================

echo.
echo ========================================
echo Phase 2 Todo App - Deployment Script
echo ========================================
echo.

REM Check if Docker is running
echo Step 1: Checking Docker Desktop...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ Docker Desktop is NOT running!
    echo.
    echo PLEASE DO THE FOLLOWING:
    echo   1. Press Windows key and type "Docker Desktop"
    echo   2. Click on Docker Desktop to start it
    echo   3. Wait for the Docker icon in system tray to stop animating
    echo   4. The icon should show "Docker Desktop is running"
    echo   5. Come back and run this script again
    echo.
    echo Alternatively, you can try to start Docker with:
    echo   start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    echo.
    pause
    exit /b 1
)
echo ✅ Docker Desktop is running
echo.

REM Run pre-flight checks
echo Step 2: Running pre-flight checks...
call preflight.bat
if %errorlevel% neq 0 (
    echo.
    echo ❌ Pre-flight checks failed. Please fix the issues above.
    pause
    exit /b 1
)
echo.

REM Stop any existing containers
echo Step 3: Stopping existing containers (if any)...
docker-compose down >nul 2>&1
echo ✅ Cleaned up existing containers
echo.

REM Build and start services
echo Step 4: Building and starting services...
echo This may take a few minutes on first run...
echo.
docker-compose up --build -d
if %errorlevel% neq 0 (
    echo.
    echo ❌ Failed to start services!
    echo.
    echo Check the logs with:
    echo   docker-compose logs
    echo.
    pause
    exit /b 1
)
echo.
echo ✅ Services started
echo.

REM Wait for services to be healthy
echo Step 5: Waiting for services to be healthy...
echo This may take 30-60 seconds...
timeout /t 30 /nobreak >nul
echo.

REM Verify deployment
echo Step 6: Verifying deployment...
call verify-deployment.bat
if %errorlevel% neq 0 (
    echo.
    echo ⚠️  Verification had issues. Check logs:
    echo   docker-compose logs backend
    echo   docker-compose logs frontend
    echo.
) else (
    echo.
    echo ========================================
    echo ✅ DEPLOYMENT SUCCESSFUL!
    echo ========================================
    echo.
    echo Opening the application in your browser...
    timeout /t 3 /nobreak >nul
    start http://localhost:3002
    echo.
)

echo.
echo Useful commands:
echo   - View logs: docker-compose logs -f
echo   - Stop app: docker-compose stop
echo   - Restart app: docker-compose restart
echo   - Remove all: docker-compose down -v
echo.
pause
