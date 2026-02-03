@echo off
REM Simple script to start both servers in separate windows

echo ============================================
echo   Starting TaskFlow Application
echo ============================================
echo.

REM Start backend
cd /d "%~dp0backend"
start "TaskFlow Backend (Port 8000)" cmd /k "python -m uvicorn src.main:app --reload --port 8000"

REM Wait for backend to initialize
timeout /t 5 /nobreak >nul

REM Start frontend
cd /d "%~dp0frontend"
start "TaskFlow Frontend (Port 3000)" cmd /k "npm run dev"

echo.
echo ============================================
echo   Servers Started!
echo ============================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Two separate windows have been opened.
echo Close those windows to stop the servers.
echo.
pause
