#!/bin/bash

# RAG Application Startup Script
echo "🚀 Starting RAG Application..."
echo "=================================="

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    echo "   Expected directories: backend/ and frontend/"
    exit 1
fi

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is not installed or not in PATH"
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed or not in PATH"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed or not in PATH"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Set up Python path
export PYTHONPATH="${PYTHONPATH}:$(pwd)/02_Embeddings_and_RAG"
echo "📁 Python path set to include RAG components"

# Install backend dependencies if needed
echo "📦 Checking backend dependencies..."
cd backend
if [ ! -d "venv" ]; then
    echo "   Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt > /dev/null 2>&1
echo "✅ Backend dependencies ready"
cd ..

# Install frontend dependencies if needed
echo "📦 Checking frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "   Installing npm packages..."
    npm install > /dev/null 2>&1
fi
echo "✅ Frontend dependencies ready"
cd ..

echo ""
echo "🎯 Starting services..."
echo ""

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend server
echo "🔧 Starting backend server on http://localhost:8000"
cd backend
source venv/bin/activate
python start_server.py &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "🎨 Starting frontend server on http://localhost:3000"
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 RAG Application is starting up!"
echo "=================================="
echo "🔧 Backend API: http://localhost:8000"
echo "📖 API Docs: http://localhost:8000/docs"
echo "🎨 Frontend: http://localhost:3000"
echo ""
echo "💡 Usage:"
echo "   1. Open http://localhost:3000 in your browser"
echo "   2. Go to Settings and enter your OpenAI API key"
echo "   3. Upload documents in the Documents tab"
echo "   4. Use RAG in the Chat tab by toggling 'Use RAG'"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for background processes
wait