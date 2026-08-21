// Simple static HTTP server for the Playwright suite.
// Serves the built Angular app `www` with an SPA fallback to index.html on 8210,
// and the static www-mock reference on 8211.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
};

function createServer(root, spa) {
  return http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    let filePath = path.join(root, url === '/' ? 'index.html' : url);
    try {
      let stat = fs.existsSync(filePath) ? fs.statSync(filePath) : null;
      if (!stat || !stat.isFile()) {
        if (!spa) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('not found');
          return;
        }
        filePath = path.join(root, 'index.html');
        stat = fs.statSync(filePath);
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(String(err));
    }
  });
}

const app = createServer(process.argv[2], true);
const mock = createServer(process.argv[3], false);
app.listen(8210, '127.0.0.1', () => console.log('www app serving on http://127.0.0.1:8210'));
mock.listen(8211, '127.0.0.1', () => console.log('www-mock serving on http://127.0.0.1:8211'));
