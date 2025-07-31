#!/bin/bash

# EcoCredit Complete System Starter
echo "🌱 EcoCredit Complete System"
echo "============================="
echo "🚀 Backend API: http://localhost:8080"
echo "🌐 Web App: http://localhost:8081"  
echo "📱 Mobile App: Expo with QR code"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

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
        sleep 2
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local name=$2
    local max_attempts=30
    
    for i in $(seq 1 $max_attempts); do
        if curl -s "$url" > /dev/null 2>&1; then
            print_status "$name is ready!"
            return 0
        fi
        echo "⏳ Waiting for $name... ($i/$max_attempts)"
        sleep 2
    done
    
    print_error "$name failed to start after $max_attempts attempts"
    return 1
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command_exists java; then
    print_error "Java not found. Please install Java 17 or higher."
    exit 1
fi

if ! command_exists mvn; then
    print_error "Maven not found. Please install Maven."
    exit 1
fi

if ! command_exists npm; then
    print_error "npm not found. Please install Node.js and npm."
    exit 1
fi

if ! command_exists npx; then
    print_error "npx not found. Please install Node.js and npm."
    exit 1
fi

if ! command_exists node; then
    print_error "Node.js not found. Please install Node.js."
    exit 1
fi

print_status "All prerequisites found"

# Clean up existing processes
echo ""
echo "🧹 Cleaning up existing processes..."
kill_port 8080
kill_port 8081
kill_port 8082

# Cleanup any hanging expo processes
pkill -f "expo start" 2>/dev/null || true
sleep 2

# Start backend (port 8080)
echo ""
echo "🚀 Starting EcoCredit Backend..."
./scripts/manage-backend.sh restart

# Wait for backend to be ready
if ! wait_for_service "http://localhost:8080/api/health" "Backend API"; then
    print_error "Backend failed to start. Please check the logs."
    exit 1
fi

# Start web app server (port 8081)
echo ""
echo "🌐 Starting Web App Server..."
./scripts/start-webapp.sh &
WEB_SERVER_PID=$!

# Wait for web server to be ready
if ! wait_for_service "http://localhost:8081" "Web App"; then
    print_error "Web app failed to start. Please check Node.js installation."
    exit 1
fi

# Prepare mobile app
echo ""
echo "📱 Preparing Mobile App..."
cd mobile-app

# Check if node_modules exists and is healthy
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.bin/expo" ]; then
    echo "📦 Installing/updating mobile app dependencies..."
    rm -rf node_modules package-lock.json 2>/dev/null
    npm install
    if [ $? -ne 0 ]; then
        print_error "Failed to install mobile app dependencies"
        cd ..
        exit 1
    fi
fi

echo ""
echo "🎯 Starting Expo development server..."
echo "📱 QR code will appear below - scan with Expo Go app"
echo "⌨️  Controls:"
echo "   - 'i' for iOS Simulator"
echo "   - 'a' for Android Emulator"
echo "   - 'w' for web browser"
echo "   - 'r' to reload app"
echo "   - 'm' for more options"
echo ""

# Start Expo on specific port to avoid conflicts
npx expo start --clear --port 8082 &
EXPO_PID=$!

cd ..

# Wait a moment for expo to start
sleep 5

echo ""
print_status "🎉 EcoCredit Full Stack Platform is running!"
echo ""
echo "📊 System Status:"
echo "   ✅ Backend API: http://localhost:8080/api/health"
echo "   ✅ Web App: http://localhost:8081/app-with-auth.html"
echo "   ✅ Mobile App: Expo development server (check terminal for QR code)"
echo ""
echo "🔗 Quick Access:"
echo "   🌐 Web Interface: http://localhost:8081"
echo "   📊 API Health Check: http://localhost:8080/api/health"
echo "   🎮 Database Console: http://localhost:8080/h2-console"
echo "   📱 Mobile App: Scan QR code with Expo Go"
echo ""
echo "💡 Development Tips:"
echo "   - Web app changes: Edit files in backend-java/src/main/resources/static/"
echo "   - Mobile app changes: Edit files in mobile-app/src/ (auto-reload)"
echo "   - Backend changes: Run ./scripts/manage-backend.sh restart"
echo "   - Both apps share the same backend data and API"
echo ""
echo "🛑 To stop all services:"
echo "   - Press Ctrl+C here"
echo "   - Or run: ./scripts/manage-backend.sh stop"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down all services..."
    kill_port 8080
    kill_port 8081
    if [ ! -z "$EXPO_PID" ]; then
        kill $EXPO_PID 2>/dev/null
    fi
    if [ ! -z "$WEB_SERVER_PID" ]; then
        kill $WEB_SERVER_PID 2>/dev/null
    fi
    pkill -f "expo start" 2>/dev/null || true
    print_status "All services stopped"
    echo ""
    echo "Thank you for using EcoCredit! 🌱"
}

# Set trap to cleanup on script exit
trap cleanup EXIT INT TERM

# Keep script running and show expo output
echo "📱 Mobile app is starting... QR code should appear below:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Press Ctrl+C to stop all services..."
wait $EXPO_PID 