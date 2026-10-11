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
      autoPingEnabled: false,
      autoPingInterval: 30,
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
  async function updateAutoPing() {
    const toggle = $("libp2p-auto-ping-toggle");
    const intervalInput = $("libp2p-auto-ping-interval");
    const enabled = toggle?.checked ?? false;
    const interval = Math.max(5, Math.min(3600, Math.floor(Number(intervalInput?.value) || 30)));
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
    $("libp2p-auto-ping-interval")?.addEventListener("change", async () => {
      await updateAutoPing();
    });
  }
  document.addEventListener("DOMContentLoaded", init);
  document.getElementById("close-btn")?.addEventListener("click", () => {
    window.close();
  });
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uLy4uL3NyYy9leHBlcmltZW50YWwvZXhwZXJpbWVudGFsLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIEJyb3dzZXIgQVBJIGNvbXBhdGliaWxpdHkgbGF5ZXIgZm9yIENocm9tZSAvIFNhZmFyaSAvIEZpcmVmb3guXG4gKlxuICogU2FmYXJpIGFuZCBGaXJlZm94IGV4cG9zZSBgYnJvd3Nlci4qYCAoUHJvbWlzZS1iYXNlZCwgV2ViRXh0ZW5zaW9uIHN0YW5kYXJkKS5cbiAqIENocm9tZSBleHBvc2VzIGBjaHJvbWUuKmAgKGNhbGxiYWNrLWJhc2VkIGhpc3RvcmljYWxseSwgYnV0IE1WMyBzdXBwb3J0c1xuICogcHJvbWlzZXMgb24gbW9zdCBBUElzKS4gSW4gYSBzZXJ2aWNlLXdvcmtlciBjb250ZXh0IGBicm93c2VyYCBpcyB1bmRlZmluZWRcbiAqIG9uIENocm9tZSwgc28gd2Ugbm9ybWFsaXNlIGV2ZXJ5dGhpbmcgaGVyZS5cbiAqXG4gKiBVc2FnZTogIGltcG9ydCB7IGFwaSB9IGZyb20gJy4vdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwnO1xuICogICAgICAgICBhcGkucnVudGltZS5zZW5kTWVzc2FnZSguLi4pXG4gKlxuICogVGhlIGV4cG9ydGVkIGBhcGlgIG9iamVjdCBtaXJyb3JzIHRoZSBzdWJzZXQgb2YgdGhlIFdlYkV4dGVuc2lvbiBBUEkgdGhhdFxuICogTm9zdHJLZXkgYWN0dWFsbHkgdXNlcywgd2l0aCBldmVyeSBtZXRob2QgcmV0dXJuaW5nIGEgUHJvbWlzZS5cbiAqL1xuXG4vLyBEZXRlY3Qgd2hpY2ggZ2xvYmFsIG5hbWVzcGFjZSBpcyBhdmFpbGFibGUuXG5jb25zdCBfYnJvd3NlciA9XG4gICAgdHlwZW9mIGJyb3dzZXIgIT09ICd1bmRlZmluZWQnID8gYnJvd3NlciA6XG4gICAgdHlwZW9mIGNocm9tZSAgIT09ICd1bmRlZmluZWQnID8gY2hyb21lICA6XG4gICAgbnVsbDtcblxuaWYgKCFfYnJvd3Nlcikge1xuICAgIHRocm93IG5ldyBFcnJvcignYnJvd3Nlci1wb2x5ZmlsbDogTm8gZXh0ZW5zaW9uIEFQSSBuYW1lc3BhY2UgZm91bmQgKG5laXRoZXIgYnJvd3NlciBub3IgY2hyb21lKS4nKTtcbn1cblxuLyoqXG4gKiBUcnVlIHdoZW4gcnVubmluZyBvbiBDaHJvbWUgKG9yIGFueSBDaHJvbWl1bS1iYXNlZCBicm93c2VyIHRoYXQgb25seVxuICogZXhwb3NlcyB0aGUgYGNocm9tZWAgbmFtZXNwYWNlKS5cbiAqL1xuY29uc3QgaXNDaHJvbWUgPSB0eXBlb2YgYnJvd3NlciA9PT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNocm9tZSAhPT0gJ3VuZGVmaW5lZCc7XG5cbi8qKlxuICogV3JhcCBhIENocm9tZSBjYWxsYmFjay1zdHlsZSBtZXRob2Qgc28gaXQgcmV0dXJucyBhIFByb21pc2UuXG4gKiBJZiB0aGUgbWV0aG9kIGFscmVhZHkgcmV0dXJucyBhIHByb21pc2UgKE1WMykgd2UganVzdCBwYXNzIHRocm91Z2guXG4gKi9cbmZ1bmN0aW9uIHByb21pc2lmeShjb250ZXh0LCBtZXRob2QpIHtcbiAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgLy8gTVYzIENocm9tZSBBUElzIHJldHVybiBwcm9taXNlcyB3aGVuIG5vIGNhbGxiYWNrIGlzIHN1cHBsaWVkLlxuICAgICAgICAvLyBXZSB0cnkgdGhlIHByb21pc2UgcGF0aCBmaXJzdDsgaWYgdGhlIHJ1bnRpbWUgc2lnbmFscyBhbiBlcnJvclxuICAgICAgICAvLyB2aWEgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yIGluc2lkZSBhIGNhbGxiYWNrIHdlIGNhdGNoIHRoYXQgdG9vLlxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gbWV0aG9kLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgICAvLyBmYWxsIHRocm91Z2ggdG8gY2FsbGJhY2sgd3JhcHBpbmdcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBtZXRob2QuYXBwbHkoY29udGV4dCwgW1xuICAgICAgICAgICAgICAgIC4uLmFyZ3MsXG4gICAgICAgICAgICAgICAgKC4uLmNiQXJncykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2Jyb3dzZXIucnVudGltZSAmJiBfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGNiQXJncy5sZW5ndGggPD0gMSA/IGNiQXJnc1swXSA6IGNiQXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQnVpbGQgdGhlIHVuaWZpZWQgYGFwaWAgb2JqZWN0XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuY29uc3QgYXBpID0ge307XG5cbi8vIC0tLSBydW50aW1lIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnJ1bnRpbWUgPSB7XG4gICAgLyoqXG4gICAgICogc2VuZE1lc3NhZ2UgXHUyMDEzIGFsd2F5cyByZXR1cm5zIGEgUHJvbWlzZS5cbiAgICAgKi9cbiAgICBzZW5kTWVzc2FnZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIucnVudGltZSwgX2Jyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSkoLi4uYXJncyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uTWVzc2FnZSBcdTIwMTMgdGhpbiB3cmFwcGVyIHNvIGNhbGxlcnMgdXNlIGEgY29uc2lzdGVudCByZWZlcmVuY2UuXG4gICAgICogVGhlIGxpc3RlbmVyIHNpZ25hdHVyZSBpcyAobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpLlxuICAgICAqIE9uIENocm9tZSB0aGUgbGlzdGVuZXIgY2FuIHJldHVybiBgdHJ1ZWAgdG8ga2VlcCB0aGUgY2hhbm5lbCBvcGVuLFxuICAgICAqIG9yIHJldHVybiBhIFByb21pc2UgKE1WMykuICBTYWZhcmkgLyBGaXJlZm94IGV4cGVjdCBhIFByb21pc2UgcmV0dXJuLlxuICAgICAqL1xuICAgIG9uTWVzc2FnZTogX2Jyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UsXG5cbiAgICAvKipcbiAgICAgKiBnZXRVUkwgXHUyMDEzIHN5bmNocm9ub3VzIG9uIGFsbCBicm93c2Vycy5cbiAgICAgKi9cbiAgICBnZXRVUkwocGF0aCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5nZXRVUkwocGF0aCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9wZW5PcHRpb25zUGFnZVxuICAgICAqL1xuICAgIG9wZW5PcHRpb25zUGFnZSgpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUub3Blbk9wdGlvbnNQYWdlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5ydW50aW1lLCBfYnJvd3Nlci5ydW50aW1lLm9wZW5PcHRpb25zUGFnZSkoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXhwb3NlIHRoZSBpZCBmb3IgY29udmVuaWVuY2UuXG4gICAgICovXG4gICAgZ2V0IGlkKCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5pZDtcbiAgICB9LFxufTtcblxuLy8gLS0tIHN0b3JhZ2UubG9jYWwgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkuc3RvcmFnZSA9IHtcbiAgICBsb2NhbDoge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICAvLyAtLS0gc3RvcmFnZS5zeW5jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBOdWxsIHdoZW4gdGhlIGJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IHN5bmMgKG9sZGVyIFNhZmFyaSwgZXRjLilcbiAgICBzeW5jOiBfYnJvd3Nlci5zdG9yYWdlPy5zeW5jID8ge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuc2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBnZXRCeXRlc0luVXNlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpIHtcbiAgICAgICAgICAgICAgICAvLyBTYWZhcmkgZG9lc24ndCBzdXBwb3J0IGdldEJ5dGVzSW5Vc2UgXHUyMDE0IHJldHVybiAwXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0gOiBudWxsLFxuXG4gICAgLy8gLS0tIHN0b3JhZ2Uuc2Vzc2lvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gTVYzIGluLW1lbW9yeSBhcmVhIHRoYXQgc3Vydml2ZXMgc2VydmljZS13b3JrZXIgZXZpY3Rpb24gYnV0IG5ldmVyIHRvdWNoZXNcbiAgICAvLyBkaXNrLiBOdWxsIG9uIGVuZ2luZXMgdGhhdCBkb24ndCBpbXBsZW1lbnQgaXQgKFNhZmFyaSBiYWNrZ3JvdW5kIHBhZ2UsXG4gICAgLy8gb2xkZXIgRmlyZWZveCkgXHUyMDE0IGNhbGxlcnMgbXVzdCBmZWF0dXJlLWRldGVjdCBhbmQgZmFsbCBiYWNrLlxuICAgIHNlc3Npb246IF9icm93c2VyLnN0b3JhZ2U/LnNlc3Npb24gPyB7XG4gICAgICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLmdldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24sIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5jbGVhcikoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXN0cmljdCB0aGUgYXJlYSB0byBleHRlbnNpb24tcHJpdmlsZWdlZCBjb250ZXh0cy4gQ2hyb21lLW9ubHk7XG4gICAgICAgICAqIHJlc29sdmVzIGhhcm1sZXNzbHkgd2hlcmUgdGhlIG1ldGhvZCBpcyBhYnNlbnQuXG4gICAgICAgICAqL1xuICAgICAgICBzZXRBY2Nlc3NMZXZlbCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIV9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXRBY2Nlc3NMZXZlbCkgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uc2V0QWNjZXNzTGV2ZWwoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldEFjY2Vzc0xldmVsKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9IDogbnVsbCxcblxuICAgIC8vIC0tLSBzdG9yYWdlLm9uQ2hhbmdlZCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIG9uQ2hhbmdlZDogX2Jyb3dzZXIuc3RvcmFnZT8ub25DaGFuZ2VkIHx8IG51bGwsXG59O1xuXG4vLyAtLS0gdGFicyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS50YWJzID0ge1xuICAgIGNyZWF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmNyZWF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuY3JlYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHF1ZXJ5KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMucXVlcnkoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnF1ZXJ5KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMucmVtb3ZlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHVwZGF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnVwZGF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMudXBkYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmdldCguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuZ2V0KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldEN1cnJlbnQoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHNlbmRNZXNzYWdlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuc2VuZE1lc3NhZ2UoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnNlbmRNZXNzYWdlKSguLi5hcmdzKTtcbiAgICB9LFxufTtcblxuLy8gLS0tIGFsYXJtcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBjaHJvbWUuYWxhcm1zIHN1cnZpdmVzIE1WMyBzZXJ2aWNlLXdvcmtlciBldmljdGlvbjsgc2V0VGltZW91dCBkb2VzIG5vdC5cbmFwaS5hbGFybXMgPSBfYnJvd3Nlci5hbGFybXMgPyB7XG4gICAgY3JlYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgLy8gYWxhcm1zLmNyZWF0ZSBpcyBzeW5jaHJvbm91cyBvbiBDaHJvbWUsIHJldHVybnMgUHJvbWlzZSBvbiBGaXJlZm94L1NhZmFyaVxuICAgICAgICBjb25zdCByZXN1bHQgPSBfYnJvd3Nlci5hbGFybXMuY3JlYXRlKC4uLmFyZ3MpO1xuICAgICAgICByZXR1cm4gcmVzdWx0ICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gJ2Z1bmN0aW9uJyA/IHJlc3VsdCA6IFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH0sXG4gICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuYWxhcm1zLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuYWxhcm1zLCBfYnJvd3Nlci5hbGFybXMuY2xlYXIpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgb25BbGFybTogX2Jyb3dzZXIuYWxhcm1zLm9uQWxhcm0sXG59IDogbnVsbDtcblxuZXhwb3J0IHsgYXBpLCBpc0Nocm9tZSB9O1xuIiwgImltcG9ydCB7IGFwaSB9IGZyb20gJy4uL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsJztcblxuY29uc3QgRkVBVFVSRVMgPSBbXG4gICAgW1xuICAgICAgICAnbm9uZScsXG4gICAgICAgICdOSVAtWFg6IE5vbmUnLFxuICAgICAgICAnUmVzZXJ2ZWQgZm9yIHRoZSBmdXR1cmUgdXNlLicsXG4gICAgXSxcbl07XG5cbmNvbnN0ICQgPSAoaWQpID0+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcblxuY29uc3Qgc3RhdGUgPSB7XG4gICAgZmVhdHVyZXM6IFtdLFxuICAgIGxpYnAycDoge1xuICAgICAgICByZWFkeTogZmFsc2UsXG4gICAgICAgIHN0YXJ0aW5nOiBmYWxzZSxcbiAgICAgICAgc3RvcHBpbmc6IGZhbHNlLFxuICAgICAgICBiaW5kaW5nOiBmYWxzZSxcbiAgICAgICAgYm9vdHN0cmFwcGluZzogZmFsc2UsXG4gICAgICAgIHBlZXJJZDogJycsXG4gICAgICAgIHBlZXJJZFNob3J0OiAnJyxcbiAgICAgICAgYWN0aXZlUHVia2V5OiAnJyxcbiAgICAgICAgYWN0aXZlTnB1YjogJycsXG4gICAgICAgIGF0dGVzdGF0aW9uOiBudWxsLFxuICAgICAgICByZWxheURlc2NyaXB0b3I6IG51bGwsXG4gICAgICAgIGRlZmF1bHRCb290c3RyYXBBZGRyczogW10sXG4gICAgICAgIGRpc2NvdmVyeUJvb3RzdHJhcEFkZHJzOiBbXSxcbiAgICAgICAgYm9vdHN0cmFwQWRkcnM6IFtdLFxuICAgICAgICBsaXN0ZW5BZGRyczogW10sXG4gICAgICAgIHdlYnJ0Y0FkZHJzOiBbXSxcbiAgICAgICAgY29ubmVjdGlvbkNvdW50OiAwLFxuICAgICAgICBwdWJzdWJQZWVyczogW10sXG4gICAgICAgIHN1YnNjcmliZWRUb3BpY3M6IFtdLFxuICAgICAgICBwdWJzdWJNZXNzYWdlczogW10sXG4gICAgICAgIGF1dG9QaW5nRW5hYmxlZDogZmFsc2UsXG4gICAgICAgIGF1dG9QaW5nSW50ZXJ2YWw6IDMwLFxuICAgICAgICBsYXN0RGlhbFRhcmdldDogJycsXG4gICAgICAgIGxhc3REaWFsUGVlcjogJycsXG4gICAgICAgIGxhc3RQaW5nTGF0ZW5jeTogJycsXG4gICAgICAgIGxhc3RCaW5kRXJyb3I6ICcnLFxuICAgICAgICBsYXN0Qm9vdHN0cmFwRXJyb3I6ICcnLFxuICAgICAgICBsYXN0RXJyb3I6ICcnLFxuICAgICAgICBsb2dzOiBbXSxcbiAgICB9LFxufTtcblxuZnVuY3Rpb24gZXNjYXBlSHRtbCh2YWx1ZSkge1xuICAgIHJldHVybiBTdHJpbmcodmFsdWUpXG4gICAgICAgIC5yZXBsYWNlQWxsKCcmJywgJyZhbXA7JylcbiAgICAgICAgLnJlcGxhY2VBbGwoJzwnLCAnJmx0OycpXG4gICAgICAgIC5yZXBsYWNlQWxsKCc+JywgJyZndDsnKVxuICAgICAgICAucmVwbGFjZUFsbCgnXCInLCAnJnF1b3Q7JylcbiAgICAgICAgLnJlcGxhY2VBbGwoXCInXCIsICcmIzM5OycpO1xufVxuXG5mdW5jdGlvbiBzaG9ydFZhbHVlKHZhbHVlLCBoZWFkID0gMTAsIHRhaWwgPSA4KSB7XG4gICAgaWYgKCF2YWx1ZSkgcmV0dXJuICcnO1xuICAgIGlmICh2YWx1ZS5sZW5ndGggPD0gaGVhZCArIHRhaWwgKyAzKSByZXR1cm4gdmFsdWU7XG4gICAgcmV0dXJuIGAke3ZhbHVlLnNsaWNlKDAsIGhlYWQpfVx1MjAyNiR7dmFsdWUuc2xpY2UoLXRhaWwpfWA7XG59XG5cbmZ1bmN0aW9uIGFwcGx5U3RhdHVzVXBkYXRlKHN0YXR1cykge1xuICAgIGlmICghc3RhdHVzIHx8IHR5cGVvZiBzdGF0dXMgIT09ICdvYmplY3QnKSByZXR1cm47XG4gICAgc3RhdGUubGlicDJwID0geyAuLi5zdGF0ZS5saWJwMnAsIC4uLnN0YXR1cyB9O1xuICAgIHJlbmRlckxpYnAycCgpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzZW5kTGlicDJwTWVzc2FnZShraW5kLCBwYXlsb2FkKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQsIHBheWxvYWQgfSk7XG4gICAgICAgIGlmIChyZXNwb25zZT8uc3RhdHVzKSB7XG4gICAgICAgICAgICBhcHBseVN0YXR1c1VwZGF0ZShyZXNwb25zZS5zdGF0dXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICBzdGF0ZS5saWJwMnAubGFzdEVycm9yID0gbWVzc2FnZTtcbiAgICAgICAgcmVuZGVyTGlicDJwKCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogbWVzc2FnZSB9O1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVuZGVyRmVhdHVyZXMoKSB7XG4gICAgY29uc3QgY29udGFpbmVyID0gJCgnZmVhdHVyZXMtY29udGFpbmVyJyk7XG4gICAgaWYgKCFjb250YWluZXIpIHJldHVybjtcblxuICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSBzdGF0ZS5mZWF0dXJlcy5tYXAoKFtuYW1lLCBhY3RpdmUsIHNob3J0RGVzYywgbG9uZ0Rlc2NdKSA9PiBgXG4gICAgICAgIDxkaXYgY2xhc3M9XCJtdC00XCI+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICBjbGFzcz1cImNoZWNrYm94XCJcbiAgICAgICAgICAgICAgICB0eXBlPVwiY2hlY2tib3hcIlxuICAgICAgICAgICAgICAgIGlkPVwiJHtuYW1lfVwiXG4gICAgICAgICAgICAgICAgJHthY3RpdmUgPyAnY2hlY2tlZCcgOiAnJ31cbiAgICAgICAgICAgICAgICBkYXRhLWZlYXR1cmU9XCIke25hbWV9XCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPVwiJHtuYW1lfVwiIGNsYXNzPVwiZm9udC1ib2xkXCI+JHtzaG9ydERlc2N9PC9sYWJlbD5cbiAgICAgICAgICAgIDxwIGNsYXNzPVwiaXRhbGljXCI+JHtsb25nRGVzY308L3A+XG4gICAgICAgIDwvZGl2PlxuICAgIGApLmpvaW4oJycpO1xuXG4gICAgY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXScpLmZvckVhY2goKGNiKSA9PiB7XG4gICAgICAgIGNiLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGFzeW5jIChlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBmZWF0dXJlID0gZS50YXJnZXQuZGF0YXNldC5mZWF0dXJlO1xuICAgICAgICAgICAgY29uc3QgYWN0aXZlID0gZS50YXJnZXQuY2hlY2tlZDtcbiAgICAgICAgICAgIGF3YWl0IGFwaS5zdG9yYWdlLmxvY2FsLnNldCh7IFtmZWF0dXJlXTogYWN0aXZlIH0pO1xuICAgICAgICAgICAgYXdhaXQgcmVsb2FkRmVhdHVyZXMoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJlbG9hZEZlYXR1cmVzKCkge1xuICAgIHN0YXRlLmZlYXR1cmVzID0gYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgICAgIEZFQVRVUkVTLm1hcChhc3luYyAoW25hbWUsIHNob3J0RGVzYywgbG9uZ0Rlc2NdKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSBgZmVhdHVyZToke25hbWV9YDtcbiAgICAgICAgICAgIGNvbnN0IHN0b3JlZCA9IGF3YWl0IGFwaS5zdG9yYWdlLmxvY2FsLmdldCh7IFtrZXldOiBmYWxzZSB9KTtcbiAgICAgICAgICAgIHJldHVybiBba2V5LCBzdG9yZWRba2V5XSwgc2hvcnREZXNjLCBsb25nRGVzY107XG4gICAgICAgIH0pXG4gICAgKTtcbiAgICByZW5kZXJGZWF0dXJlcygpO1xufVxuXG5mdW5jdGlvbiByZW5kZXJMaWJwMnAoKSB7XG4gICAgY29uc3Qge1xuICAgICAgICByZWFkeSxcbiAgICAgICAgc3RhcnRpbmcsXG4gICAgICAgIHN0b3BwaW5nLFxuICAgICAgICBiaW5kaW5nLFxuICAgICAgICBib290c3RyYXBwaW5nLFxuICAgICAgICBwZWVySWQsXG4gICAgICAgIHBlZXJJZFNob3J0LFxuICAgICAgICBhY3RpdmVQdWJrZXksXG4gICAgICAgIGFjdGl2ZU5wdWIsXG4gICAgICAgIGF0dGVzdGF0aW9uLFxuICAgICAgICBsaXN0ZW5BZGRycyxcbiAgICAgICAgZGVmYXVsdEJvb3RzdHJhcEFkZHJzLFxuICAgICAgICBib290c3RyYXBBZGRycyxcbiAgICAgICAgY29ubmVjdGlvbkNvdW50LFxuICAgICAgICBsYXN0RGlhbFRhcmdldCxcbiAgICAgICAgbGFzdERpYWxQZWVyLFxuICAgICAgICBsYXN0UGluZ0xhdGVuY3ksXG4gICAgICAgIGxhc3RCaW5kRXJyb3IsXG4gICAgICAgIGxhc3RCb290c3RyYXBFcnJvcixcbiAgICAgICAgbGFzdEVycm9yLFxuICAgICAgICBsb2dzLFxuICAgIH0gPSBzdGF0ZS5saWJwMnA7XG5cbiAgICBjb25zdCBzdGF0dXNFbCA9ICQoJ2xpYnAycC1zdGF0dXMnKTtcbiAgICBpZiAoc3RhdHVzRWwpIHtcbiAgICAgICAgc3RhdHVzRWwudGV4dENvbnRlbnQgPSByZWFkeVxuICAgICAgICAgICAgPyAnUmVhZHknXG4gICAgICAgICAgICA6IHN0YXJ0aW5nXG4gICAgICAgICAgICAgICAgPyAnU3RhcnRpbmdcdTIwMjYnXG4gICAgICAgICAgICAgICAgOiBzdG9wcGluZ1xuICAgICAgICAgICAgICAgICAgICA/ICdTdG9wcGluZ1x1MjAyNidcbiAgICAgICAgICAgICAgICAgICAgOiAnU3RvcHBlZCc7XG4gICAgfVxuXG4gICAgY29uc3QgcGVlcklkRWwgPSAkKCdsaWJwMnAtcGVlci1pZCcpO1xuICAgIGlmIChwZWVySWRFbCkge1xuICAgICAgICBwZWVySWRFbC50ZXh0Q29udGVudCA9IHBlZXJJZFNob3J0IHx8IHBlZXJJZCB8fCAnTm90IHN0YXJ0ZWQnO1xuICAgIH1cblxuICAgIGNvbnN0IGxpc3RlbkFkZHJzRWwgPSAkKCdsaWJwMnAtbGlzdGVuLWFkZHJzJyk7XG4gICAgaWYgKGxpc3RlbkFkZHJzRWwpIHtcbiAgICAgICAgbGlzdGVuQWRkcnNFbC50ZXh0Q29udGVudCA9IGxpc3RlbkFkZHJzLmxlbmd0aCA/IGxpc3RlbkFkZHJzLmpvaW4oJ1xcbicpIDogJ05vIGFkdmVydGlzZWQgbGlzdGVuIGFkZHJlc3NlcyBpbiB0aGlzIGJyb3dzZXIgbm9kZS4nO1xuICAgIH1cblxuICAgIGNvbnN0IHdlYnJ0Y0FkZHJzRWwgPSAkKCdsaWJwMnAtd2VicnRjLWFkZHJzJyk7XG4gICAgaWYgKHdlYnJ0Y0FkZHJzRWwpIHtcbiAgICAgICAgd2VicnRjQWRkcnNFbC50ZXh0Q29udGVudCA9IHN0YXRlLmxpYnAycC53ZWJydGNBZGRycy5sZW5ndGhcbiAgICAgICAgICAgID8gc3RhdGUubGlicDJwLndlYnJ0Y0FkZHJzLmpvaW4oJ1xcbicpXG4gICAgICAgICAgICA6ICdObyBXZWJSVEMgbGlzdGVuIGFkZHJlc3NlcyB5ZXQgKHJlcXVpcmVzIGEgcmVsYXkgcmVzZXJ2YXRpb24pLic7XG4gICAgfVxuXG4gICAgY29uc3QgZGVmYXVsdEJvb3RzdHJhcEVsID0gJCgnbGlicDJwLWRlZmF1bHQtYm9vdHN0cmFwJyk7XG4gICAgaWYgKGRlZmF1bHRCb290c3RyYXBFbCkge1xuICAgICAgICBkZWZhdWx0Qm9vdHN0cmFwRWwudGV4dENvbnRlbnQgPSBkZWZhdWx0Qm9vdHN0cmFwQWRkcnMubGVuZ3RoXG4gICAgICAgICAgICA/IGRlZmF1bHRCb290c3RyYXBBZGRycy5qb2luKCdcXG4nKVxuICAgICAgICAgICAgOiAnTm8gZGVmYXVsdCBXU1MgYm9vdHN0cmFwIHJlbGF5cyBjb25maWd1cmVkLic7XG4gICAgfVxuXG4gICAgY29uc3QgZGlzY292ZXJ5Qm9vdHN0cmFwRWwgPSAkKCdsaWJwMnAtZGlzY292ZXJ5LWJvb3RzdHJhcCcpO1xuICAgIGlmIChkaXNjb3ZlcnlCb290c3RyYXBFbCkge1xuICAgICAgICBkaXNjb3ZlcnlCb290c3RyYXBFbC50ZXh0Q29udGVudCA9IHN0YXRlLmxpYnAycC5kaXNjb3ZlcnlCb290c3RyYXBBZGRycy5sZW5ndGhcbiAgICAgICAgICAgID8gc3RhdGUubGlicDJwLmRpc2NvdmVyeUJvb3RzdHJhcEFkZHJzLmpvaW4oJ1xcbicpXG4gICAgICAgICAgICA6ICdObyBjYW5vbmljYWwgbGlicDJwIGJvb3RzdHJhcCByZWxheXMgY29uZmlndXJlZC4nO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbm5lY3Rpb25Db3VudEVsID0gJCgnbGlicDJwLWNvbm5lY3Rpb24tY291bnQnKTtcbiAgICBpZiAoY29ubmVjdGlvbkNvdW50RWwpIHtcbiAgICAgICAgY29ubmVjdGlvbkNvdW50RWwudGV4dENvbnRlbnQgPSBTdHJpbmcoY29ubmVjdGlvbkNvdW50KTtcbiAgICB9XG5cbiAgICBjb25zdCBsYXN0RGlhbFRhcmdldEVsID0gJCgnbGlicDJwLWxhc3QtZGlhbC10YXJnZXQnKTtcbiAgICBpZiAobGFzdERpYWxUYXJnZXRFbCkge1xuICAgICAgICBsYXN0RGlhbFRhcmdldEVsLnRleHRDb250ZW50ID0gbGFzdERpYWxUYXJnZXQgfHwgJ1x1MjAxNCc7XG4gICAgfVxuXG4gICAgY29uc3QgbGFzdERpYWxQZWVyRWwgPSAkKCdsaWJwMnAtbGFzdC1kaWFsLXBlZXInKTtcbiAgICBpZiAobGFzdERpYWxQZWVyRWwpIHtcbiAgICAgICAgbGFzdERpYWxQZWVyRWwudGV4dENvbnRlbnQgPSBsYXN0RGlhbFBlZXIgfHwgJ1x1MjAxNCc7XG4gICAgfVxuXG4gICAgY29uc3QgbGFzdFBpbmdFbCA9ICQoJ2xpYnAycC1sYXN0LXBpbmcnKTtcbiAgICBpZiAobGFzdFBpbmdFbCkge1xuICAgICAgICBsYXN0UGluZ0VsLnRleHRDb250ZW50ID0gbGFzdFBpbmdMYXRlbmN5IHx8ICdcdTIwMTQnO1xuICAgIH1cblxuICAgIGNvbnN0IGVycm9yRWwgPSAkKCdsaWJwMnAtZXJyb3InKTtcbiAgICBpZiAoZXJyb3JFbCkge1xuICAgICAgICBlcnJvckVsLnRleHRDb250ZW50ID0gbGFzdEVycm9yIHx8ICcnO1xuICAgICAgICBlcnJvckVsLmNsYXNzTGlzdC50b2dnbGUoJ2hpZGRlbicsICFsYXN0RXJyb3IpO1xuICAgIH1cblxuICAgIGNvbnN0IGJpbmRFcnJvckVsID0gJCgnbGlicDJwLWJpbmQtZXJyb3InKTtcbiAgICBpZiAoYmluZEVycm9yRWwpIHtcbiAgICAgICAgYmluZEVycm9yRWwudGV4dENvbnRlbnQgPSBsYXN0QmluZEVycm9yIHx8ICcnO1xuICAgICAgICBiaW5kRXJyb3JFbC5jbGFzc0xpc3QudG9nZ2xlKCdoaWRkZW4nLCAhbGFzdEJpbmRFcnJvcik7XG4gICAgfVxuXG4gICAgY29uc3QgYm9vdHN0cmFwRXJyb3JFbCA9ICQoJ2xpYnAycC1ib290c3RyYXAtZXJyb3InKTtcbiAgICBpZiAoYm9vdHN0cmFwRXJyb3JFbCkge1xuICAgICAgICBib290c3RyYXBFcnJvckVsLnRleHRDb250ZW50ID0gbGFzdEJvb3RzdHJhcEVycm9yIHx8ICcnO1xuICAgICAgICBib290c3RyYXBFcnJvckVsLmNsYXNzTGlzdC50b2dnbGUoJ2hpZGRlbicsICFsYXN0Qm9vdHN0cmFwRXJyb3IpO1xuICAgIH1cblxuICAgIGNvbnN0IGFjdGl2ZVB1YmtleUVsID0gJCgnbGlicDJwLWFjdGl2ZS1wdWJrZXknKTtcbiAgICBpZiAoYWN0aXZlUHVia2V5RWwpIHtcbiAgICAgICAgYWN0aXZlUHVia2V5RWwudGV4dENvbnRlbnQgPSBhY3RpdmVQdWJrZXkgPyBzaG9ydFZhbHVlKGFjdGl2ZVB1YmtleSwgMTYsIDEyKSA6ICdOb3QgYm91bmQnO1xuICAgIH1cblxuICAgIGNvbnN0IGFjdGl2ZU5wdWJFbCA9ICQoJ2xpYnAycC1hY3RpdmUtbnB1YicpO1xuICAgIGlmIChhY3RpdmVOcHViRWwpIHtcbiAgICAgICAgYWN0aXZlTnB1YkVsLnRleHRDb250ZW50ID0gYWN0aXZlTnB1YiB8fCAnTm90IGJvdW5kJztcbiAgICB9XG5cbiAgICBjb25zdCBhdHRlc3RhdGlvbkVsID0gJCgnbGlicDJwLWF0dGVzdGF0aW9uJyk7XG4gICAgaWYgKGF0dGVzdGF0aW9uRWwpIHtcbiAgICAgICAgYXR0ZXN0YXRpb25FbC50ZXh0Q29udGVudCA9IGF0dGVzdGF0aW9uID8gSlNPTi5zdHJpbmdpZnkoYXR0ZXN0YXRpb24sIG51bGwsIDIpIDogJ05vIGF0dGVzdGF0aW9uIHlldC4nO1xuICAgIH1cblxuICAgIGNvbnN0IHJlbGF5RGVzY3JpcHRvckVsID0gJCgnbGlicDJwLXJlbGF5LWRlc2NyaXB0b3InKTtcbiAgICBpZiAocmVsYXlEZXNjcmlwdG9yRWwpIHtcbiAgICAgICAgcmVsYXlEZXNjcmlwdG9yRWwudGV4dENvbnRlbnQgPSBzdGF0ZS5saWJwMnAucmVsYXlEZXNjcmlwdG9yXG4gICAgICAgICAgICA/IEpTT04uc3RyaW5naWZ5KHN0YXRlLmxpYnAycC5yZWxheURlc2NyaXB0b3IsIG51bGwsIDIpXG4gICAgICAgICAgICA6ICdObyByZWxheSBkZXNjcmlwdG9yIHlldC4nO1xuICAgIH1cblxuICAgIGNvbnN0IGJpbmRTdGF0ZUVsID0gJCgnbGlicDJwLWJpbmQtc3RhdGUnKTtcbiAgICBpZiAoYmluZFN0YXRlRWwpIHtcbiAgICAgICAgYmluZFN0YXRlRWwudGV4dENvbnRlbnQgPSBiaW5kaW5nXG4gICAgICAgICAgICA/ICdCaW5kaW5nXHUyMDI2J1xuICAgICAgICAgICAgOiBhdHRlc3RhdGlvblxuICAgICAgICAgICAgICAgID8gJ0F0dGVzdGVkJ1xuICAgICAgICAgICAgICAgIDogJ1VuYm91bmQnO1xuICAgIH1cblxuICAgIGNvbnN0IGxvZ0VsID0gJCgnbGlicDJwLWxvZycpO1xuICAgIGlmIChsb2dFbCkge1xuICAgICAgICBsb2dFbC5pbm5lckhUTUwgPSBsb2dzLmxlbmd0aFxuICAgICAgICAgICAgPyBsb2dzLm1hcCgoeyB0cywga2luZCwgbWVzc2FnZSB9KSA9PiBgXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImxpYnAycC1sb2ctbGluZSBsaWJwMnAtbG9nLWxpbmUtLSR7a2luZH1cIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJsaWJwMnAtbG9nLXRzXCI+JHtlc2NhcGVIdG1sKHRzKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibGlicDJwLWxvZy1tc2dcIj4ke2VzY2FwZUh0bWwobWVzc2FnZSl9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgYCkuam9pbignJylcbiAgICAgICAgICAgIDogJzxkaXYgY2xhc3M9XCJsaWJwMnAtbG9nLWVtcHR5XCI+Tm8gYWN0aXZpdHkgeWV0LjwvZGl2Pic7XG4gICAgfVxuXG4gICAgY29uc3Qgc3RhcnRCdG4gPSAkKCdsaWJwMnAtc3RhcnQtYnRuJyk7XG4gICAgaWYgKHN0YXJ0QnRuKSB7XG4gICAgICAgIHN0YXJ0QnRuLmRpc2FibGVkID0gcmVhZHkgfHwgc3RhcnRpbmcgfHwgc3RvcHBpbmc7XG4gICAgfVxuXG4gICAgY29uc3Qgc3RvcEJ0biA9ICQoJ2xpYnAycC1zdG9wLWJ0bicpO1xuICAgIGlmIChzdG9wQnRuKSB7XG4gICAgICAgIHN0b3BCdG4uZGlzYWJsZWQgPSAhcmVhZHkgfHwgc3RvcHBpbmc7XG4gICAgfVxuXG4gICAgY29uc3QgZGlhbEJ0biA9ICQoJ2xpYnAycC1kaWFsLWJ0bicpO1xuICAgIGlmIChkaWFsQnRuKSB7XG4gICAgICAgIGRpYWxCdG4uZGlzYWJsZWQgPSAhcmVhZHkgfHwgc3RhcnRpbmcgfHwgc3RvcHBpbmc7XG4gICAgfVxuXG4gICAgY29uc3QgcGVlcklucHV0ID0gJCgnbGlicDJwLXBlZXItaW5wdXQnKTtcbiAgICBpZiAocGVlcklucHV0KSB7XG4gICAgICAgIHBlZXJJbnB1dC5kaXNhYmxlZCA9ICFyZWFkeSB8fCBzdGFydGluZyB8fCBzdG9wcGluZztcbiAgICB9XG5cbiAgICBjb25zdCBiaW5kQnRuID0gJCgnbGlicDJwLWJpbmQtYnRuJyk7XG4gICAgaWYgKGJpbmRCdG4pIHtcbiAgICAgICAgYmluZEJ0bi5kaXNhYmxlZCA9ICFyZWFkeSB8fCBzdGFydGluZyB8fCBzdG9wcGluZyB8fCBiaW5kaW5nO1xuICAgIH1cblxuICAgIGNvbnN0IGNvcHlCaW5kQnRuID0gJCgnbGlicDJwLWNvcHktYmluZC1idG4nKTtcbiAgICBpZiAoY29weUJpbmRCdG4pIHtcbiAgICAgICAgY29weUJpbmRCdG4uZGlzYWJsZWQgPSAhYXR0ZXN0YXRpb247XG4gICAgfVxuXG4gICAgY29uc3QgY2xlYXJCaW5kQnRuID0gJCgnbGlicDJwLWNsZWFyLWJpbmQtYnRuJyk7XG4gICAgaWYgKGNsZWFyQmluZEJ0bikge1xuICAgICAgICBjbGVhckJpbmRCdG4uZGlzYWJsZWQgPSAhYXR0ZXN0YXRpb24gJiYgIWFjdGl2ZVB1YmtleSAmJiAhYWN0aXZlTnB1YjtcbiAgICB9XG5cbiAgICBjb25zdCBjb3B5UmVsYXlCdG4gPSAkKCdsaWJwMnAtY29weS1yZWxheS1idG4nKTtcbiAgICBpZiAoY29weVJlbGF5QnRuKSB7XG4gICAgICAgIGNvcHlSZWxheUJ0bi5kaXNhYmxlZCA9ICFzdGF0ZS5saWJwMnAucmVsYXlEZXNjcmlwdG9yO1xuICAgIH1cblxuICAgIGNvbnN0IGJvb3RzdHJhcEJ0biA9ICQoJ2xpYnAycC1ib290c3RyYXAtYnRuJyk7XG4gICAgaWYgKGJvb3RzdHJhcEJ0bikge1xuICAgICAgICBib290c3RyYXBCdG4uZGlzYWJsZWQgPSAhcmVhZHkgfHwgc3RhcnRpbmcgfHwgc3RvcHBpbmcgfHwgYm9vdHN0cmFwcGluZztcbiAgICB9XG5cbiAgICBjb25zdCBib290c3RyYXBJbnB1dCA9ICQoJ2xpYnAycC1ib290c3RyYXAtaW5wdXQnKTtcbiAgICBpZiAoYm9vdHN0cmFwSW5wdXQpIHtcbiAgICAgICAgY29uc3QgbmV4dFZhbHVlID0gYm9vdHN0cmFwQWRkcnMuam9pbignXFxuJyk7XG4gICAgICAgIGlmIChkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSBib290c3RyYXBJbnB1dCAmJiBib290c3RyYXBJbnB1dC52YWx1ZSAhPT0gbmV4dFZhbHVlKSB7XG4gICAgICAgICAgICBib290c3RyYXBJbnB1dC52YWx1ZSA9IG5leHRWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBib290c3RyYXBJbnB1dC5kaXNhYmxlZCA9ICFyZWFkeSB8fCBzdGFydGluZyB8fCBzdG9wcGluZztcbiAgICB9XG5cbiAgICBjb25zdCBwdWJzdWJQZWVyc0VsID0gJCgnbGlicDJwLXB1YnN1Yi1wZWVycycpO1xuICAgIGlmIChwdWJzdWJQZWVyc0VsKSB7XG4gICAgICAgIHB1YnN1YlBlZXJzRWwudGV4dENvbnRlbnQgPSBzdGF0ZS5saWJwMnAucHVic3ViUGVlcnMubGVuZ3RoXG4gICAgICAgICAgICA/IHN0YXRlLmxpYnAycC5wdWJzdWJQZWVycy5qb2luKCdcXG4nKVxuICAgICAgICAgICAgOiAnTm8gcHVic3ViIHBlZXJzIHlldC4nO1xuICAgIH1cblxuICAgIGNvbnN0IHN1YnNjcmliZWRUb3BpY3NFbCA9ICQoJ2xpYnAycC1zdWJzY3JpYmVkLXRvcGljcycpO1xuICAgIGlmIChzdWJzY3JpYmVkVG9waWNzRWwpIHtcbiAgICAgICAgc3Vic2NyaWJlZFRvcGljc0VsLnRleHRDb250ZW50ID0gc3RhdGUubGlicDJwLnN1YnNjcmliZWRUb3BpY3MubGVuZ3RoXG4gICAgICAgICAgICA/IHN0YXRlLmxpYnAycC5zdWJzY3JpYmVkVG9waWNzLmpvaW4oJ1xcbicpXG4gICAgICAgICAgICA6ICdOb3Qgc3Vic2NyaWJlZCB0byBhbnkgdG9waWNzLic7XG4gICAgfVxuXG4gICAgY29uc3QgcHVic3ViTWVzc2FnZXNFbCA9ICQoJ2xpYnAycC1wdWJzdWItbWVzc2FnZXMnKTtcbiAgICBpZiAocHVic3ViTWVzc2FnZXNFbCkge1xuICAgICAgICBwdWJzdWJNZXNzYWdlc0VsLmlubmVySFRNTCA9IHN0YXRlLmxpYnAycC5wdWJzdWJNZXNzYWdlcy5sZW5ndGhcbiAgICAgICAgICAgID8gc3RhdGUubGlicDJwLnB1YnN1Yk1lc3NhZ2VzLm1hcCgoZW50cnkpID0+IGBcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibGlicDJwLWxvZy1saW5lXCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibGlicDJwLWxvZy10c1wiPiR7ZXNjYXBlSHRtbChlbnRyeS50cyl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImxpYnAycC1sb2ctbXNnXCI+WyR7ZXNjYXBlSHRtbChlbnRyeS50b3BpYyl9XSAke2VzY2FwZUh0bWwoZW50cnkuZnJvbSl9OiAke2VzY2FwZUh0bWwoZW50cnkuZGF0YSl9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgYCkuam9pbignJylcbiAgICAgICAgICAgIDogJzxkaXYgY2xhc3M9XCJsaWJwMnAtbG9nLWVtcHR5XCI+Tm8gcHVic3ViIG1lc3NhZ2VzIHlldC48L2Rpdj4nO1xuICAgIH1cblxuICAgIGNvbnN0IHB1YnN1YkVycm9yRWwgPSAkKCdsaWJwMnAtcHVic3ViLWVycm9yJyk7XG4gICAgaWYgKHB1YnN1YkVycm9yRWwpIHtcbiAgICAgICAgcHVic3ViRXJyb3JFbC50ZXh0Q29udGVudCA9IHN0YXRlLmxpYnAycC5sYXN0UHVic3ViRXJyb3IgfHwgJyc7XG4gICAgICAgIHB1YnN1YkVycm9yRWwuY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZGVuJywgIXN0YXRlLmxpYnAycC5sYXN0UHVic3ViRXJyb3IpO1xuICAgIH1cblxuICAgIGNvbnN0IHN1YnNjcmliZUJ0biA9ICQoJ2xpYnAycC1zdWJzY3JpYmUtYnRuJyk7XG4gICAgaWYgKHN1YnNjcmliZUJ0bikge1xuICAgICAgICBzdWJzY3JpYmVCdG4uZGlzYWJsZWQgPSAhcmVhZHkgfHwgc3RhcnRpbmcgfHwgc3RvcHBpbmc7XG4gICAgfVxuXG4gICAgY29uc3QgdW5zdWJzY3JpYmVCdG4gPSAkKCdsaWJwMnAtdW5zdWJzY3JpYmUtYnRuJyk7XG4gICAgaWYgKHVuc3Vic2NyaWJlQnRuKSB7XG4gICAgICAgIHVuc3Vic2NyaWJlQnRuLmRpc2FibGVkID0gIXJlYWR5IHx8IHN0YXJ0aW5nIHx8IHN0b3BwaW5nO1xuICAgIH1cblxuICAgIGNvbnN0IHB1Ymxpc2hCdG4gPSAkKCdsaWJwMnAtcHVibGlzaC1idG4nKTtcbiAgICBpZiAocHVibGlzaEJ0bikge1xuICAgICAgICBwdWJsaXNoQnRuLmRpc2FibGVkID0gIXJlYWR5IHx8IHN0YXJ0aW5nIHx8IHN0b3BwaW5nO1xuICAgIH1cblxuICAgIGNvbnN0IHRvcGljSW5wdXQgPSAkKCdsaWJwMnAtdG9waWMtaW5wdXQnKTtcbiAgICBpZiAodG9waWNJbnB1dCkge1xuICAgICAgICB0b3BpY0lucHV0LmRpc2FibGVkID0gIXJlYWR5IHx8IHN0YXJ0aW5nIHx8IHN0b3BwaW5nO1xuICAgIH1cblxuICAgIGNvbnN0IHB1Ymxpc2hJbnB1dCA9ICQoJ2xpYnAycC1wdWJsaXNoLWlucHV0Jyk7XG4gICAgaWYgKHB1Ymxpc2hJbnB1dCkge1xuICAgICAgICBwdWJsaXNoSW5wdXQuZGlzYWJsZWQgPSAhcmVhZHkgfHwgc3RhcnRpbmcgfHwgc3RvcHBpbmc7XG4gICAgfVxuXG4gICAgY29uc3QgYXV0b1BpbmdUb2dnbGUgPSAkKCdsaWJwMnAtYXV0by1waW5nLXRvZ2dsZScpO1xuICAgIGlmIChhdXRvUGluZ1RvZ2dsZSkge1xuICAgICAgICBhdXRvUGluZ1RvZ2dsZS5jaGVja2VkID0gc3RhdGUubGlicDJwLmF1dG9QaW5nRW5hYmxlZDtcbiAgICB9XG5cbiAgICBjb25zdCBhdXRvUGluZ0ludGVydmFsID0gJCgnbGlicDJwLWF1dG8tcGluZy1pbnRlcnZhbCcpO1xuICAgIGlmIChhdXRvUGluZ0ludGVydmFsKSB7XG4gICAgICAgIGF1dG9QaW5nSW50ZXJ2YWwudmFsdWUgPSBTdHJpbmcoc3RhdGUubGlicDJwLmF1dG9QaW5nSW50ZXJ2YWwpO1xuICAgICAgICBhdXRvUGluZ0ludGVydmFsLmRpc2FibGVkID0gIXN0YXRlLmxpYnAycC5hdXRvUGluZ0VuYWJsZWQ7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBzdGFydExpYnAycE5vZGUoKSB7XG4gICAgYXdhaXQgc2VuZExpYnAycE1lc3NhZ2UoJ2xpYnAycC5zdGFydCcpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzdG9wTGlicDJwTm9kZSgpIHtcbiAgICBhd2FpdCBzZW5kTGlicDJwTWVzc2FnZSgnbGlicDJwLnN0b3AnKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZGlhbExpYnAycFBlZXIoKSB7XG4gICAgY29uc3QgcGVlcklucHV0ID0gJCgnbGlicDJwLXBlZXItaW5wdXQnKTtcbiAgICBjb25zdCB0YXJnZXQgPSBwZWVySW5wdXQ/LnZhbHVlLnRyaW0oKTtcbiAgICBpZiAoIXRhcmdldCkge1xuICAgICAgICBzdGF0ZS5saWJwMnAubGFzdEVycm9yID0gJ0VudGVyIGEgbGlicDJwIG11bHRpYWRkciBmaXJzdC4nO1xuICAgICAgICByZW5kZXJMaWJwMnAoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBhd2FpdCBzZW5kTGlicDJwTWVzc2FnZSgnbGlicDJwLmRpYWwnLCB0YXJnZXQpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBib290c3RyYXBMaWJwMnBOb2RlKCkge1xuICAgIGNvbnN0IGlucHV0ID0gJCgnbGlicDJwLWJvb3RzdHJhcC1pbnB1dCcpO1xuICAgIGNvbnN0IHJhdyA9IGlucHV0Py52YWx1ZSB8fCAnJztcbiAgICBjb25zdCBhZGRycyA9IHJhd1xuICAgICAgICAuc3BsaXQoL1xccj9cXG58LC8pXG4gICAgICAgIC5tYXAoKGFkZHIpID0+IGFkZHIudHJpbSgpKVxuICAgICAgICAuZmlsdGVyKEJvb2xlYW4pO1xuXG4gICAgaWYgKCFhZGRycy5sZW5ndGgpIHtcbiAgICAgICAgc3RhdGUubGlicDJwLmxhc3RCb290c3RyYXBFcnJvciA9ICdBZGQgYXQgbGVhc3Qgb25lIGJvb3RzdHJhcCBtdWx0aWFkZHIuJztcbiAgICAgICAgcmVuZGVyTGlicDJwKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBhd2FpdCBzZW5kTGlicDJwTWVzc2FnZSgnbGlicDJwLmJvb3RzdHJhcCcsIGFkZHJzKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gYmluZExpYnAycElkZW50aXR5KCkge1xuICAgIGF3YWl0IHNlbmRMaWJwMnBNZXNzYWdlKCdsaWJwMnAuYmluZElkZW50aXR5Jyk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNsZWFyTGlicDJwQmluZGluZygpIHtcbiAgICBhd2FpdCBzZW5kTGlicDJwTWVzc2FnZSgnbGlicDJwLmNsZWFyQmluZGluZycpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBjb3B5TGlicDJwQmluZGluZygpIHtcbiAgICBjb25zdCBwYXlsb2FkID0gc3RhdGUubGlicDJwLmF0dGVzdGF0aW9uO1xuICAgIGlmICghcGF5bG9hZCkgcmV0dXJuO1xuICAgIGNvbnN0IHRleHQgPSBKU09OLnN0cmluZ2lmeShwYXlsb2FkLCBudWxsLCAyKTtcbiAgICBpZiAobmF2aWdhdG9yLmNsaXBib2FyZD8ud3JpdGVUZXh0KSB7XG4gICAgICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHRleHQpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ2NvcHknLCBwYXlsb2FkOiB0ZXh0IH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiBjb3B5UmVsYXlEZXNjcmlwdG9yKCkge1xuICAgIGNvbnN0IGRlc2NyaXB0b3IgPSBzdGF0ZS5saWJwMnAucmVsYXlEZXNjcmlwdG9yO1xuICAgIGlmICghZGVzY3JpcHRvcikgcmV0dXJuO1xuICAgIGNvbnN0IHRleHQgPSBKU09OLnN0cmluZ2lmeShkZXNjcmlwdG9yLCBudWxsLCAyKTtcbiAgICBpZiAobmF2aWdhdG9yLmNsaXBib2FyZD8ud3JpdGVUZXh0KSB7XG4gICAgICAgIGF3YWl0IG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KHRleHQpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ2NvcHknLCBwYXlsb2FkOiB0ZXh0IH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzdWJzY3JpYmVQdWJzdWJUb3BpYygpIHtcbiAgICBjb25zdCBpbnB1dCA9ICQoJ2xpYnAycC10b3BpYy1pbnB1dCcpO1xuICAgIGNvbnN0IHRvcGljID0gaW5wdXQ/LnZhbHVlLnRyaW0oKTtcbiAgICBpZiAoIXRvcGljKSB7XG4gICAgICAgIHN0YXRlLmxpYnAycC5sYXN0UHVic3ViRXJyb3IgPSAnRW50ZXIgYSB0b3BpYyBmaXJzdC4nO1xuICAgICAgICByZW5kZXJMaWJwMnAoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBhd2FpdCBzZW5kTGlicDJwTWVzc2FnZSgnbGlicDJwLnN1YnNjcmliZVRvcGljJywgdG9waWMpO1xufVxuXG5hc3luYyBmdW5jdGlvbiB1bnN1YnNjcmliZVB1YnN1YlRvcGljKCkge1xuICAgIGNvbnN0IGlucHV0ID0gJCgnbGlicDJwLXRvcGljLWlucHV0Jyk7XG4gICAgY29uc3QgdG9waWMgPSBpbnB1dD8udmFsdWUudHJpbSgpO1xuICAgIGlmICghdG9waWMpIHtcbiAgICAgICAgc3RhdGUubGlicDJwLmxhc3RQdWJzdWJFcnJvciA9ICdFbnRlciBhIHRvcGljIGZpcnN0Lic7XG4gICAgICAgIHJlbmRlckxpYnAycCgpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGF3YWl0IHNlbmRMaWJwMnBNZXNzYWdlKCdsaWJwMnAudW5zdWJzY3JpYmVUb3BpYycsIHRvcGljKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gcHVibGlzaFB1YnN1Yk1lc3NhZ2UoKSB7XG4gICAgY29uc3QgdG9waWNJbnB1dCA9ICQoJ2xpYnAycC10b3BpYy1pbnB1dCcpO1xuICAgIGNvbnN0IHB1Ymxpc2hJbnB1dCA9ICQoJ2xpYnAycC1wdWJsaXNoLWlucHV0Jyk7XG4gICAgY29uc3QgdG9waWMgPSB0b3BpY0lucHV0Py52YWx1ZS50cmltKCk7XG4gICAgY29uc3QgZGF0YSA9IHB1Ymxpc2hJbnB1dD8udmFsdWUgfHwgJyc7XG4gICAgaWYgKCF0b3BpYykge1xuICAgICAgICBzdGF0ZS5saWJwMnAubGFzdFB1YnN1YkVycm9yID0gJ0VudGVyIGEgdG9waWMgZmlyc3QuJztcbiAgICAgICAgcmVuZGVyTGlicDJwKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgYXdhaXQgc2VuZExpYnAycE1lc3NhZ2UoJ2xpYnAycC5wdWJsaXNoVG9waWMnLCB7IHRvcGljLCBkYXRhIH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiB1cGRhdGVBdXRvUGluZygpIHtcbiAgICBjb25zdCB0b2dnbGUgPSAkKCdsaWJwMnAtYXV0by1waW5nLXRvZ2dsZScpO1xuICAgIGNvbnN0IGludGVydmFsSW5wdXQgPSAkKCdsaWJwMnAtYXV0by1waW5nLWludGVydmFsJyk7XG4gICAgY29uc3QgZW5hYmxlZCA9IHRvZ2dsZT8uY2hlY2tlZCA/PyBmYWxzZTtcbiAgICBjb25zdCBpbnRlcnZhbCA9IE1hdGgubWF4KDUsIE1hdGgubWluKDM2MDAsIE1hdGguZmxvb3IoTnVtYmVyKGludGVydmFsSW5wdXQ/LnZhbHVlKSB8fCAzMCkpKTtcbiAgICBhd2FpdCBzZW5kTGlicDJwTWVzc2FnZSgnbGlicDJwLnNldEF1dG9QaW5nJywgeyBlbmFibGVkLCBpbnRlcnZhbCB9KTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlUnVudGltZU1lc3NhZ2UobWVzc2FnZSkge1xuICAgIGlmIChtZXNzYWdlPy5raW5kID09PSAnbGlicDJwLnN0YXR1c1VwZGF0ZScpIHtcbiAgICAgICAgYXBwbHlTdGF0dXNVcGRhdGUobWVzc2FnZS5wYXlsb2FkKTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgYXBpLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKGhhbmRsZVJ1bnRpbWVNZXNzYWdlKTtcblxuICAgIGF3YWl0IHJlbG9hZEZlYXR1cmVzKCk7XG4gICAgY29uc3Qgc3RhdHVzUmVzcG9uc2UgPSBhd2FpdCBzZW5kTGlicDJwTWVzc2FnZSgnbGlicDJwLnN0YXR1cycpO1xuICAgIGlmIChzdGF0dXNSZXNwb25zZT8uc3RhdHVzKSB7XG4gICAgICAgIGFwcGx5U3RhdHVzVXBkYXRlKHN0YXR1c1Jlc3BvbnNlLnN0YXR1cyk7XG4gICAgfVxuXG4gICAgJCgnbGlicDJwLXN0YXJ0LWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcbiAgICAgICAgYXdhaXQgc3RhcnRMaWJwMnBOb2RlKCk7XG4gICAgfSk7XG5cbiAgICAkKCdsaWJwMnAtc3RvcC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IHN0b3BMaWJwMnBOb2RlKCk7XG4gICAgfSk7XG5cbiAgICAkKCdsaWJwMnAtZGlhbC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IGRpYWxMaWJwMnBQZWVyKCk7XG4gICAgfSk7XG5cbiAgICAkKCdsaWJwMnAtYmluZC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IGJpbmRMaWJwMnBJZGVudGl0eSgpO1xuICAgIH0pO1xuXG4gICAgJCgnbGlicDJwLWJvb3RzdHJhcC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IGJvb3RzdHJhcExpYnAycE5vZGUoKTtcbiAgICB9KTtcblxuICAgICQoJ2xpYnAycC1jb3B5LWJpbmQtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBhd2FpdCBjb3B5TGlicDJwQmluZGluZygpO1xuICAgIH0pO1xuXG4gICAgJCgnbGlicDJwLWNvcHktcmVsYXktYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBhd2FpdCBjb3B5UmVsYXlEZXNjcmlwdG9yKCk7XG4gICAgfSk7XG5cbiAgICAkKCdsaWJwMnAtY2xlYXItYmluZC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IGNsZWFyTGlicDJwQmluZGluZygpO1xuICAgIH0pO1xuXG4gICAgJCgnbGlicDJwLXN1YnNjcmliZS1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IHN1YnNjcmliZVB1YnN1YlRvcGljKCk7XG4gICAgfSk7XG5cbiAgICAkKCdsaWJwMnAtdW5zdWJzY3JpYmUtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBhd2FpdCB1bnN1YnNjcmliZVB1YnN1YlRvcGljKCk7XG4gICAgfSk7XG5cbiAgICAkKCdsaWJwMnAtcHVibGlzaC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IHB1Ymxpc2hQdWJzdWJNZXNzYWdlKCk7XG4gICAgfSk7XG5cbiAgICAkKCdsaWJwMnAtcHVibGlzaC1pbnB1dCcpPy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldmVudC5rZXkgPT09ICdFbnRlcicpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBhd2FpdCBwdWJsaXNoUHVic3ViTWVzc2FnZSgpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAkKCdsaWJwMnAtcGVlci1pbnB1dCcpPy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldmVudC5rZXkgPT09ICdFbnRlcicpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBhd2FpdCBkaWFsTGlicDJwUGVlcigpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAkKCdsaWJwMnAtYXV0by1waW5nLXRvZ2dsZScpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IHVwZGF0ZUF1dG9QaW5nKCk7XG4gICAgfSk7XG5cbiAgICAkKCdsaWJwMnAtYXV0by1waW5nLWludGVydmFsJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGFzeW5jICgpID0+IHtcbiAgICAgICAgYXdhaXQgdXBkYXRlQXV0b1BpbmcoKTtcbiAgICB9KTtcbn1cblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGluaXQpO1xuXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xvc2UtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgIHdpbmRvdy5jbG9zZSgpO1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiOztBQWdCQSxNQUFNLFdBQ0YsT0FBTyxZQUFZLGNBQWMsVUFDakMsT0FBTyxXQUFZLGNBQWMsU0FDakM7QUFFSixNQUFJLENBQUMsVUFBVTtBQUNYLFVBQU0sSUFBSSxNQUFNLGtGQUFrRjtBQUFBLEVBQ3RHO0FBTUEsTUFBTSxXQUFXLE9BQU8sWUFBWSxlQUFlLE9BQU8sV0FBVztBQU1yRSxXQUFTLFVBQVUsU0FBUyxRQUFRO0FBQ2hDLFdBQU8sSUFBSSxTQUFTO0FBSWhCLFVB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
