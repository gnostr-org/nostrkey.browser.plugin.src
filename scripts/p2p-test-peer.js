#!/usr/bin/env node

const DEFAULT_TOPIC = 'gnostr';
const DEFAULT_PING_INTERVAL_MS = 1000;
const DEFAULT_PUBLISH_INTERVAL_MS = 1000;
const DETERMINISTIC_EXTENSION_PEER_ID = '12D3KooWNeFQq6UZ8meyknx3sH7CGZUsJsSNntzRsDuFTdAwpDBP';

// Browser-safe WSS bootstrap relays that the extension also uses. These can
// act as circuit-relay intermediaries so this test peer can reach the
// deterministic browser extension peer once it has a relay reservation.
const WSS_BOOTSTRAP_RELAYS = [
    '/dns4/lith-1.bootstrap.ipni.io/tcp/4443/wss/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
    '/dns4/chic-1.bootstrap.ipni.io/tcp/4443/wss/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
    '/dns4/sing-1.bootstrap.ipni.io/tcp/4443/wss/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt',
    '/dns4/chic-1-b.bootstrap.ipni.io/tcp/4453/wss/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
];

function parseArgs(argv) {
    const args = argv.slice(2);
    const command = args[0] || 'run';

    if (command === 'ping') {
        let count = 1;
        let topic = DEFAULT_TOPIC;
        for (let i = 1; i < args.length; i++) {
            if (args[i] === '-c' && args[i + 1]) {
                count = parseInt(args[i + 1], 10);
                i++;
            } else if (args[i] === '--topic' && args[i + 1]) {
                topic = args[i + 1];
                i++;
            }
        }
        if (Number.isNaN(count) || count < 1) count = 1;
        return { command: 'ping', count, topic };
    }

    const options = { command: 'run', dialExtension: true, extraDials: [] };
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--no-dial-ext') {
            options.dialExtension = false;
        } else if (args[i] === '--dial' && args[i + 1]) {
            options.extraDials.push(args[i + 1]);
            i++;
        }
    }
    return options;
}

async function createNode() {
    const [{ createLibp2p }, { webSockets }, { webRTCDirect }, { noise }, { yamux }, { gossipsub }, { identify }, { bootstrap }, { circuitRelayServer, circuitRelayTransport }, { dcutr }, { multiaddr }, { peerIdFromString }] = await Promise.all([
        import('libp2p'),
        import('@libp2p/websockets'),
        import('@libp2p/webrtc'),
        import('@libp2p/noise'),
        import('@libp2p/yamux'),
        import('@libp2p/gossipsub'),
        import('@libp2p/identify'),
        import('@libp2p/bootstrap'),
        import('@libp2p/circuit-relay-v2'),
        import('@libp2p/dcutr'),
        import('@multiformats/multiaddr'),
        import('@libp2p/peer-id'),
    ]);

    const extensionPeerId = peerIdFromString(DETERMINISTIC_EXTENSION_PEER_ID);

    return {
        node: await createLibp2p({
            addresses: {
                listen: [
                    '/ip4/0.0.0.0/tcp/0/ws',
                    '/ip4/0.0.0.0/udp/0/webrtc-direct',
                    '/p2p-circuit',
                ],
            },
            transports: [webSockets(), webRTCDirect(), circuitRelayTransport()],
            connectionEncryption: [noise()],
            streamMuxers: [yamux()],
            services: {
                identify: identify(),
                pubsub: gossipsub({
                    allowPublishToZeroTopicPeers: true,
                    emitSelf: true,
                    directPeers: [
                        { id: extensionPeerId, addrs: [] },
                    ],
                }),
                relay: circuitRelayServer(),
                dcutr: dcutr(),
            },
            peerDiscovery: [
                bootstrap({
                    list: [
                        '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
                        '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
                        '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
                        '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt',
                    ],
                    timeout: 0,
                    tagTTL: Infinity,
                }),
            ],
        }),
        multiaddr,
    };
}

async function tryDialExtension(node, multiaddr, relayAddr) {
    const target = `${relayAddr}/p2p-circuit/p2p/${DETERMINISTIC_EXTENSION_PEER_ID}`;
    try {
        await node.dial(multiaddr(target));
        console.log(`connected to deterministic extension via ${target}`);
        return true;
    } catch (_) {
        // Best-effort background dial; failures are expected when the
        // extension has not yet made a relay reservation.
        return false;
    }
}

async function maintainExtensionConnection(node, multiaddr, enabled) {
    if (!enabled) return;

    console.log(`target extension peer: ${DETERMINISTIC_EXTENSION_PEER_ID}`);
    console.log('best-effort: trying to reach the extension through WSS bootstrap relays (it must have a relay reservation first)');

    let connected = false;
    const attempt = async () => {
        if (connected) return;
        for (const relay of WSS_BOOTSTRAP_RELAYS) {
            connected = await tryDialExtension(node, multiaddr, relay);
            if (connected) break;
        }
    };

    node.addEventListener('peer:connect', (event) => {
        const peerId = event.detail?.toString?.() || String(event.detail || '');
        if (peerId === DETERMINISTIC_EXTENSION_PEER_ID) {
            connected = true;
            console.log(`extension peer connected: ${peerId}`);
        }
    });

    node.addEventListener('peer:disconnect', (event) => {
        const peerId = event.detail?.toString?.() || String(event.detail || '');
        if (peerId === DETERMINISTIC_EXTENSION_PEER_ID) {
            connected = false;
            console.log(`extension peer disconnected: ${peerId}`);
        }
    });

    await attempt();
    setInterval(() => {
        if (!connected) {
            void attempt();
        }
    }, 10000);
}

async function dialExtraTargets(node, multiaddr, targets) {
    for (const target of targets) {
        try {
            await node.dial(multiaddr(target));
            console.log(`connected to ${target}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.log(`dial ${target} failed: ${message}`);
        }
    }
}

async function runPingCommand(node, count, topic) {
    for (let i = 0; i < count; i++) {
        const payload = JSON.stringify({
            ts: new Date().toISOString(),
            seq: i + 1,
            from: node.peerId.toString(),
        });
        await node.services.pubsub.publish(topic, new TextEncoder().encode(payload));
        console.log(`published to ${topic}: ${payload}`);
        if (i < count - 1) {
            await new Promise((resolve) => setTimeout(resolve, DEFAULT_PUBLISH_INTERVAL_MS));
        }
    }
}

async function runRunCommand(node) {
    node.services.pubsub.subscribe(DEFAULT_TOPIC);
    node.services.pubsub.addEventListener('message', (event) => {
        const data = new TextDecoder().decode(event.detail.data);
        console.log(`[${event.detail.topic}] ${data}`);
    });

    setInterval(async () => {
        const connections = node.getConnections();
        if (!connections.length) return;
        for (const connection of connections) {
            const remotePeer = connection?.remotePeer;
            if (!remotePeer) continue;
            try {
                const start = performance.now();
                for await (const _ of node.services.ping.ping(remotePeer)) {
                    const latency = Math.max(0, Math.round(performance.now() - start));
                    console.log(`ping ${remotePeer.toString()}: ${latency} ms`);
                    break;
                }
            } catch (error) {
                console.log(`ping ${remotePeer.toString()} failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    }, DEFAULT_PING_INTERVAL_MS);

    setInterval(async () => {
        const payload = JSON.stringify({
            ts: new Date().toISOString(),
            from: node.peerId.toString(),
        });
        await node.services.pubsub.publish(DEFAULT_TOPIC, new TextEncoder().encode(payload));
    }, DEFAULT_PUBLISH_INTERVAL_MS);
}

function printExtensionInstructions(multiaddrs) {
    const webrtcDirect = multiaddrs.find((addr) => addr.includes('/webrtc-direct/'));
    const ws = multiaddrs.find((addr) => addr.includes('/ws/p2p/'));

    console.log('');
    console.log('to connect the extension to this test peer, paste one of these addresses');
    console.log('into the Experimental page "Target multiaddr" field and click "Dial and ping":');
    if (webrtcDirect) {
        console.log(`  (best for browser) ${webrtcDirect}`);
    }
    if (ws) {
        console.log(`  (local network only) ${ws}`);
    }
    console.log('');
}

async function main() {
    const options = parseArgs(process.argv);

    const { node, multiaddr } = await createNode();
    await node.start();

    console.log('peer id:', node.peerId.toString());
    console.log('listening on:');
    const addrs = node.getMultiaddrs().map((addr) => addr.toString());
    for (const addr of addrs) {
        console.log(`  ${addr}`);
    }

    if (options.command === 'ping') {
        await runPingCommand(node, options.count, options.topic);
        await node.stop();
        process.exit(0);
    }

    printExtensionInstructions(addrs);
    await dialExtraTargets(node, multiaddr, options.extraDials);
    await maintainExtensionConnection(node, multiaddr, options.dialExtension);
    await runRunCommand(node);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
