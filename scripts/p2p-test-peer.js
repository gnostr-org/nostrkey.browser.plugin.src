#!/usr/bin/env node

const DEFAULT_TOPIC = 'gnostr';
const DEFAULT_PING_INTERVAL_MS = 1000;
const DEFAULT_PUBLISH_INTERVAL_MS = 1000;

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

    return { command: 'run' };
}

async function createNode() {
    const [{ createLibp2p }, { webSockets }, { webRTCDirect }, { noise }, { yamux }, { gossipsub }, { identify }, { bootstrap }, { circuitRelayServer, circuitRelayTransport }, { dcutr }] = await Promise.all([
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
    ]);

    return createLibp2p({
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
    });
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

async function main() {
    const { command, count, topic } = parseArgs(process.argv);

    const node = await createNode();
    await node.start();

    console.log('peer id:', node.peerId.toString());
    console.log('listening on:');
    for (const addr of node.getMultiaddrs()) {
        console.log(`  ${addr.toString()}`);
    }

    if (command === 'ping') {
        await runPingCommand(node, count, topic);
        await node.stop();
        process.exit(0);
    }

    await runRunCommand(node);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
