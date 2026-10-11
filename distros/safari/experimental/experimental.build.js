(() => {
  // src/utilities/browser-polyfill.js
  var _browser = typeof browser !== "undefined" ? browser : typeof chrome !== "undefined" ? chrome : null;
  if (!_browser) {
    throw new Error("browser-polyfill: No extension API namespace found (neither browser nor chrome).");
  }
  var isChrome = typeof browser === "undefined" && typeof chrome !== "undefined";
  function promisify(context, method) {
    return (...args) => {
      try {
        const result = method.apply(context, args);
        if (result && typeof result.then === "function") {
          return result;
        }
      } catch (_) {
      }
      return new Promise((resolve, reject) => {
        method.apply(context, [
          ...args,
          (...cbArgs) => {
            if (_browser.runtime && _browser.runtime.lastError) {
              reject(new Error(_browser.runtime.lastError.message));
            } else {
              resolve(cbArgs.length <= 1 ? cbArgs[0] : cbArgs);
            }
          }
        ]);
      });
    };
  }
  var api = {};
  api.runtime = {
    /**
     * sendMessage – always returns a Promise.
     */
    sendMessage(...args) {
      if (!isChrome) {
        return _browser.runtime.sendMessage(...args);
      }
      return promisify(_browser.runtime, _browser.runtime.sendMessage)(...args);
    },
    /**
     * onMessage – thin wrapper so callers use a consistent reference.
     * The listener signature is (message, sender, sendResponse).
     * On Chrome the listener can return `true` to keep the channel open,
     * or return a Promise (MV3).  Safari / Firefox expect a Promise return.
     */
    onMessage: _browser.runtime.onMessage,
    /**
     * getURL – synchronous on all browsers.
     */
    getURL(path) {
      return _browser.runtime.getURL(path);
    },
    /**
     * openOptionsPage
     */
    openOptionsPage() {
      if (!isChrome) {
        return _browser.runtime.openOptionsPage();
      }
      return promisify(_browser.runtime, _browser.runtime.openOptionsPage)();
    },
    /**
     * Expose the id for convenience.
     */
    get id() {
      return _browser.runtime.id;
    }
  };
  api.storage = {
    local: {
      get(...args) {
        if (!isChrome) {
          return _browser.storage.local.get(...args);
        }
        return promisify(_browser.storage.local, _browser.storage.local.get)(...args);
      },
      set(...args) {
        if (!isChrome) {
          return _browser.storage.local.set(...args);
        }
        return promisify(_browser.storage.local, _browser.storage.local.set)(...args);
      },
      clear(...args) {
        if (!isChrome) {
          return _browser.storage.local.clear(...args);
        }
        return promisify(_browser.storage.local, _browser.storage.local.clear)(...args);
      },
      remove(...args) {
        if (!isChrome) {
          return _browser.storage.local.remove(...args);
        }
        return promisify(_browser.storage.local, _browser.storage.local.remove)(...args);
      }
    },
    // --- storage.sync ----------------------------------------------------------
    // Null when the browser doesn't support sync (older Safari, etc.)
    sync: _browser.storage?.sync ? {
      get(...args) {
        if (!isChrome) {
          return _browser.storage.sync.get(...args);
        }
        return promisify(_browser.storage.sync, _browser.storage.sync.get)(...args);
      },
      set(...args) {
        if (!isChrome) {
          return _browser.storage.sync.set(...args);
        }
        return promisify(_browser.storage.sync, _browser.storage.sync.set)(...args);
      },
      remove(...args) {
        if (!isChrome) {
          return _browser.storage.sync.remove(...args);
        }
        return promisify(_browser.storage.sync, _browser.storage.sync.remove)(...args);
      },
      clear(...args) {
        if (!isChrome) {
          return _browser.storage.sync.clear(...args);
        }
        return promisify(_browser.storage.sync, _browser.storage.sync.clear)(...args);
      },
      getBytesInUse(...args) {
        if (!_browser.storage.sync.getBytesInUse) {
          return Promise.resolve(0);
        }
        if (!isChrome) {
          return _browser.storage.sync.getBytesInUse(...args);
        }
        return promisify(_browser.storage.sync, _browser.storage.sync.getBytesInUse)(...args);
      }
    } : null,
    // --- storage.session -------------------------------------------------------
    // MV3 in-memory area that survives service-worker eviction but never touches
    // disk. Null on engines that don't implement it (Safari background page,
    // older Firefox) — callers must feature-detect and fall back.
    session: _browser.storage?.session ? {
      get(...args) {
        if (!isChrome) {
          return _browser.storage.session.get(...args);
        }
        return promisify(_browser.storage.session, _browser.storage.session.get)(...args);
      },
      set(...args) {
        if (!isChrome) {
          return _browser.storage.session.set(...args);
        }
        return promisify(_browser.storage.session, _browser.storage.session.set)(...args);
      },
      remove(...args) {
        if (!isChrome) {
          return _browser.storage.session.remove(...args);
        }
        return promisify(_browser.storage.session, _browser.storage.session.remove)(...args);
      },
      clear(...args) {
        if (!isChrome) {
          return _browser.storage.session.clear(...args);
        }
        return promisify(_browser.storage.session, _browser.storage.session.clear)(...args);
      },
      /**
       * Restrict the area to extension-privileged contexts. Chrome-only;
       * resolves harmlessly where the method is absent.
       */
      setAccessLevel(...args) {
        if (!_browser.storage.session.setAccessLevel) return Promise.resolve();
        if (!isChrome) {
          return _browser.storage.session.setAccessLevel(...args);
        }
        return promisify(_browser.storage.session, _browser.storage.session.setAccessLevel)(...args);
      }
    } : null,
    // --- storage.onChanged -----------------------------------------------------
    onChanged: _browser.storage?.onChanged || null
  };
  api.tabs = {
    create(...args) {
      if (!isChrome) {
        return _browser.tabs.create(...args);
      }
      return promisify(_browser.tabs, _browser.tabs.create)(...args);
    },
    query(...args) {
      if (!isChrome) {
        return _browser.tabs.query(...args);
      }
      return promisify(_browser.tabs, _browser.tabs.query)(...args);
    },
    remove(...args) {
      if (!isChrome) {
        return _browser.tabs.remove(...args);
      }
      return promisify(_browser.tabs, _browser.tabs.remove)(...args);
    },
    update(...args) {
      if (!isChrome) {
        return _browser.tabs.update(...args);
      }
      return promisify(_browser.tabs, _browser.tabs.update)(...args);
    },
    get(...args) {
      if (!isChrome) {
        return _browser.tabs.get(...args);
      }
      return promisify(_browser.tabs, _browser.tabs.get)(...args);
    },
    getCurrent(...args) {
      if (!isChrome) {
        return _browser.tabs.getCurrent(...args);
      }
      return promisify(_browser.tabs, _browser.tabs.getCurrent)(...args);
    },
    sendMessage(...args) {
      if (!isChrome) {
        return _browser.tabs.sendMessage(...args);
      }
      return promisify(_browser.tabs, _browser.tabs.sendMessage)(...args);
    }
  };
  api.alarms = _browser.alarms ? {
    create(...args) {
      const result = _browser.alarms.create(...args);
      return result && typeof result.then === "function" ? result : Promise.resolve();
    },
    clear(...args) {
      if (!isChrome) {
        return _browser.alarms.clear(...args);
      }
      return promisify(_browser.alarms, _browser.alarms.clear)(...args);
    },
    onAlarm: _browser.alarms.onAlarm
  } : null;

  // src/experimental/experimental.js
  var FEATURES = [
    [
      "none",
      "NIP-XX: None",
      "Reserved for the future use."
    ]
  ];
  var $ = (id) => document.getElementById(id);
  var state = {
    features: [],
    libp2p: {
      ready: false,
      starting: false,
      stopping: false,
      binding: false,
      bootstrapping: false,
      peerId: "",
      peerIdShort: "",
      activePubkey: "",
      activeNpub: "",
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
      pingLog: [],
      autoPingEnabled: false,
      autoPingInterval: 1,
      lastDialTarget: "",
      lastDialPeer: "",
      lastPingLatency: "",
      lastBindError: "",
      lastBootstrapError: "",
      lastError: "",
      logs: []
    }
  };
  function escapeHtml(value) {
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }
  function shortValue(value, head = 10, tail = 8) {
    if (!value) return "";
    if (value.length <= head + tail + 3) return value;
    return `${value.slice(0, head)}\u2026${value.slice(-tail)}`;
  }
  function applyStatusUpdate(status) {
    if (!status || typeof status !== "object") return;
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
    const container = $("features-container");
    if (!container) return;
    container.innerHTML = state.features.map(([name, active, shortDesc, longDesc]) => `
        <div class="mt-4">
            <input
                class="checkbox"
                type="checkbox"
                id="${name}"
                ${active ? "checked" : ""}
                data-feature="${name}"
            />
            <label for="${name}" class="font-bold">${shortDesc}</label>
            <p class="italic">${longDesc}</p>
        </div>
    `).join("");
    container.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
      cb.addEventListener("change", async (e) => {
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
      logs
    } = state.libp2p;
    const statusEl = $("libp2p-status");
    if (statusEl) {
      statusEl.textContent = ready ? "Ready" : starting ? "Starting\u2026" : stopping ? "Stopping\u2026" : "Stopped";
    }
    const peerIdEl = $("libp2p-peer-id");
    if (peerIdEl) {
      peerIdEl.textContent = peerIdShort || peerId || "Not started";
    }
    const listenAddrsEl = $("libp2p-listen-addrs");
    if (listenAddrsEl) {
      listenAddrsEl.textContent = listenAddrs.length ? listenAddrs.join("\n") : "No advertised listen addresses in this browser node.";
    }
    const webrtcAddrsEl = $("libp2p-webrtc-addrs");
    if (webrtcAddrsEl) {
      webrtcAddrsEl.textContent = state.libp2p.webrtcAddrs.length ? state.libp2p.webrtcAddrs.join("\n") : "No WebRTC listen addresses yet (requires a relay reservation).";
    }
    const defaultBootstrapEl = $("libp2p-default-bootstrap");
    if (defaultBootstrapEl) {
      defaultBootstrapEl.textContent = defaultBootstrapAddrs.length ? defaultBootstrapAddrs.join("\n") : "No default WSS bootstrap relays configured.";
    }
    const discoveryBootstrapEl = $("libp2p-discovery-bootstrap");
    if (discoveryBootstrapEl) {
      discoveryBootstrapEl.textContent = state.libp2p.discoveryBootstrapAddrs.length ? state.libp2p.discoveryBootstrapAddrs.join("\n") : "No canonical libp2p bootstrap relays configured.";
    }
    const connectionCountEl = $("libp2p-connection-count");
    if (connectionCountEl) {
      connectionCountEl.textContent = String(connectionCount);
    }
    const lastDialTargetEl = $("libp2p-last-dial-target");
    if (lastDialTargetEl) {
      lastDialTargetEl.textContent = lastDialTarget || "\u2014";
    }
    const lastDialPeerEl = $("libp2p-last-dial-peer");
    if (lastDialPeerEl) {
      lastDialPeerEl.textContent = lastDialPeer || "\u2014";
    }
    const lastPingEl = $("libp2p-last-ping");
    if (lastPingEl) {
      lastPingEl.textContent = lastPingLatency || "\u2014";
    }
    const errorEl = $("libp2p-error");
    if (errorEl) {
      errorEl.textContent = lastError || "";
      errorEl.classList.toggle("hidden", !lastError);
    }
    const bindErrorEl = $("libp2p-bind-error");
    if (bindErrorEl) {
      bindErrorEl.textContent = lastBindError || "";
      bindErrorEl.classList.toggle("hidden", !lastBindError);
    }
    const bootstrapErrorEl = $("libp2p-bootstrap-error");
    if (bootstrapErrorEl) {
      bootstrapErrorEl.textContent = lastBootstrapError || "";
      bootstrapErrorEl.classList.toggle("hidden", !lastBootstrapError);
    }
    const activePubkeyEl = $("libp2p-active-pubkey");
    if (activePubkeyEl) {
      activePubkeyEl.textContent = activePubkey ? shortValue(activePubkey, 16, 12) : "Not bound";
    }
    const activeNpubEl = $("libp2p-active-npub");
    if (activeNpubEl) {
      activeNpubEl.textContent = activeNpub || "Not bound";
    }
    const attestationEl = $("libp2p-attestation");
    if (attestationEl) {
      attestationEl.textContent = attestation ? JSON.stringify(attestation, null, 2) : "No attestation yet.";
    }
    const relayDescriptorEl = $("libp2p-relay-descriptor");
    if (relayDescriptorEl) {
      relayDescriptorEl.textContent = state.libp2p.relayDescriptor ? JSON.stringify(state.libp2p.relayDescriptor, null, 2) : "No relay descriptor yet.";
    }
    const bindStateEl = $("libp2p-bind-state");
    if (bindStateEl) {
      bindStateEl.textContent = binding ? "Binding\u2026" : attestation ? "Attested" : "Unbound";
    }
    const logEl = $("libp2p-log");
    if (logEl) {
      logEl.innerHTML = logs.length ? logs.map(({ ts, kind, message }) => `
                <div class="libp2p-log-line libp2p-log-line--${kind}">
                    <span class="libp2p-log-ts">${escapeHtml(ts)}</span>
                    <span class="libp2p-log-msg">${escapeHtml(message)}</span>
                </div>
            `).join("") : '<div class="libp2p-log-empty">No activity yet.</div>';
    }
    const startBtn = $("libp2p-start-btn");
    if (startBtn) {
      startBtn.disabled = ready || starting || stopping;
    }
    const stopBtn = $("libp2p-stop-btn");
    if (stopBtn) {
      stopBtn.disabled = !ready || stopping;
    }
    const dialBtn = $("libp2p-dial-btn");
    if (dialBtn) {
      dialBtn.disabled = !ready || starting || stopping;
    }
    const peerInput = $("libp2p-peer-input");
    if (peerInput) {
      peerInput.disabled = !ready || starting || stopping;
    }
    const bindBtn = $("libp2p-bind-btn");
    if (bindBtn) {
      bindBtn.disabled = !ready || starting || stopping || binding;
    }
    const copyBindBtn = $("libp2p-copy-bind-btn");
    if (copyBindBtn) {
      copyBindBtn.disabled = !attestation;
    }
    const clearBindBtn = $("libp2p-clear-bind-btn");
    if (clearBindBtn) {
      clearBindBtn.disabled = !attestation && !activePubkey && !activeNpub;
    }
    const copyRelayBtn = $("libp2p-copy-relay-btn");
    if (copyRelayBtn) {
      copyRelayBtn.disabled = !state.libp2p.relayDescriptor;
    }
    const bootstrapBtn = $("libp2p-bootstrap-btn");
    if (bootstrapBtn) {
      bootstrapBtn.disabled = !ready || starting || stopping || bootstrapping;
    }
    const bootstrapInput = $("libp2p-bootstrap-input");
    if (bootstrapInput) {
      const nextValue = bootstrapAddrs.join("\n");
      if (document.activeElement !== bootstrapInput && bootstrapInput.value !== nextValue) {
        bootstrapInput.value = nextValue;
      }
      bootstrapInput.disabled = !ready || starting || stopping;
    }
    const pubsubPeersEl = $("libp2p-pubsub-peers");
    if (pubsubPeersEl) {
      pubsubPeersEl.textContent = state.libp2p.pubsubPeers.length ? state.libp2p.pubsubPeers.join("\n") : "No pubsub peers yet.";
    }
    const subscribedTopicsEl = $("libp2p-subscribed-topics");
    if (subscribedTopicsEl) {
      subscribedTopicsEl.textContent = state.libp2p.subscribedTopics.length ? state.libp2p.subscribedTopics.join("\n") : "Not subscribed to any topics.";
    }
    const pubsubMessagesEl = $("libp2p-pubsub-messages");
    if (pubsubMessagesEl) {
      pubsubMessagesEl.innerHTML = state.libp2p.pubsubMessages.length ? state.libp2p.pubsubMessages.map((entry) => `
                <div class="libp2p-log-line">
                    <span class="libp2p-log-ts">${escapeHtml(entry.ts)}</span>
                    <span class="libp2p-log-msg">[${escapeHtml(entry.topic)}] ${escapeHtml(entry.from)}: ${escapeHtml(entry.data)}</span>
                </div>
            `).join("") : '<div class="libp2p-log-empty">No pubsub messages yet.</div>';
    }
    const pingLogEl = $("libp2p-ping-log");
    if (pingLogEl) {
      pingLogEl.innerHTML = state.libp2p.pingLog.length ? state.libp2p.pingLog.map((entry) => `
                <div class="libp2p-log-line ${entry.ok ? "" : "libp2p-log-line--warn"}">
                    <span class="libp2p-log-ts">${escapeHtml(entry.ts)}</span>
                    <span class="libp2p-log-msg">${escapeHtml(entry.peer)} ${entry.ok ? `${entry.latency} ms` : `failed: ${entry.error}`}</span>
                </div>
            `).join("") : '<div class="libp2p-log-empty">No pings yet. Connect to a peer and enable auto-ping, or press Ping all.</div>';
    }
    const pingAllBtn = $("libp2p-ping-all-btn");
    if (pingAllBtn) {
      pingAllBtn.disabled = !ready || starting || stopping;
    }
    const pubsubErrorEl = $("libp2p-pubsub-error");
    if (pubsubErrorEl) {
      pubsubErrorEl.textContent = state.libp2p.lastPubsubError || "";
      pubsubErrorEl.classList.toggle("hidden", !state.libp2p.lastPubsubError);
    }
    const subscribeBtn = $("libp2p-subscribe-btn");
    if (subscribeBtn) {
      subscribeBtn.disabled = !ready || starting || stopping;
    }
    const unsubscribeBtn = $("libp2p-unsubscribe-btn");
    if (unsubscribeBtn) {
      unsubscribeBtn.disabled = !ready || starting || stopping;
    }
    const publishBtn = $("libp2p-publish-btn");
    if (publishBtn) {
      publishBtn.disabled = !ready || starting || stopping;
    }
    const topicInput = $("libp2p-topic-input");
    if (topicInput) {
      topicInput.disabled = !ready || starting || stopping;
    }
    const publishInput = $("libp2p-publish-input");
    if (publishInput) {
      publishInput.disabled = !ready || starting || stopping;
    }
    const autoPingToggle = $("libp2p-auto-ping-toggle");
    if (autoPingToggle) {
      autoPingToggle.checked = state.libp2p.autoPingEnabled;
    }
    const autoPingInterval = $("libp2p-auto-ping-interval");
    if (autoPingInterval) {
      autoPingInterval.value = String(state.libp2p.autoPingInterval);
      autoPingInterval.disabled = !state.libp2p.autoPingEnabled;
    }
  }
  async function startLibp2pNode() {
    await sendLibp2pMessage("libp2p.start");
  }
  async function stopLibp2pNode() {
    await sendLibp2pMessage("libp2p.stop");
  }
  async function dialLibp2pPeer() {
    const peerInput = $("libp2p-peer-input");
    const target = peerInput?.value.trim();
    if (!target) {
      state.libp2p.lastError = "Enter a libp2p multiaddr first.";
      renderLibp2p();
      return;
    }
    await sendLibp2pMessage("libp2p.dial", target);
  }
  async function bootstrapLibp2pNode() {
    const input = $("libp2p-bootstrap-input");
    const raw = input?.value || "";
    const addrs = raw.split(/\r?\n|,/).map((addr) => addr.trim()).filter(Boolean);
    if (!addrs.length) {
      state.libp2p.lastBootstrapError = "Add at least one bootstrap multiaddr.";
      renderLibp2p();
      return;
    }
    await sendLibp2pMessage("libp2p.bootstrap", addrs);
  }
  async function bindLibp2pIdentity() {
    await sendLibp2pMessage("libp2p.bindIdentity");
  }
  async function clearLibp2pBinding() {
    await sendLibp2pMessage("libp2p.clearBinding");
  }
  async function copyLibp2pBinding() {
    const payload = state.libp2p.attestation;
    if (!payload) return;
    const text = JSON.stringify(payload, null, 2);
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    await api.runtime.sendMessage({ kind: "copy", payload: text });
  }
  async function copyRelayDescriptor() {
    const descriptor = state.libp2p.relayDescriptor;
    if (!descriptor) return;
    const text = JSON.stringify(descriptor, null, 2);
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    await api.runtime.sendMessage({ kind: "copy", payload: text });
  }
  async function subscribePubsubTopic() {
    const input = $("libp2p-topic-input");
    const topic = input?.value.trim();
    if (!topic) {
      state.libp2p.lastPubsubError = "Enter a topic first.";
      renderLibp2p();
      return;
    }
    await sendLibp2pMessage("libp2p.subscribeTopic", topic);
  }
  async function unsubscribePubsubTopic() {
    const input = $("libp2p-topic-input");
    const topic = input?.value.trim();
    if (!topic) {
      state.libp2p.lastPubsubError = "Enter a topic first.";
      renderLibp2p();
      return;
    }
    await sendLibp2pMessage("libp2p.unsubscribeTopic", topic);
  }
  async function publishPubsubMessage() {
    const topicInput = $("libp2p-topic-input");
    const publishInput = $("libp2p-publish-input");
    const topic = topicInput?.value.trim();
    const data = publishInput?.value || "";
    if (!topic) {
      state.libp2p.lastPubsubError = "Enter a topic first.";
      renderLibp2p();
      return;
    }
    await sendLibp2pMessage("libp2p.publishTopic", { topic, data });
  }
  async function pingAllPeersNow() {
    await sendLibp2pMessage("libp2p.pingAll");
  }
  async function updateAutoPing() {
    const toggle = $("libp2p-auto-ping-toggle");
    const intervalInput = $("libp2p-auto-ping-interval");
    const enabled = toggle?.checked ?? false;
    const interval = Math.max(1, Math.min(3600, Math.floor(Number(intervalInput?.value) || 1)));
    await sendLibp2pMessage("libp2p.setAutoPing", { enabled, interval });
  }
  function handleRuntimeMessage(message) {
    if (message?.kind === "libp2p.statusUpdate") {
      applyStatusUpdate(message.payload);
    }
  }
  async function init() {
    api.runtime.onMessage.addListener(handleRuntimeMessage);
    await reloadFeatures();
    const statusResponse = await sendLibp2pMessage("libp2p.status");
    if (statusResponse?.status) {
      applyStatusUpdate(statusResponse.status);
    }
    $("libp2p-start-btn")?.addEventListener("click", async () => {
      await startLibp2pNode();
    });
    $("libp2p-stop-btn")?.addEventListener("click", async () => {
      await stopLibp2pNode();
    });
    $("libp2p-dial-btn")?.addEventListener("click", async () => {
      await dialLibp2pPeer();
    });
    $("libp2p-bind-btn")?.addEventListener("click", async () => {
      await bindLibp2pIdentity();
    });
    $("libp2p-bootstrap-btn")?.addEventListener("click", async () => {
      await bootstrapLibp2pNode();
    });
    $("libp2p-copy-bind-btn")?.addEventListener("click", async () => {
      await copyLibp2pBinding();
    });
    $("libp2p-copy-relay-btn")?.addEventListener("click", async () => {
      await copyRelayDescriptor();
    });
    $("libp2p-clear-bind-btn")?.addEventListener("click", async () => {
      await clearLibp2pBinding();
    });
    $("libp2p-subscribe-btn")?.addEventListener("click", async () => {
      await subscribePubsubTopic();
    });
    $("libp2p-unsubscribe-btn")?.addEventListener("click", async () => {
      await unsubscribePubsubTopic();
    });
    $("libp2p-publish-btn")?.addEventListener("click", async () => {
      await publishPubsubMessage();
    });
    $("libp2p-publish-input")?.addEventListener("keydown", async (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        await publishPubsubMessage();
      }
    });
    $("libp2p-peer-input")?.addEventListener("keydown", async (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        await dialLibp2pPeer();
      }
    });
    $("libp2p-auto-ping-toggle")?.addEventListener("change", async () => {
      await updateAutoPing();
    });
    $("libp2p-ping-all-btn")?.addEventListener("click", async () => {
      await pingAllPeersNow();
    });
    $("libp2p-auto-ping-interval")?.addEventListener("change", async () => {
      await updateAutoPing();
    });
  }
  document.addEventListener("DOMContentLoaded", init);
  document.getElementById("close-btn")?.addEventListener("click", () => {
    window.close();
  });
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uLy4uL3NyYy9leHBlcmltZW50YWwvZXhwZXJpbWVudGFsLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIEJyb3dzZXIgQVBJIGNvbXBhdGliaWxpdHkgbGF5ZXIgZm9yIENocm9tZSAvIFNhZmFyaSAvIEZpcmVmb3guXG4gKlxuICogU2FmYXJpIGFuZCBGaXJlZm94IGV4cG9zZSBgYnJvd3Nlci4qYCAoUHJvbWlzZS1iYXNlZCwgV2ViRXh0ZW5zaW9uIHN0YW5kYXJkKS5cbiAqIENocm9tZSBleHBvc2VzIGBjaHJvbWUuKmAgKGNhbGxiYWNrLWJhc2VkIGhpc3RvcmljYWxseSwgYnV0IE1WMyBzdXBwb3J0c1xuICogcHJvbWlzZXMgb24gbW9zdCBBUElzKS4gSW4gYSBzZXJ2aWNlLXdvcmtlciBjb250ZXh0IGBicm93c2VyYCBpcyB1bmRlZmluZWRcbiAqIG9uIENocm9tZSwgc28gd2Ugbm9ybWFsaXNlIGV2ZXJ5dGhpbmcgaGVyZS5cbiAqXG4gKiBVc2FnZTogIGltcG9ydCB7IGFwaSB9IGZyb20gJy4vdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwnO1xuICogICAgICAgICBhcGkucnVudGltZS5zZW5kTWVzc2FnZSguLi4pXG4gKlxuICogVGhlIGV4cG9ydGVkIGBhcGlgIG9iamVjdCBtaXJyb3JzIHRoZSBzdWJzZXQgb2YgdGhlIFdlYkV4dGVuc2lvbiBBUEkgdGhhdFxuICogTm9zdHJLZXkgYWN0dWFsbHkgdXNlcywgd2l0aCBldmVyeSBtZXRob2QgcmV0dXJuaW5nIGEgUHJvbWlzZS5cbiAqL1xuXG4vLyBEZXRlY3Qgd2hpY2ggZ2xvYmFsIG5hbWVzcGFjZSBpcyBhdmFpbGFibGUuXG5jb25zdCBfYnJvd3NlciA9XG4gICAgdHlwZW9mIGJyb3dzZXIgIT09ICd1bmRlZmluZWQnID8gYnJvd3NlciA6XG4gICAgdHlwZW9mIGNocm9tZSAgIT09ICd1bmRlZmluZWQnID8gY2hyb21lICA6XG4gICAgbnVsbDtcblxuaWYgKCFfYnJvd3Nlcikge1xuICAgIHRocm93IG5ldyBFcnJvcignYnJvd3Nlci1wb2x5ZmlsbDogTm8gZXh0ZW5zaW9uIEFQSSBuYW1lc3BhY2UgZm91bmQgKG5laXRoZXIgYnJvd3NlciBub3IgY2hyb21lKS4nKTtcbn1cblxuLyoqXG4gKiBUcnVlIHdoZW4gcnVubmluZyBvbiBDaHJvbWUgKG9yIGFueSBDaHJvbWl1bS1iYXNlZCBicm93c2VyIHRoYXQgb25seVxuICogZXhwb3NlcyB0aGUgYGNocm9tZWAgbmFtZXNwYWNlKS5cbiAqL1xuY29uc3QgaXNDaHJvbWUgPSB0eXBlb2YgYnJvd3NlciA9PT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNocm9tZSAhPT0gJ3VuZGVmaW5lZCc7XG5cbi8qKlxuICogV3JhcCBhIENocm9tZSBjYWxsYmFjay1zdHlsZSBtZXRob2Qgc28gaXQgcmV0dXJucyBhIFByb21pc2UuXG4gKiBJZiB0aGUgbWV0aG9kIGFscmVhZHkgcmV0dXJucyBhIHByb21pc2UgKE1WMykgd2UganVzdCBwYXNzIHRocm91Z2guXG4gKi9cbmZ1bmN0aW9uIHByb21pc2lmeShjb250ZXh0LCBtZXRob2QpIHtcbiAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgLy8gTVYzIENocm9tZSBBUElzIHJldHVybiBwcm9taXNlcyB3aGVuIG5vIGNhbGxiYWNrIGlzIHN1cHBsaWVkLlxuICAgICAgICAvLyBXZSB0cnkgdGhlIHByb21pc2UgcGF0aCBmaXJzdDsgaWYgdGhlIHJ1bnRpbWUgc2lnbmFscyBhbiBlcnJvclxuICAgICAgICAvLyB2aWEgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yIGluc2lkZSBhIGNhbGxiYWNrIHdlIGNhdGNoIHRoYXQgdG9vLlxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gbWV0aG9kLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgICAvLyBmYWxsIHRocm91Z2ggdG8gY2FsbGJhY2sgd3JhcHBpbmdcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBtZXRob2QuYXBwbHkoY29udGV4dCwgW1xuICAgICAgICAgICAgICAgIC4uLmFyZ3MsXG4gICAgICAgICAgICAgICAgKC4uLmNiQXJncykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2Jyb3dzZXIucnVudGltZSAmJiBfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGNiQXJncy5sZW5ndGggPD0gMSA/IGNiQXJnc1swXSA6IGNiQXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQnVpbGQgdGhlIHVuaWZpZWQgYGFwaWAgb2JqZWN0XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuY29uc3QgYXBpID0ge307XG5cbi8vIC0tLSBydW50aW1lIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnJ1bnRpbWUgPSB7XG4gICAgLyoqXG4gICAgICogc2VuZE1lc3NhZ2UgXHUyMDEzIGFsd2F5cyByZXR1cm5zIGEgUHJvbWlzZS5cbiAgICAgKi9cbiAgICBzZW5kTWVzc2FnZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIucnVudGltZSwgX2Jyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSkoLi4uYXJncyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uTWVzc2FnZSBcdTIwMTMgdGhpbiB3cmFwcGVyIHNvIGNhbGxlcnMgdXNlIGEgY29uc2lzdGVudCByZWZlcmVuY2UuXG4gICAgICogVGhlIGxpc3RlbmVyIHNpZ25hdHVyZSBpcyAobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpLlxuICAgICAqIE9uIENocm9tZSB0aGUgbGlzdGVuZXIgY2FuIHJldHVybiBgdHJ1ZWAgdG8ga2VlcCB0aGUgY2hhbm5lbCBvcGVuLFxuICAgICAqIG9yIHJldHVybiBhIFByb21pc2UgKE1WMykuICBTYWZhcmkgLyBGaXJlZm94IGV4cGVjdCBhIFByb21pc2UgcmV0dXJuLlxuICAgICAqL1xuICAgIG9uTWVzc2FnZTogX2Jyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UsXG5cbiAgICAvKipcbiAgICAgKiBnZXRVUkwgXHUyMDEzIHN5bmNocm9ub3VzIG9uIGFsbCBicm93c2Vycy5cbiAgICAgKi9cbiAgICBnZXRVUkwocGF0aCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5nZXRVUkwocGF0aCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9wZW5PcHRpb25zUGFnZVxuICAgICAqL1xuICAgIG9wZW5PcHRpb25zUGFnZSgpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUub3Blbk9wdGlvbnNQYWdlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5ydW50aW1lLCBfYnJvd3Nlci5ydW50aW1lLm9wZW5PcHRpb25zUGFnZSkoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXhwb3NlIHRoZSBpZCBmb3IgY29udmVuaWVuY2UuXG4gICAgICovXG4gICAgZ2V0IGlkKCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5pZDtcbiAgICB9LFxufTtcblxuLy8gLS0tIHN0b3JhZ2UubG9jYWwgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkuc3RvcmFnZSA9IHtcbiAgICBsb2NhbDoge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICAvLyAtLS0gc3RvcmFnZS5zeW5jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBOdWxsIHdoZW4gdGhlIGJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IHN5bmMgKG9sZGVyIFNhZmFyaSwgZXRjLilcbiAgICBzeW5jOiBfYnJvd3Nlci5zdG9yYWdlPy5zeW5jID8ge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuc2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBnZXRCeXRlc0luVXNlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpIHtcbiAgICAgICAgICAgICAgICAvLyBTYWZhcmkgZG9lc24ndCBzdXBwb3J0IGdldEJ5dGVzSW5Vc2UgXHUyMDE0IHJldHVybiAwXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0gOiBudWxsLFxuXG4gICAgLy8gLS0tIHN0b3JhZ2Uuc2Vzc2lvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gTVYzIGluLW1lbW9yeSBhcmVhIHRoYXQgc3Vydml2ZXMgc2VydmljZS13b3JrZXIgZXZpY3Rpb24gYnV0IG5ldmVyIHRvdWNoZXNcbiAgICAvLyBkaXNrLiBOdWxsIG9uIGVuZ2luZXMgdGhhdCBkb24ndCBpbXBsZW1lbnQgaXQgKFNhZmFyaSBiYWNrZ3JvdW5kIHBhZ2UsXG4gICAgLy8gb2xkZXIgRmlyZWZveCkgXHUyMDE0IGNhbGxlcnMgbXVzdCBmZWF0dXJlLWRldGVjdCBhbmQgZmFsbCBiYWNrLlxuICAgIHNlc3Npb246IF9icm93c2VyLnN0b3JhZ2U/LnNlc3Npb24gPyB7XG4gICAgICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLmdldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24sIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5jbGVhcikoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXN0cmljdCB0aGUgYXJlYSB0byBleHRlbnNpb24tcHJpdmlsZWdlZCBjb250ZXh0cy4gQ2hyb21lLW9ubHk7XG4gICAgICAgICAqIHJlc29sdmVzIGhhcm1sZXNzbHkgd2hlcmUgdGhlIG1ldGhvZCBpcyBhYnNlbnQuXG4gICAgICAgICAqL1xuICAgICAgICBzZXRBY2Nlc3NMZXZlbCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIV9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXRBY2Nlc3NMZXZlbCkgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uc2V0QWNjZXNzTGV2ZWwoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldEFjY2Vzc0xldmVsKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9IDogbnVsbCxcblxuICAgIC8vIC0tLSBzdG9yYWdlLm9uQ2hhbmdlZCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIG9uQ2hhbmdlZDogX2Jyb3dzZXIuc3RvcmFnZT8ub25DaGFuZ2VkIHx8IG51bGwsXG59O1xuXG4vLyAtLS0gdGFicyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS50YWJzID0ge1xuICAgIGNyZWF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmNyZWF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuY3JlYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHF1ZXJ5KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMucXVlcnkoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnF1ZXJ5KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMucmVtb3ZlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHVwZGF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnVwZGF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMudXBkYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmdldCguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuZ2V0KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldEN1cnJlbnQoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHNlbmRNZXNzYWdlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuc2VuZE1lc3NhZ2UoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnNlbmRNZXNzYWdlKSguLi5hcmdzKTtcbiAgICB9LFxufTtcblxuLy8gLS0tIGFsYXJtcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBjaHJvbWUuYWxhcm1zIHN1cnZpdmVzIE1WMyBzZXJ2aWNlLXdvcmtlciBldmljdGlvbjsgc2V0VGltZW91dCBkb2VzIG5vdC5cbmFwaS5hbGFybXMgPSBfYnJvd3Nlci5hbGFybXMgPyB7XG4gICAgY3JlYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgLy8gYWxhcm1zLmNyZWF0ZSBpcyBzeW5jaHJvbm91cyBvbiBDaHJvbWUsIHJldHVybnMgUHJvbWlzZSBvbiBGaXJlZm94L1NhZmFyaVxuICAgICAgICBjb25zdCByZXN1bHQgPSBfYnJvd3Nlci5hbGFybXMuY3JlYXRlKC4uLmFyZ3MpO1xuICAgICAgICByZXR1cm4gcmVzdWx0ICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gJ2Z1bmN0aW9uJyA/IHJlc3VsdCA6IFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH0sXG4gICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuYWxhcm1zLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuYWxhcm1zLCBfYnJvd3Nlci5hbGFybXMuY2xlYXIpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgb25BbGFybTogX2Jyb3dzZXIuYWxhcm1zLm9uQWxhcm0sXG59IDogbnVsbDtcblxuZXhwb3J0IHsgYXBpLCBpc0Nocm9tZSB9O1xuIiwgImltcG9ydCB7IGFwaSB9IGZyb20gJy4uL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsJztcblxuY29uc3QgRkVBVFVSRVMgPSBbXG4gICAgW1xuICAgICAgICAnbm9uZScsXG4gICAgICAgICdOSVAtWFg6IE5vbmUnLFxuICAgICAgICAnUmVzZXJ2ZWQgZm9yIHRoZSBmdXR1cmUgdXNlLicsXG4gICAgXSxcbl07XG5cbmNvbnN0ICQgPSAoaWQpID0+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcblxuY29uc3Qgc3RhdGUgPSB7XG4gICAgZmVhdHVyZXM6IFtdLFxuICAgIGxpYnAycDoge1xuICAgICAgICByZWFkeTogZmFsc2UsXG4gICAgICAgIHN0YXJ0aW5nOiBmYWxzZSxcbiAgICAgICAgc3RvcHBpbmc6IGZhbHNlLFxuICAgICAgICBiaW5kaW5nOiBmYWxzZSxcbiAgICAgICAgYm9vdHN0cmFwcGluZzogZmFsc2UsXG4gICAgICAgIHBlZXJJZDogJycsXG4gICAgICAgIHBlZXJJZFNob3J0OiAnJyxcbiAgICAgICAgYWN0aXZlUHVia2V5OiAnJyxcbiAgICAgICAgYWN0aXZlTnB1YjogJycsXG4gICAgICAgIGF0dGVzdGF0aW9uOiBudWxsLFxuICAgICAgICByZWxheURlc2NyaXB0b3I6IG51bGwsXG4gICAgICAgIGRlZmF1bHRCb290c3RyYXBBZGRyczogW10sXG4gICAgICAgIGRpc2NvdmVyeUJvb3RzdHJhcEFkZHJzOiBbXSxcbiAgICAgICAgYm9vdHN0cmFwQWRkcnM6IFtdLFxuICAgICAgICBsaXN0ZW5BZGRyczogW10sXG4gICAgICAgIHdlYnJ0Y0FkZHJzOiBbXSxcbiAgICAgICAgY29ubmVjdGlvbkNvdW50OiAwLFxuICAgICAgICBwdWJzdWJQZWVyczogW10sXG4gICAgICAgIHN1YnNjcmliZWRUb3BpY3M6IFtdLFxuICAgICAgICBwdWJzdWJNZXNzYWdlczogW10sXG4gICAgICAgIHBpbmdMb2c6IFtdLFxuICAgICAgICBhdXRvUGluZ0VuYWJsZWQ6IGZhbHNlLFxuICAgICAgICBhdXRvUGluZ0ludGVydmFsOiAxLFxuICAgICAgICBsYXN0RGlhbFRhcmdldDogJycsXG4gICAgICAgIGxhc3REaWFsUGVlcjogJycsXG4gICAgICAgIGxhc3RQaW5nTGF0ZW5jeTogJycsXG4gICAgICAgIGxhc3RCaW5kRXJyb3I6ICcnLFxuICAgICAgICBsYXN0Qm9vdHN0cmFwRXJyb3I6ICcnLFxuICAgICAgICBsYXN0RXJyb3I6ICcnLFxuICAgICAgICBsb2dzOiBbXSxcbiAgICB9LFxufTtcblxuZnVuY3Rpb24gZXNjYXBlSHRtbCh2YWx1ZSkge1xuICAgIHJldHVybiBTdHJpbmcodmFsdWUpXG4gICAgICAgIC5yZXBsYWNlQWxsKCcmJywgJyZhbXA7JylcbiAgICAgICAgLnJlcGxhY2VBbGwoJzwnLCAnJmx0OycpXG4gICAgICAgIC5yZXBsYWNlQWxsKCc+JywgJyZndDsnKVxuICAgICAgICAucmVwbGFjZUFsbCgnXCInLCAnJnF1b3Q7JylcbiAgICAgICAgLnJlcGxhY2VBbGwoXCInXCIsICcmIzM5OycpO1xufVxuXG5mdW5jdGlvbiBzaG9ydFZhbHVlKHZhbHVlLCBoZWFkID0gMTAsIHRhaWwgPSA4KSB7XG4gICAgaWYgKCF2YWx1ZSkgcmV0dXJuICcnO1xuICAgIGlmICh2YWx1ZS5sZW5ndGggPD0gaGVhZCArIHRhaWwgKyAzKSByZXR1cm4gdmFsdWU7XG4gICAgcmV0dXJuIGAke3ZhbHVlLnNsaWNlKDAsIGhlYWQpfVx1MjAyNiR7dmFsdWUuc2xpY2UoLXRhaWwpfWA7XG59XG5cbmZ1bmN0aW9uIGFwcGx5U3RhdHVzVXBkYXRlKHN0YXR1cykge1xuICAgIGlmICghc3RhdHVzIHx8IHR5cGVvZiBzdGF0dXMgIT09ICdvYmplY3QnKSByZXR1cm47XG4gICAgc3RhdGUubGlicDJwID0geyAuLi5zdGF0ZS5saWJwMnAsIC4uLnN0YXR1cyB9O1xuICAgIHJlbmRlckxpYnAycCgpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzZW5kTGlicDJwTWVzc2FnZShraW5kLCBwYXlsb2FkKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQsIHBheWxvYWQgfSk7XG4gICAgICAgIGlmIChyZXNwb25zZT8uc3RhdHVzKSB7XG4gICAgICAgICAgICBhcHBseVN0YXR1c1VwZGF0ZShyZXNwb25zZS5zdGF0dXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICBzdGF0ZS5saWJwMnAubGFzdEVycm9yID0gbWVzc2FnZTtcbiAgICAgICAgcmVuZGVyTGlicDJwKCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogbWVzc2FnZSB9O1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVuZGVyRmVhdHVyZXMoKSB7XG4gICAgY29uc3QgY29udGFpbmVyID0gJCgnZmVhdHVyZXMtY29udGFpbmVyJyk7XG4gICAgaWYgKCFjb250YWluZXIpIHJldHVybjtcblxuICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSBzdGF0ZS5mZWF0dXJlcy5tYXAoKFtuYW1lLCBhY3RpdmUsIHNob3J0RGVzYywgbG9uZ0Rlc2NdKSA9PiBgXG4gICAgICAgIDxkaXYgY2xhc3M9XCJtdC00XCI+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICBjbGFzcz1cImNoZWNrYm94XCJcbiAgICAgICAgICAgICAgICB0eXBlPVwiY2hlY2tib3hcIlxuICAgICAgICAgICAgICAgIGlkPVwiJHtuYW1lfVwiXG4gICAgICAgICAgICAgICAgJHthY3RpdmUgPyAnY2hlY2tlZCcgOiAnJ31cbiAgICAgICAgICAgICAgICBkYXRhLWZlYXR1cmU9XCIke25hbWV9XCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPVwiJHtuYW1lfVwiIGNsYXNzPVwiZm9udC1ib2xkXCI+JHtzaG9ydERlc2N9PC9sYWJlbD5cbiAgICAgICAgICAgIDxwIGNsYXNzPVwiaXRhbGljXCI+JHtsb25nRGVzY308L3A+XG4gICAgICAgIDwvZGl2PlxuICAgIGApLmpvaW4oJycpO1xuXG4gICAgY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXScpLmZvckVhY2goKGNiKSA9PiB7XG4gICAgICAgIGNiLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGFzeW5jIChlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBmZWF0dXJlID0gZS50YXJnZXQuZGF0YXNldC5mZWF0dXJlO1xuICAgICAgICAgICAgY29uc3QgYWN0aXZlID0gZS50YXJnZXQuY2hlY2tlZDtcbiAgICAgICAgICAgIGF3YWl0IGFwaS5zdG9yYWdlLmxvY2FsLnNldCh7IFtmZWF0dXJlXTogYWN0aXZlIH0pO1xuICAgICAgICAgICAgYXdhaXQgcmVsb2FkRmVhdHVyZXMoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJlbG9hZEZlYXR1cmVzKCkge1xuICAgIHN0YXRlLmZlYXR1cmVzID0gYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgICAgIEZFQVRVUkVTLm1hcChhc3luYyAoW25hbWUsIHNob3J0RGVzYywgbG9uZ0Rlc2NdKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSBgZmVhdHVyZToke25hbWV9YDtcbiAgICAgICAgICAgIGNvbnN0IHN0b3JlZCA9IGF3YWl0IGFwaS5zdG9yYWdlLmxvY2FsLmdldCh7IFtrZXldOiBmYWxzZSB9KTtcbiAgICAgICAgICAgIHJldHVybiBba2V5LCBzdG9yZWRba2V5XSwgc2hvcnREZXNjLCBsb25nRGVzY107XG4gICAgICAgIH0pXG4gICAgKTtcbiAgICByZW5kZXJGZWF0dXJlcygpO1xufVxuXG5mdW5jdGlvbiByZW5kZXJMaWJwMnAoKSB7XG4gICAgY29uc3Qge1xuICAgICAgICByZWFkeSxcbiAgICAgICAgc3RhcnRpbmcsXG4gICAgICAgIHN0b3BwaW5nLFxuICAgICAgICBiaW5kaW5nLFxuICAgICAgICBib290c3RyYXBwaW5nLFxuICAgICAgICBwZWVySWQsXG4gICAgICAgIHBlZXJJZFNob3J0LFxuICAgICAgICBhY3RpdmVQdWJrZXksXG4gICAgICAgIGFjdGl2ZU5wdWIsXG4gICAgICAgIGF0dGVzdGF0aW9uLFxuICAgICAgICBsaXN0ZW5BZGRycyxcbiAgICAgICAgZGVmYXVsdEJvb3RzdHJhcEFkZHJzLFxuICAgICAgICBib290c3RyYXBBZGRycyxcbiAgICAgICAgY29ubmVjdGlvbkNvdW50LFxuICAgICAgICBsYXN0RGlhbFRhcmdldCxcbiAgICAgICAgbGFzdERpYWxQZWVyLFxuICAgICAgICBsYXN0UGluZ0xhdGVuY3ksXG4gICAgICAgIGxhc3RCaW5kRXJyb3IsXG4gICAgICAgIGxhc3RCb290c3RyYXBFcnJvcixcbiAgICAgICAgbGFzdEVycm9yLFxuICAgICAgICBsb2dzLFxuICAgIH0gPSBzdGF0ZS5saWJwMnA7XG5cbiAgICBjb25zdCBzdGF0dXNFbCA9ICQoJ2xpYnAycC1zdGF0dXMnKTtcbiAgICBpZiAoc3RhdHVzRWwpIHtcbiAgICAgICAgc3RhdHVzRWwudGV4dENvbnRlbnQgPSByZWFkeVxuICAgICAgICAgICAgPyAnUmVhZHknXG4gICAgICAgICAgICA6IHN0YXJ0aW5nXG4gICAgICAgICAgICAgICAgPyAnU3RhcnRpbmdcdTIwMjYnXG4gICAgICAgICAgICAgICAgOiBzdG9wcGluZ1xuICAgICAgICAgICAgICAgICAgICA/ICdTdG9wcGluZ1x1MjAyNidcbiAgICAgICAgICAgICAgICAgICAgOiAnU3RvcHBlZCc7XG4gICAgfVxuXG4gICAgY29uc3QgcGVlcklkRWwgPSAkKCdsaWJwMnAtcGVlci1pZCcpO1xuICAgIGlmIChwZWVySWRFbCkge1xuICAgICAgICBwZWVySWRFbC50ZXh0Q29udGVudCA9IHBlZXJJZFNob3J0IHx8IHBlZXJJZCB8fCAnTm90IHN0YXJ0ZWQnO1xuICAgIH1cblxuICAgIGNvbnN0IGxpc3RlbkFkZHJzRWwgPSAkKCdsaWJwMnAtbGlzdGVuLWFkZHJzJyk7XG4gICAgaWYgKGxpc3RlbkFkZHJzRWwpIHtcbiAgICAgICAgbGlzdGVuQWRkcnNFbC50ZXh0Q29udGVudCA9IGxpc3RlbkFkZHJzLmxlbmd0aCA/IGxpc3RlbkFkZHJzLmpvaW4oJ1xcbicpIDogJ05vIGFkdmVydGlzZWQgbGlzdGVuIGFkZHJlc3NlcyBpbiB0aGlzIGJyb3dzZXIgbm9kZS4nO1xuICAgIH1cblxuICAgIGNvbnN0IHdlYnJ0Y0FkZHJzRWwgPSAkKCdsaWJwMnAtd2VicnRjLWFkZHJzJyk7XG4gICAgaWYgKHdlYnJ0Y0FkZHJzRWwpIHtcbiAgICAgICAgd2VicnRjQWRkcnNFbC50ZXh0Q29udGVudCA9IHN0YXRlLmxpYnAycC53ZWJydGNBZGRycy5sZW5ndGhcbiAgICAgICAgICAgID8gc3RhdGUubGlicDJwLndlYnJ0Y0FkZHJzLmpvaW4oJ1xcbicpXG4gICAgICAgICAgICA6ICdObyBXZWJSVEMgbGlzdGVuIGFkZHJlc3NlcyB5ZXQgKHJlcXVpcmVzIGEgcmVsYXkgcmVzZXJ2YXRpb24pLic7XG4gICAgfVxuXG4gICAgY29uc3QgZGVmYXVsdEJvb3RzdHJhcEVsID0gJCgnbGlicDJwLWRlZmF1bHQtYm9vdHN0cmFwJyk7XG4gICAgaWYgKGRlZmF1bHRCb290c3RyYXBFbCkge1xuICAgICAgICBkZWZhdWx0Qm9vdHN0cmFwRWwudGV4dENvbnRlbnQgPSBkZWZhdWx0Qm9vdHN0cmFwQWRkcnMubGVuZ3RoXG4gICAgICAgICAgICA/IGRlZmF1bHRCb290c3RyYXBBZGRycy5qb2luKCdcXG4nKVxuICAgICAgICAgICAgOiAnTm8gZGVmYXVsdCBXU1MgYm9vdHN0cmFwIHJlbGF5cyBjb25maWd1cmVkLic7XG4gICAgfVxuXG4gICAgY29uc3QgZGlzY292ZXJ5Qm9vdHN0cmFwRWwgPSAkKCdsaWJwMnAtZGlzY292ZXJ5LWJvb3RzdHJhcCcpO1xuICAgIGlmIChkaXNjb3ZlcnlCb290c3RyYXBFbCkge1xuICAgICAgICBkaXNjb3ZlcnlCb290c3RyYXBFbC50ZXh0Q29udGVudCA9IHN0YXRlLmxpYnAycC5kaXNjb3ZlcnlCb290c3RyYXBBZGRycy5sZW5ndGhcbiAgICAgICAgICAgID8gc3RhdGUubGlicDJwLmRpc2NvdmVyeUJvb3RzdHJhcEFkZHJzLmpvaW4oJ1xcbicpXG4gICAgICAgICAgICA6ICdObyBjYW5vbmljYWwgbGlicDJwIGJvb3RzdHJhcCByZWxheXMgY29uZmlndXJlZC4nO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbm5lY3Rpb25Db3VudEVsID0gJCgnbGlicDJwLWNvbm5lY3Rpb24tY291bnQnKTtcbiAgICBpZiAoY29ubmVjdGlvbkNvdW50RWwpIHtcbiAgICAgICAgY29ubmVjdGlvbkNvdW50RWwudGV4dENvbnRlbnQgPSBTdHJpbmcoY29ubmVjdGlvbkNvdW50KTtcbiAgICB9XG5cbiAgICBjb25zdCBsYXN0RGlhbFRhcmdldEVsID0gJCgnbGlicDJwLWxhc3QtZGlhbC10YXJnZXQnKTtcbiAgICBpZiAobGFzdERpYWxUYXJnZXRFbCkge1xuICAgICAgICBsYXN0RGlhbFRhcmdldEVsLnRleHRDb250ZW50ID0gbGFzdERpYWxUYXJnZXQgfHwgJ1x1MjAxNCc7XG4gICAgfVxuXG4gICAgY29uc3QgbGFzdERpYWxQZWVyRWwgPSAkKCdsaWJwMnAtbGFzdC1kaWFsLXBlZXInKTtcbiAgICBpZiAobGFzdERpYWxQZWVyRWwpIHtcbiAgICAgICAgbGFzdERpYWxQZWVyRWwudGV4dENvbnRlbnQgPSBsYXN0RGlhbFBlZXIgfHwgJ1x1MjAxNCc7XG4gICAgfVxuXG4gICAgY29uc3QgbGFzdFBpbmdFbCA9ICQoJ2xpYnAycC1sYXN0LXBpbmcnKTtcbiAgICBpZiAobGFzdFBpbmdFbCkge1xuICAgICAgICBsYXN0UGluZ0VsLnRleHRDb250ZW50ID0gbGFzdFBpbmdMYXRlbmN5IHx8ICdcdTIwMTQnO1xuICAgIH1cblxuICAgIGNvbnN0IGVycm9yRWwgPSAkKCdsaWJwMnAtZXJyb3InKTtcbiAgICBpZiAoZXJyb3JFbCkge1xuICAgICAgICBlcnJvckVsLnRleHRDb250ZW50ID0gbGFzdEVycm9yIHx8ICcnO1xuICAgICAgICBlcnJvckVsLmNsYXNzTGlzdC50b2dnbGUoJ2hpZGRlbicsICFsYXN0RXJyb3IpO1xuICAgIH1cblxuICAgIGNvbnN0IGJpbmRFcnJvckVsID0gJCgnbGlicDJwLWJpbmQtZXJyb3InKTtcbiAgICBpZiAoYmluZEVycm9yRWwpIHtcbiAgICAgICAgYmluZEVycm9yRWwudGV4dENvbnRlbnQgPSBsYXN0QmluZEVycm9yIHx8ICcnO1xuICAgICAgICBiaW5kRXJyb3JFbC5jbGFzc0xpc3QudG9nZ2xlKCdoaWRkZW4nLCAhbGFzdEJpbmRFcnJvcik7XG4gICAgfVxuXG4gICAgY29uc3QgYm9vdHN0cmFwRXJyb3JFbCA9ICQoJ2xpYnAycC1ib290c3RyYXAtZXJyb3InKTtcbiAgICBpZiAoYm9vdHN0cmFwRXJyb3JFbCkge1xuICAgICAgICBib290c3RyYXBFcnJvckVsLnRleHRDb250ZW50ID0gbGFzdEJvb3RzdHJhcEVycm9yIHx8ICcnO1xuICAgICAgICBib290c3RyYXBFcnJvckVsLmNsYXNzTGlzdC50b2dnbGUoJ2hpZGRlbicsICFsYXN0Qm9vdHN0cmFwRXJyb3IpO1xuICAgIH1cblxuICAgIGNvbnN0IGFjdGl2ZVB1YmtleUVsID0gJCgnbGlicDJwLWFjdGl2ZS1wdWJrZXknKTtcbiAgICBpZiAoYWN0aXZlUHVia2V5RWwpIHtcbiAgICAgICAgYWN0aXZlUHVia2V5RWwudGV4dENvbnRlbnQgPSBhY3RpdmVQdWJrZXkgPyBzaG9ydFZhbHVlKGFjdGl2ZVB1YmtleSwgMTYsIDEyKSA6ICdOb3QgYm91bmQnO1xuICAgIH1cblxuICAgIGNvbnN0IGFjdGl2ZU5wdWJFbCA9ICQoJ2xpYnAycC1hY3RpdmUtbnB1YicpO1xuICAgIGlmIChhY3RpdmVOcHViRWwpIHtcbiAgICAgICAgYWN0aXZlTnB1YkVsLnRleHRDb250ZW50ID0gYWN0aXZlTnB1YiB8fCAnTm90IGJvdW5kJztcbiAgICB9XG5cbiAgICBjb25zdCBhdHRlc3RhdGlvbkVsID0gJCgnbGlicDJwLWF0dGVzdGF0aW9uJyk7XG4gICAgaWYgKGF0dGVzdGF0aW9uRWwpIHtcbiAgICAgICAgYXR0ZXN0YXRpb25FbC50ZXh0Q29udGVudCA9IGF0dGVzdGF0aW9uID8gSlNPTi5zdHJpbmdpZnkoYXR0ZXN0YXRpb24sIG51bGwsIDIpIDogJ05vIGF0dGVzdGF0aW9uIHlldC4nO1xuICAgIH1cblxuICAgIGNvbnN0IHJlbGF5RGVzY3JpcHRvckVsID0gJCgnbGlicDJwLXJlbGF5LWRlc2NyaXB0b3InKTtcbiAgICBpZiAocmVsYXlEZXNjcmlwdG9yRWwpIHtcbiAgICAgICAgcmVsYXlEZXNjcmlwdG9yRWwudGV4dENvbnRlbnQgPSBzdGF0ZS5saWJwMnAucmVsYXlEZXNjcmlwdG9yXG4gICAgICAgICAgICA/IEpTT04uc3RyaW5naWZ5KHN0YXRlLmxpYnAycC5yZWxheURlc2NyaXB0b3IsIG51bGwsIDIpXG4gICAgICAgICAgICA6ICdObyByZWxheSBkZXNjcmlwdG9yIHlldC4nO1xuICAgIH1cblxuICAgIGNvbnN0IGJpbmRTdGF0ZUVsID0gJCgnbGlicDJwLWJpbmQtc3RhdGUnKTtcbiAgICBpZiAoYmluZFN0YXRlRWwpIHtcbiAgICAgICAgYmluZFN0YXRlRWwudGV4dENvbnRlbnQgPSBiaW5kaW5nXG4gICAgICAgICAgICA/ICdCaW5kaW5nXHUyMDI2J1xuICAgICAgICAgICAgOiBhdHRlc3RhdGlvblxuICAgICAgICAgICAgICAgID8gJ0F0dGVzdGVkJ1xuICAgICAgICAgICAgICAgIDogJ1VuYm91bmQnO1xuICAgIH1cblxuICAgIGNvbnN0IGxvZ0VsID0gJCgnbGlicDJwLWxvZycpO1xuICAgIGlmIChsb2dFbCkge1xuICAgICAgICBsb2dFbC5pbm5lckhUTUwgPSBsb2dzLmxlbmd0aFxuICAgICAgICAgICAgPyBsb2dzLm1hcCgoeyB0cywga2luZCwgbWVzc2FnZSB9KSA9PiBgXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImxpYnAycC1sb2ctbGluZSBsaWJwMnAtbG9nLWxpbmUtLSR7a2luZH1cIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJsaWJwMnAtbG9nLXRzXCI+JHtlc2NhcGVIdG1sKHRzKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibGlicDJwLWxvZy1tc2dcIj4ke2VzY2FwZUh0bWwobWVzc2FnZSl9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgYCkuam9pbignJylcbiAgICAgICAgICAgIDogJzxkaXYgY2xhc3M9XCJsaWJwMnAtbG9nLWVtcHR5XCI+Tm8gYWN0aXZpdHkgeWV0LjwvZGl2Pic7XG4gICAgfVxuXG4gICAgY29uc3Qgc3RhcnRCdG4gPSAkKCdsaWJwMnAtc3RhcnQtYnRuJyk7XG4gICAgaWYgKHN0YXJ0QnRuKSB7XG4gICAgICAgIHN0YXJ0QnRuLmRpc2FibGVkID0gcmVhZHkgfHwgc3RhcnRpbmcgfHwgc3RvcHBpbmc7XG4gICAgfVxuXG4gICAgY29uc3Qgc3RvcEJ0biA9ICQoJ2xpYnAycC1zdG9wLWJ0bicpO1xuICAgIGlmIChzdG9wQnRuKSB7XG4gICAgICAgIHN0b3BCdG4uZGlzYWJsZWQgPSAhcmVhZHkgfHwgc3RvcHBpbmc7XG4gICAgfVxuXG4gICAgY29uc3QgZGlhbEJ0biA9ICQoJ2xpYnAycC1kaWFsLWJ0bicpO1xuICAgIGlmIChkaWFsQnRuKSB7XG4gICAgICAgIGRpYWxCdG4uZGlzYWJsZWQgPSAhcmVhZHkgfHwgc3RhcnRpbmcgfHwgc3RvcHBpbmc7XG4gICAgfVxuXG4gICAgY29uc3QgcGVlcklucHV0ID0gJCgnbGlicDJwLXBlZXItaW5wdXQnKTtcbiAgICBpZiAocGVlcklucHV0KSB7XG4gICAgICAgIHBlZXJJbnB1dC5kaXNhYmxlZCA9ICFyZWFkeSB8fCBzdGFydGluZyB8fCBzdG9wcGluZztcbiAgICB9XG5cbiAgICBjb25zdCBiaW5kQnRuID0gJCgnbGlicDJwLWJpbmQtYnRuJyk7XG4gICAgaWYgKGJpbmRCdG4pIHtcbiAgICAgICAgYmluZEJ0bi5kaXNhYmxlZCA9ICFyZWFkeSB8fCBzdGFydGluZyB8fCBzdG9wcGluZyB8fCBiaW5kaW5nO1xuICAgIH1cblxuICAgIGNvbnN0IGNvcHlCaW5kQnRuID0gJCgnbGlicDJwLWNvcHktYmluZC1idG4nKTtcbiAgICBpZiAoY29weUJpbmRCdG4pIHtcbiAgICAgICAgY29weUJpbmRCdG4uZGlzYWJsZWQgPSAhYXR0ZXN0YXRpb247XG4gICAgfVxuXG4gICAgY29uc3QgY2xlYXJCaW5kQnRuID0gJCgnbGlicDJwLWNsZWFyLWJpbmQtYnRuJyk7XG4gICAgaWYgKGNsZWFyQmluZEJ0bikge1xuICAgICAgICBjbGVhckJpbmRCdG4uZGlzYWJsZWQgPSAhYXR0ZXN0YXRpb24gJiYgIWFjdGl2ZVB1YmtleSAmJiAhYWN0aXZlTnB1YjtcbiAgICB9XG5cbiAgICBjb25zdCBjb3B5UmVsYXlCdG4gPSAkKCdsaWJwMnAtY29weS1yZWxheS1idG4nKTtcbiAgICBpZiAoY29weVJlbGF5QnRuKSB7XG4gICAgICAgIGNvcHlSZWxheUJ0bi5kaXNhYmxlZCA9ICFzdGF0ZS5saWJwMnAucmVsYXlEZXNjcmlwdG9yO1xuICAgIH1cblxuICAgIGNvbnN0IGJvb3RzdHJhcEJ0biA9ICQoJ2xpYnAycC1ib290c3RyYXAtYnRuJyk7XG4gICAgaWYgKGJvb3RzdHJhcEJ0bikge1xuICAgICAgICBib290c3RyYXBCdG4uZGlzYWJsZWQgPSAhcmVhZHkgfHwgc3RhcnRpbmcgfHwgc3RvcHBpbmcgfHwgYm9vdHN0cmFwcGluZztcbiAgICB9XG5cbiAgICBjb25zdCBib290c3RyYXBJbnB1dCA9ICQoJ2xpYnAycC1ib290c3RyYXAtaW5wdXQnKTtcbiAgICBpZiAoYm9vdHN0cmFwSW5wdXQpIHtcbiAgICAgICAgY29uc3QgbmV4dFZhbHVlID0gYm9vdHN0cmFwQWRkcnMuam9pbignXFxuJyk7XG4gICAgICAgIGlmIChkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSBib290c3RyYXBJbnB1dCAmJiBib290c3RyYXBJbnB1dC52YWx1ZSAhPT0gbmV4dFZhbHVlKSB7XG4gICAgICAgICAgICBib290c3RyYXBJbnB1dC52YWx1ZSA9IG5leHRWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBib290c3RyYXBJbnB1dC5kaXNhYmxlZCA9ICFyZWFkeSB8fCBzdGFydGluZyB8fCBzdG9wcGluZztcbiAgICB9XG5cbiAgICBjb25zdCBwdWJzdWJQZWVyc0VsID0gJCgnbGlicDJwLXB1YnN1Yi1wZWVycycpO1xuICAgIGlmIChwdWJzdWJQZWVyc0VsKSB7XG4gICAgICAgIHB1YnN1YlBlZXJzRWwudGV4dENvbnRlbnQgPSBzdGF0ZS5saWJwMnAucHVic3ViUGVlcnMubGVuZ3RoXG4gICAgICAgICAgICA/IHN0YXRlLmxpYnAycC5wdWJzdWJQZWVycy5qb2luKCdcXG4nKVxuICAgICAgICAgICAgOiAnTm8gcHVic3ViIHBlZXJzIHlldC4nO1xuICAgIH1cblxuICAgIGNvbnN0IHN1YnNjcmliZWRUb3BpY3NFbCA9ICQoJ2xpYnAycC1zdWJzY3JpYmVkLXRvcGljcycpO1xuICAgIGlmIChzdWJzY3JpYmVkVG9waWNzRWwpIHtcbiAgICAgICAgc3Vic2NyaWJlZFRvcGljc0VsLnRleHRDb250ZW50ID0gc3RhdGUubGlicDJwLnN1YnNjcmliZWRUb3BpY3MubGVuZ3RoXG4gICAgICAgICAgICA/IHN0YXRlLmxpYnAycC5zdWJzY3JpYmVkVG9waWNzLmpvaW4oJ1xcbicpXG4gICAgICAgICAgICA6ICdOb3Qgc3Vic2NyaWJlZCB0byBhbnkgdG9waWNzLic7XG4gICAgfVxuXG4gICAgY29uc3QgcHVic3ViTWVzc2FnZXNFbCA9ICQoJ2xpYnAycC1wdWJzdWItbWVzc2FnZXMnKTtcbiAgICBpZiAocHVic3ViTWVzc2FnZXNFbCkge1xuICAgICAgICBwdWJzdWJNZXNzYWdlc0VsLmlubmVySFRNTCA9IHN0YXRlLmxpYnAycC5wdWJzdWJNZXNzYWdlcy5sZW5ndGhcbiAgICAgICAgICAgID8gc3RhdGUubGlicDJwLnB1YnN1Yk1lc3NhZ2VzLm1hcCgoZW50cnkpID0+IGBcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibGlicDJwLWxvZy1saW5lXCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibGlicDJwLWxvZy10c1wiPiR7ZXNjYXBlSHRtbChlbnRyeS50cyl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImxpYnAycC1sb2ctbXNnXCI+WyR7ZXNjYXBlSHRtbChlbnRyeS50b3BpYyl9XSAke2VzY2FwZUh0bWwoZW50cnkuZnJvbSl9OiAke2VzY2FwZUh0bWwoZW50cnkuZGF0YSl9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgYCkuam9pbignJylcbiAgICAgICAgICAgIDogJzxkaXYgY2xhc3M9XCJsaWJwMnAtbG9nLWVtcHR5XCI+Tm8gcHVic3ViIG1lc3NhZ2VzIHlldC48L2Rpdj4nO1xuICAgIH1cblxuICAgIGNvbnN0IHBpbmdMb2dFbCA9ICQoJ2xpYnAycC1waW5nLWxvZycpO1xuICAgIGlmIChwaW5nTG9nRWwpIHtcbiAgICAgICAgcGluZ0xvZ0VsLmlubmVySFRNTCA9IHN0YXRlLmxpYnAycC5waW5nTG9nLmxlbmd0aFxuICAgICAgICAgICAgPyBzdGF0ZS5saWJwMnAucGluZ0xvZy5tYXAoKGVudHJ5KSA9PiBgXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImxpYnAycC1sb2ctbGluZSAke2VudHJ5Lm9rID8gJycgOiAnbGlicDJwLWxvZy1saW5lLS13YXJuJ31cIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJsaWJwMnAtbG9nLXRzXCI+JHtlc2NhcGVIdG1sKGVudHJ5LnRzKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibGlicDJwLWxvZy1tc2dcIj4ke2VzY2FwZUh0bWwoZW50cnkucGVlcil9ICR7ZW50cnkub2sgPyBgJHtlbnRyeS5sYXRlbmN5fSBtc2AgOiBgZmFpbGVkOiAke2VudHJ5LmVycm9yfWB9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgYCkuam9pbignJylcbiAgICAgICAgICAgIDogJzxkaXYgY2xhc3M9XCJsaWJwMnAtbG9nLWVtcHR5XCI+Tm8gcGluZ3MgeWV0LiBDb25uZWN0IHRvIGEgcGVlciBhbmQgZW5hYmxlIGF1dG8tcGluZywgb3IgcHJlc3MgUGluZyBhbGwuPC9kaXY+JztcbiAgICB9XG5cbiAgICBjb25zdCBwaW5nQWxsQnRuID0gJCgnbGlicDJwLXBpbmctYWxsLWJ0bicpO1xuICAgIGlmIChwaW5nQWxsQnRuKSB7XG4gICAgICAgIHBpbmdBbGxCdG4uZGlzYWJsZWQgPSAhcmVhZHkgfHwgc3RhcnRpbmcgfHwgc3RvcHBpbmc7XG4gICAgfVxuXG4gICAgY29uc3QgcHVic3ViRXJyb3JFbCA9ICQoJ2xpYnAycC1wdWJzdWItZXJyb3InKTtcbiAgICBpZiAocHVic3ViRXJyb3JFbCkge1xuICAgICAgICBwdWJzdWJFcnJvckVsLnRleHRDb250ZW50ID0gc3RhdGUubGlicDJwLmxhc3RQdWJzdWJFcnJvciB8fCAnJztcbiAgICAgICAgcHVic3ViRXJyb3JFbC5jbGFzc0xpc3QudG9nZ2xlKCdoaWRkZW4nLCAhc3RhdGUubGlicDJwLmxhc3RQdWJzdWJFcnJvcik7XG4gICAgfVxuXG4gICAgY29uc3Qgc3Vic2NyaWJlQnRuID0gJCgnbGlicDJwLXN1YnNjcmliZS1idG4nKTtcbiAgICBpZiAoc3Vic2NyaWJlQnRuKSB7XG4gICAgICAgIHN1YnNjcmliZUJ0bi5kaXNhYmxlZCA9ICFyZWFkeSB8fCBzdGFydGluZyB8fCBzdG9wcGluZztcbiAgICB9XG5cbiAgICBjb25zdCB1bnN1YnNjcmliZUJ0biA9ICQoJ2xpYnAycC11bnN1YnNjcmliZS1idG4nKTtcbiAgICBpZiAodW5zdWJzY3JpYmVCdG4pIHtcbiAgICAgICAgdW5zdWJzY3JpYmVCdG4uZGlzYWJsZWQgPSAhcmVhZHkgfHwgc3RhcnRpbmcgfHwgc3RvcHBpbmc7XG4gICAgfVxuXG4gICAgY29uc3QgcHVibGlzaEJ0biA9ICQoJ2xpYnAycC1wdWJsaXNoLWJ0bicpO1xuICAgIGlmIChwdWJsaXNoQnRuKSB7XG4gICAgICAgIHB1Ymxpc2hCdG4uZGlzYWJsZWQgPSAhcmVhZHkgfHwgc3RhcnRpbmcgfHwgc3RvcHBpbmc7XG4gICAgfVxuXG4gICAgY29uc3QgdG9waWNJbnB1dCA9ICQoJ2xpYnAycC10b3BpYy1pbnB1dCcpO1xuICAgIGlmICh0b3BpY0lucHV0KSB7XG4gICAgICAgIHRvcGljSW5wdXQuZGlzYWJsZWQgPSAhcmVhZHkgfHwgc3RhcnRpbmcgfHwgc3RvcHBpbmc7XG4gICAgfVxuXG4gICAgY29uc3QgcHVibGlzaElucHV0ID0gJCgnbGlicDJwLXB1Ymxpc2gtaW5wdXQnKTtcbiAgICBpZiAocHVibGlzaElucHV0KSB7XG4gICAgICAgIHB1Ymxpc2hJbnB1dC5kaXNhYmxlZCA9ICFyZWFkeSB8fCBzdGFydGluZyB8fCBzdG9wcGluZztcbiAgICB9XG5cbiAgICBjb25zdCBhdXRvUGluZ1RvZ2dsZSA9ICQoJ2xpYnAycC1hdXRvLXBpbmctdG9nZ2xlJyk7XG4gICAgaWYgKGF1dG9QaW5nVG9nZ2xlKSB7XG4gICAgICAgIGF1dG9QaW5nVG9nZ2xlLmNoZWNrZWQgPSBzdGF0ZS5saWJwMnAuYXV0b1BpbmdFbmFibGVkO1xuICAgIH1cblxuICAgIGNvbnN0IGF1dG9QaW5nSW50ZXJ2YWwgPSAkKCdsaWJwMnAtYXV0by1waW5nLWludGVydmFsJyk7XG4gICAgaWYgKGF1dG9QaW5nSW50ZXJ2YWwpIHtcbiAgICAgICAgYXV0b1BpbmdJbnRlcnZhbC52YWx1ZSA9IFN0cmluZyhzdGF0ZS5saWJwMnAuYXV0b1BpbmdJbnRlcnZhbCk7XG4gICAgICAgIGF1dG9QaW5nSW50ZXJ2YWwuZGlzYWJsZWQgPSAhc3RhdGUubGlicDJwLmF1dG9QaW5nRW5hYmxlZDtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHN0YXJ0TGlicDJwTm9kZSgpIHtcbiAgICBhd2FpdCBzZW5kTGlicDJwTWVzc2FnZSgnbGlicDJwLnN0YXJ0Jyk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHN0b3BMaWJwMnBOb2RlKCkge1xuICAgIGF3YWl0IHNlbmRMaWJwMnBNZXNzYWdlKCdsaWJwMnAuc3RvcCcpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBkaWFsTGlicDJwUGVlcigpIHtcbiAgICBjb25zdCBwZWVySW5wdXQgPSAkKCdsaWJwMnAtcGVlci1pbnB1dCcpO1xuICAgIGNvbnN0IHRhcmdldCA9IHBlZXJJbnB1dD8udmFsdWUudHJpbSgpO1xuICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgIHN0YXRlLmxpYnAycC5sYXN0RXJyb3IgPSAnRW50ZXIgYSBsaWJwMnAgbXVsdGlhZGRyIGZpcnN0Lic7XG4gICAgICAgIHJlbmRlckxpYnAycCgpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGF3YWl0IHNlbmRMaWJwMnBNZXNzYWdlKCdsaWJwMnAuZGlhbCcsIHRhcmdldCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGJvb3RzdHJhcExpYnAycE5vZGUoKSB7XG4gICAgY29uc3QgaW5wdXQgPSAkKCdsaWJwMnAtYm9vdHN0cmFwLWlucHV0Jyk7XG4gICAgY29uc3QgcmF3ID0gaW5wdXQ/LnZhbHVlIHx8ICcnO1xuICAgIGNvbnN0IGFkZHJzID0gcmF3XG4gICAgICAgIC5zcGxpdCgvXFxyP1xcbnwsLylcbiAgICAgICAgLm1hcCgoYWRkcikgPT4gYWRkci50cmltKCkpXG4gICAgICAgIC5maWx0ZXIoQm9vbGVhbik7XG5cbiAgICBpZiAoIWFkZHJzLmxlbmd0aCkge1xuICAgICAgICBzdGF0ZS5saWJwMnAubGFzdEJvb3RzdHJhcEVycm9yID0gJ0FkZCBhdCBsZWFzdCBvbmUgYm9vdHN0cmFwIG11bHRpYWRkci4nO1xuICAgICAgICByZW5kZXJMaWJwMnAoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGF3YWl0IHNlbmRMaWJwMnBNZXNzYWdlKCdsaWJwMnAuYm9vdHN0cmFwJywgYWRkcnMpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBiaW5kTGlicDJwSWRlbnRpdHkoKSB7XG4gICAgYXdhaXQgc2VuZExpYnAycE1lc3NhZ2UoJ2xpYnAycC5iaW5kSWRlbnRpdHknKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gY2xlYXJMaWJwMnBCaW5kaW5nKCkge1xuICAgIGF3YWl0IHNlbmRMaWJwMnBNZXNzYWdlKCdsaWJwMnAuY2xlYXJCaW5kaW5nJyk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNvcHlMaWJwMnBCaW5kaW5nKCkge1xuICAgIGNvbnN0IHBheWxvYWQgPSBzdGF0ZS5saWJwMnAuYXR0ZXN0YXRpb247XG4gICAgaWYgKCFwYXlsb2FkKSByZXR1cm47XG4gICAgY29uc3QgdGV4dCA9IEpTT04uc3RyaW5naWZ5KHBheWxvYWQsIG51bGwsIDIpO1xuICAgIGlmIChuYXZpZ2F0b3IuY2xpcGJvYXJkPy53cml0ZVRleHQpIHtcbiAgICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGV4dCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAnY29weScsIHBheWxvYWQ6IHRleHQgfSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNvcHlSZWxheURlc2NyaXB0b3IoKSB7XG4gICAgY29uc3QgZGVzY3JpcHRvciA9IHN0YXRlLmxpYnAycC5yZWxheURlc2NyaXB0b3I7XG4gICAgaWYgKCFkZXNjcmlwdG9yKSByZXR1cm47XG4gICAgY29uc3QgdGV4dCA9IEpTT04uc3RyaW5naWZ5KGRlc2NyaXB0b3IsIG51bGwsIDIpO1xuICAgIGlmIChuYXZpZ2F0b3IuY2xpcGJvYXJkPy53cml0ZVRleHQpIHtcbiAgICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGV4dCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAnY29weScsIHBheWxvYWQ6IHRleHQgfSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHN1YnNjcmliZVB1YnN1YlRvcGljKCkge1xuICAgIGNvbnN0IGlucHV0ID0gJCgnbGlicDJwLXRvcGljLWlucHV0Jyk7XG4gICAgY29uc3QgdG9waWMgPSBpbnB1dD8udmFsdWUudHJpbSgpO1xuICAgIGlmICghdG9waWMpIHtcbiAgICAgICAgc3RhdGUubGlicDJwLmxhc3RQdWJzdWJFcnJvciA9ICdFbnRlciBhIHRvcGljIGZpcnN0Lic7XG4gICAgICAgIHJlbmRlckxpYnAycCgpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGF3YWl0IHNlbmRMaWJwMnBNZXNzYWdlKCdsaWJwMnAuc3Vic2NyaWJlVG9waWMnLCB0b3BpYyk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHVuc3Vic2NyaWJlUHVic3ViVG9waWMoKSB7XG4gICAgY29uc3QgaW5wdXQgPSAkKCdsaWJwMnAtdG9waWMtaW5wdXQnKTtcbiAgICBjb25zdCB0b3BpYyA9IGlucHV0Py52YWx1ZS50cmltKCk7XG4gICAgaWYgKCF0b3BpYykge1xuICAgICAgICBzdGF0ZS5saWJwMnAubGFzdFB1YnN1YkVycm9yID0gJ0VudGVyIGEgdG9waWMgZmlyc3QuJztcbiAgICAgICAgcmVuZGVyTGlicDJwKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgYXdhaXQgc2VuZExpYnAycE1lc3NhZ2UoJ2xpYnAycC51bnN1YnNjcmliZVRvcGljJywgdG9waWMpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBwdWJsaXNoUHVic3ViTWVzc2FnZSgpIHtcbiAgICBjb25zdCB0b3BpY0lucHV0ID0gJCgnbGlicDJwLXRvcGljLWlucHV0Jyk7XG4gICAgY29uc3QgcHVibGlzaElucHV0ID0gJCgnbGlicDJwLXB1Ymxpc2gtaW5wdXQnKTtcbiAgICBjb25zdCB0b3BpYyA9IHRvcGljSW5wdXQ/LnZhbHVlLnRyaW0oKTtcbiAgICBjb25zdCBkYXRhID0gcHVibGlzaElucHV0Py52YWx1ZSB8fCAnJztcbiAgICBpZiAoIXRvcGljKSB7XG4gICAgICAgIHN0YXRlLmxpYnAycC5sYXN0UHVic3ViRXJyb3IgPSAnRW50ZXIgYSB0b3BpYyBmaXJzdC4nO1xuICAgICAgICByZW5kZXJMaWJwMnAoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBhd2FpdCBzZW5kTGlicDJwTWVzc2FnZSgnbGlicDJwLnB1Ymxpc2hUb3BpYycsIHsgdG9waWMsIGRhdGEgfSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHBpbmdBbGxQZWVyc05vdygpIHtcbiAgICBhd2FpdCBzZW5kTGlicDJwTWVzc2FnZSgnbGlicDJwLnBpbmdBbGwnKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gdXBkYXRlQXV0b1BpbmcoKSB7XG4gICAgY29uc3QgdG9nZ2xlID0gJCgnbGlicDJwLWF1dG8tcGluZy10b2dnbGUnKTtcbiAgICBjb25zdCBpbnRlcnZhbElucHV0ID0gJCgnbGlicDJwLWF1dG8tcGluZy1pbnRlcnZhbCcpO1xuICAgIGNvbnN0IGVuYWJsZWQgPSB0b2dnbGU/LmNoZWNrZWQgPz8gZmFsc2U7XG4gICAgY29uc3QgaW50ZXJ2YWwgPSBNYXRoLm1heCgxLCBNYXRoLm1pbigzNjAwLCBNYXRoLmZsb29yKE51bWJlcihpbnRlcnZhbElucHV0Py52YWx1ZSkgfHwgMSkpKTtcbiAgICBhd2FpdCBzZW5kTGlicDJwTWVzc2FnZSgnbGlicDJwLnNldEF1dG9QaW5nJywgeyBlbmFibGVkLCBpbnRlcnZhbCB9KTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlUnVudGltZU1lc3NhZ2UobWVzc2FnZSkge1xuICAgIGlmIChtZXNzYWdlPy5raW5kID09PSAnbGlicDJwLnN0YXR1c1VwZGF0ZScpIHtcbiAgICAgICAgYXBwbHlTdGF0dXNVcGRhdGUobWVzc2FnZS5wYXlsb2FkKTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgYXBpLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKGhhbmRsZVJ1bnRpbWVNZXNzYWdlKTtcblxuICAgIGF3YWl0IHJlbG9hZEZlYXR1cmVzKCk7XG4gICAgY29uc3Qgc3RhdHVzUmVzcG9uc2UgPSBhd2FpdCBzZW5kTGlicDJwTWVzc2FnZSgnbGlicDJwLnN0YXR1cycpO1xuICAgIGlmIChzdGF0dXNSZXNwb25zZT8uc3RhdHVzKSB7XG4gICAgICAgIGFwcGx5U3RhdHVzVXBkYXRlKHN0YXR1c1Jlc3BvbnNlLnN0YXR1cyk7XG4gICAgfVxuXG4gICAgJCgnbGlicDJwLXN0YXJ0LWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcbiAgICAgICAgYXdhaXQgc3RhcnRMaWJwMnBOb2RlKCk7XG4gICAgfSk7XG5cbiAgICAkKCdsaWJwMnAtc3RvcC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IHN0b3BMaWJwMnBOb2RlKCk7XG4gICAgfSk7XG5cbiAgICAkKCdsaWJwMnAtZGlhbC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IGRpYWxMaWJwMnBQZWVyKCk7XG4gICAgfSk7XG5cbiAgICAkKCdsaWJwMnAtYmluZC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IGJpbmRMaWJwMnBJZGVudGl0eSgpO1xuICAgIH0pO1xuXG4gICAgJCgnbGlicDJwLWJvb3RzdHJhcC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IGJvb3RzdHJhcExpYnAycE5vZGUoKTtcbiAgICB9KTtcblxuICAgICQoJ2xpYnAycC1jb3B5LWJpbmQtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBhd2FpdCBjb3B5TGlicDJwQmluZGluZygpO1xuICAgIH0pO1xuXG4gICAgJCgnbGlicDJwLWNvcHktcmVsYXktYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBhd2FpdCBjb3B5UmVsYXlEZXNjcmlwdG9yKCk7XG4gICAgfSk7XG5cbiAgICAkKCdsaWJwMnAtY2xlYXItYmluZC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IGNsZWFyTGlicDJwQmluZGluZygpO1xuICAgIH0pO1xuXG4gICAgJCgnbGlicDJwLXN1YnNjcmliZS1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IHN1YnNjcmliZVB1YnN1YlRvcGljKCk7XG4gICAgfSk7XG5cbiAgICAkKCdsaWJwMnAtdW5zdWJzY3JpYmUtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBhd2FpdCB1bnN1YnNjcmliZVB1YnN1YlRvcGljKCk7XG4gICAgfSk7XG5cbiAgICAkKCdsaWJwMnAtcHVibGlzaC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IHB1Ymxpc2hQdWJzdWJNZXNzYWdlKCk7XG4gICAgfSk7XG5cbiAgICAkKCdsaWJwMnAtcHVibGlzaC1pbnB1dCcpPy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldmVudC5rZXkgPT09ICdFbnRlcicpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBhd2FpdCBwdWJsaXNoUHVic3ViTWVzc2FnZSgpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAkKCdsaWJwMnAtcGVlci1pbnB1dCcpPy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldmVudC5rZXkgPT09ICdFbnRlcicpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBhd2FpdCBkaWFsTGlicDJwUGVlcigpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAkKCdsaWJwMnAtYXV0by1waW5nLXRvZ2dsZScpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IHVwZGF0ZUF1dG9QaW5nKCk7XG4gICAgfSk7XG5cbiAgICAkKCdsaWJwMnAtcGluZy1hbGwtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBhd2FpdCBwaW5nQWxsUGVlcnNOb3coKTtcbiAgICB9KTtcblxuICAgICQoJ2xpYnAycC1hdXRvLXBpbmctaW50ZXJ2YWwnKT8uYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBhd2FpdCB1cGRhdGVBdXRvUGluZygpO1xuICAgIH0pO1xufVxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgaW5pdCk7XG5cbmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbG9zZS1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgd2luZG93LmNsb3NlKCk7XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7O0FBZ0JBLE1BQU0sV0FDRixPQUFPLFlBQVksY0FBYyxVQUNqQyxPQUFPLFdBQVksY0FBYyxT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O0FBQUEsSUFDOUIsQ0FBQztBQUVELE1BQUUsc0JBQXNCLEdBQUcsaUJBQWlCLFNBQVMsWUFBWTtBQUM3RCxZQUFNLGtCQUFrQjtBQUFBLElBQzVCLENBQUM7QUFFRCxNQUFFLHVCQUF1QixHQUFHLGlCQUFpQixTQUFTLFlBQVk7QUFDOUQsWUFBTSxvQkFBb0I7QUFBQSxJQUM5QixDQUFDO0FBRUQsTUFBRSx1QkFBdUIsR0FBRyxpQkFBaUIsU0FBUyxZQUFZO0FBQzlELFlBQU0sbUJBQW1CO0FBQUEsSUFDN0IsQ0FBQztBQUVELE1BQUUsc0JBQXNCLEdBQUcsaUJBQWlCLFNBQVMsWUFBWTtBQUM3RCxZQUFNLHFCQUFxQjtBQUFBLElBQy9CLENBQUM7QUFFRCxNQUFFLHdCQUF3QixHQUFHLGlCQUFpQixTQUFTLFlBQVk7QUFDL0QsWUFBTSx1QkFBdUI7QUFBQSxJQUNqQyxDQUFDO0FBRUQsTUFBRSxvQkFBb0IsR0FBRyxpQkFBaUIsU0FBUyxZQUFZO0FBQzNELFlBQU0scUJBQXFCO0FBQUEsSUFDL0IsQ0FBQztBQUVELE1BQUUsc0JBQXNCLEdBQUcsaUJBQWlCLFdBQVcsT0FBTyxVQUFVO0FBQ3BFLFVBQUksTUFBTSxRQUFRLFNBQVM7QUFDdkIsY0FBTSxlQUFlO0FBQ3JCLGNBQU0scUJBQXFCO0FBQUEsTUFDL0I7QUFBQSxJQUNKLENBQUM7QUFFRCxNQUFFLG1CQUFtQixHQUFHLGlCQUFpQixXQUFXLE9BQU8sVUFBVTtBQUNqRSxVQUFJLE1BQU0sUUFBUSxTQUFTO0FBQ3ZCLGNBQU0sZUFBZTtBQUNyQixjQUFNLGVBQWU7QUFBQSxNQUN6QjtBQUFBLElBQ0osQ0FBQztBQUVELE1BQUUseUJBQXlCLEdBQUcsaUJBQWlCLFVBQVUsWUFBWTtBQUNqRSxZQUFNLGVBQWU7QUFBQSxJQUN6QixDQUFDO0FBRUQsTUFBRSxxQkFBcUIsR0FBRyxpQkFBaUIsU0FBUyxZQUFZO0FBQzVELFlBQU0sZ0JBQWdCO0FBQUEsSUFDMUIsQ0FBQztBQUVELE1BQUUsMkJBQTJCLEdBQUcsaUJBQWlCLFVBQVUsWUFBWTtBQUNuRSxZQUFNLGVBQWU7QUFBQSxJQUN6QixDQUFDO0FBQUEsRUFDTDtBQUVBLFdBQVMsaUJBQWlCLG9CQUFvQixJQUFJO0FBRWxELFdBQVMsZUFBZSxXQUFXLEdBQUcsaUJBQWlCLFNBQVMsTUFBTTtBQUNsRSxXQUFPLE1BQU07QUFBQSxFQUNqQixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
