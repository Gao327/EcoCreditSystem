#!/bin/bash

# EcoCredit Full Stack Starter Script
echo "🌱 EcoCredit Full Stack Starter"
echo "================================"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
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

# Start backend
echo ""
echo "🚀 Starting EcoCredit Backend..."
./scripts/manage-backend.sh restart

# Wait for backend to be ready
echo "⏳ Waiting for backend to be fully ready..."
sleep 3

# Test backend health
for i in {1..10}; do
    if curl -s http://localhost:8080/api/health > /dev/null; then
        echo "✅ Backend is ready and healthy!"
        break
    fi
    echo "⏳ Backend starting... ($i/10)"
    sleep 2
done

# Start mobile app
echo ""
echo "📱 Starting Mobile App..."
echo "🔧 Installing mobile app dependencies if needed..."

cd mobile-app
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🎯 Starting Expo development server..."
echo "📱 You can scan the QR code with Expo Go app or press:"
echo "   - 'i' for iOS Simulator"
echo "   - 'a' for Android Emulator"
echo "   - 'w' for web browser"
echo ""

# Start expo in the background initially, then bring to foreground
npx expo start --clear &
EXPO_PID=$!

cd ..

echo ""
echo "🎉 EcoCredit Full Stack is starting up!"
echo ""
echo "📊 Backend Health Check: http://localhost:8080/api/health"
echo "📱 Mobile App: Will open in Expo"
echo "🌐 Web Interface: http://localhost:8080"
echo ""
echo "💡 Tips:"
echo "   - Kill backend: ./scripts/manage-backend.sh stop"
echo "   - Check backend status: ./scripts/manage-backend.sh status"
echo "   - Mobile app will auto-reload on changes"
echo ""
echo "Press Ctrl+C to stop all services"

# Bring expo to foreground
wait $EXPO_PID 