import { nip19 } from 'nostr-crypto-utils';
import { multiaddr } from '@multiformats/multiaddr';

const BINDING_STORAGE_KEY = 'experimental:libp2p-binding';
const BOOTSTRAP_STORAGE_KEY = 'experimental:libp2p-bootstrap';
const LOG_LIMIT = 64;

// Canonical libp2p bootstrap peers (from a local `ipfs bootstrap list`).
// These are handed to @libp2p/bootstrap for peer discovery; dnsaddr entries
// are resolved by libp2p and the connection manager dials whichever resolved
// transports the browser supports (WSS in this extension's case).
const DEFAULT_LIBP2P_BOOTSTRAP = [
    '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
    '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
    '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
    '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt',
    '/dnsaddr/va1.bootstrap.libp2p.io/p2p/12D3KooWKnDdG3iXw9eTFijk3EWSunZcFi54Zka4wmtqtt6rPxc8',
    '/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ',
    '/ip4/104.131.131.82/udp/4001/quic-v1/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ',
];

// Browser-safe WSS endpoints for the same canonical bootstrap peers. These
// are used for the explicit fast-path dial loop because raw TCP/QUIC and
// unresolved dnsaddr addresses cannot be dialled directly in a browser
// extension context.
const DEFAULT_WSS_BOOTSTRAP = [
    '/dns4/lith-1.bootstrap.ipni.io/tcp/4443/wss/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
    '/dns4/chic-1.bootstrap.ipni.io/tcp/4443/wss/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
    '/dns4/sing-1.bootstrap.ipni.io/tcp/4443/wss/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt',
    '/dns4/chic-1-b.bootstrap.ipni.io/tcp/4453/wss/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
];

function isBrowserDialable(addr) {
    return typeof addr === 'string' && (addr.includes('/wss/') || addr.includes('/ws/'));
}

const DOH_ENDPOINTS = [
    'https://cloudflare-dns.com/dns-query',
    'https://dns.quad9.net:5053/dns-query',
    'https://dns.adguard-dns.com/resolve',
];
const DNSADDR_MAX_DEPTH = 2;

async function resolveTxtDoH(name) {
    const errors = [];
    for (const endpoint of DOH_ENDPOINTS) {
        try {
            const url = new URL(endpoint);
            url.searchParams.set('name', name);
            url.searchParams.set('type', 'TXT');
            const response = await fetch(url.toString(), {
                headers: { Accept: 'application/dns-json' },
            });
            if (!response.ok) {
                throw new Error(`${endpoint} returned ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            if (data.Status !== 0) {
                throw new Error(`${endpoint} returned DNS status ${data.Status}`);
            }
            return (data.Answer || []).map((record) => record.data.replace(/^"|"$/g, ''));
        } catch (error) {
            errors.push(error instanceof Error ? error.message : String(error));
        }
    }
    throw new Error(`All DoH endpoints failed: ${errors.join('; ')}`);
}

function extractDnsaddrValues(records) {
    return records
        .map((record) => record.replace(/^"|"$/g, ''))
        .filter((record) => record.startsWith('dnsaddr='))
        .map((record) => record.slice('dnsaddr='.length));
}

function dnsaddrHostFromMultiaddr(addr) {
    const match = addr.match(/^\/dnsaddr\/([^/]+)/);
    return match ? match[1] : null;
}

async function resolveDnsaddrRecursive(name, depth = DNSADDR_MAX_DEPTH) {
    if (depth <= 0) return [];
    const records = await resolveTxtDoH(name);
    const addrs = extractDnsaddrValues(records);
    const results = [];
    for (const addr of addrs) {
        if (isBrowserDialable(addr)) {
            results.push(addr);
            continue;
        }
        const host = dnsaddrHostFromMultiaddr(addr);
        if (host) {
            const nested = await resolveDnsaddrRecursive(`_dnsaddr.${host}`, depth - 1);
            results.push(...nested);
        }
    }
    return results;
}

async function resolveBootstrapWssAddrs() {
    try {
        return await resolveDnsaddrRecursive('_dnsaddr.bootstrap.libp2p.io');
    } catch (error) {
        return [];
    }
}

function shortValue(value, head = 10, tail = 8) {
    if (!value) return '';
    if (value.length <= head + tail + 3) return value;
    return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

export function createLibp2pController({ api, storage, getPubKey, signEvent_, sendStatusUpdate }) {
    const state = {
        node: null,
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
        defaultBootstrapAddrs: [...DEFAULT_WSS_BOOTSTRAP],
        bootstrapAddrs: [],
        listenAddrs: [],
        connectionCount: 0,
        lastDialTarget: '',
        lastDialPeer: '',
        lastPingLatency: '',
        lastBindError: '',
        lastBootstrapError: '',
        lastError: '',
        logs: [],
    };

    let libp2pModules = null;

    function pushLog(message, kind = 'info') {
        const ts = new Date().toISOString();
        state.logs = [...state.logs, { ts, kind, message }].slice(-LOG_LIMIT);
        broadcastStatus();
    }

    function broadcastStatus() {
        try {
            sendStatusUpdate(getStatus());
        } catch (_) {
            // Broadcast is best-effort; callers also receive explicit responses.
        }
    }

    function updateStatus(updates) {
        Object.assign(state, updates);
        broadcastStatus();
    }

    async function loadLibp2pModules() {
        if (libp2pModules) return libp2pModules;
        const [
            libp2pModule,
            websocketsModule,
            noiseModule,
            yamuxModule,
            pingModule,
            circuitRelayModule,
            identifyModule,
            bootstrapModule,
        ] = await Promise.all([
            import('libp2p'),
            import('@libp2p/websockets'),
            import('@chainsafe/libp2p-noise'),
            import('@libp2p/yamux'),
            import('@libp2p/ping'),
            import('@libp2p/circuit-relay-v2'),
            import('@libp2p/identify'),
            import('@libp2p/bootstrap'),
        ]);
        libp2pModules = {
            createLibp2p: libp2pModule.createLibp2p,
            webSockets: websocketsModule.webSockets,
            noise: noiseModule.noise,
            yamux: yamuxModule.yamux,
            ping: pingModule.ping,
            circuitRelayTransport: circuitRelayModule.circuitRelayTransport,
            identify: identifyModule.identify,
            bootstrap: bootstrapModule.bootstrap,
        };
        return libp2pModules;
    }

    function rebuildRelayDescriptor() {
        if (!state.attestation || !state.activePubkey || !state.peerId) {
            state.relayDescriptor = null;
            return;
        }
        state.relayDescriptor = {
            title: 'NostrKey libp2p relay experiment',
            npub: state.activeNpub || nip19.npubEncode(state.activePubkey),
            pubkey: state.activePubkey,
            peerId: state.peerId,
            peerIdShort: state.peerIdShort,
            listenAddrs: state.listenAddrs,
            attestationId: state.attestation.id,
            attestationKind: state.attestation.kind,
            createdAt: new Date().toISOString(),
        };
    }

    function attachNodeListeners(node) {
        node.addEventListener('peer:connect', (event) => {
            const remotePeer = event.detail?.toString?.() || String(event.detail || '');
            state.connectionCount = node.getConnections().length;
            pushLog(`Peer connected: ${remotePeer}`);
        });
        node.addEventListener('peer:disconnect', (event) => {
            const remotePeer = event.detail?.toString?.() || String(event.detail || '');
            state.connectionCount = node.getConnections().length;
            pushLog(`Peer disconnected: ${remotePeer}`);
        });
    }

    async function startNode() {
        if (state.node) return { success: true, status: getStatus() };
        if (state.starting) return { success: true, status: getStatus() };

        updateStatus({ starting: true, lastError: '' });

        try {
            const { createLibp2p, webSockets, noise, yamux, ping, circuitRelayTransport, identify, bootstrap } = await loadLibp2pModules();
            const node = await createLibp2p({
                addresses: { listen: [] },
                transports: [webSockets(), circuitRelayTransport()],
                connectionEncryption: [noise()],
                streamMuxers: [yamux()],
                services: {
                    ping: ping(),
                    identify: identify(),
                },
                peerDiscovery: [
                    bootstrap({
                        list: DEFAULT_LIBP2P_BOOTSTRAP,
                        timeout: 0,
                        tagTTL: Infinity,
                    }),
                ],
            });

            await node.start();
            attachNodeListeners(node);

            const peerId = node.peerId?.toString?.() || String(node.peerId || '');
            state.node = node;
            state.ready = true;
            state.peerId = peerId;
            state.peerIdShort = shortValue(peerId, 14, 10);
            state.listenAddrs = node.getMultiaddrs().map((addr) => addr.toString());
            state.connectionCount = node.getConnections().length;
            state.lastError = '';
            rebuildRelayDescriptor();
            pushLog(`Node started with peer ID ${peerId}`);

            const resolvedWss = await resolveBootstrapWssAddrs();
            if (resolvedWss.length) {
                pushLog(`Resolved ${resolvedWss.length} WSS bootstrap endpoint(s) via DoH`);
            }
            const autoDialAddrs = [
                ...resolvedWss,
                ...state.defaultBootstrapAddrs,
                ...state.bootstrapAddrs,
            ];
            if (autoDialAddrs.length) {
                pushLog(`Auto-dialing ${autoDialAddrs.length} bootstrap address(es)`);
                await dialBootstrapAddrs(autoDialAddrs);
            }

            updateStatus({ starting: false });
            return { success: true, status: getStatus() };
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            state.node = null;
            state.ready = false;
            state.peerId = '';
            state.peerIdShort = '';
            state.listenAddrs = [];
            state.connectionCount = 0;
            state.lastError = message;
            pushLog(`Start failed: ${message}`, 'error');
            updateStatus({ starting: false });
            return { success: false, error: message, status: getStatus() };
        }
    }

    async function stopNode() {
        if (!state.node) return { success: true, status: getStatus() };
        if (state.stopping) return { success: true, status: getStatus() };

        updateStatus({ stopping: true });
        const node = state.node;
        state.node = null;

        try {
            await node.stop();
            pushLog('Node stopped.');
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            state.lastError = message;
            pushLog(`Stop failed: ${message}`, 'error');
        } finally {
            updateStatus({
                ready: false,
                stopping: false,
                peerId: '',
                peerIdShort: '',
                listenAddrs: [],
                connectionCount: 0,
                lastDialTarget: '',
                lastDialPeer: '',
                lastPingLatency: '',
            });
        }
        return { success: true, status: getStatus() };
    }

    async function dialPeer(target) {
        if (!target || typeof target !== 'string') {
            return { success: false, error: 'Enter a libp2p multiaddr first.', status: getStatus() };
        }

        const startResult = await startNode();
        if (!startResult.success) return startResult;
        const node = state.node;
        if (!node) {
            return { success: false, error: 'Node not available.', status: getStatus() };
        }

        state.lastDialTarget = target;
        state.lastError = '';
        updateStatus({});

        try {
            pushLog(`Dialing ${target}`);
            const connection = await node.dial(multiaddr(target));
            const remotePeer = connection?.remotePeer?.toString?.() || String(connection?.remotePeer || '');
            state.lastDialPeer = remotePeer || target;
            state.connectionCount = node.getConnections().length;
            pushLog(`Connected to ${state.lastDialPeer}`);

            if (node.services?.ping?.ping && connection?.remotePeer) {
                const pingStart = performance.now();
                let observed = false;
                for await (const _ of node.services.ping.ping(connection.remotePeer)) {
                    const latency = Math.max(0, Math.round(performance.now() - pingStart));
                    state.lastPingLatency = `${latency} ms`;
                    pushLog(`Ping returned in ${state.lastPingLatency}`);
                    observed = true;
                    break;
                }
                if (!observed) {
                    state.lastPingLatency = 'No ping result';
                    pushLog('Ping completed without a readable latency.', 'warn');
                }
            } else {
                state.lastPingLatency = 'Ping service unavailable';
            }

            updateStatus({});
            return { success: true, status: getStatus() };
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            state.lastError = message;
            state.lastDialPeer = '';
            state.lastPingLatency = '';
            pushLog(`Dial failed: ${message}`, 'error');
            updateStatus({});
            return { success: false, error: message, status: getStatus() };
        } finally {
            state.connectionCount = state.node?.getConnections().length || 0;
            updateStatus({});
        }
    }

    async function dialBootstrapAddrs(addrs) {
        if (!Array.isArray(addrs) || !addrs.length) return { success: false, error: 'No bootstrap addresses.' };
        const node = state.node;
        if (!node) return { success: false, error: 'Node not started.' };

        const dialable = addrs.filter((addr) => {
            if (isBrowserDialable(addr)) return true;
            pushLog(`Skipping non-browser bootstrap address: ${addr}`, 'warn');
            return false;
        });

        if (!dialable.length) {
            return { success: false, error: 'No browser-compatible (WS/WSS) bootstrap addresses.', status: getStatus() };
        }

        for (const addr of dialable) {
            pushLog(`Bootstrapping to ${addr}`);
            try {
                await node.dial(multiaddr(addr));
                const connections = node.getConnections();
                const lastConnection = connections.length ? connections[connections.length - 1] : null;
                state.lastDialTarget = addr;
                state.lastDialPeer = lastConnection?.remotePeer?.toString?.() || addr;
                state.connectionCount = connections.length;
                pushLog(`Bootstrap connected: ${state.lastDialPeer}`);
                return { success: true, status: getStatus() };
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                pushLog(`Bootstrap dial failed for ${addr}: ${message}`, 'warn');
            }
        }
        return { success: false, error: `Failed to dial all ${dialable.length} browser-compatible bootstrap address(es).`, status: getStatus() };
    }

    async function setBootstrapAddrs(addrs) {
        const list = Array.isArray(addrs)
            ? addrs.filter((a) => typeof a === 'string' && a.trim())
            : [];
        if (!list.length) {
            return { success: false, error: 'Add at least one bootstrap multiaddr.', status: getStatus() };
        }

        state.bootstrapAddrs = list;
        state.lastBootstrapError = '';
        await storage.set({ [BOOTSTRAP_STORAGE_KEY]: list });
        pushLog(`Bootstrap list saved (${list.length} address(es))`);

        const startResult = await startNode();
        if (!startResult.success) return startResult;

        updateStatus({ bootstrapping: true });
        try {
            const result = await dialBootstrapAddrs(list);
            return result;
        } finally {
            updateStatus({ bootstrapping: false });
        }
    }

    async function bindIdentity() {
        const startResult = await startNode();
        if (!startResult.success) return startResult;

        updateStatus({ binding: true, lastBindError: '' });

        try {
            const rawPubkey = await getPubKey();
            if (typeof rawPubkey !== 'string' || !rawPubkey) {
                throw new Error('Unable to read the active Nostr pubkey.');
            }

            const npub = nip19.npubEncode(rawPubkey);
            const payload = {
                peerId: state.peerId,
                listenAddrs: state.listenAddrs,
                protocol: 'nostrkey-libp2p-experiment',
                createdAt: new Date().toISOString(),
                note: 'Nostr-authenticated libp2p node binding',
            };

            const unsigned = {
                kind: 31337,
                created_at: Math.floor(Date.now() / 1000),
                tags: [
                    ['d', 'libp2p-binding'],
                    ['peer', state.peerId],
                    ...state.listenAddrs.map((addr) => ['relay', addr]),
                ],
                content: JSON.stringify(payload),
                pubkey: rawPubkey,
            };

            pushLog(`Signing attestation for ${npub}`);
            const attestation = await signEvent_(unsigned, 'libp2p-attestation');
            if (!attestation || typeof attestation !== 'object') {
                throw new Error('No attestation returned from the signer.');
            }

            state.activePubkey = rawPubkey;
            state.activeNpub = npub;
            state.attestation = { ...attestation, binding: payload };
            rebuildRelayDescriptor();

            await storage.set({
                [BINDING_STORAGE_KEY]: {
                    attestation: state.attestation,
                    activePubkey: state.activePubkey,
                    activeNpub: state.activeNpub,
                    relayDescriptor: state.relayDescriptor,
                    peerId: state.peerId,
                },
            });

            pushLog(`Bound ${npub} to peer ${state.peerId}`);
            pushLog(`Attestation signed as event ${attestation.id}`);
            updateStatus({ binding: false });
            return { success: true, status: getStatus() };
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            state.lastBindError = message;
            pushLog(`Bind failed: ${message}`, 'error');
            updateStatus({ binding: false });
            return { success: false, error: message, status: getStatus() };
        }
    }

    async function clearBinding() {
        state.attestation = null;
        state.activePubkey = '';
        state.activeNpub = '';
        state.relayDescriptor = null;
        state.lastBindError = '';
        await storage.remove(BINDING_STORAGE_KEY);
        pushLog('Cleared libp2p binding.');
        updateStatus({});
        return { success: true, status: getStatus() };
    }

    async function loadSavedState() {
        try {
            const stored = await storage.get({
                [BINDING_STORAGE_KEY]: null,
                [BOOTSTRAP_STORAGE_KEY]: [],
            });

            const binding = stored[BINDING_STORAGE_KEY];
            if (binding && typeof binding === 'object') {
                state.attestation = binding.attestation || null;
                state.activePubkey = binding.activePubkey || '';
                state.activeNpub = binding.activeNpub || '';
                if (binding.peerId) {
                    state.peerId = binding.peerId;
                    state.peerIdShort = shortValue(binding.peerId, 14, 10);
                }
                if (binding.attestation?.binding?.peerId && !state.peerId) {
                    state.peerId = binding.attestation.binding.peerId;
                    state.peerIdShort = shortValue(binding.attestation.binding.peerId, 14, 10);
                }
                state.relayDescriptor = binding.relayDescriptor || (
                    state.attestation && state.activePubkey && state.peerId
                        ? {
                            title: 'NostrKey libp2p relay experiment',
                            npub: state.activeNpub || nip19.npubEncode(state.activePubkey),
                            pubkey: state.activePubkey,
                            peerId: state.peerId,
                            peerIdShort: state.peerIdShort,
                            listenAddrs: state.attestation.binding?.listenAddrs || [],
                            attestationId: state.attestation.id,
                            attestationKind: state.attestation.kind,
                            createdAt: state.attestation.created_at
                                ? new Date(state.attestation.created_at * 1000).toISOString()
                                : new Date().toISOString(),
                        }
                        : null
                );
                pushLog('Restored libp2p binding from storage.');
            }

            state.defaultBootstrapAddrs = [...DEFAULT_WSS_BOOTSTRAP];
            const bootstrap = stored[BOOTSTRAP_STORAGE_KEY];
            state.bootstrapAddrs = Array.isArray(bootstrap)
                ? bootstrap.filter((addr) => typeof addr === 'string' && addr.trim())
                : [];
            if (state.bootstrapAddrs.length) {
                pushLog(`Restored ${state.bootstrapAddrs.length} custom bootstrap address(es).`);
            }

            broadcastStatus();
        } catch (error) {
            pushLog(`Failed to restore libp2p state: ${error instanceof Error ? error.message : String(error)}`, 'warn');
        }
    }

    function getStatus() {
        return {
            ready: state.ready,
            starting: state.starting,
            stopping: state.stopping,
            binding: state.binding,
            bootstrapping: state.bootstrapping,
            peerId: state.peerId,
            peerIdShort: state.peerIdShort,
            activePubkey: state.activePubkey,
            activeNpub: state.activeNpub,
            attestation: state.attestation,
            relayDescriptor: state.relayDescriptor,
            defaultBootstrapAddrs: [...state.defaultBootstrapAddrs],
            bootstrapAddrs: [...state.bootstrapAddrs],
            listenAddrs: [...state.listenAddrs],
            connectionCount: state.connectionCount,
            lastDialTarget: state.lastDialTarget,
            lastDialPeer: state.lastDialPeer,
            lastPingLatency: state.lastPingLatency,
            lastBindError: state.lastBindError,
            lastBootstrapError: state.lastBootstrapError,
            lastError: state.lastError,
            logs: [...state.logs],
        };
    }

    return {
        startNode,
        stopNode,
        dialPeer,
        setBootstrapAddrs,
        bindIdentity,
        clearBinding,
        getStatus,
        loadSavedState,
    };
}
