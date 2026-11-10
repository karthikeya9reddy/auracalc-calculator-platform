import { createServer } from 'node:http';
import { access, realpath, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const servingBuild = process.argv[2] === 'dist';
const staticRoot = resolve(projectRoot, 'dist');
const webRoot = servingBuild ? staticRoot : resolve(projectRoot, 'web');
const listenPort = Number.parseInt(process.env.AURACALC_PORT || process.env.NEXORA_PORT || '4173', 10);
const listenHost = process.env.AURACALC_HOST || process.env.NEXORA_HOST || '127.0.0.1';
const mimeTypes = new Map([
  ['.html', 'text/html; charset=utf-8'], ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'], ['.mjs', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'], ['.webmanifest', 'application/manifest+json; charset=utf-8'],
  ['.svg', 'image/svg+xml'], ['.txt', 'text/plain; charset=utf-8'], ['.xml', 'application/xml; charset=utf-8'],
]);

async function chooseFile(pathname) {
  let decoded;
  try { decoded = decodeURIComponent(pathname); } catch { return null; }
  if (decoded.includes('\0') || decoded.includes('\\') || decoded.split('/').includes('..')) return null;
  let allowedRoot = webRoot;
  let relativePath = decoded.replace(/^\/+/, '');
  if (!servingBuild && (relativePath.startsWith('src/') || relativePath.startsWith('catalog/'))) {
    allowedRoot = projectRoot;
  } else if (!servingBuild && relativePath.startsWith('prototype/')) {
    allowedRoot = projectRoot;
  }
  if (!relativePath) relativePath = 'index.html';
  let target = resolve(allowedRoot, relativePath);
  if (target !== allowedRoot && !target.startsWith(`${allowedRoot}${sep}`)) return null;
  try {
    let info = await stat(target);
    if (info.isDirectory()) {
      target = resolve(target, 'index.html');
      info = await stat(target);
    }
    if (!info.isFile()) return null;
    const real = await realpath(target);
    const realRoot = await realpath(allowedRoot);
    if (real !== realRoot && !real.startsWith(`${realRoot}${sep}`)) return null;
    await access(real);
    return real;
  } catch { return null; }
}

const server = createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method || '')) {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end('Method not allowed');
    return;
  }
  const url = new URL(request.url || '/', 'http://localhost');
  const file = await chooseFile(url.pathname);
  if (!file) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
    return;
  }
  const extension = extname(file).toLowerCase();
  response.writeHead(200, {
    'Content-Type': mimeTypes.get(extension) || 'application/octet-stream',
    'Cache-Control': servingBuild ? 'public, max-age=300' : 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  });
  if (request.method === 'HEAD') response.end();
  else {
    const { createReadStream } = await import('node:fs');
    createReadStream(file).pipe(response);
  }
});

server.listen(listenPort, listenHost, () => {
  console.log(`AuraCalc ${servingBuild ? 'build preview' : 'local site'} running at http://${listenHost}:${listenPort}`);
  console.log('Press Ctrl+C to stop this local server.');
});
