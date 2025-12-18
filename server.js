/**
 * Ambulance Inventory Finder - Local Server
 * Serves the PWA for local development and testing
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json'
};

const server = http.createServer((req, res) => {
  // Handle root path
  let filePath = req.url === '/' ? '/index.html' : req.url;

  // Security: prevent directory traversal
  filePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');

  const fullPath = path.join(PUBLIC_DIR, filePath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // For SPA routing, serve index.html for unknown paths
        fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (err2, indexData) => {
          if (err2) {
            res.writeHead(500);
            res.end('Server Error');
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(indexData);
        });
        return;
      }
      res.writeHead(500);
      res.end('Server Error');
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║   HARPSWELL NECK FIRE & RESCUE - EQUIPMENT FINDER               ║
╠════════════════════════════════════════════════════════════════╣
║                                                                 ║
║   Server running at: http://localhost:${PORT}                     ║
║                                                                 ║
║   Open this URL in your browser or mobile device                ║
║   (must be on same network for mobile testing)                  ║
║                                                                 ║
║   Features:                                                     ║
║   - Voice search (tap microphone)                               ║
║   - Text search                                                 ║
║   - Quick access buttons for critical items                     ║
║   - Text-to-speech response                                     ║
║   - Works 100% offline after first load                         ║
║                                                                 ║
╚════════════════════════════════════════════════════════════════╝
`);
});
