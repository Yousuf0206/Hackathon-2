@echo off
REM ============================================
REM Pre-flight Checks Script (Windows)
REM Validates environment before deployment
REM ============================================

echo.
echo 🔧 Running pre-flight checks...
echo.

set FAILED=0

REM Check Docker Desktop
echo 1. Checking Docker Desktop...
docker info >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Docker Desktop is running
) else (
    echo ❌ Docker Desktop is NOT running
    echo    → Start Docker Desktop and wait for it to initialize
    set FAILED=1
)
echo.

REM Check Docker Compose
echo 2. Checking Docker Compose...
docker-compose --version >nul 2>&1
if %errorlevel% equ 0 (
    docker-compose --version
    echo ✅ Docker Compose is installed
) else (
    echo ❌ Docker Compose not found
    set FAILED=1
)
echo.

REM Check ports
echo 3. Checking port availability...
netstat -ano | findstr ":3002.*LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Port 3002 is already in use
    netstat -ano | findstr ":3002.*LISTENING"
) else (
    echo ✅ Port 3002 is available
)

netstat -ano | findstr ":8000.*LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Port 8000 is already in use
    netstat -ano | findstr ":8000.*LISTENING"
) else (
    echo ✅ Port 8000 is available
)
echo.

REM Check environment files
echo 4. Checking environment configuration...
if exist "backend\.env" (
    echo ✅ backend\.env exists
    findstr /C:"BETTER_AUTH_SECRET" backend\.env >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ BETTER_AUTH_SECRET configured in backend\.env
    ) else (
        echo ❌ BETTER_AUTH_SECRET missing in backend\.env
        set FAILED=1
    )
    findstr /C:"DATABASE_URL" backend\.env >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ DATABASE_URL configured in backend\.env
    ) else (
        echo ❌ DATABASE_URL missing in backend\.env
        set FAILED=1
    )
) else (
    echo ❌ backend\.env missing
    echo    → Copy backend\.env.example to backend\.env
    set FAILED=1
)
echo.

if exist "frontend\.env.local" (
    echo ✅ frontend\.env.local exists
) else (
    echo ⚠️  frontend\.env.local missing (optional for Docker)
    echo    Environment variables will be provided by docker-compose.yml
)
echo.

REM Check Docker configuration files
echo 5. Checking Docker configuration files...
if exist "backend\Dockerfile" (
    echo ✅ backend\Dockerfile exists
) else (
    echo ❌ backend\Dockerfile missing
    set FAILED=1
)

if exist "frontend\Dockerfile" (
    echo ✅ frontend\Dockerfile exists
) else (
    echo ❌ frontend\Dockerfile missing
    set FAILED=1
)

if exist "docker-compose.yml" (
    echo ✅ docker-compose.yml exists
) else (
    echo ❌ docker-compose.yml missing
    set FAILED=1
)
echo.

REM Summary
echo ======================================
if %FAILED% equ 0 (
    echo ✅ All pre-flight checks passed!
    echo ======================================
    echo.
    echo You can now run:
    echo   docker-compose up --build
    echo.
    exit /b 0
) else (
    echo ❌ Some pre-flight checks failed
    echo ======================================
    echo.
    echo Please fix the issues above before deploying.
    echo.
    exit /b 1
)
