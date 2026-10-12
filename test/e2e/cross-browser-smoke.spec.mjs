/**
 * Cross-browser smoke test for the built-in self-test page.
 *
 * Serves the repo root over HTTP, opens /test/test.html in Chromium, Firefox,
 * and WebKit, and asserts the built-in smoke tests all pass. This validates
 * that the bundled test page works across browser engines without loading an
 * extension.
 */

import { test, expect } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// The self-test page does not need an extension, so it can run headless.
test.use({ headless: process.env.CROSS_BROWSER_SMOKE_HEADLESS !== 'false' });

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function startServer() {
  return new Promise((res, rej) => {
    const server = createServer(async (req, response) => {
      try {
        const urlPath = decodeURIComponent(req.url.split('?')[0]);
        const filePath = resolve(ROOT, urlPath.replace(/^\//, ''));
        if (!filePath.startsWith(ROOT)) {
          response.writeHead(403);
          response.end('Forbidden');
          return;
        }
        const body = await readFile(filePath);
        const contentType = MIME[extname(filePath)] || 'application/octet-stream';
        response.writeHead(200, { 'Content-Type': contentType });
        response.end(body);
      } catch (error) {
        response.writeHead(404);
        response.end('Not found');
      }
    });

    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      res({ server, baseUrl: `http://127.0.0.1:${port}` });
    });

    server.on('error', rej);
  });
}

test('self-test page passes all smoke tests', async ({ page }) => {
  test.setTimeout(120000);
  const { server, baseUrl } = await startServer();

  try {
    page.on('console', (msg) => console.log(`[browser:${msg.type()}] ${msg.text()}`));
    page.on('pageerror', (err) => console.error(`[browser:error] ${err.message}`));
    await page.goto(`${baseUrl}/test/test.html?relay=`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => {
      const el = document.querySelector('#test-results .summary');
      return el && /(passed|failed)/.test(el.textContent || '');
    });

    const summary = await page.textContent('#test-results .summary');
    expect(summary).toMatch(/0 failed/);
    expect(summary).not.toMatch(/[1-9]\d* failed/);
  } finally {
    server.close();
  }
});
