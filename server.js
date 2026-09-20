const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC_DIR = __dirname;

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.json': 'application/json'
};

const server = http.createServer((req, res) => {
  // POST Endpoint to save survey responses
  if (req.method === 'POST' && req.url === '/api/survey-response') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const responseData = JSON.parse(body);
        const record = {
          timestamp: new Date().toISOString(),
          answers: responseData
        };
        const responsesFile = path.join(PUBLIC_DIR, 'responses.json');
        let existing = [];
        if (fs.existsSync(responsesFile)) {
          try {
            existing = JSON.parse(fs.readFileSync(responsesFile, 'utf8'));
          } catch(e) {}
        }
        existing.push(record);
        fs.writeFileSync(responsesFile, JSON.stringify(existing, null, 2));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'success', message: 'Response saved to server' }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', message: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url);
  let ext = path.extname(filePath);

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Survey server running at http://localhost:${PORT}/`);
  console.log(`Survey responses will be automatically stored in 'responses.json'`);
});
