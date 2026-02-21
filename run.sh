#!/bin/bash

# --- Environment Setup (For macOS Shortcuts/Non-interactive shells) ---
# Source common profiles to get NVM, Path, etc.
[ -f ~/.zshrc ] && source ~/.zshrc
[ -f ~/.bash_profile ] && source ~/.bash_profile

# Ensure NVM is loaded if it exists
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" --no-use

# Add common local bin paths to PATH
export PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$HOME/Library/Python/3.9/bin:$PATH"

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

# 0. Start Ollama if not running
if command -v ollama &>/dev/null; then
    if ! curl -s http://localhost:11434/api/tags &>/dev/null; then
        echo "Starting Ollama..."
        ollama serve &
        sleep 2
    else
        echo "Ollama already running ✓"
    fi
else
    echo "⚠️  Ollama not found. Install: curl -fsSL https://ollama.com/install.sh | sh"
fi

# 1. Cleanup old processes on these ports
echo "Cleaning up ports 8000 and 3001..."
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"

# 2. Start Backend
echo "Starting Backend (FastAPI)..."
cd "$PROJECT_ROOT/backend"

# Use/Create virtual environment for reliability
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

PYTHON_BIN="venv/bin/python3"
$PYTHON_BIN -m pip install --upgrade pip
echo "Verifying backend dependencies..."
$PYTHON_BIN -m pip install -r requirements.txt

$PYTHON_BIN -m uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!

# 3. Start Frontend
echo "Starting Frontend (Next.js)..."
cd "$PROJECT_ROOT/frontend"

# Check node_modules
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

npm run dev &
FRONTEND_PID=$!

echo "✅ All systems go!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3001"
echo "Press Ctrl+C to stop."

# 4. Open browser (macOS)
sleep 5
open "http://localhost:3001"

wait
