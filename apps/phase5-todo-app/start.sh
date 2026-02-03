#!/bin/bash
# TaskFlow - Start both Backend and Frontend servers

echo "============================================"
echo "  TaskFlow - Fullstack Todo Application"
echo "============================================"
echo ""
echo "Starting servers..."
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "============================================"
echo ""

# Start backend in background
cd backend
uvicorn src.main:app --reload --port 8000 &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo "Both servers are starting..."
echo ""
echo "============================================"
echo "  Servers are running!"
echo "  - Backend API:  http://localhost:8000"
echo "  - Frontend App: http://localhost:3000"
echo "============================================"
echo ""

# Handle shutdown
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "Servers stopped."
    exit
}

trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
