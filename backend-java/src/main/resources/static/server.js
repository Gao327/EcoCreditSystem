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
