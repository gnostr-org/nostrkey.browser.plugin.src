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
        ready: false,
        starting: false,
        stopping: false,
        binding: false,
        bootstrapping: false,
        peerId: '',
        peerIdShort: '',
        activePubkey: '',
        activeNpub: '',
        attestation: null,
        relayDescriptor: null,
        defaultBootstrapAddrs: [],
        discoveryBootstrapAddrs: [],
        bootstrapAddrs: [],
        listenAddrs: [],
        webrtcAddrs: [],
        connectionCount: 0,
        pubsubPeers: [],
        subscribedTopics: [],
        pubsubMessages: [],
        lastDialTarget: '',
        lastDialPeer: '',
        lastPingLatency: '',
        lastBindError: '',
        lastBootstrapError: '',
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

function shortValue(value, head = 10, tail = 8) {
    if (!value) return '';
    if (value.length <= head + tail + 3) return value;
    return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

function applyStatusUpdate(status) {
    if (!status || typeof status !== 'object') return;
    state.libp2p = { ...state.libp2p, ...status };
    renderLibp2p();
}

async function sendLibp2pMessage(kind, payload) {
    try {
        const response = await api.runtime.sendMessage({ kind, payload });
        if (response?.status) {
            applyStatusUpdate(response.status);
        }
        return response;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        state.libp2p.lastError = message;
        renderLibp2p();
        return { success: false, error: message };
    }
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
        bootstrapping,
        peerId,
        peerIdShort,
        activePubkey,
        activeNpub,
        attestation,
        listenAddrs,
        defaultBootstrapAddrs,
        bootstrapAddrs,
        connectionCount,
        lastDialTarget,
        lastDialPeer,
        lastPingLatency,
        lastBindError,
        lastBootstrapError,
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

    const webrtcAddrsEl = $('libp2p-webrtc-addrs');
    if (webrtcAddrsEl) {
        webrtcAddrsEl.textContent = state.libp2p.webrtcAddrs.length
            ? state.libp2p.webrtcAddrs.join('\n')
            : 'No WebRTC listen addresses yet (requires a relay reservation).';
    }

    const defaultBootstrapEl = $('libp2p-default-bootstrap');
    if (defaultBootstrapEl) {
        defaultBootstrapEl.textContent = defaultBootstrapAddrs.length
            ? defaultBootstrapAddrs.join('\n')
            : 'No default WSS bootstrap relays configured.';
    }

    const discoveryBootstrapEl = $('libp2p-discovery-bootstrap');
    if (discoveryBootstrapEl) {
        discoveryBootstrapEl.textContent = state.libp2p.discoveryBootstrapAddrs.length
            ? state.libp2p.discoveryBootstrapAddrs.join('\n')
            : 'No canonical libp2p bootstrap relays configured.';
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

    const bootstrapErrorEl = $('libp2p-bootstrap-error');
    if (bootstrapErrorEl) {
        bootstrapErrorEl.textContent = lastBootstrapError || '';
        bootstrapErrorEl.classList.toggle('hidden', !lastBootstrapError);
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

    const bootstrapBtn = $('libp2p-bootstrap-btn');
    if (bootstrapBtn) {
        bootstrapBtn.disabled = !ready || starting || stopping || bootstrapping;
    }

    const bootstrapInput = $('libp2p-bootstrap-input');
    if (bootstrapInput) {
        const nextValue = bootstrapAddrs.join('\n');
        if (document.activeElement !== bootstrapInput && bootstrapInput.value !== nextValue) {
            bootstrapInput.value = nextValue;
        }
        bootstrapInput.disabled = !ready || starting || stopping;
    }

    const pubsubPeersEl = $('libp2p-pubsub-peers');
    if (pubsubPeersEl) {
        pubsubPeersEl.textContent = state.libp2p.pubsubPeers.length
            ? state.libp2p.pubsubPeers.join('\n')
            : 'No pubsub peers yet.';
    }

    const subscribedTopicsEl = $('libp2p-subscribed-topics');
    if (subscribedTopicsEl) {
        subscribedTopicsEl.textContent = state.libp2p.subscribedTopics.length
            ? state.libp2p.subscribedTopics.join('\n')
            : 'Not subscribed to any topics.';
    }

    const pubsubMessagesEl = $('libp2p-pubsub-messages');
    if (pubsubMessagesEl) {
        pubsubMessagesEl.innerHTML = state.libp2p.pubsubMessages.length
            ? state.libp2p.pubsubMessages.map((entry) => `
                <div class="libp2p-log-line">
                    <span class="libp2p-log-ts">${escapeHtml(entry.ts)}</span>
                    <span class="libp2p-log-msg">[${escapeHtml(entry.topic)}] ${escapeHtml(entry.from)}: ${escapeHtml(entry.data)}</span>
                </div>
            `).join('')
            : '<div class="libp2p-log-empty">No pubsub messages yet.</div>';
    }

    const pubsubErrorEl = $('libp2p-pubsub-error');
    if (pubsubErrorEl) {
        pubsubErrorEl.textContent = state.libp2p.lastPubsubError || '';
        pubsubErrorEl.classList.toggle('hidden', !state.libp2p.lastPubsubError);
    }

    const subscribeBtn = $('libp2p-subscribe-btn');
    if (subscribeBtn) {
        subscribeBtn.disabled = !ready || starting || stopping;
    }

    const unsubscribeBtn = $('libp2p-unsubscribe-btn');
    if (unsubscribeBtn) {
        unsubscribeBtn.disabled = !ready || starting || stopping;
    }

    const publishBtn = $('libp2p-publish-btn');
    if (publishBtn) {
        publishBtn.disabled = !ready || starting || stopping;
    }

    const topicInput = $('libp2p-topic-input');
    if (topicInput) {
        topicInput.disabled = !ready || starting || stopping;
    }

    const publishInput = $('libp2p-publish-input');
    if (publishInput) {
        publishInput.disabled = !ready || starting || stopping;
    }
}

async function startLibp2pNode() {
    await sendLibp2pMessage('libp2p.start');
}

async function stopLibp2pNode() {
    await sendLibp2pMessage('libp2p.stop');
}

async function dialLibp2pPeer() {
    const peerInput = $('libp2p-peer-input');
    const target = peerInput?.value.trim();
    if (!target) {
        state.libp2p.lastError = 'Enter a libp2p multiaddr first.';
        renderLibp2p();
        return;
    }
    await sendLibp2pMessage('libp2p.dial', target);
}

async function bootstrapLibp2pNode() {
    const input = $('libp2p-bootstrap-input');
    const raw = input?.value || '';
    const addrs = raw
        .split(/\r?\n|,/)
        .map((addr) => addr.trim())
        .filter(Boolean);

    if (!addrs.length) {
        state.libp2p.lastBootstrapError = 'Add at least one bootstrap multiaddr.';
        renderLibp2p();
        return;
    }

    await sendLibp2pMessage('libp2p.bootstrap', addrs);
}

async function bindLibp2pIdentity() {
    await sendLibp2pMessage('libp2p.bindIdentity');
}

async function clearLibp2pBinding() {
    await sendLibp2pMessage('libp2p.clearBinding');
}

async function copyLibp2pBinding() {
    const payload = state.libp2p.attestation;
    if (!payload) return;
    const text = JSON.stringify(payload, null, 2);
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
    }
    await api.runtime.sendMessage({ kind: 'copy', payload: text });
}

async function copyRelayDescriptor() {
    const descriptor = state.libp2p.relayDescriptor;
    if (!descriptor) return;
    const text = JSON.stringify(descriptor, null, 2);
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
    }
    await api.runtime.sendMessage({ kind: 'copy', payload: text });
}

async function subscribePubsubTopic() {
    const input = $('libp2p-topic-input');
    const topic = input?.value.trim();
    if (!topic) {
        state.libp2p.lastPubsubError = 'Enter a topic first.';
        renderLibp2p();
        return;
    }
    await sendLibp2pMessage('libp2p.subscribeTopic', topic);
}

async function unsubscribePubsubTopic() {
    const input = $('libp2p-topic-input');
    const topic = input?.value.trim();
    if (!topic) {
        state.libp2p.lastPubsubError = 'Enter a topic first.';
        renderLibp2p();
        return;
    }
    await sendLibp2pMessage('libp2p.unsubscribeTopic', topic);
}

async function publishPubsubMessage() {
    const topicInput = $('libp2p-topic-input');
    const publishInput = $('libp2p-publish-input');
    const topic = topicInput?.value.trim();
    const data = publishInput?.value || '';
    if (!topic) {
        state.libp2p.lastPubsubError = 'Enter a topic first.';
        renderLibp2p();
        return;
    }
    await sendLibp2pMessage('libp2p.publishTopic', { topic, data });
}

function handleRuntimeMessage(message) {
    if (message?.kind === 'libp2p.statusUpdate') {
        applyStatusUpdate(message.payload);
    }
}

async function init() {
    api.runtime.onMessage.addListener(handleRuntimeMessage);

    await reloadFeatures();
    const statusResponse = await sendLibp2pMessage('libp2p.status');
    if (statusResponse?.status) {
        applyStatusUpdate(statusResponse.status);
    }

    $('libp2p-start-btn')?.addEventListener('click', async () => {
        await startLibp2pNode();
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

    $('libp2p-bootstrap-btn')?.addEventListener('click', async () => {
        await bootstrapLibp2pNode();
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

    $('libp2p-subscribe-btn')?.addEventListener('click', async () => {
        await subscribePubsubTopic();
    });

    $('libp2p-unsubscribe-btn')?.addEventListener('click', async () => {
        await unsubscribePubsubTopic();
    });

    $('libp2p-publish-btn')?.addEventListener('click', async () => {
        await publishPubsubMessage();
    });

    $('libp2p-publish-input')?.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            await publishPubsubMessage();
        }
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
