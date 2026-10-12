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
        httpPort: 0,
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
            case '--http-port':
                options.httpPort = parseInt(args[i + 1], 10) || 0;
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

function createReportHub(httpPort) {
    const http = require('http');
    const { URL } = require('url');
    const reports = new Map();
    const clients = new Set();

    function broadcast(report) {
        const payload = `data: ${JSON.stringify(report)}\n\n`;
        for (const res of clients) {
            try {
                res.write(payload);
            } catch {
                clients.delete(res);
            }
        }
    }

    function storeReport(report) {
        if (!report || typeof report !== 'object' || report.type !== 'test-report' || !report.pageId) return false;
        reports.set(report.pageId, { ...report, receivedAt: Date.now() });
        broadcast(report);
        return true;
    }

    const server = http.createServer((req, res) => {
        const origin = req.headers.origin || '*';
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }

        const url = new URL(req.url, `http://${req.headers.host}`);

        if (url.pathname === '/health' && req.method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true, reports: reports.size, clients: clients.size }));
            return;
        }

        if (url.pathname === '/reports' && req.method === 'GET') {
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            });
            res.write(':ok\n\n');
            for (const report of reports.values()) {
                res.write(`data: ${JSON.stringify(report)}\n\n`);
            }
            clients.add(res);
            req.on('close', () => clients.delete(res));
            return;
        }

        if (url.pathname === '/report' && req.method === 'POST') {
            let body = '';
            req.on('data', (chunk) => { body += chunk; });
            req.on('end', () => {
                try {
                    const report = JSON.parse(body);
                    if (storeReport(report)) {
                        console.log(`[http-hub] report from ${report.pageId || '?'} (${report.browser || '?'})`);
                        res.writeHead(202);
                        res.end(JSON.stringify({ ok: true }));
                    } else {
                        res.writeHead(400);
                        res.end(JSON.stringify({ ok: false, error: 'Invalid report' }));
                    }
                } catch (err) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ ok: false, error: 'Invalid JSON' }));
                }
            });
            return;
        }

        res.writeHead(404);
        res.end('Not found');
    });

    return new Promise((resolve, reject) => {
        server.listen(httpPort, '127.0.0.1', () => {
            const { port } = server.address();
            const httpUrl = `http://127.0.0.1:${port}`;
            console.log(`HTTP report hub listening on ${httpUrl}`);
            resolve({ server, httpUrl, storeReport });
        });
        server.on('error', reject);
    });
}

function isIp(host) {
    return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host);
}

function announcedAddrs(addrs, announceHost) {
    if (!announceHost) return addrs;
    const ipPrefix = isIp(announceHost) ? 'ip4' : 'dns4';
    return addrs.map((addr) => {
        // Rewrite WebSocket listen addresses so remote nodes get a usable address.
        const wsMatch = addr.match(/\/ip4\/[^/]+\/tcp\/(\d+)\/ws/);
        if (wsMatch) {
            const port = wsMatch[1];
            const suffix = addr.slice(addr.indexOf('/ws') + 3);
            return `/${ipPrefix}/${announceHost}/tcp/${port}/ws${suffix}`;
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
        transports: [
            webSockets(),
            webRTCDirect({
                rtcConfiguration: {
                    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
                },
            }),
            tcp(),
            circuitRelayTransport(),
        ],
        connectionEncryption: [noise()],
        streamMuxers: [yamux()],
        services: {
            identify: identify(),
            ping: ping(),
            pubsub: gossipsub({
                allowPublishToZeroTopicPeers: true,
                emitSelf: false,
                floodPublish: true,
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

function writeOutput(path, peerId, addrs, httpUrl) {
    const fs = require('fs');
    const data = {
        peerId,
        addresses: addrs,
        httpUrl,
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

    const hub = await createReportHub(options.httpPort);

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

    writeOutput(options.output, peerId, addrs, hub.httpUrl);
    console.log(`relay info written to ${options.output}`);

    node.services.pubsub.subscribe(options.topic);
    node.services.pubsub.addEventListener('message', (event) => {
        const data = new TextDecoder().decode(event.detail.data);
        const from = event.detail.from?.toString?.() || String(event.detail.from || '');
        const topic = event.detail.topic || options.topic;
        console.log(`[pubsub:${topic}] ${from}: ${data}`);
        // Also make pubsub reports available via the HTTP hub.
        try {
            const parsed = JSON.parse(data);
            if (parsed && parsed.type === 'test-report') {
                hub.storeReport(parsed);
            }
        } catch {
            // ignore non-JSON
        }
    });

    // Direct report forwarding protocol: browsers send test reports over a
    // dedicated libp2p stream. The relay forwards them to every other connected
    // peer. This is used as a reliable fallback when gossipsub mesh formation
    // across WebRTC-direct links is slow or unreliable in automated browsers.
    const REPORT_PROTOCOL = '/gnostr/test-report/1.0.0';
    const seenReports = new Map();

    async function forwardReport(senderPeerId, data) {
        const text = new TextDecoder().decode(data);
        let reportId = '';
        try {
            const parsed = JSON.parse(text);
            reportId = `${parsed.pageId || ''}:${parsed.timestamp || ''}`;
        } catch {
            reportId = text;
        }
        if (!reportId || seenReports.has(reportId)) return;
        seenReports.set(reportId, Date.now());

        const connections = node.getConnections();
        for (const connection of connections) {
            const remotePeer = connection?.remotePeer?.toString?.();
            if (!remotePeer || remotePeer === senderPeerId) continue;
            try {
                const stream = await node.dialProtocol(connection.remotePeer, REPORT_PROTOCOL);
                if (!stream.send(data)) {
                    await new Promise((resolve, reject) => {
                        stream.addEventListener('drain', resolve, { once: true });
                        stream.addEventListener('close', () => reject(new Error('Stream closed before drain')), { once: true });
                    });
                }
                await stream.close();
                console.log(`[report-forward] ${senderPeerId} -> ${remotePeer}`);
            } catch (err) {
                console.log(`[report-forward] ${senderPeerId} -> ${remotePeer} failed: ${err instanceof Error ? err.message : String(err)}`);
            }
        }
    }

    function chunkToUint8Array(chunk) {
        if (chunk instanceof Uint8Array) return chunk;
        if (chunk && typeof chunk.subarray === 'function') return chunk.subarray();
        return new Uint8Array(chunk);
    }

    function concatChunks(chunks) {
        if (chunks.length === 0) return new Uint8Array(0);
        if (chunks.length === 1) return chunks[0];
        const total = chunks.reduce((sum, c) => sum + c.length, 0);
        const result = new Uint8Array(total);
        let offset = 0;
        for (const chunk of chunks) {
            result.set(chunk, offset);
            offset += chunk.length;
        }
        return result;
    }

    await node.handle(REPORT_PROTOCOL, async ({ stream, connection }) => {
        const chunks = [];
        let settled = false;
        let timeout = null;
        let resolveDone = null;
        const donePromise = new Promise((resolve) => { resolveDone = resolve; });

        const finish = () => {
            if (settled) return;
            settled = true;
            if (timeout) clearTimeout(timeout);
            stream.removeEventListener('message', onMessage);
            resolveDone();
        };

        const onMessage = (event) => {
            const data = event.detail?.data ?? event.data;
            if (data) {
                chunks.push(chunkToUint8Array(data));
                if (timeout) clearTimeout(timeout);
                timeout = setTimeout(finish, 250);
            }
        };

        stream.addEventListener('message', onMessage);
        stream.addEventListener('close', finish, { once: true });
        stream.addEventListener('end', finish, { once: true });

        await Promise.race([donePromise, new Promise((resolve) => setTimeout(resolve, 5000))]);
        finish();

        const data = concatChunks(chunks);
        const senderPeerId = connection?.remotePeer?.toString?.() || '';
        if (data.length) {
            console.log(`[report-protocol] received report from ${senderPeerId} (${data.length} bytes)`);
            await forwardReport(senderPeerId, data);
        }
        try { await stream.close(); } catch {}
    });

    node.addEventListener('peer:connect', (event) => {
        const peerId = event.detail?.toString?.() || String(event.detail || '');
        console.log(`peer connected: ${peerId}`);
        // Send any reports we have already seen to the new peer so late joiners
        // catch up without waiting for the next re-publish interval.
        const reports = Array.from(seenReports.values());
        if (!reports.length) return;
        (async () => {
            for (const data of reports) {
                try {
                    const stream = await node.dialProtocol(event.detail, REPORT_PROTOCOL);
                    if (!stream.send(data)) {
                        await new Promise((resolve, reject) => {
                            stream.addEventListener('drain', resolve, { once: true });
                            stream.addEventListener('close', () => reject(new Error('Stream closed before drain')), { once: true });
                        });
                    }
                    await stream.close();
                    console.log(`[report-forward] catch-up to ${peerId}`);
                } catch (err) {
                    console.log(`[report-forward] catch-up to ${peerId} failed: ${err instanceof Error ? err.message : String(err)}`);
                    break;
                }
            }
        })();
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
