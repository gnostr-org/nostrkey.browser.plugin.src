import { generateKeyPair, getPublicKeyFromPrivate } from '../src/utilities/keys.js';
import { nip19 } from 'nostr-crypto-utils';
import { encrypt, decrypt, hashPassword, verifyPassword } from '../src/utilities/crypto.js';
import { seedPhraseToKeyLegacy, keyToSeedPhrase } from '../src/utilities/seedphrase.js';
import { createLibp2pController } from '../src/experimental/libp2p-controller.js';

const TEST_PUBKEY = '0000000000000000000000000000000000000000000000000000000000000001';

function randomHex(byteCount) {
    const bytes = crypto.getRandomValues(new Uint8Array(byteCount));
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

// ---------------------------------------------------------------------------
// Tiny test harness
// ---------------------------------------------------------------------------
const tests = [];

export function test(name, fn) {
    tests.push({ name, fn });
}

function el(id) {
    return document.getElementById(id);
}

function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
}

function renderResult(container, name, ok, error) {
    const row = document.createElement('div');
    row.className = `result ${ok ? 'pass' : 'fail'}`;
    row.textContent = `${ok ? 'PASS' : 'FAIL'} — ${name}`;
    if (error) {
        const detail = document.createElement('pre');
        detail.className = 'error-detail';
        detail.textContent = error.stack || error.message || String(error);
        row.appendChild(detail);
    }
    container.appendChild(row);
}

async function runTests() {
    const container = el('test-results');
    container.innerHTML = '';
    const summary = document.createElement('div');
    summary.className = 'summary';
    container.appendChild(summary);

    let passed = 0;
    let failed = 0;

    for (const { name, fn } of tests) {
        try {
            await fn();
            passed += 1;
            renderResult(container, name, true);
        } catch (error) {
            failed += 1;
            renderResult(container, name, false, error);
        }
    }

    summary.textContent = `${passed} passed, ${failed} failed of ${tests.length}`;
    summary.className = `summary ${failed === 0 ? 'pass' : 'fail'}`;
}

// ---------------------------------------------------------------------------
// Smoke tests
// ---------------------------------------------------------------------------

test('generateKeyPair produces 64-char hex keys and matching pubkey', async () => {
    const { privateKey, publicKey } = await generateKeyPair();
    assert(typeof privateKey === 'string' && privateKey.length === 64, `privateKey length ${privateKey?.length}`);
    assert(/^[0-9a-fA-F]+$/.test(privateKey), 'privateKey is hex');
    assert(typeof publicKey === 'string' && publicKey.length === 64, `publicKey length ${publicKey?.length}`);
    assert(getPublicKeyFromPrivate(privateKey) === publicKey, 'pubkey derived from private key does not match');
});

test('getPublicKeyFromPrivate is consistent', async () => {
    const { privateKey, publicKey } = await generateKeyPair();
    const first = getPublicKeyFromPrivate(privateKey);
    const second = getPublicKeyFromPrivate(privateKey);
    assert(first === publicKey, 'first call mismatch');
    assert(second === publicKey, 'second call mismatch');
    assert(first === second, 'subsequent calls differ');
});

test('nip19 npub encode/decode round-trip', async () => {
    const { publicKey } = await generateKeyPair();
    const npub = nip19.npubEncode(publicKey);
    assert(typeof npub === 'string' && npub.startsWith('npub1'), 'npub format');
    const decoded = nip19.decode(npub);
    assert(decoded.type === 'npub', `decoded type ${decoded.type}`);
    assert(decoded.data === publicKey, 'decoded pubkey mismatch');
});

test('encrypt/decrypt round-trip', async () => {
    const plaintext = 'hello gnostr 🔑';
    const password = 'correct horse battery staple';
    const blob = await encrypt(plaintext, password);
    const recovered = await decrypt(blob, password);
    assert(recovered === plaintext, 'decrypted text mismatch');
});

test('hashPassword/verifyPassword pass for correct password and fail for wrong password', async () => {
    const password = 'a very secret password';
    const wrong = 'not the password';
    const { hash, salt } = await hashPassword(password);
    assert(await verifyPassword(password, hash, salt), 'correct password should verify');
    assert(!(await verifyPassword(wrong, hash, salt)), 'wrong password should not verify');
});

test('seedPhraseToKeyLegacy + keyToSeedPhrase legacy round-trip', async () => {
    const { privateKey } = await generateKeyPair();
    const phrase = keyToSeedPhrase(privateKey);
    assert(typeof phrase === 'string' && phrase.split(/\s+/).length === 24, 'expected 24-word legacy phrase');
    const { hexKey, pubKey } = seedPhraseToKeyLegacy(phrase);
    assert(hexKey === privateKey, 'legacy round-trip private key mismatch');
    assert(pubKey === getPublicKeyFromPrivate(privateKey), 'legacy round-trip pubkey mismatch');
});

test('libp2p controller can start and stop with an ephemeral key', async () => {
    const controller = createLibp2pController({
        storage: makeFakeStorage(),
        getPubKey: async () => TEST_PUBKEY,
        signEvent_: async (unsigned) => ({ ...unsigned, id: 'fake-id', sig: '00'.repeat(64) }),
        sendStatusUpdate: () => {},
        peerSeed: randomHex(32),
    });

    const start = await controller.startNode();
    assert(start.success, `start failed: ${start.error}`);
    const statusAfterStart = controller.getStatus();
    assert(statusAfterStart.ready, 'node not ready after start');
    assert(statusAfterStart.peerId.length > 0, 'no peerId after start');

    const stop = await controller.stopNode();
    assert(stop.success, `stop failed: ${stop.error}`);
    const statusAfterStop = controller.getStatus();
    assert(!statusAfterStop.ready, 'node still ready after stop');
    assert(statusAfterStop.peerId === '', 'peerId not cleared after stop');
});

// ---------------------------------------------------------------------------
// Coverage report rendering
// ---------------------------------------------------------------------------
function renderCoverage() {
    const script = el('coverage-summary');
    const report = el('coverage-report');
    if (!script || !report) return;

    let data;
    try {
        data = JSON.parse(script.textContent);
    } catch (error) {
        report.innerHTML = `<p class="error">Failed to parse coverage JSON: ${error.message}</p>`;
        return;
    }

    if (data.note) {
        report.innerHTML = `<p class="muted">${data.note}</p>`;
        return;
    }

    const metrics = ['statements', 'branches', 'functions', 'lines'];
    const header = ['File', ...metrics.map((m) => m.charAt(0).toUpperCase() + m.slice(1))];

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    for (const h of header) {
        const th = document.createElement('th');
        th.textContent = h;
        headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    function row(label, summary) {
        const tr = document.createElement('tr');
        const tdLabel = document.createElement('td');
        tdLabel.textContent = label;
        tr.appendChild(tdLabel);
        for (const m of metrics) {
            const td = document.createElement('td');
            const pct = summary?.[m]?.pct;
            td.textContent = typeof pct === 'number' ? `${pct.toFixed(1)}%` : '—';
            if (typeof pct === 'number') {
                td.className = pct >= 80 ? 'good' : pct >= 50 ? 'warn' : 'poor';
            }
            tr.appendChild(td);
        }
        return tr;
    }

    if (data.total) {
        tbody.appendChild(row('Total', data.total));
    }

    const files = Object.keys(data)
        .filter((k) => k !== 'total')
        .sort();
    for (const file of files) {
        tbody.appendChild(row(file, data[file]));
    }

    table.appendChild(tbody);
    report.innerHTML = '';
    report.appendChild(table);
}

// ---------------------------------------------------------------------------
// Fake chrome.storage.local API
// ---------------------------------------------------------------------------
function makeFakeStorage() {
    const store = {};
    return {
        get(keys, callback) {
            let defaults = {};
            if (typeof keys === 'string') {
                defaults = { [keys]: undefined };
            } else if (keys && typeof keys === 'object') {
                defaults = { ...keys };
            }
            const result = {};
            for (const key of Object.keys(defaults)) {
                result[key] = key in store ? store[key] : defaults[key];
            }
            const promise = Promise.resolve(result);
            if (typeof callback === 'function') {
                promise.then((r) => callback(r));
            }
            return promise;
        },
        set(items, callback) {
            Object.assign(store, items);
            const promise = Promise.resolve();
            if (typeof callback === 'function') {
                promise.then(() => callback());
            }
            return promise;
        },
        remove(keys, callback) {
            const list = Array.isArray(keys) ? keys : [keys];
            for (const key of list) {
                delete store[key];
            }
            const promise = Promise.resolve();
            if (typeof callback === 'function') {
                promise.then(() => callback());
            }
            return promise;
        },
    };
}

// ---------------------------------------------------------------------------
// P2P mesh lab
// ---------------------------------------------------------------------------
function initMeshLab() {
    const pageId = randomHex(16);
    const peerSeed = randomHex(32);
    const storage = makeFakeStorage();
    const logEl = el('node-log');
    let renderedLogCount = 0;
    const relayAddr = getQueryParam('relay').trim();

    function appendLog(text, kind = 'info') {
        const line = document.createElement('div');
        line.className = `log-line ${kind}`;
        line.textContent = text;
        logEl.appendChild(line);
        logEl.scrollTop = logEl.scrollHeight;
    }

    function log(message, kind = 'info') {
        appendLog(`${new Date().toISOString()} ${message}`, kind);
    }

    const controller = createLibp2pController({
        storage,
        getPubKey: async () => TEST_PUBKEY,
        signEvent_: async (unsigned) => ({
            ...unsigned,
            id: 'fake-id',
            created_at: Math.floor(Date.now() / 1000),
            sig: '00'.repeat(64),
        }),
        sendStatusUpdate: (status) => renderMeshStatus(status),
        peerSeed,
    });

    if (relayAddr) {
        el('configured-relay').textContent = relayAddr;
        el('configured-relay').classList.remove('muted');
        log(`Using relay bootstrap address: ${relayAddr}`);
        void controller.setBootstrapAddrs([relayAddr]);
    }

    let heartbeatInterval = null;
    let presenceInterval = null;
    const instances = new Map();
    let bc = null;

    try {
        bc = new BroadcastChannel('gnostr-test-page');
    } catch (error) {
        log(`BroadcastChannel unavailable: ${error.message}`, 'warn');
    }

    function sendPresence() {
        if (!bc) return;
        const status = controller.getStatus();
        bc.postMessage({
            type: 'presence',
            pageId,
            peerId: status.peerId,
            addrs: status.webrtcAddrs.length ? status.webrtcAddrs : status.listenAddrs,
            timestamp: Date.now(),
        });
    }

    function handlePresence(message) {
        if (message.pageId === pageId) return;
        instances.set(message.pageId, {
            pageId: message.pageId,
            peerId: message.peerId,
            addrs: message.addrs || [],
            lastSeen: message.timestamp,
        });
        renderInstances();
    }

    function renderInstances() {
        const list = el('page-instances');
        list.innerHTML = '';
        const now = Date.now();
        for (const [id, instance] of instances) {
            if (now - instance.lastSeen > 60000) {
                instances.delete(id);
                continue;
            }
            const li = document.createElement('li');
            li.textContent = `${instance.pageId.slice(0, 8)}… peer=${instance.peerId.slice(0, 14)}… addrs=${instance.addrs.length}`;
            list.appendChild(li);
        }
        if (!instances.size) {
            const li = document.createElement('li');
            li.className = 'muted';
            li.textContent = 'No other tabs detected yet';
            list.appendChild(li);
        }
    }

    if (bc) {
        bc.onmessage = (event) => {
            if (event.data?.type === 'presence') {
                handlePresence(event.data);
            }
        };
    }

    function renderMeshStatus(status) {
        el('peer-id').textContent = status.peerId || '—';
        el('listen-addrs').textContent = status.listenAddrs.join('\n') || '—';
        el('connection-count').textContent = String(status.connectionCount);
        el('pubsub-peers').textContent = status.pubsubPeers.join('\n') || '—';

        const messagesEl = el('received-messages');
        messagesEl.innerHTML = '';
        for (const msg of status.pubsubMessages.slice(-20).reverse()) {
            const line = document.createElement('div');
            line.className = 'message-line';
            line.textContent = `[${msg.ts}] ${msg.from} @ ${msg.topic}: ${msg.data}`;
            messagesEl.appendChild(line);
        }

        while (renderedLogCount < status.logs.length) {
            const entry = status.logs[renderedLogCount];
            renderedLogCount += 1;
            appendLog(`[${entry.ts}] ${entry.message}`, entry.kind);
        }

        if (status.ready) {
            sendPresence();
        }
    }

    async function startNode() {
        log('Starting libp2p node…');
        const result = await controller.startNode();
        if (!result.success) {
            log(`Start failed: ${result.error}`, 'error');
            return;
        }
        log(`Node started: ${controller.getStatus().peerId}`);
        const sub = await controller.subscribeTopic('gnostr-test');
        if (!sub.success) {
            log(`Subscribe failed: ${sub.error}`, 'warn');
        } else {
            log('Subscribed to gnostr-test');
        }

        if (heartbeatInterval) clearInterval(heartbeatInterval);
        heartbeatInterval = setInterval(async () => {
            if (!controller.getStatus().ready) return;
            const payload = JSON.stringify({ from: pageId, ts: new Date().toISOString(), text: 'heartbeat' });
            const pub = await controller.publishTopic('gnostr-test', payload);
            if (!pub.success) {
                log(`Heartbeat publish failed: ${pub.error}`, 'warn');
            }
        }, 15000);

        if (presenceInterval) clearInterval(presenceInterval);
        presenceInterval = setInterval(() => {
            renderInstances();
            sendPresence();
        }, 5000);

        sendPresence();
    }

    async function stopNode() {
        if (heartbeatInterval) clearInterval(heartbeatInterval);
        heartbeatInterval = null;
        if (presenceInterval) clearInterval(presenceInterval);
        presenceInterval = null;
        log('Stopping libp2p node…');
        const result = await controller.stopNode();
        if (!result.success) {
            log(`Stop failed: ${result.error}`, 'error');
            return;
        }
        log('Node stopped');
    }

    async function bindIdentity() {
        log('Binding identity…');
        const result = await controller.bindIdentity();
        if (!result.success) {
            log(`Bind failed: ${result.error}`, 'error');
            return;
        }
        const status = controller.getStatus();
        el('attestation-id').textContent = status.attestation?.id || '—';
        el('active-npub').textContent = status.activeNpub || '—';
        log(`Identity bound to ${status.activeNpub}`);
    }

    async function pingAllPeers() {
        log('Pinging all connected peers…');
        const result = await controller.pingAllConnectedPeers();
        if (!result.success) {
            log(`Ping failed: ${result.error}`, 'error');
            return;
        }
        log('Ping round complete');
    }

    async function publishMessage() {
        const input = el('message-input');
        const text = input.value.trim();
        if (!text) return;
        const payload = JSON.stringify({ from: pageId, ts: new Date().toISOString(), text });
        const result = await controller.publishTopic('gnostr-test', payload);
        if (!result.success) {
            log(`Publish failed: ${result.error}`, 'error');
            return;
        }
        input.value = '';
        log(`Published message: ${text}`);
    }

    async function dialOtherInstances() {
        if (!instances.size) {
            log('No other instances to dial', 'warn');
            return;
        }
        for (const instance of instances.values()) {
            const addrs = instance.addrs.length ? instance.addrs : [];
            for (const addr of addrs) {
                log(`Dialling ${addr}…`);
                try {
                    const result = await controller.dialPeer(addr);
                    if (!result.success) {
                        log(`Dial failed for ${addr}: ${result.error}`, 'warn');
                    } else {
                        log(`Dial succeeded for ${addr}`);
                    }
                } catch (error) {
                    log(`Dial exception for ${addr}: ${error.message}`, 'error');
                }
            }
        }
    }

    el('btn-start').addEventListener('click', startNode);
    el('btn-stop').addEventListener('click', stopNode);
    el('btn-bind').addEventListener('click', bindIdentity);
    el('btn-ping').addEventListener('click', pingAllPeers);
    el('btn-publish').addEventListener('click', publishMessage);
    el('btn-dial').addEventListener('click', dialOtherInstances);
    el('message-input').addEventListener('keydown', (event) => {
        if (event.key === 'Enter') publishMessage();
    });

    renderMeshStatus(controller.getStatus());
}

// ---------------------------------------------------------------------------
// Bootstrap the page
// ---------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    renderCoverage();
    runTests();
    initMeshLab();
});
