#!/usr/bin/env node

/**
 * Simple demo server with live reload and esbuild watch.
 * Run with: npm run demo
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { context } from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 5330;
const ROOT_DIR = path.resolve(__dirname, '..');
const DEMO_DIR = path.join(ROOT_DIR, 'demo');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml'
};

const clients = new Set();
let reloadTimer = null;

function broadcastReload() {
  for (const res of clients) {
    res.write('data: reload\n\n');
  }
}

function scheduleReload() {
  if (reloadTimer) {
    clearTimeout(reloadTimer);
  }
  reloadTimer = setTimeout(broadcastReload, 50);
}

const reloadSnippet = `<script>
(() => {
  const source = new EventSource('/__livereload');
  source.onmessage = () => window.location.reload();
})();
</script>`;

function injectReload(html) {
  if (html.includes('/__livereload')) {
    return html;
  }
  if (html.includes('</body>')) {
    return html.replace('</body>', `${reloadSnippet}</body>`);
  }
  return `${html}${reloadSnippet}`;
}

function watchDir(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }
  try {
    fs.watch(dir, { recursive: false }, () => {
      scheduleReload();
    });
  } catch (error) {
    console.error(`Failed to watch ${dir}:`, error);
  }
}

async function start() {
  let buildContext;
  try {
    let hasBuiltOnce = false;
    buildContext = await context({
      entryPoints: [path.join(ROOT_DIR, 'src/index.ts')],
      bundle: true,
      format: 'esm',
      platform: 'browser',
      target: 'es2020',
      outfile: path.join(ROOT_DIR, 'dist/index.js'),
      inject: [path.join(ROOT_DIR, 'scripts/buffer-shim.js')],
      plugins: [
        {
          name: 'reload-on-rebuild',
          setup(build) {
            build.onEnd((result) => {
              if (result.errors.length > 0) {
                console.error('esbuild rebuild failed:', result.errors);
                return;
              }
              if (hasBuiltOnce) {
                scheduleReload();
              }
              hasBuiltOnce = true;
            });
          }
        }
      ]
    });
    await buildContext.rebuild();
    await buildContext.watch();
  } catch (error) {
    console.error('esbuild build failed:', error);
    process.exit(1);
  }

  watchDir(DEMO_DIR);
  watchDir(DIST_DIR);

  const server = http.createServer((req, res) => {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    if (url.pathname === '/__livereload') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });
      res.write('\n');
      clients.add(res);
      req.on('close', () => {
        clients.delete(res);
      });
      return;
    }

    // Serve demo assets at the site root while keeping dist under /dist.
    let requestPath;
    if (url.pathname === '/') {
      requestPath = path.join('demo', 'index.html');
    } else if (url.pathname.startsWith('/dist/')) {
      requestPath = path.join('dist', url.pathname.replace(/^\/dist\/+/, ''));
    } else {
      requestPath = path.join('demo', url.pathname.replace(/^\/+/, ''));
    }
    const filePath = path.resolve(ROOT_DIR, requestPath);

    // Security: prevent directory traversal
    if (!filePath.startsWith(`${ROOT_DIR}${path.sep}`) && filePath !== ROOT_DIR) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          res.writeHead(404);
          res.end('Not Found');
        } else {
          res.writeHead(500);
          res.end('Internal Server Error');
        }
        return;
      }

      const ext = path.extname(filePath);
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      let body = content;

      if (ext === '.html' && filePath.startsWith(DEMO_DIR)) {
        body = Buffer.from(injectReload(content.toString()));
      }

      res.writeHead(200, { 'Content-Type': contentType });
      res.end(body);
    });
  });

  server.listen(PORT, () => {
    console.log(`🎉 PassSeeds demo running at http://localhost:${PORT}`);
    console.log('🔁 Live reload enabled for demo/ and dist/');
    console.log('\nPress Ctrl+C to stop the server\n');
  });

  const shutdown = () => {
    buildContext?.dispose?.();
    server.close(() => process.exit(0));
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start();
