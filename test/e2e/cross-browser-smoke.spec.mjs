/**
 * Cross-browser live consensus smoke test.
 *
 * Starts a local P2P relay daemon, then opens test/test.html in Chromium,
 * Firefox, and WebKit with the relay address. Each browser runs the built-in
 * smoke tests, starts a libp2p node, and publishes a test-report over pubsub.
 * The spec waits until the consensus table shows all three browsers and all
 * tests have passed.
 */

import { test, expect, chromium, firefox, webkit } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { mkdtemp, writeFile, readFile as readFileSync } from 'node:fs/promises';
import { resolve, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';

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
      } catch {
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

async function waitForFile(path, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const text = await readFileSync(path, 'utf8');
      const data = JSON.parse(text);
      if (data.peerId && Array.isArray(data.addresses) && data.addresses.length) {
        return data;
      }
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`Timed out waiting for relay info at ${path}`);
}

async function startRelayDaemon() {
  const tmpDir = await mkdtemp(resolve(tmpdir(), 'gnostr-relay-'));
  const outputPath = resolve(tmpDir, 'p2p-relay.json');
  const wsPort = 19090 + Math.floor(Math.random() * 1000);
  const httpPort = 20090 + Math.floor(Math.random() * 1000);

  const proc = spawn(
    process.execPath,
    ['scripts/p2p-relay-daemon.js', '--ws-port', String(wsPort), '--http-port', String(httpPort), '--output', outputPath, '--announce', '127.0.0.1', '--topic', 'gnostr-test'],
    { cwd: ROOT, stdio: 'pipe' }
  );

  proc.stdout.on('data', (data) => console.log(`[relay] ${data.toString().trim()}`));
  proc.stderr.on('data', (data) => console.error(`[relay] ${data.toString().trim()}`));

  const info = await waitForFile(outputPath, 20000);
  const wsAddr = info.addresses.find((a) => a.includes('/ws/p2p/'));
  const directAddr = info.addresses.find((a) => a.includes('/webrtc-direct/') && a.includes('/ip4/127.0.0.1/'));
  const relayAddr = directAddr || wsAddr;
  if (!relayAddr) {
    throw new Error('Relay daemon did not advertise a usable browser address');
  }
  if (!info.httpUrl) {
    throw new Error('Relay daemon did not advertise an HTTP report hub URL');
  }

  return { proc, relayAddr, httpUrl: info.httpUrl, wsAddr, outputPath };
}

function stopRelay(proc) {
  return new Promise((resolve) => {
    if (!proc || proc.killed) return resolve();
    proc.on('exit', () => resolve());
    proc.kill('SIGINT');
    setTimeout(() => {
      try { proc.kill('SIGTERM'); } catch {}
      resolve();
    }, 5000);
  });
}

async function runBrowser(browserType, browserName, baseUrl, relayAddrs, httpUrl) {
  const browser = await browserType.launch({ headless: process.env.CROSS_BROWSER_SMOKE_HEADLESS !== 'false' });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', (msg) => console.log(`[${browserName}:${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => console.error(`[${browserName}:error] ${err.message}`));

  const params = relayAddrs.map((addr) => `relay=${encodeURIComponent(addr)}`);
  if (httpUrl) {
    params.push(`relayHttp=${encodeURIComponent(httpUrl)}`);
  }
  const url = `${baseUrl}/test/test.html?${params.join('&')}`;
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // Local smoke tests must all pass.
  await page.waitForFunction(() => {
    const el = document.querySelector('#test-results .summary');
    return el && /(passed|failed)/.test(el.textContent || '');
  }, { timeout: 60000 });

  const summary = await page.textContent('#test-results .summary');
  expect(summary, `${browserName} local smoke tests`).toMatch(/0 failed/);
  expect(summary, `${browserName} local smoke tests`).not.toMatch(/[1-9]\d* failed/);

  // Give the node a moment to start and log.
  await page.waitForTimeout(3000);
  const nodeLog = await page.locator('#node-log').innerText().catch(() => '(no node log)');
  const consensus = await page.locator('#consensus-report').innerText().catch(() => '(no consensus)');
  console.log(`[${browserName}:node-log]\n${nodeLog.slice(-1000)}`);
  console.log(`[${browserName}:consensus]\n${consensus.slice(-1000)}`);

  return { browser, context, page };
}

async function waitForConsensus(pages, timeoutMs = 90000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const states = await Promise.all(
      pages.map(async (page, i) => {
        try {
          return await page.textContent('#consensus-report .summary');
        } catch {
          return '';
        }
      })
    );
    const allReady = states.every((s) => /Consensus: 3 node/.test(s) && /all tests passed/.test(s));
    if (allReady) return states;
    await new Promise((r) => setTimeout(r, 1000));
  }
  console.log('Final consensus states:');
  for (const [i, page] of pages.entries()) {
    const state = await page.textContent('#consensus-report .summary').catch(() => '(missing)');
    const html = await page.locator('#consensus-report').innerHTML().catch(() => '');
    console.log(`  page ${i}: ${state}`);
    console.log(`  page ${i} html: ${html.slice(-500)}`);
  }
  throw new Error('Consensus did not converge to 3 nodes with all tests passed');
}

test('live P2P consensus across Chromium, Firefox, and WebKit', async () => {
  test.setTimeout(180000);

  const { server, baseUrl } = await startServer();
  const relay = await startRelayDaemon();
  const handles = [];

  try {
    const bootstrapAddrs = [relay.relayAddr];
    if (relay.wsAddr && relay.wsAddr !== relay.relayAddr) {
      bootstrapAddrs.push(relay.wsAddr);
    }
    console.log(`relay bootstrap addresses: ${bootstrapAddrs.join(', ')}`);
    console.log(`relay HTTP hub: ${relay.httpUrl}`);

    handles.push(await runBrowser(chromium, 'chromium', baseUrl, bootstrapAddrs, relay.httpUrl));
    handles.push(await runBrowser(firefox, 'firefox', baseUrl, bootstrapAddrs, relay.httpUrl));
    handles.push(await runBrowser(webkit, 'webkit', baseUrl, bootstrapAddrs, relay.httpUrl));

    const pages = handles.map((h) => h.page);
    const consensus = await waitForConsensus(pages);

    for (const state of consensus) {
      expect(state).toMatch(/Consensus: 3 node/);
      expect(state).toMatch(/all tests passed/);
    }
  } finally {
    for (const { browser } of handles) {
      try { await browser.close(); } catch {}
    }
    await stopRelay(relay.proc);
    server.close();
  }
});
