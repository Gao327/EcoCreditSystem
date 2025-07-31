#!/bin/bash

# EcoCredit Full Stack Starter Script (Backend + Web App + Mobile App)
echo "🌱 EcoCredit Full Stack Platform"
echo "================================="
echo "🚀 Backend API: http://localhost:8080"
echo "🌐 Web App: http://localhost:8081"
echo "📱 Mobile App: Expo with QR code"
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
port_in_use() {
    lsof -ti:$1 >/dev/null 2>&1
}

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo "💀 Killing process $pid on port $port..."
        kill -9 $pid
        sleep 1
    fi
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command_exists java; then
    echo "❌ Java not found. Please install Java 17 or higher."
    exit 1
fi

if ! command_exists mvn; then
    echo "❌ Maven not found. Please install Maven."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm not found. Please install Node.js and npm."
    exit 1
fi

if ! command_exists npx; then
    echo "❌ npx not found. Please install Node.js and npm."
    exit 1
fi

echo "✅ All prerequisites found"

# Clean up existing processes
echo ""
echo "🧹 Cleaning up existing processes..."
kill_port 8080
kill_port 8081

# Start backend (port 8080)
echo ""
echo "🚀 Starting EcoCredit Backend (API Server)..."
./scripts/manage-backend.sh start

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
for i in {1..15}; do
    if curl -s http://localhost:8080/api/health > /dev/null; then
        echo "✅ Backend API is ready!"
        break
    fi
    echo "⏳ Backend starting... ($i/15)"
    sleep 2
done

# Check if backend is actually ready
if ! curl -s http://localhost:8080/api/health > /dev/null; then
    echo "❌ Backend failed to start properly"
    exit 1
fi

# Start web app server (port 8081)
echo ""
echo "🌐 Starting Web App Server..."
./scripts/start-webapp.sh &
WEB_SERVER_PID=$!

# Wait for web server to be ready
echo "⏳ Waiting for web app server to be ready..."
for i in {1..10}; do
    if port_in_use 8081; then
        echo "✅ Web app server is ready!"
        break
    fi
    echo "⏳ Web server starting... ($i/10)"
    sleep 1
done

# Start mobile app
echo ""
echo "📱 Starting Mobile App (Expo)..."
echo "🔧 Installing mobile app dependencies if needed..."

cd mobile-app

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "🎯 Starting Expo development server..."
echo "📱 The QR code will appear below - scan it with Expo Go app"
echo "⌨️  Or press:"
echo "   - 'i' for iOS Simulator"
echo "   - 'a' for Android Emulator" 
echo "   - 'w' for web browser"
echo ""

            # Start Expo on specific port to avoid conflicts
            npx expo start --clear --port 8082 &
EXPO_PID=$!

cd ..

echo ""
echo "🎉 EcoCredit Full Stack Platform is running!"
echo ""
echo "📊 Services Status:"
echo "   ✅ Backend API: http://localhost:8080/api/health"
echo "   ✅ Web App: http://localhost:8081/app-with-auth.html"
echo "   ✅ Mobile App: Expo development server with QR code"
echo ""
echo "🔗 Quick Links:"
echo "   🌐 Web Interface: http://localhost:8081"
echo "   📊 API Health: http://localhost:8080/api/health"
echo "   🎮 H2 Database Console: http://localhost:8080/h2-console"
echo ""
echo "💡 Usage Tips:"
echo "   - Web app runs independently on port 8081"
echo "   - Mobile app connects to API on port 8080"
echo "   - Scan QR code with Expo Go for mobile testing"
echo "   - Both apps share the same backend data"
echo ""
echo "🛑 To stop everything:"
echo "   - Press Ctrl+C to stop this script"
echo "   - Or run: ./scripts/manage-backend.sh stop"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    kill_port 8080
    kill_port 8081
    if [ ! -z "$EXPO_PID" ]; then
        kill $EXPO_PID 2>/dev/null
    fi
    if [ ! -z "$WEB_SERVER_PID" ]; then
        kill $WEB_SERVER_PID 2>/dev/null
    fi
    echo "✅ All services stopped"
}

# Set trap to cleanup on script exit
trap cleanup EXIT INT TERM

# Keep script running
echo "Press Ctrl+C to stop all services..."
wait $EXPO_PID 