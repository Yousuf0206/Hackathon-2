@echo off
REM TaskFlow - Start both Backend and Frontend servers
REM This script runs both servers in a single terminal

echo ============================================
echo   TaskFlow - Fullstack Todo Application
echo ============================================
echo.
echo Starting servers...
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:3000
echo.
echo Press Ctrl+C to stop both servers
echo ============================================
echo.

REM Start backend in background
cd /d "%~dp0backend"
start "Backend - FastAPI" cmd /c "python -m uvicorn src.main:app --reload --port 8000"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
cd /d "%~dp0frontend"
start "Frontend - Next.js" cmd /c "npm run dev"

echo Both servers are starting...
echo.
echo ============================================
echo   Servers are running!
echo   - Backend API:  http://localhost:8000
echo   - Frontend App: http://localhost:3000
echo ============================================
echo.
echo This window will stay open. Close it to stop all servers.
echo.

REM Keep this window open
pause >nul
