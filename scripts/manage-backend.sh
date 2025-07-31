#!/bin/bash

# EcoCredit Backend Management Script
PORT=8080
BACKEND_DIR="backend-java"
JAR_FILE="target/ecocredit-backend-1.0.0.jar"

# Function to kill process on port
kill_port() {
    echo "🔍 Checking for processes on port $PORT..."
    PID=$(lsof -ti:$PORT)
    if [ ! -z "$PID" ]; then
        echo "💀 Killing process $PID on port $PORT..."
        kill -9 $PID
        sleep 2
        echo "✅ Process killed"
    else
        echo "ℹ️  No process found on port $PORT"
    fi
}

# Function to start backend
start_backend() {
    echo "🚀 Starting EcoCredit backend..."
    cd $BACKEND_DIR
    
    # Check if JAR exists
    if [ ! -f "$JAR_FILE" ]; then
        echo "📦 JAR file not found. Building project..."
        mvn clean package -DskipTests
        if [ $? -ne 0 ]; then
            echo "❌ Build failed"
            exit 1
        fi
    fi
    
    # Start the backend
    echo "🟢 Starting backend on port $PORT..."
    java -jar $JAR_FILE &
    BACKEND_PID=$!
    
    echo "🎉 Backend started with PID: $BACKEND_PID"
    echo "📍 Backend URL: http://localhost:$PORT"
    echo "🏥 Health check: http://localhost:$PORT/api/health"
    
    # Wait for backend to start
    echo "⏳ Waiting for backend to be ready..."
    for i in {1..30}; do
        if curl -s http://localhost:$PORT/api/health > /dev/null; then
            echo "✅ Backend is ready!"
            break
        fi
        echo "⏳ Waiting... ($i/30)"
        sleep 2
    done
    
    cd ..
}

# Function to restart backend
restart_backend() {
    echo "🔄 Restarting EcoCredit backend..."
    kill_port
    start_backend
}

# Function to check status
check_status() {
    echo "📊 Checking backend status..."
    if curl -s http://localhost:$PORT/api/health > /dev/null; then
        echo "✅ Backend is running on port $PORT"
        echo "🏥 Health check: PASSED"
    else
        echo "❌ Backend is not responding on port $PORT"
    fi
}

# Main script logic
case "$1" in
    "start")
        start_backend
        ;;
    "stop")
        kill_port
        ;;
    "restart")
        restart_backend
        ;;
    "status")
        check_status
        ;;
    *)
        echo "EcoCredit Backend Management"
        echo "Usage: $0 {start|stop|restart|status}"
        echo ""
        echo "Commands:"
        echo "  start   - Start the backend service"
        echo "  stop    - Stop the backend service"
        echo "  restart - Restart the backend service"
        echo "  status  - Check backend status"
        echo ""
        echo "Examples:"
        echo "  $0 restart  # Kill any existing service and start fresh"
        echo "  $0 status   # Check if backend is running"
        ;;
esac 