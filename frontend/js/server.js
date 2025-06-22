const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
};

http.createServer((req, res) => {
    console.log(`Request: ${req.url}`);
    
    // Parse URL
    let filePath = '.' + req.url;
    
    // If URL has no file extension, serve index.html
    if (!path.extname(filePath)) {
        console.log(`Routing ${req.url} to index.html`);
        filePath = './index.html';
    }
    
    const extname = path.extname(filePath);
    const contentType = MIME_TYPES[extname] || 'text/plain';
    
    // Read file
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                console.log(`File not found: ${filePath}, serving index.html instead`);
                // File not found, serve index.html
                fs.readFile('./index.html', (err, content) => {
                    if (err) {
                        res.writeHead(500);
                        res.end('Error loading index.html');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(content, 'utf-8');
                    }
                });
            } else {
                // Server error
                console.error(`Server error: ${error.code}`);
                res.writeHead(500);
                res.end('Server Error: ' + error.code);
            }
        } else {
            // Success
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}).listen(PORT, () => {
    console.log(`Server running at http://127.0.0.1:${PORT}/`);
});