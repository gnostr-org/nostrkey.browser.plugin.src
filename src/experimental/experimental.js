import { api } from '../utilities/browser-polyfill';

const FEATURES = [
    [
        'none',
        'NIP-XX: None',
        'Reserved for the future use.',
    ],
];

const $ = (id) => document.getElementById(id);

const state = {
    features: [],
    libp2p: {
        node: null,
        ready: false,
        starting: false,
        stopping: false,
        peerId: '',
        listenAddrs: [],
        connectionCount: 0,
        lastDialTarget: '',
        lastDialPeer: '',
        lastPingLatency: '',
        lastError: '',
        logs: [],
    },
};

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function pushLibp2pLog(message, kind = 'info') {
    const ts = new Date().toISOString();
    state.libp2p.logs = [
        ...state.libp2p.logs,
        { ts, kind, message },
    ].slice(-12);
    renderLibp2p();
}

function renderFeatures() {
    const container = $('features-container');
    if (!container) return;

    container.innerHTML = state.features.map(([name, active, shortDesc, longDesc]) => `
        <div class="mt-4">
            <input
                class="checkbox"
                type="checkbox"
                id="${name}"
                ${active ? 'checked' : ''}
                data-feature="${name}"
            />
            <label for="${name}" class="font-bold">${shortDesc}</label>
            <p class="italic">${longDesc}</p>
        </div>
    `).join('');

    container.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
        cb.addEventListener('change', async (e) => {
            const feature = e.target.dataset.feature;
            const active = e.target.checked;
            await api.storage.local.set({ [feature]: active });
            await reloadFeatures();
        });
    });
}

async function reloadFeatures() {
    state.features = await Promise.all(
        FEATURES.map(async ([name, shortDesc, longDesc]) => {
            const key = `feature:${name}`;
            const stored = await api.storage.local.get({ [key]: false });
            return [key, stored[key], shortDesc, longDesc];
        })
    );
    renderFeatures();
}

function renderLibp2p() {
    const {
        ready,
        starting,
        stopping,
        peerId,
        listenAddrs,
        connectionCount,
        lastDialTarget,
        lastDialPeer,
        lastPingLatency,
        lastError,
        logs,
    } = state.libp2p;

    const statusEl = $('libp2p-status');
    if (statusEl) {
        statusEl.textContent = ready
            ? 'Ready'
            : starting
                ? 'Starting…'
                : stopping
                    ? 'Stopping…'
                    : 'Stopped';
    }

    const peerIdEl = $('libp2p-peer-id');
    if (peerIdEl) {
        peerIdEl.textContent = peerId || 'Not started';
    }

    const listenAddrsEl = $('libp2p-listen-addrs');
    if (listenAddrsEl) {
        listenAddrsEl.textContent = listenAddrs.length ? listenAddrs.join('\n') : 'No advertised listen addresses in this browser node.';
    }

    const connectionCountEl = $('libp2p-connection-count');
    if (connectionCountEl) {
        connectionCountEl.textContent = String(connectionCount);
    }

    const lastDialTargetEl = $('libp2p-last-dial-target');
    if (lastDialTargetEl) {
        lastDialTargetEl.textContent = lastDialTarget || '—';
    }

    const lastDialPeerEl = $('libp2p-last-dial-peer');
    if (lastDialPeerEl) {
        lastDialPeerEl.textContent = lastDialPeer || '—';
    }

    const lastPingEl = $('libp2p-last-ping');
    if (lastPingEl) {
        lastPingEl.textContent = lastPingLatency || '—';
    }

    const errorEl = $('libp2p-error');
    if (errorEl) {
        errorEl.textContent = lastError || '';
        errorEl.classList.toggle('hidden', !lastError);
    }

    const logEl = $('libp2p-log');
    if (logEl) {
        logEl.innerHTML = logs.length
            ? logs.map(({ ts, kind, message }) => `
                <div class="libp2p-log-line libp2p-log-line--${kind}">
                    <span class="libp2p-log-ts">${escapeHtml(ts)}</span>
                    <span class="libp2p-log-msg">${escapeHtml(message)}</span>
                </div>
            `).join('')
            : '<div class="libp2p-log-empty">No activity yet.</div>';
    }

    const startBtn = $('libp2p-start-btn');
    if (startBtn) {
        startBtn.disabled = ready || starting || stopping;
    }

    const stopBtn = $('libp2p-stop-btn');
    if (stopBtn) {
        stopBtn.disabled = !ready || stopping;
    }

    const dialBtn = $('libp2p-dial-btn');
    if (dialBtn) {
        dialBtn.disabled = !ready || starting || stopping;
    }

    const peerInput = $('libp2p-peer-input');
    if (peerInput) {
        peerInput.disabled = !ready || starting || stopping;
    }
}

async function loadLibp2pModules() {
    const [
        libp2pModule,
        websocketsModule,
        noiseModule,
        yamuxModule,
        pingModule,
    ] = await Promise.all([
        import('libp2p'),
        import('@libp2p/websockets'),
        import('@chainsafe/libp2p-noise'),
        import('@libp2p/yamux'),
        import('@libp2p/ping'),
    ]);

    return {
        createLibp2p: libp2pModule.createLibp2p,
        webSockets: websocketsModule.webSockets,
        noise: noiseModule.noise,
        yamux: yamuxModule.yamux,
        ping: pingModule.ping,
    };
}

async function ensureLibp2pNode() {
    if (state.libp2p.node) return state.libp2p.node;

    state.libp2p.starting = true;
    state.libp2p.lastError = '';
    renderLibp2p();

    try {
        const {
            createLibp2p,
            webSockets,
            noise,
            yamux,
            ping,
        } = await loadLibp2pModules();

        const node = await createLibp2p({
            addresses: {
                listen: [],
            },
            transports: [webSockets()],
            connectionEncryption: [noise()],
            streamMuxers: [yamux()],
            services: {
                ping: ping(),
            },
        });

        await node.start();

        state.libp2p.node = node;
        state.libp2p.ready = true;
        state.libp2p.peerId = node.peerId?.toString?.() || String(node.peerId || '');
        state.libp2p.listenAddrs = node.getMultiaddrs().map((addr) => addr.toString());
        state.libp2p.connectionCount = node.getConnections().length;
        state.libp2p.lastError = '';
        pushLibp2pLog(`Node started with peer ID ${state.libp2p.peerId}`);
        renderLibp2p();
        return node;
    } catch (error) {
        state.libp2p.ready = false;
        state.libp2p.node = null;
        state.libp2p.peerId = '';
        state.libp2p.listenAddrs = [];
        state.libp2p.connectionCount = 0;
        state.libp2p.lastError = error instanceof Error ? error.message : String(error);
        pushLibp2pLog(`Start failed: ${state.libp2p.lastError}`, 'error');
        renderLibp2p();
        throw error;
    } finally {
        state.libp2p.starting = false;
        renderLibp2p();
    }
}

async function stopLibp2pNode() {
    if (!state.libp2p.node) return;

    state.libp2p.stopping = true;
    renderLibp2p();

    const node = state.libp2p.node;
    state.libp2p.node = null;
    try {
        await node.stop();
        pushLibp2pLog('Node stopped.');
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        state.libp2p.lastError = message;
        pushLibp2pLog(`Stop failed: ${message}`, 'error');
    } finally {
        state.libp2p.ready = false;
        state.libp2p.peerId = '';
        state.libp2p.listenAddrs = [];
        state.libp2p.connectionCount = 0;
        state.libp2p.lastDialTarget = '';
        state.libp2p.lastDialPeer = '';
        state.libp2p.lastPingLatency = '';
        state.libp2p.stopping = false;
        renderLibp2p();
    }
}

async function dialLibp2pPeer() {
    const peerInput = $('libp2p-peer-input');
    const target = peerInput?.value.trim();
    if (!target) {
        state.libp2p.lastError = 'Enter a libp2p multiaddr first.';
        renderLibp2p();
        return;
    }

    const node = await ensureLibp2pNode();
    state.libp2p.lastDialTarget = target;
    state.libp2p.lastError = '';
    renderLibp2p();

    try {
        pushLibp2pLog(`Dialing ${target}`);
        const connection = await node.dial(target);
        const remotePeer = connection?.remotePeer?.toString?.() || String(connection?.remotePeer || '');
        state.libp2p.lastDialPeer = remotePeer || target;
        state.libp2p.connectionCount = node.getConnections().length;
        pushLibp2pLog(`Connected to ${state.libp2p.lastDialPeer}`);

        if (node.services?.ping?.ping && connection?.remotePeer) {
            const pingStart = performance.now();
            let observed = false;
            for await (const _latency of node.services.ping.ping(connection.remotePeer)) {
                const latency = Math.max(0, Math.round(performance.now() - pingStart));
                state.libp2p.lastPingLatency = `${latency} ms`;
                pushLibp2pLog(`Ping returned in ${state.libp2p.lastPingLatency}`);
                observed = true;
                break;
            }
            if (!observed) {
                state.libp2p.lastPingLatency = 'No ping result';
                pushLibp2pLog('Ping completed without a readable latency.', 'warn');
            }
        } else {
            state.libp2p.lastPingLatency = 'Ping service unavailable';
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        state.libp2p.lastError = message;
        state.libp2p.lastDialPeer = '';
        state.libp2p.lastPingLatency = '';
        pushLibp2pLog(`Dial failed: ${message}`, 'error');
    } finally {
        state.libp2p.connectionCount = state.libp2p.node?.getConnections().length || 0;
        renderLibp2p();
    }
}

function renderLibp2pSection() {
    const statusMount = $('libp2p-status');
    if (statusMount) {
        renderLibp2p();
    }
}

async function init() {
    await reloadFeatures();
    renderLibp2pSection();

    $('libp2p-start-btn')?.addEventListener('click', async () => {
        try {
            await ensureLibp2pNode();
        } catch (_) {}
    });

    $('libp2p-stop-btn')?.addEventListener('click', async () => {
        await stopLibp2pNode();
    });

    $('libp2p-dial-btn')?.addEventListener('click', async () => {
        await dialLibp2pPeer();
    });

    $('libp2p-peer-input')?.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            await dialLibp2pPeer();
        }
    });
}

document.addEventListener('DOMContentLoaded', init);

document.getElementById('close-btn')?.addEventListener('click', () => {
    window.close();
});

window.addEventListener('beforeunload', () => {
    if (state.libp2p.node) {
        void state.libp2p.node.stop();
    }
});
