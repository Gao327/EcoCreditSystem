#!/bin/bash

# Step Credit MVP Setup Script
echo "🚀 Setting up Step Credit MVP..."

# Check if required tools are installed
check_requirements() {
    echo "📋 Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        echo "❌ Node.js is required. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ npm is required. Please install npm first."
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        echo "⚠️  Docker not found. You'll need to install MongoDB and Redis manually."
    fi
    
    echo "✅ Requirements check passed!"
}

# Setup backend services
setup_backend() {
    echo "🔧 Setting up backend services..."
    
    cd backend
    
    # Copy environment configuration
    if [ ! -f .env ]; then
        cp config.example.txt .env
        echo "📝 Created .env file. Please update with your configuration."
    fi
    
    # Install main backend dependencies
    echo "📦 Installing backend dependencies..."
    npm install
    
    # Install gateway dependencies
    cd gateway
    npm install
    cd ..
    
    # Install service dependencies
    cd services/step-tracker
    npm install
    cd ../credit-system
    npm install
    cd ../../..
    
    echo "✅ Backend setup complete!"
}

# Setup mobile app
setup_mobile() {
    echo "📱 Setting up mobile app..."
    
    cd mobile-app
    
    # Install mobile app dependencies
    echo "📦 Installing mobile app dependencies..."
    npm install
    
    cd ..
    
    echo "✅ Mobile app setup complete!"
}

# Start databases with Docker
start_databases() {
    if command -v docker &> /dev/null; then
        echo "🗄️  Starting databases with Docker..."
        cd backend
        docker-compose up -d mongodb redis
        echo "✅ Databases started!"
        echo "📊 MongoDB Admin: http://localhost:8081 (admin/admin)"
        cd ..
    else
        echo "⚠️  Please start MongoDB and Redis manually:"
        echo "   MongoDB: mongod --dbpath ./data"
        echo "   Redis: redis-server"
    fi
}

# Create basic directories
create_directories() {
    echo "📁 Creating directories..."
    mkdir -p backend/logs
    mkdir -p backend/uploads
    mkdir -p data
    echo "✅ Directories created!"
}

# Main setup
main() {
    check_requirements
    create_directories
    setup_backend
    setup_mobile
    start_databases
    
    echo ""
    echo "🎉 Setup complete!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Update backend/.env with your configuration"
    echo "2. Start the backend services:"
    echo "   cd backend && npm run start:all"
    echo "3. Start the mobile app:"
    echo "   cd mobile-app && npm start"
    echo ""
    echo "🔗 API Gateway will be available at: http://localhost:3000"
    echo "📊 MongoDB Admin: http://localhost:8081"
    echo ""
    echo "📖 For more information, see the README.md file"
}

# Run setup
main 