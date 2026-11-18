import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const port = Number(process.env.PORT) || 8080;
const dist = join(fileURLToPath(new URL('.', import.meta.url)), 'dist');

const mime = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.xml', 'application/xml; charset=utf-8'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.png', 'image/png'],
  ['.webp', 'image/webp'],
  ['.woff2', 'font/woff2'],
]);

function safePath(urlPath) {
  const clean = decodeURIComponent((urlPath.split('?')[0] || '/')).replace(/\\/g, '/');
  const relative = clean === '/' ? 'index.html' : clean.replace(/^\//, '');
  const resolved = normalize(join(dist, relative));
  if (!resolved.startsWith(dist + sep) && resolved !== dist) return null;
  return resolved;
}

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'content-type': type, 'cache-control': 'no-cache' });
  res.end(body);
}

const server = createServer((req, res) => {
  const url = req.url || '/';
  if (url.split('?')[0] === '/health') {
    send(res, 200, JSON.stringify({ status: 'ok' }), 'application/json; charset=utf-8');
    return;
  }

  let path = safePath(url);
  if (!path) {
    send(res, 400, 'Bad request');
    return;
  }

  if (!existsSync(path) && !extname(path)) {
    const withHtml = `${path}.html`;
    if (existsSync(withHtml)) path = withHtml;
  }

  if (existsSync(path) && statSync(path).isDirectory()) {
    path = join(path, 'index.html');
  }

  if (!existsSync(path) || !statSync(path).isFile()) {
    const fallback = join(dist, '404.html');
    if (existsSync(fallback)) {
      res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
      createReadStream(fallback).pipe(res);
      return;
    }
    send(res, 404, 'Not found');
    return;
  }

  const type = mime.get(extname(path).toLowerCase()) || 'application/octet-stream';
  res.writeHead(200, { 'content-type': type });
  createReadStream(path).pipe(res);
});

server.listen(port, () => {
  console.log(`Invoice Pad serving dist/ on port ${port}`);
});
