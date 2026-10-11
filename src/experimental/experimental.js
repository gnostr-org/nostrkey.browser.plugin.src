import { api } from '../utilities/browser-polyfill';
import { nip19 } from 'nostr-crypto-utils';

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
        binding: false,
        peerId: '',
        peerIdShort: '',
        activePubkey: '',
        activeNpub: '',
        attestation: null,
        relayDescriptor: null,
        listenAddrs: [],
        connectionCount: 0,
        lastDialTarget: '',
        lastDialPeer: '',
        lastPingLatency: '',
        lastBindError: '',
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

function shortValue(value, head = 10, tail = 8) {
    if (!value) return '';
    if (value.length <= head + tail + 3) return value;
    return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

function rebuildRelayDescriptor() {
    if (!state.libp2p.attestation || !state.libp2p.activePubkey || !state.libp2p.peerId) return;
    state.libp2p.relayDescriptor = {
        title: 'NostrKey libp2p relay experiment',
        npub: state.libp2p.activeNpub || nip19.npubEncode(state.libp2p.activePubkey),
        pubkey: state.libp2p.activePubkey,
        peerId: state.libp2p.peerId,
        peerIdShort: state.libp2p.peerIdShort,
        listenAddrs: state.libp2p.listenAddrs,
        attestationId: state.libp2p.attestation.id,
        attestationKind: state.libp2p.attestation.kind,
        createdAt: new Date().toISOString(),
    };
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
        binding,
        peerId,
        peerIdShort,
        activePubkey,
        activeNpub,
        attestation,
        listenAddrs,
        connectionCount,
        lastDialTarget,
        lastDialPeer,
        lastPingLatency,
        lastBindError,
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
        peerIdEl.textContent = peerIdShort || peerId || 'Not started';
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

    const bindErrorEl = $('libp2p-bind-error');
    if (bindErrorEl) {
        bindErrorEl.textContent = lastBindError || '';
        bindErrorEl.classList.toggle('hidden', !lastBindError);
    }

    const activePubkeyEl = $('libp2p-active-pubkey');
    if (activePubkeyEl) {
        activePubkeyEl.textContent = activePubkey ? shortValue(activePubkey, 16, 12) : 'Not bound';
    }

    const activeNpubEl = $('libp2p-active-npub');
    if (activeNpubEl) {
        activeNpubEl.textContent = activeNpub || 'Not bound';
    }

    const attestationEl = $('libp2p-attestation');
    if (attestationEl) {
        attestationEl.textContent = attestation ? JSON.stringify(attestation, null, 2) : 'No attestation yet.';
    }

    const relayDescriptorEl = $('libp2p-relay-descriptor');
    if (relayDescriptorEl) {
        relayDescriptorEl.textContent = state.libp2p.relayDescriptor
            ? JSON.stringify(state.libp2p.relayDescriptor, null, 2)
            : 'No relay descriptor yet.';
    }

    const bindStateEl = $('libp2p-bind-state');
    if (bindStateEl) {
        bindStateEl.textContent = binding
            ? 'Binding…'
            : attestation
                ? 'Attested'
                : 'Unbound';
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

    const bindBtn = $('libp2p-bind-btn');
    if (bindBtn) {
        bindBtn.disabled = !ready || starting || stopping || binding;
    }

    const copyBindBtn = $('libp2p-copy-bind-btn');
    if (copyBindBtn) {
        copyBindBtn.disabled = !attestation;
    }

    const clearBindBtn = $('libp2p-clear-bind-btn');
    if (clearBindBtn) {
        clearBindBtn.disabled = !attestation && !activePubkey && !activeNpub;
    }

    const copyRelayBtn = $('libp2p-copy-relay-btn');
    if (copyRelayBtn) {
        copyRelayBtn.disabled = !state.libp2p.relayDescriptor;
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
        state.libp2p.peerIdShort = shortValue(state.libp2p.peerId, 14, 10);
        state.libp2p.listenAddrs = node.getMultiaddrs().map((addr) => addr.toString());
        state.libp2p.connectionCount = node.getConnections().length;
        rebuildRelayDescriptor();
        state.libp2p.lastError = '';
        pushLibp2pLog(`Node started with peer ID ${state.libp2p.peerId}`);
        renderLibp2p();
        return node;
    } catch (error) {
        state.libp2p.ready = false;
        state.libp2p.node = null;
        state.libp2p.peerId = '';
        state.libp2p.peerIdShort = '';
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

async function loadSavedLibp2pBinding() {
    try {
        const stored = await api.storage.local.get({
            'experimental:libp2p-binding': null,
        });
        const saved = stored['experimental:libp2p-binding'];
        if (!saved || typeof saved !== 'object') return;

        state.libp2p.attestation = saved.attestation || null;
        state.libp2p.activePubkey = saved.activePubkey || '';
        state.libp2p.activeNpub = saved.activeNpub || '';
        if (saved.peerId) {
            state.libp2p.peerId = saved.peerId;
            state.libp2p.peerIdShort = shortValue(saved.peerId, 14, 10);
        }
        if (saved.attestation?.binding?.peerId && !state.libp2p.peerId) {
            state.libp2p.peerId = saved.attestation.binding.peerId;
            state.libp2p.peerIdShort = shortValue(saved.attestation.binding.peerId, 14, 10);
        }
        state.libp2p.relayDescriptor = saved.relayDescriptor || (
            state.libp2p.attestation && state.libp2p.activePubkey && state.libp2p.peerId
                ? {
                    title: 'NostrKey libp2p relay experiment',
                    npub: state.libp2p.activeNpub || nip19.npubEncode(state.libp2p.activePubkey),
                    pubkey: state.libp2p.activePubkey,
                    peerId: state.libp2p.peerId,
                    peerIdShort: state.libp2p.peerIdShort,
                    listenAddrs: state.libp2p.attestation.binding?.listenAddrs || [],
                    attestationId: state.libp2p.attestation.id,
                    attestationKind: state.libp2p.attestation.kind,
                    createdAt: state.libp2p.attestation.created_at ? new Date(state.libp2p.attestation.created_at * 1000).toISOString() : new Date().toISOString(),
                }
                : null
        );
        renderLibp2p();
    } catch (error) {
        console.warn('Failed to restore libp2p binding:', error);
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
        state.libp2p.peerIdShort = '';
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

async function bindLibp2pIdentity() {
    await ensureLibp2pNode();
    state.libp2p.binding = true;
    state.libp2p.lastBindError = '';
    renderLibp2p();

    try {
        const rawPubkey = await api.runtime.sendMessage({ kind: 'getPubKey' });
        if (typeof rawPubkey !== 'string' || !rawPubkey) {
            throw new Error('Unable to read the active Nostr pubkey.');
        }

        const npub = nip19.npubEncode(rawPubkey);
        const payload = {
            peerId: state.libp2p.peerId,
            listenAddrs: state.libp2p.listenAddrs,
            protocol: 'nostrkey-libp2p-experiment',
            createdAt: new Date().toISOString(),
            note: 'Nostr-authenticated libp2p node binding',
        };

        const unsigned = {
            kind: 31337,
            created_at: Math.floor(Date.now() / 1000),
            tags: [
                ['d', 'libp2p-binding'],
                ['peer', state.libp2p.peerId],
                ...state.libp2p.listenAddrs.map((addr) => ['relay', addr]),
            ],
            content: JSON.stringify(payload),
            pubkey: rawPubkey,
        };

        pushLibp2pLog(`Requesting a Nostr signature from ${npub}`);
        const attestation = await api.runtime.sendMessage({ kind: 'signEvent', payload: unsigned });
        if (!attestation || typeof attestation !== 'object') {
            throw new Error('No attestation returned from the signer.');
        }

        state.libp2p.activePubkey = rawPubkey;
        state.libp2p.activeNpub = npub;
        state.libp2p.attestation = {
            ...attestation,
            binding: payload,
        };
        rebuildRelayDescriptor();

        await api.storage.local.set({
            'experimental:libp2p-binding': {
                attestation: state.libp2p.attestation,
                activePubkey: state.libp2p.activePubkey,
                activeNpub: state.libp2p.activeNpub,
                relayDescriptor: state.libp2p.relayDescriptor,
                peerId: state.libp2p.peerId,
            },
        });

        pushLibp2pLog(`Bound ${npub} to peer ${state.libp2p.peerId}`);
        pushLibp2pLog(`Attestation signed as event ${attestation.id}`);
        renderLibp2p();
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        state.libp2p.lastBindError = message;
        pushLibp2pLog(`Bind failed: ${message}`, 'error');
        renderLibp2p();
        throw error;
    } finally {
        state.libp2p.binding = false;
        renderLibp2p();
    }
}

async function copyLibp2pBinding() {
    const payload = state.libp2p.attestation;
    if (!payload) return;
    const text = JSON.stringify(payload, null, 2);
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        pushLibp2pLog('Attestation copied to clipboard.');
        return;
    }
    await api.runtime.sendMessage({ kind: 'copy', payload: text });
    pushLibp2pLog('Attestation copied via extension clipboard helper.');
}

async function copyRelayDescriptor() {
    const descriptor = state.libp2p.relayDescriptor;
    if (!descriptor) return;
    const text = JSON.stringify(descriptor, null, 2);
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        pushLibp2pLog('Relay descriptor copied to clipboard.');
        return;
    }
    await api.runtime.sendMessage({ kind: 'copy', payload: text });
    pushLibp2pLog('Relay descriptor copied via extension clipboard helper.');
}

async function clearLibp2pBinding() {
    state.libp2p.attestation = null;
    state.libp2p.activePubkey = '';
    state.libp2p.activeNpub = '';
    state.libp2p.relayDescriptor = null;
    state.libp2p.lastBindError = '';
    await api.storage.local.remove('experimental:libp2p-binding');
    pushLibp2pLog('Cleared libp2p binding.');
    renderLibp2p();
}

function renderLibp2pSection() {
    const statusMount = $('libp2p-status');
    if (statusMount) {
        renderLibp2p();
    }
}

async function init() {
    await reloadFeatures();
    await loadSavedLibp2pBinding();
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

    $('libp2p-bind-btn')?.addEventListener('click', async () => {
        await bindLibp2pIdentity();
    });

    $('libp2p-copy-bind-btn')?.addEventListener('click', async () => {
        await copyLibp2pBinding();
    });

    $('libp2p-copy-relay-btn')?.addEventListener('click', async () => {
        await copyRelayDescriptor();
    });

    $('libp2p-clear-bind-btn')?.addEventListener('click', async () => {
        await clearLibp2pBinding();
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
