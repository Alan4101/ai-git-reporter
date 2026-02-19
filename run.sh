#!/bin/bash

# Function to kill background processes on exit
cleanup() {
    echo ""
    echo "Stopping servers..."
    [ -n "$BACKEND_PID" ] && kill $BACKEND_PID 2>/dev/null
    [ -n "$FRONTEND_PID" ] && kill $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

echo "🚀 Starting Git AI Reporter Pro..."

# 1. Cleanup old processes on these ports
echo "Cleaning up ports 8000 and 3000..."
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null

# 2. Start Backend
echo "Starting Backend (FastAPI)..."
cd "$(dirname "$0")/backend"

# Detect python and venv
if [ -d "../venv" ]; then
    PYTHON="../venv/bin/python3"
else
    PYTHON="python3"
fi

# Ensure dependencies are installed
echo "Verifying backend dependencies..."
$PYTHON -m pip install -r requirements.txt

$PYTHON -m uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

# 3. Start Frontend
echo "Starting Frontend (Next.js)..."
cd "../frontend"

# Check node_modules
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

npm run dev &
FRONTEND_PID=$!

echo "✅ All systems go!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "Press Ctrl+C to stop."

# 4. Open browser (macOS)
sleep 5
open "http://localhost:3000"

wait
