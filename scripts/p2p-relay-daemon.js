#!/usr/bin/env node

const DEFAULT_TOPIC = 'gnostr-relay';
const DEFAULT_OUTPUT = './p2p-relay.json';
const DEFAULT_PING_INTERVAL_MS = 15000;
const DEFAULT_STATUS_INTERVAL_MS = 30000;

const DEFAULT_BOOTSTRAP = [
    '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
    '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
    '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
    '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt',
];

function parseArgs(argv) {
    const args = argv.slice(2);
    const options = {
        wsPort: 0,
        topic: DEFAULT_TOPIC,
        output: DEFAULT_OUTPUT,
        announce: null,
    };

    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--ws-port':
                options.wsPort = parseInt(args[i + 1], 10) || 0;
                i++;
                break;
            case '--topic':
                options.topic = args[i + 1] || DEFAULT_TOPIC;
                i++;
                break;
            case '--output':
                options.output = args[i + 1] || DEFAULT_OUTPUT;
                i++;
                break;
            case '--announce':
                options.announce = args[i + 1] || null;
                i++;
                break;
            default:
                break;
        }
    }

    return options;
}

function wsAddrForPort(port) {
    return `/ip4/0.0.0.0/tcp/${port}/ws`;
}

function announcedAddrs(addrs, announceHost) {
    if (!announceHost) return addrs;
    return addrs.map((addr) => {
        // Rewrite WebSocket listen addresses so remote nodes get a usable DNS address.
        const wsMatch = addr.match(/\/ip4\/[^/]+\/tcp\/(\d+)\/ws/);
        if (wsMatch) {
            const port = wsMatch[1];
            const suffix = addr.slice(addr.indexOf('/ws') + 3);
            return `/dns4/${announceHost}/tcp/${port}/ws${suffix}`;
        }
        return addr;
    });
}

async function createNode(options) {
    const [
        { createLibp2p },
        { webSockets },
        { webRTCDirect },
        { tcp },
        { noise },
        { yamux },
        { gossipsub },
        { identify },
        { bootstrap },
        { circuitRelayServer, circuitRelayTransport },
        { dcutr },
        { ping },
    ] = await Promise.all([
        import('libp2p'),
        import('@libp2p/websockets'),
        import('@libp2p/webrtc'),
        import('@libp2p/tcp'),
        import('@chainsafe/libp2p-noise'),
        import('@libp2p/yamux'),
        import('@libp2p/gossipsub'),
        import('@libp2p/identify'),
        import('@libp2p/bootstrap'),
        import('@libp2p/circuit-relay-v2'),
        import('@libp2p/dcutr'),
        import('@libp2p/ping'),
    ]);

    const listenAddrs = [
        options.wsPort ? wsAddrForPort(options.wsPort) : '/ip4/0.0.0.0/tcp/0/ws',
        '/ip4/0.0.0.0/tcp/0',
        '/ip4/0.0.0.0/udp/0/webrtc-direct',
        '/p2p-circuit',
    ];

    return createLibp2p({
        addresses: {
            listen: listenAddrs,
        },
        transports: [webSockets(), webRTCDirect(), tcp(), circuitRelayTransport()],
        connectionEncryption: [noise()],
        streamMuxers: [yamux()],
        services: {
            identify: identify(),
            ping: ping(),
            pubsub: gossipsub({
                allowPublishToZeroTopicPeers: true,
                emitSelf: false,
            }),
            relay: circuitRelayServer({
                reservations: {
                    maxReservations: 512,
                    defaultDurationLimit: 600_000,
                    defaultDataLimit: BigInt(1 << 20),
                },
            }),
            dcutr: dcutr(),
        },
        peerDiscovery: [
            bootstrap({
                list: DEFAULT_BOOTSTRAP,
                timeout: 0,
                tagTTL: Infinity,
            }),
        ],
    });
}

function writeOutput(path, peerId, addrs) {
    const fs = require('fs');
    const data = {
        peerId,
        addresses: addrs,
        timestamp: new Date().toISOString(),
    };
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
    return data;
}

async function main() {
    const options = parseArgs(process.argv);

    const node = await createNode(options);
    await node.start();

    const peerId = node.peerId.toString();
    const rawAddrs = node.getMultiaddrs().map((addr) => addr.toString());
    const addrs = announcedAddrs(rawAddrs, options.announce);

    console.log('P2P relay daemon started');
    console.log('peer id:', peerId);
    console.log('listening on:');
    for (const addr of rawAddrs) {
        console.log(`  ${addr}`);
    }
    if (options.announce) {
        console.log('announced addresses:');
        for (const addr of addrs) {
            console.log(`  ${addr}`);
        }
    }

    writeOutput(options.output, peerId, addrs);
    console.log(`relay info written to ${options.output}`);

    node.services.pubsub.subscribe(options.topic);
    node.services.pubsub.addEventListener('message', (event) => {
        const data = new TextDecoder().decode(event.detail.data);
        const from = event.detail.from?.toString?.() || String(event.detail.from || '');
        console.log(`[pubsub:${event.detail.topic || options.topic}] ${from}: ${data}`);
    });

    node.addEventListener('peer:connect', (event) => {
        console.log(`peer connected: ${event.detail?.toString?.() || String(event.detail || '')}`);
    });
    node.addEventListener('peer:disconnect', (event) => {
        console.log(`peer disconnected: ${event.detail?.toString?.() || String(event.detail || '')}`);
    });

    const pingInterval = setInterval(async () => {
        const connections = node.getConnections();
        if (!connections.length) return;
        for (const connection of connections) {
            const remotePeer = connection?.remotePeer;
            if (!remotePeer) continue;
            try {
                const latency = await node.services.ping.ping(remotePeer);
                console.log(`ping ${remotePeer.toString()}: ${latency} ms`);
            } catch (error) {
                console.log(`ping ${remotePeer.toString()} failed: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    }, DEFAULT_PING_INTERVAL_MS);

    const statusInterval = setInterval(() => {
        console.log(`connected peers: ${node.getConnections().length}`);
    }, DEFAULT_STATUS_INTERVAL_MS);

    const shutdown = async (signal) => {
        console.log(`\n${signal} received, stopping relay node...`);
        clearInterval(pingInterval);
        clearInterval(statusInterval);
        try {
            await node.stop();
            console.log('relay node stopped.');
        } catch (error) {
            console.error('error stopping node:', error);
        }
        process.exit(0);
    };

    process.on('SIGINT', () => void shutdown('SIGINT'));
    process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
