@echo off
echo ========================================
echo Phase II Todo App - Starting Services
echo ========================================
echo.

echo Starting Backend Server (FastAPI)...
start "Backend Server" cmd /k "cd backend && venv312\Scripts\python -m uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload"

echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo Starting Frontend Server (Next.js)...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo Services Starting...
echo ========================================
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs
echo ========================================
echo.
echo Opening browser in 10 seconds...
timeout /t 10 /nobreak >nul

echo Opening application in browser...
start http://localhost:3000

echo.
echo ========================================
echo Both servers are running!
echo Press Ctrl+C in each window to stop
echo ========================================
pause
