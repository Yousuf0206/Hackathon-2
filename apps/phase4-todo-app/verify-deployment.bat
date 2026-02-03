@echo off
REM ============================================
REM Deployment Verification Script (Windows)
REM Validates that both services are healthy
REM ============================================

echo.
echo 🔍 Verifying deployment...
echo.

REM Check if Docker is running
echo Checking Docker status...
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running!
    echo Please start Docker Desktop and wait for it to initialize.
    exit /b 1
)
echo ✅ Docker is running
echo.

REM Check if containers are running
echo Checking container status...
docker-compose ps -q backend >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Backend container is not running
    exit /b 1
)
echo ✅ Backend container is running

docker-compose ps -q frontend >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Frontend container is not running
    exit /b 1
)
echo ✅ Frontend container is running
echo.

REM Wait for services to initialize
echo Waiting for services to initialize...
timeout /t 5 /nobreak >nul
echo.

REM Check backend health
echo Checking backend health endpoint...
curl -f http://localhost:8000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend responding on port 8000
    curl -s http://localhost:8000/health
) else (
    echo ❌ Backend not responding on port 8000
    echo.
    echo Backend logs:
    docker-compose logs backend --tail 50
    exit /b 1
)
echo.

REM Check frontend health
echo Checking frontend health endpoint...
curl -f http://localhost:3002/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend responding on port 3002
    curl -s http://localhost:3002/api/health
) else (
    echo ❌ Frontend not responding on port 3002
    echo.
    echo Frontend logs:
    docker-compose logs frontend --tail 50
    exit /b 1
)
echo.

REM Check frontend homepage
echo Checking frontend homepage...
curl -f http://localhost:3002 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Frontend homepage accessible
) else (
    echo ❌ Frontend homepage not accessible
    exit /b 1
)
echo.

REM Check backend API docs
echo Checking backend API documentation...
curl -f http://localhost:8000/docs >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend API docs accessible
) else (
    echo ❌ Backend API docs not accessible
)
echo.

REM Summary
echo ======================================
echo ✅ All services are healthy!
echo ======================================
echo.
echo 📝 Access points:
echo    Frontend: http://localhost:3002
echo    Backend API: http://localhost:8000
echo    API Docs: http://localhost:8000/docs
echo.
echo 🧪 You can now test the application:
echo    1. Open http://localhost:3002 in your browser
echo    2. Register a new account
echo    3. Create todos
echo.
