#!/bin/bash

# EcoCredit Web App Server Script
PORT=8081
WEB_DIR="backend-java/src/main/resources/static"

echo "🌐 Starting EcoCredit Web App Server..."
echo "📍 Port: $PORT"
echo "📁 Directory: $WEB_DIR"

# Check if the directory exists
if [ ! -d "$WEB_DIR" ]; then
    echo "❌ Web directory not found: $WEB_DIR"
    exit 1
fi

# Check if app-with-auth.html exists
if [ ! -f "$WEB_DIR/app-with-auth.html" ]; then
    echo "❌ Web app file not found: $WEB_DIR/app-with-auth.html"
    exit 1
fi

# Kill any existing process on port 8081
echo "🔍 Checking for existing processes on port $PORT..."
PID=$(lsof -ti:$PORT)
if [ ! -z "$PID" ]; then
    echo "💀 Killing existing process $PID on port $PORT..."
    kill -9 $PID
    sleep 1
fi

# Check if Node.js is available for a simple server
if command -v node >/dev/null 2>&1; then
    echo "🚀 Starting Node.js server..."
    cd "$WEB_DIR"
    
    # Create a simple server script
    cat > server.js << 'EOF'
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8081;

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    let pathname = url.parse(req.url).pathname;
    
    // Default to app-with-auth.html for root
    if (pathname === '/') {
        pathname = '/app-with-auth.html';
    }
    
    const filePath = path.join(__dirname, pathname);
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, {'Content-Type': 'text/html'});
            res.end('<h1>404 - File Not Found</h1>');
            return;
        }
        
        const ext = path.extname(filePath);
        const contentType = mimeTypes[ext] || 'text/plain';
        
        res.writeHead(200, {'Content-Type': contentType});
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`🌐 EcoCredit Web App running on http://localhost:${PORT}`);
    console.log(`📱 Direct access: http://localhost:${PORT}/app-with-auth.html`);
});
EOF
    
    # Start the server
    node server.js &
    SERVER_PID=$!
    
    echo "🎉 Web App Server started!"
    echo "📍 URL: http://localhost:$PORT"
    echo "📱 Direct link: http://localhost:$PORT/app-with-auth.html"
    echo "🔧 Process ID: $SERVER_PID"
    
    # Go back to original directory
    cd - > /dev/null
    
else
    # Fallback to Python if Node.js is not available
    echo "🐍 Node.js not found, trying Python..."
    
    if command -v python3 >/dev/null 2>&1; then
        echo "🚀 Starting Python HTTP server..."
        cd "$WEB_DIR"
        python3 -m http.server $PORT &
        SERVER_PID=$!
        echo "🎉 Web App Server started with Python!"
        echo "📍 URL: http://localhost:$PORT"
        echo "📱 Direct link: http://localhost:$PORT/app-with-auth.html"
        cd - > /dev/null
    else
        echo "❌ Neither Node.js nor Python3 found. Please install one of them."
        exit 1
    fi
fi 