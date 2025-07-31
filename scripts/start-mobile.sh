#!/bin/bash

# EcoCredit Mobile App Starter Script
echo "📱 EcoCredit Mobile App Starter"
echo "==============================="

# Check if we're in the right directory
if [ ! -d "mobile-app" ]; then
    echo "❌ mobile-app directory not found. Please run from project root."
    exit 1
fi

# Check if npm is available
if ! command -v npm >/dev/null 2>&1; then
    echo "❌ npm not found. Please install Node.js and npm."
    exit 1
fi

# Check if npx is available
if ! command -v npx >/dev/null 2>&1; then
    echo "❌ npx not found. Please install Node.js and npm."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Change to mobile app directory
cd mobile-app

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

echo ""
echo "🎯 Starting Expo development server..."
echo "📱 Scan the QR code below with Expo Go app on your phone"
echo "⌨️  Or press:"
echo "   - 'i' for iOS Simulator"
echo "   - 'a' for Android Emulator"
echo "   - 'w' for web browser"
echo "   - 'r' to reload"
echo "   - 'm' for more options"
echo ""
echo "🔗 Make sure the backend is running:"
echo "   - Backend API: http://localhost:8080/api/health"
echo "   - If not running: ./scripts/manage-backend.sh restart"
echo ""

# Start Expo on specific port to avoid conflicts
npx expo start --clear --port 8082

echo ""
echo "📱 Mobile app development server stopped" 