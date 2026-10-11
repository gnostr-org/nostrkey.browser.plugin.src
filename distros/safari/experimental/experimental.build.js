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
  }
  document.addEventListener("DOMContentLoaded", init);
  document.getElementById("close-btn")?.addEventListener("click", () => {
    window.close();
  });
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uLy4uL3NyYy9leHBlcmltZW50YWwvZXhwZXJpbWVudGFsLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIEJyb3dzZXIgQVBJIGNvbXBhdGliaWxpdHkgbGF5ZXIgZm9yIENocm9tZSAvIFNhZmFyaSAvIEZpcmVmb3guXG4gKlxuICogU2FmYXJpIGFuZCBGaXJlZm94IGV4cG9zZSBgYnJvd3Nlci4qYCAoUHJvbWlzZS1iYXNlZCwgV2ViRXh0ZW5zaW9uIHN0YW5kYXJkKS5cbiAqIENocm9tZSBleHBvc2VzIGBjaHJvbWUuKmAgKGNhbGxiYWNrLWJhc2VkIGhpc3RvcmljYWxseSwgYnV0IE1WMyBzdXBwb3J0c1xuICogcHJvbWlzZXMgb24gbW9zdCBBUElzKS4gSW4gYSBzZXJ2aWNlLXdvcmtlciBjb250ZXh0IGBicm93c2VyYCBpcyB1bmRlZmluZWRcbiAqIG9uIENocm9tZSwgc28gd2Ugbm9ybWFsaXNlIGV2ZXJ5dGhpbmcgaGVyZS5cbiAqXG4gKiBVc2FnZTogIGltcG9ydCB7IGFwaSB9IGZyb20gJy4vdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwnO1xuICogICAgICAgICBhcGkucnVudGltZS5zZW5kTWVzc2FnZSguLi4pXG4gKlxuICogVGhlIGV4cG9ydGVkIGBhcGlgIG9iamVjdCBtaXJyb3JzIHRoZSBzdWJzZXQgb2YgdGhlIFdlYkV4dGVuc2lvbiBBUEkgdGhhdFxuICogTm9zdHJLZXkgYWN0dWFsbHkgdXNlcywgd2l0aCBldmVyeSBtZXRob2QgcmV0dXJuaW5nIGEgUHJvbWlzZS5cbiAqL1xuXG4vLyBEZXRlY3Qgd2hpY2ggZ2xvYmFsIG5hbWVzcGFjZSBpcyBhdmFpbGFibGUuXG5jb25zdCBfYnJvd3NlciA9XG4gICAgdHlwZW9mIGJyb3dzZXIgIT09ICd1bmRlZmluZWQnID8gYnJvd3NlciA6XG4gICAgdHlwZW9mIGNocm9tZSAgIT09ICd1bmRlZmluZWQnID8gY2hyb21lICA6XG4gICAgbnVsbDtcblxuaWYgKCFfYnJvd3Nlcikge1xuICAgIHRocm93IG5ldyBFcnJvcignYnJvd3Nlci1wb2x5ZmlsbDogTm8gZXh0ZW5zaW9uIEFQSSBuYW1lc3BhY2UgZm91bmQgKG5laXRoZXIgYnJvd3NlciBub3IgY2hyb21lKS4nKTtcbn1cblxuLyoqXG4gKiBUcnVlIHdoZW4gcnVubmluZyBvbiBDaHJvbWUgKG9yIGFueSBDaHJvbWl1bS1iYXNlZCBicm93c2VyIHRoYXQgb25seVxuICogZXhwb3NlcyB0aGUgYGNocm9tZWAgbmFtZXNwYWNlKS5cbiAqL1xuY29uc3QgaXNDaHJvbWUgPSB0eXBlb2YgYnJvd3NlciA9PT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNocm9tZSAhPT0gJ3VuZGVmaW5lZCc7XG5cbi8qKlxuICogV3JhcCBhIENocm9tZSBjYWxsYmFjay1zdHlsZSBtZXRob2Qgc28gaXQgcmV0dXJucyBhIFByb21pc2UuXG4gKiBJZiB0aGUgbWV0aG9kIGFscmVhZHkgcmV0dXJucyBhIHByb21pc2UgKE1WMykgd2UganVzdCBwYXNzIHRocm91Z2guXG4gKi9cbmZ1bmN0aW9uIHByb21pc2lmeShjb250ZXh0LCBtZXRob2QpIHtcbiAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgLy8gTVYzIENocm9tZSBBUElzIHJldHVybiBwcm9taXNlcyB3aGVuIG5vIGNhbGxiYWNrIGlzIHN1cHBsaWVkLlxuICAgICAgICAvLyBXZSB0cnkgdGhlIHByb21pc2UgcGF0aCBmaXJzdDsgaWYgdGhlIHJ1bnRpbWUgc2lnbmFscyBhbiBlcnJvclxuICAgICAgICAvLyB2aWEgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yIGluc2lkZSBhIGNhbGxiYWNrIHdlIGNhdGNoIHRoYXQgdG9vLlxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gbWV0aG9kLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgICAvLyBmYWxsIHRocm91Z2ggdG8gY2FsbGJhY2sgd3JhcHBpbmdcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBtZXRob2QuYXBwbHkoY29udGV4dCwgW1xuICAgICAgICAgICAgICAgIC4uLmFyZ3MsXG4gICAgICAgICAgICAgICAgKC4uLmNiQXJncykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2Jyb3dzZXIucnVudGltZSAmJiBfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGNiQXJncy5sZW5ndGggPD0gMSA/IGNiQXJnc1swXSA6IGNiQXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQnVpbGQgdGhlIHVuaWZpZWQgYGFwaWAgb2JqZWN0XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuY29uc3QgYXBpID0ge307XG5cbi8vIC0tLSBydW50aW1lIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnJ1bnRpbWUgPSB7XG4gICAgLyoqXG4gICAgICogc2VuZE1lc3NhZ2UgXHUyMDEzIGFsd2F5cyByZXR1cm5zIGEgUHJvbWlzZS5cbiAgICAgKi9cbiAgICBzZW5kTWVzc2FnZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIucnVudGltZSwgX2Jyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSkoLi4uYXJncyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uTWVzc2FnZSBcdTIwMTMgdGhpbiB3cmFwcGVyIHNvIGNhbGxlcnMgdXNlIGEgY29uc2lzdGVudCByZWZlcmVuY2UuXG4gICAgICogVGhlIGxpc3RlbmVyIHNpZ25hdHVyZSBpcyAobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpLlxuICAgICAqIE9uIENocm9tZSB0aGUgbGlzdGVuZXIgY2FuIHJldHVybiBgdHJ1ZWAgdG8ga2VlcCB0aGUgY2hhbm5lbCBvcGVuLFxuICAgICAqIG9yIHJldHVybiBhIFByb21pc2UgKE1WMykuICBTYWZhcmkgLyBGaXJlZm94IGV4cGVjdCBhIFByb21pc2UgcmV0dXJuLlxuICAgICAqL1xuICAgIG9uTWVzc2FnZTogX2Jyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UsXG5cbiAgICAvKipcbiAgICAgKiBnZXRVUkwgXHUyMDEzIHN5bmNocm9ub3VzIG9uIGFsbCBicm93c2Vycy5cbiAgICAgKi9cbiAgICBnZXRVUkwocGF0aCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5nZXRVUkwocGF0aCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9wZW5PcHRpb25zUGFnZVxuICAgICAqL1xuICAgIG9wZW5PcHRpb25zUGFnZSgpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUub3Blbk9wdGlvbnNQYWdlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5ydW50aW1lLCBfYnJvd3Nlci5ydW50aW1lLm9wZW5PcHRpb25zUGFnZSkoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXhwb3NlIHRoZSBpZCBmb3IgY29udmVuaWVuY2UuXG4gICAgICovXG4gICAgZ2V0IGlkKCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5pZDtcbiAgICB9LFxufTtcblxuLy8gLS0tIHN0b3JhZ2UubG9jYWwgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkuc3RvcmFnZSA9IHtcbiAgICBsb2NhbDoge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICAvLyAtLS0gc3RvcmFnZS5zeW5jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBOdWxsIHdoZW4gdGhlIGJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IHN5bmMgKG9sZGVyIFNhZmFyaSwgZXRjLilcbiAgICBzeW5jOiBfYnJvd3Nlci5zdG9yYWdlPy5zeW5jID8ge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuc2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBnZXRCeXRlc0luVXNlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpIHtcbiAgICAgICAgICAgICAgICAvLyBTYWZhcmkgZG9lc24ndCBzdXBwb3J0IGdldEJ5dGVzSW5Vc2UgXHUyMDE0IHJldHVybiAwXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0gOiBudWxsLFxuXG4gICAgLy8gLS0tIHN0b3JhZ2Uuc2Vzc2lvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gTVYzIGluLW1lbW9yeSBhcmVhIHRoYXQgc3Vydml2ZXMgc2VydmljZS13b3JrZXIgZXZpY3Rpb24gYnV0IG5ldmVyIHRvdWNoZXNcbiAgICAvLyBkaXNrLiBOdWxsIG9uIGVuZ2luZXMgdGhhdCBkb24ndCBpbXBsZW1lbnQgaXQgKFNhZmFyaSBiYWNrZ3JvdW5kIHBhZ2UsXG4gICAgLy8gb2xkZXIgRmlyZWZveCkgXHUyMDE0IGNhbGxlcnMgbXVzdCBmZWF0dXJlLWRldGVjdCBhbmQgZmFsbCBiYWNrLlxuICAgIHNlc3Npb246IF9icm93c2VyLnN0b3JhZ2U/LnNlc3Npb24gPyB7XG4gICAgICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLmdldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24sIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5jbGVhcikoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXN0cmljdCB0aGUgYXJlYSB0byBleHRlbnNpb24tcHJpdmlsZWdlZCBjb250ZXh0cy4gQ2hyb21lLW9ubHk7XG4gICAgICAgICAqIHJlc29sdmVzIGhhcm1sZXNzbHkgd2hlcmUgdGhlIG1ldGhvZCBpcyBhYnNlbnQuXG4gICAgICAgICAqL1xuICAgICAgICBzZXRBY2Nlc3NMZXZlbCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIV9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXRBY2Nlc3NMZXZlbCkgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uc2V0QWNjZXNzTGV2ZWwoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldEFjY2Vzc0xldmVsKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9IDogbnVsbCxcblxuICAgIC8vIC0tLSBzdG9yYWdlLm9uQ2hhbmdlZCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIG9uQ2hhbmdlZDogX2Jyb3dzZXIuc3RvcmFnZT8ub25DaGFuZ2VkIHx8IG51bGwsXG59O1xuXG4vLyAtLS0gdGFicyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS50YWJzID0ge1xuICAgIGNyZWF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmNyZWF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuY3JlYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHF1ZXJ5KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMucXVlcnkoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnF1ZXJ5KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMucmVtb3ZlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHVwZGF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnVwZGF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMudXBkYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmdldCguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuZ2V0KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldEN1cnJlbnQoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHNlbmRNZXNzYWdlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuc2VuZE1lc3NhZ2UoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnNlbmRNZXNzYWdlKSguLi5hcmdzKTtcbiAgICB9LFxufTtcblxuLy8gLS0tIGFsYXJtcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBjaHJvbWUuYWxhcm1zIHN1cnZpdmVzIE1WMyBzZXJ2aWNlLXdvcmtlciBldmljdGlvbjsgc2V0VGltZW91dCBkb2VzIG5vdC5cbmFwaS5hbGFybXMgPSBfYnJvd3Nlci5hbGFybXMgPyB7XG4gICAgY3JlYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgLy8gYWxhcm1zLmNyZWF0ZSBpcyBzeW5jaHJvbm91cyBvbiBDaHJvbWUsIHJldHVybnMgUHJvbWlzZSBvbiBGaXJlZm94L1NhZmFyaVxuICAgICAgICBjb25zdCByZXN1bHQgPSBfYnJvd3Nlci5hbGFybXMuY3JlYXRlKC4uLmFyZ3MpO1xuICAgICAgICByZXR1cm4gcmVzdWx0ICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gJ2Z1bmN0aW9uJyA/IHJlc3VsdCA6IFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH0sXG4gICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuYWxhcm1zLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuYWxhcm1zLCBfYnJvd3Nlci5hbGFybXMuY2xlYXIpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgb25BbGFybTogX2Jyb3dzZXIuYWxhcm1zLm9uQWxhcm0sXG59IDogbnVsbDtcblxuZXhwb3J0IHsgYXBpLCBpc0Nocm9tZSB9O1xuIiwgImltcG9ydCB7IGFwaSB9IGZyb20gJy4uL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsJztcblxuY29uc3QgRkVBVFVSRVMgPSBbXG4gICAgW1xuICAgICAgICAnbm9uZScsXG4gICAgICAgICdOSVAtWFg6IE5vbmUnLFxuICAgICAgICAnUmVzZXJ2ZWQgZm9yIHRoZSBmdXR1cmUgdXNlLicsXG4gICAgXSxcbl07XG5cbmNvbnN0ICQgPSAoaWQpID0+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcblxuY29uc3Qgc3RhdGUgPSB7XG4gICAgZmVhdHVyZXM6IFtdLFxuICAgIGxpYnAycDoge1xuICAgICAgICByZWFkeTogZmFsc2UsXG4gICAgICAgIHN0YXJ0aW5nOiBmYWxzZSxcbiAgICAgICAgc3RvcHBpbmc6IGZhbHNlLFxuICAgICAgICBiaW5kaW5nOiBmYWxzZSxcbiAgICAgICAgYm9vdHN0cmFwcGluZzogZmFsc2UsXG4gICAgICAgIHBlZXJJZDogJycsXG4gICAgICAgIHBlZXJJZFNob3J0OiAnJyxcbiAgICAgICAgYWN0aXZlUHVia2V5OiAnJyxcbiAgICAgICAgYWN0aXZlTnB1YjogJycsXG4gICAgICAgIGF0dGVzdGF0aW9uOiBudWxsLFxuICAgICAgICByZWxheURlc2NyaXB0b3I6IG51bGwsXG4gICAgICAgIGRlZmF1bHRCb290c3RyYXBBZGRyczogW10sXG4gICAgICAgIGRpc2NvdmVyeUJvb3RzdHJhcEFkZHJzOiBbXSxcbiAgICAgICAgYm9vdHN0cmFwQWRkcnM6IFtdLFxuICAgICAgICBsaXN0ZW5BZGRyczogW10sXG4gICAgICAgIHdlYnJ0Y0FkZHJzOiBbXSxcbiAgICAgICAgY29ubmVjdGlvbkNvdW50OiAwLFxuICAgICAgICBwdWJzdWJQZWVyczogW10sXG4gICAgICAgIHN1YnNjcmliZWRUb3BpY3M6IFtdLFxuICAgICAgICBwdWJzdWJNZXNzYWdlczogW10sXG4gICAgICAgIGxhc3REaWFsVGFyZ2V0OiAnJyxcbiAgICAgICAgbGFzdERpYWxQZWVyOiAnJyxcbiAgICAgICAgbGFzdFBpbmdMYXRlbmN5OiAnJyxcbiAgICAgICAgbGFzdEJpbmRFcnJvcjogJycsXG4gICAgICAgIGxhc3RCb290c3RyYXBFcnJvcjogJycsXG4gICAgICAgIGxhc3RFcnJvcjogJycsXG4gICAgICAgIGxvZ3M6IFtdLFxuICAgIH0sXG59O1xuXG5mdW5jdGlvbiBlc2NhcGVIdG1sKHZhbHVlKSB7XG4gICAgcmV0dXJuIFN0cmluZyh2YWx1ZSlcbiAgICAgICAgLnJlcGxhY2VBbGwoJyYnLCAnJmFtcDsnKVxuICAgICAgICAucmVwbGFjZUFsbCgnPCcsICcmbHQ7JylcbiAgICAgICAgLnJlcGxhY2VBbGwoJz4nLCAnJmd0OycpXG4gICAgICAgIC5yZXBsYWNlQWxsKCdcIicsICcmcXVvdDsnKVxuICAgICAgICAucmVwbGFjZUFsbChcIidcIiwgJyYjMzk7Jyk7XG59XG5cbmZ1bmN0aW9uIHNob3J0VmFsdWUodmFsdWUsIGhlYWQgPSAxMCwgdGFpbCA9IDgpIHtcbiAgICBpZiAoIXZhbHVlKSByZXR1cm4gJyc7XG4gICAgaWYgKHZhbHVlLmxlbmd0aCA8PSBoZWFkICsgdGFpbCArIDMpIHJldHVybiB2YWx1ZTtcbiAgICByZXR1cm4gYCR7dmFsdWUuc2xpY2UoMCwgaGVhZCl9XHUyMDI2JHt2YWx1ZS5zbGljZSgtdGFpbCl9YDtcbn1cblxuZnVuY3Rpb24gYXBwbHlTdGF0dXNVcGRhdGUoc3RhdHVzKSB7XG4gICAgaWYgKCFzdGF0dXMgfHwgdHlwZW9mIHN0YXR1cyAhPT0gJ29iamVjdCcpIHJldHVybjtcbiAgICBzdGF0ZS5saWJwMnAgPSB7IC4uLnN0YXRlLmxpYnAycCwgLi4uc3RhdHVzIH07XG4gICAgcmVuZGVyTGlicDJwKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNlbmRMaWJwMnBNZXNzYWdlKGtpbmQsIHBheWxvYWQpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZCwgcGF5bG9hZCB9KTtcbiAgICAgICAgaWYgKHJlc3BvbnNlPy5zdGF0dXMpIHtcbiAgICAgICAgICAgIGFwcGx5U3RhdHVzVXBkYXRlKHJlc3BvbnNlLnN0YXR1cyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHN0YXRlLmxpYnAycC5sYXN0RXJyb3IgPSBtZXNzYWdlO1xuICAgICAgICByZW5kZXJMaWJwMnAoKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBtZXNzYWdlIH07XG4gICAgfVxufVxuXG5mdW5jdGlvbiByZW5kZXJGZWF0dXJlcygpIHtcbiAgICBjb25zdCBjb250YWluZXIgPSAkKCdmZWF0dXJlcy1jb250YWluZXInKTtcbiAgICBpZiAoIWNvbnRhaW5lcikgcmV0dXJuO1xuXG4gICAgY29udGFpbmVyLmlubmVySFRNTCA9IHN0YXRlLmZlYXR1cmVzLm1hcCgoW25hbWUsIGFjdGl2ZSwgc2hvcnREZXNjLCBsb25nRGVzY10pID0+IGBcbiAgICAgICAgPGRpdiBjbGFzcz1cIm10LTRcIj5cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgIGNsYXNzPVwiY2hlY2tib3hcIlxuICAgICAgICAgICAgICAgIHR5cGU9XCJjaGVja2JveFwiXG4gICAgICAgICAgICAgICAgaWQ9XCIke25hbWV9XCJcbiAgICAgICAgICAgICAgICAke2FjdGl2ZSA/ICdjaGVja2VkJyA6ICcnfVxuICAgICAgICAgICAgICAgIGRhdGEtZmVhdHVyZT1cIiR7bmFtZX1cIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9XCIke25hbWV9XCIgY2xhc3M9XCJmb250LWJvbGRcIj4ke3Nob3J0RGVzY308L2xhYmVsPlxuICAgICAgICAgICAgPHAgY2xhc3M9XCJpdGFsaWNcIj4ke2xvbmdEZXNjfTwvcD5cbiAgICAgICAgPC9kaXY+XG4gICAgYCkuam9pbignJyk7XG5cbiAgICBjb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJykuZm9yRWFjaCgoY2IpID0+IHtcbiAgICAgICAgY2IuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgYXN5bmMgKGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGZlYXR1cmUgPSBlLnRhcmdldC5kYXRhc2V0LmZlYXR1cmU7XG4gICAgICAgICAgICBjb25zdCBhY3RpdmUgPSBlLnRhcmdldC5jaGVja2VkO1xuICAgICAgICAgICAgYXdhaXQgYXBpLnN0b3JhZ2UubG9jYWwuc2V0KHsgW2ZlYXR1cmVdOiBhY3RpdmUgfSk7XG4gICAgICAgICAgICBhd2FpdCByZWxvYWRGZWF0dXJlcygpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gcmVsb2FkRmVhdHVyZXMoKSB7XG4gICAgc3RhdGUuZmVhdHVyZXMgPSBhd2FpdCBQcm9taXNlLmFsbChcbiAgICAgICAgRkVBVFVSRVMubWFwKGFzeW5jIChbbmFtZSwgc2hvcnREZXNjLCBsb25nRGVzY10pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IGBmZWF0dXJlOiR7bmFtZX1gO1xuICAgICAgICAgICAgY29uc3Qgc3RvcmVkID0gYXdhaXQgYXBpLnN0b3JhZ2UubG9jYWwuZ2V0KHsgW2tleV06IGZhbHNlIH0pO1xuICAgICAgICAgICAgcmV0dXJuIFtrZXksIHN0b3JlZFtrZXldLCBzaG9ydERlc2MsIGxvbmdEZXNjXTtcbiAgICAgICAgfSlcbiAgICApO1xuICAgIHJlbmRlckZlYXR1cmVzKCk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckxpYnAycCgpIHtcbiAgICBjb25zdCB7XG4gICAgICAgIHJlYWR5LFxuICAgICAgICBzdGFydGluZyxcbiAgICAgICAgc3RvcHBpbmcsXG4gICAgICAgIGJpbmRpbmcsXG4gICAgICAgIGJvb3RzdHJhcHBpbmcsXG4gICAgICAgIHBlZXJJZCxcbiAgICAgICAgcGVlcklkU2hvcnQsXG4gICAgICAgIGFjdGl2ZVB1YmtleSxcbiAgICAgICAgYWN0aXZlTnB1YixcbiAgICAgICAgYXR0ZXN0YXRpb24sXG4gICAgICAgIGxpc3RlbkFkZHJzLFxuICAgICAgICBkZWZhdWx0Qm9vdHN0cmFwQWRkcnMsXG4gICAgICAgIGJvb3RzdHJhcEFkZHJzLFxuICAgICAgICBjb25uZWN0aW9uQ291bnQsXG4gICAgICAgIGxhc3REaWFsVGFyZ2V0LFxuICAgICAgICBsYXN0RGlhbFBlZXIsXG4gICAgICAgIGxhc3RQaW5nTGF0ZW5jeSxcbiAgICAgICAgbGFzdEJpbmRFcnJvcixcbiAgICAgICAgbGFzdEJvb3RzdHJhcEVycm9yLFxuICAgICAgICBsYXN0RXJyb3IsXG4gICAgICAgIGxvZ3MsXG4gICAgfSA9IHN0YXRlLmxpYnAycDtcblxuICAgIGNvbnN0IHN0YXR1c0VsID0gJCgnbGlicDJwLXN0YXR1cycpO1xuICAgIGlmIChzdGF0dXNFbCkge1xuICAgICAgICBzdGF0dXNFbC50ZXh0Q29udGVudCA9IHJlYWR5XG4gICAgICAgICAgICA/ICdSZWFkeSdcbiAgICAgICAgICAgIDogc3RhcnRpbmdcbiAgICAgICAgICAgICAgICA/ICdTdGFydGluZ1x1MjAyNidcbiAgICAgICAgICAgICAgICA6IHN0b3BwaW5nXG4gICAgICAgICAgICAgICAgICAgID8gJ1N0b3BwaW5nXHUyMDI2J1xuICAgICAgICAgICAgICAgICAgICA6ICdTdG9wcGVkJztcbiAgICB9XG5cbiAgICBjb25zdCBwZWVySWRFbCA9ICQoJ2xpYnAycC1wZWVyLWlkJyk7XG4gICAgaWYgKHBlZXJJZEVsKSB7XG4gICAgICAgIHBlZXJJZEVsLnRleHRDb250ZW50ID0gcGVlcklkU2hvcnQgfHwgcGVlcklkIHx8ICdOb3Qgc3RhcnRlZCc7XG4gICAgfVxuXG4gICAgY29uc3QgbGlzdGVuQWRkcnNFbCA9ICQoJ2xpYnAycC1saXN0ZW4tYWRkcnMnKTtcbiAgICBpZiAobGlzdGVuQWRkcnNFbCkge1xuICAgICAgICBsaXN0ZW5BZGRyc0VsLnRleHRDb250ZW50ID0gbGlzdGVuQWRkcnMubGVuZ3RoID8gbGlzdGVuQWRkcnMuam9pbignXFxuJykgOiAnTm8gYWR2ZXJ0aXNlZCBsaXN0ZW4gYWRkcmVzc2VzIGluIHRoaXMgYnJvd3NlciBub2RlLic7XG4gICAgfVxuXG4gICAgY29uc3Qgd2VicnRjQWRkcnNFbCA9ICQoJ2xpYnAycC13ZWJydGMtYWRkcnMnKTtcbiAgICBpZiAod2VicnRjQWRkcnNFbCkge1xuICAgICAgICB3ZWJydGNBZGRyc0VsLnRleHRDb250ZW50ID0gc3RhdGUubGlicDJwLndlYnJ0Y0FkZHJzLmxlbmd0aFxuICAgICAgICAgICAgPyBzdGF0ZS5saWJwMnAud2VicnRjQWRkcnMuam9pbignXFxuJylcbiAgICAgICAgICAgIDogJ05vIFdlYlJUQyBsaXN0ZW4gYWRkcmVzc2VzIHlldCAocmVxdWlyZXMgYSByZWxheSByZXNlcnZhdGlvbikuJztcbiAgICB9XG5cbiAgICBjb25zdCBkZWZhdWx0Qm9vdHN0cmFwRWwgPSAkKCdsaWJwMnAtZGVmYXVsdC1ib290c3RyYXAnKTtcbiAgICBpZiAoZGVmYXVsdEJvb3RzdHJhcEVsKSB7XG4gICAgICAgIGRlZmF1bHRCb290c3RyYXBFbC50ZXh0Q29udGVudCA9IGRlZmF1bHRCb290c3RyYXBBZGRycy5sZW5ndGhcbiAgICAgICAgICAgID8gZGVmYXVsdEJvb3RzdHJhcEFkZHJzLmpvaW4oJ1xcbicpXG4gICAgICAgICAgICA6ICdObyBkZWZhdWx0IFdTUyBib290c3RyYXAgcmVsYXlzIGNvbmZpZ3VyZWQuJztcbiAgICB9XG5cbiAgICBjb25zdCBkaXNjb3ZlcnlCb290c3RyYXBFbCA9ICQoJ2xpYnAycC1kaXNjb3ZlcnktYm9vdHN0cmFwJyk7XG4gICAgaWYgKGRpc2NvdmVyeUJvb3RzdHJhcEVsKSB7XG4gICAgICAgIGRpc2NvdmVyeUJvb3RzdHJhcEVsLnRleHRDb250ZW50ID0gc3RhdGUubGlicDJwLmRpc2NvdmVyeUJvb3RzdHJhcEFkZHJzLmxlbmd0aFxuICAgICAgICAgICAgPyBzdGF0ZS5saWJwMnAuZGlzY292ZXJ5Qm9vdHN0cmFwQWRkcnMuam9pbignXFxuJylcbiAgICAgICAgICAgIDogJ05vIGNhbm9uaWNhbCBsaWJwMnAgYm9vdHN0cmFwIHJlbGF5cyBjb25maWd1cmVkLic7XG4gICAgfVxuXG4gICAgY29uc3QgY29ubmVjdGlvbkNvdW50RWwgPSAkKCdsaWJwMnAtY29ubmVjdGlvbi1jb3VudCcpO1xuICAgIGlmIChjb25uZWN0aW9uQ291bnRFbCkge1xuICAgICAgICBjb25uZWN0aW9uQ291bnRFbC50ZXh0Q29udGVudCA9IFN0cmluZyhjb25uZWN0aW9uQ291bnQpO1xuICAgIH1cblxuICAgIGNvbnN0IGxhc3REaWFsVGFyZ2V0RWwgPSAkKCdsaWJwMnAtbGFzdC1kaWFsLXRhcmdldCcpO1xuICAgIGlmIChsYXN0RGlhbFRhcmdldEVsKSB7XG4gICAgICAgIGxhc3REaWFsVGFyZ2V0RWwudGV4dENvbnRlbnQgPSBsYXN0RGlhbFRhcmdldCB8fCAnXHUyMDE0JztcbiAgICB9XG5cbiAgICBjb25zdCBsYXN0RGlhbFBlZXJFbCA9ICQoJ2xpYnAycC1sYXN0LWRpYWwtcGVlcicpO1xuICAgIGlmIChsYXN0RGlhbFBlZXJFbCkge1xuICAgICAgICBsYXN0RGlhbFBlZXJFbC50ZXh0Q29udGVudCA9IGxhc3REaWFsUGVlciB8fCAnXHUyMDE0JztcbiAgICB9XG5cbiAgICBjb25zdCBsYXN0UGluZ0VsID0gJCgnbGlicDJwLWxhc3QtcGluZycpO1xuICAgIGlmIChsYXN0UGluZ0VsKSB7XG4gICAgICAgIGxhc3RQaW5nRWwudGV4dENvbnRlbnQgPSBsYXN0UGluZ0xhdGVuY3kgfHwgJ1x1MjAxNCc7XG4gICAgfVxuXG4gICAgY29uc3QgZXJyb3JFbCA9ICQoJ2xpYnAycC1lcnJvcicpO1xuICAgIGlmIChlcnJvckVsKSB7XG4gICAgICAgIGVycm9yRWwudGV4dENvbnRlbnQgPSBsYXN0RXJyb3IgfHwgJyc7XG4gICAgICAgIGVycm9yRWwuY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZGVuJywgIWxhc3RFcnJvcik7XG4gICAgfVxuXG4gICAgY29uc3QgYmluZEVycm9yRWwgPSAkKCdsaWJwMnAtYmluZC1lcnJvcicpO1xuICAgIGlmIChiaW5kRXJyb3JFbCkge1xuICAgICAgICBiaW5kRXJyb3JFbC50ZXh0Q29udGVudCA9IGxhc3RCaW5kRXJyb3IgfHwgJyc7XG4gICAgICAgIGJpbmRFcnJvckVsLmNsYXNzTGlzdC50b2dnbGUoJ2hpZGRlbicsICFsYXN0QmluZEVycm9yKTtcbiAgICB9XG5cbiAgICBjb25zdCBib290c3RyYXBFcnJvckVsID0gJCgnbGlicDJwLWJvb3RzdHJhcC1lcnJvcicpO1xuICAgIGlmIChib290c3RyYXBFcnJvckVsKSB7XG4gICAgICAgIGJvb3RzdHJhcEVycm9yRWwudGV4dENvbnRlbnQgPSBsYXN0Qm9vdHN0cmFwRXJyb3IgfHwgJyc7XG4gICAgICAgIGJvb3RzdHJhcEVycm9yRWwuY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZGVuJywgIWxhc3RCb290c3RyYXBFcnJvcik7XG4gICAgfVxuXG4gICAgY29uc3QgYWN0aXZlUHVia2V5RWwgPSAkKCdsaWJwMnAtYWN0aXZlLXB1YmtleScpO1xuICAgIGlmIChhY3RpdmVQdWJrZXlFbCkge1xuICAgICAgICBhY3RpdmVQdWJrZXlFbC50ZXh0Q29udGVudCA9IGFjdGl2ZVB1YmtleSA/IHNob3J0VmFsdWUoYWN0aXZlUHVia2V5LCAxNiwgMTIpIDogJ05vdCBib3VuZCc7XG4gICAgfVxuXG4gICAgY29uc3QgYWN0aXZlTnB1YkVsID0gJCgnbGlicDJwLWFjdGl2ZS1ucHViJyk7XG4gICAgaWYgKGFjdGl2ZU5wdWJFbCkge1xuICAgICAgICBhY3RpdmVOcHViRWwudGV4dENvbnRlbnQgPSBhY3RpdmVOcHViIHx8ICdOb3QgYm91bmQnO1xuICAgIH1cblxuICAgIGNvbnN0IGF0dGVzdGF0aW9uRWwgPSAkKCdsaWJwMnAtYXR0ZXN0YXRpb24nKTtcbiAgICBpZiAoYXR0ZXN0YXRpb25FbCkge1xuICAgICAgICBhdHRlc3RhdGlvbkVsLnRleHRDb250ZW50ID0gYXR0ZXN0YXRpb24gPyBKU09OLnN0cmluZ2lmeShhdHRlc3RhdGlvbiwgbnVsbCwgMikgOiAnTm8gYXR0ZXN0YXRpb24geWV0Lic7XG4gICAgfVxuXG4gICAgY29uc3QgcmVsYXlEZXNjcmlwdG9yRWwgPSAkKCdsaWJwMnAtcmVsYXktZGVzY3JpcHRvcicpO1xuICAgIGlmIChyZWxheURlc2NyaXB0b3JFbCkge1xuICAgICAgICByZWxheURlc2NyaXB0b3JFbC50ZXh0Q29udGVudCA9IHN0YXRlLmxpYnAycC5yZWxheURlc2NyaXB0b3JcbiAgICAgICAgICAgID8gSlNPTi5zdHJpbmdpZnkoc3RhdGUubGlicDJwLnJlbGF5RGVzY3JpcHRvciwgbnVsbCwgMilcbiAgICAgICAgICAgIDogJ05vIHJlbGF5IGRlc2NyaXB0b3IgeWV0Lic7XG4gICAgfVxuXG4gICAgY29uc3QgYmluZFN0YXRlRWwgPSAkKCdsaWJwMnAtYmluZC1zdGF0ZScpO1xuICAgIGlmIChiaW5kU3RhdGVFbCkge1xuICAgICAgICBiaW5kU3RhdGVFbC50ZXh0Q29udGVudCA9IGJpbmRpbmdcbiAgICAgICAgICAgID8gJ0JpbmRpbmdcdTIwMjYnXG4gICAgICAgICAgICA6IGF0dGVzdGF0aW9uXG4gICAgICAgICAgICAgICAgPyAnQXR0ZXN0ZWQnXG4gICAgICAgICAgICAgICAgOiAnVW5ib3VuZCc7XG4gICAgfVxuXG4gICAgY29uc3QgbG9nRWwgPSAkKCdsaWJwMnAtbG9nJyk7XG4gICAgaWYgKGxvZ0VsKSB7XG4gICAgICAgIGxvZ0VsLmlubmVySFRNTCA9IGxvZ3MubGVuZ3RoXG4gICAgICAgICAgICA/IGxvZ3MubWFwKCh7IHRzLCBraW5kLCBtZXNzYWdlIH0pID0+IGBcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibGlicDJwLWxvZy1saW5lIGxpYnAycC1sb2ctbGluZS0tJHtraW5kfVwiPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImxpYnAycC1sb2ctdHNcIj4ke2VzY2FwZUh0bWwodHMpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJsaWJwMnAtbG9nLW1zZ1wiPiR7ZXNjYXBlSHRtbChtZXNzYWdlKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICBgKS5qb2luKCcnKVxuICAgICAgICAgICAgOiAnPGRpdiBjbGFzcz1cImxpYnAycC1sb2ctZW1wdHlcIj5ObyBhY3Rpdml0eSB5ZXQuPC9kaXY+JztcbiAgICB9XG5cbiAgICBjb25zdCBzdGFydEJ0biA9ICQoJ2xpYnAycC1zdGFydC1idG4nKTtcbiAgICBpZiAoc3RhcnRCdG4pIHtcbiAgICAgICAgc3RhcnRCdG4uZGlzYWJsZWQgPSByZWFkeSB8fCBzdGFydGluZyB8fCBzdG9wcGluZztcbiAgICB9XG5cbiAgICBjb25zdCBzdG9wQnRuID0gJCgnbGlicDJwLXN0b3AtYnRuJyk7XG4gICAgaWYgKHN0b3BCdG4pIHtcbiAgICAgICAgc3RvcEJ0bi5kaXNhYmxlZCA9ICFyZWFkeSB8fCBzdG9wcGluZztcbiAgICB9XG5cbiAgICBjb25zdCBkaWFsQnRuID0gJCgnbGlicDJwLWRpYWwtYnRuJyk7XG4gICAgaWYgKGRpYWxCdG4pIHtcbiAgICAgICAgZGlhbEJ0bi5kaXNhYmxlZCA9ICFyZWFkeSB8fCBzdGFydGluZyB8fCBzdG9wcGluZztcbiAgICB9XG5cbiAgICBjb25zdCBwZWVySW5wdXQgPSAkKCdsaWJwMnAtcGVlci1pbnB1dCcpO1xuICAgIGlmIChwZWVySW5wdXQpIHtcbiAgICAgICAgcGVlcklucHV0LmRpc2FibGVkID0gIXJlYWR5IHx8IHN0YXJ0aW5nIHx8IHN0b3BwaW5nO1xuICAgIH1cblxuICAgIGNvbnN0IGJpbmRCdG4gPSAkKCdsaWJwMnAtYmluZC1idG4nKTtcbiAgICBpZiAoYmluZEJ0bikge1xuICAgICAgICBiaW5kQnRuLmRpc2FibGVkID0gIXJlYWR5IHx8IHN0YXJ0aW5nIHx8IHN0b3BwaW5nIHx8IGJpbmRpbmc7XG4gICAgfVxuXG4gICAgY29uc3QgY29weUJpbmRCdG4gPSAkKCdsaWJwMnAtY29weS1iaW5kLWJ0bicpO1xuICAgIGlmIChjb3B5QmluZEJ0bikge1xuICAgICAgICBjb3B5QmluZEJ0bi5kaXNhYmxlZCA9ICFhdHRlc3RhdGlvbjtcbiAgICB9XG5cbiAgICBjb25zdCBjbGVhckJpbmRCdG4gPSAkKCdsaWJwMnAtY2xlYXItYmluZC1idG4nKTtcbiAgICBpZiAoY2xlYXJCaW5kQnRuKSB7XG4gICAgICAgIGNsZWFyQmluZEJ0bi5kaXNhYmxlZCA9ICFhdHRlc3RhdGlvbiAmJiAhYWN0aXZlUHVia2V5ICYmICFhY3RpdmVOcHViO1xuICAgIH1cblxuICAgIGNvbnN0IGNvcHlSZWxheUJ0biA9ICQoJ2xpYnAycC1jb3B5LXJlbGF5LWJ0bicpO1xuICAgIGlmIChjb3B5UmVsYXlCdG4pIHtcbiAgICAgICAgY29weVJlbGF5QnRuLmRpc2FibGVkID0gIXN0YXRlLmxpYnAycC5yZWxheURlc2NyaXB0b3I7XG4gICAgfVxuXG4gICAgY29uc3QgYm9vdHN0cmFwQnRuID0gJCgnbGlicDJwLWJvb3RzdHJhcC1idG4nKTtcbiAgICBpZiAoYm9vdHN0cmFwQnRuKSB7XG4gICAgICAgIGJvb3RzdHJhcEJ0bi5kaXNhYmxlZCA9ICFyZWFkeSB8fCBzdGFydGluZyB8fCBzdG9wcGluZyB8fCBib290c3RyYXBwaW5nO1xuICAgIH1cblxuICAgIGNvbnN0IGJvb3RzdHJhcElucHV0ID0gJCgnbGlicDJwLWJvb3RzdHJhcC1pbnB1dCcpO1xuICAgIGlmIChib290c3RyYXBJbnB1dCkge1xuICAgICAgICBjb25zdCBuZXh0VmFsdWUgPSBib290c3RyYXBBZGRycy5qb2luKCdcXG4nKTtcbiAgICAgICAgaWYgKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IGJvb3RzdHJhcElucHV0ICYmIGJvb3RzdHJhcElucHV0LnZhbHVlICE9PSBuZXh0VmFsdWUpIHtcbiAgICAgICAgICAgIGJvb3RzdHJhcElucHV0LnZhbHVlID0gbmV4dFZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGJvb3RzdHJhcElucHV0LmRpc2FibGVkID0gIXJlYWR5IHx8IHN0YXJ0aW5nIHx8IHN0b3BwaW5nO1xuICAgIH1cblxuICAgIGNvbnN0IHB1YnN1YlBlZXJzRWwgPSAkKCdsaWJwMnAtcHVic3ViLXBlZXJzJyk7XG4gICAgaWYgKHB1YnN1YlBlZXJzRWwpIHtcbiAgICAgICAgcHVic3ViUGVlcnNFbC50ZXh0Q29udGVudCA9IHN0YXRlLmxpYnAycC5wdWJzdWJQZWVycy5sZW5ndGhcbiAgICAgICAgICAgID8gc3RhdGUubGlicDJwLnB1YnN1YlBlZXJzLmpvaW4oJ1xcbicpXG4gICAgICAgICAgICA6ICdObyBwdWJzdWIgcGVlcnMgeWV0Lic7XG4gICAgfVxuXG4gICAgY29uc3Qgc3Vic2NyaWJlZFRvcGljc0VsID0gJCgnbGlicDJwLXN1YnNjcmliZWQtdG9waWNzJyk7XG4gICAgaWYgKHN1YnNjcmliZWRUb3BpY3NFbCkge1xuICAgICAgICBzdWJzY3JpYmVkVG9waWNzRWwudGV4dENvbnRlbnQgPSBzdGF0ZS5saWJwMnAuc3Vic2NyaWJlZFRvcGljcy5sZW5ndGhcbiAgICAgICAgICAgID8gc3RhdGUubGlicDJwLnN1YnNjcmliZWRUb3BpY3Muam9pbignXFxuJylcbiAgICAgICAgICAgIDogJ05vdCBzdWJzY3JpYmVkIHRvIGFueSB0b3BpY3MuJztcbiAgICB9XG5cbiAgICBjb25zdCBwdWJzdWJNZXNzYWdlc0VsID0gJCgnbGlicDJwLXB1YnN1Yi1tZXNzYWdlcycpO1xuICAgIGlmIChwdWJzdWJNZXNzYWdlc0VsKSB7XG4gICAgICAgIHB1YnN1Yk1lc3NhZ2VzRWwuaW5uZXJIVE1MID0gc3RhdGUubGlicDJwLnB1YnN1Yk1lc3NhZ2VzLmxlbmd0aFxuICAgICAgICAgICAgPyBzdGF0ZS5saWJwMnAucHVic3ViTWVzc2FnZXMubWFwKChlbnRyeSkgPT4gYFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJsaWJwMnAtbG9nLWxpbmVcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJsaWJwMnAtbG9nLXRzXCI+JHtlc2NhcGVIdG1sKGVudHJ5LnRzKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibGlicDJwLWxvZy1tc2dcIj5bJHtlc2NhcGVIdG1sKGVudHJ5LnRvcGljKX1dICR7ZXNjYXBlSHRtbChlbnRyeS5mcm9tKX06ICR7ZXNjYXBlSHRtbChlbnRyeS5kYXRhKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICBgKS5qb2luKCcnKVxuICAgICAgICAgICAgOiAnPGRpdiBjbGFzcz1cImxpYnAycC1sb2ctZW1wdHlcIj5ObyBwdWJzdWIgbWVzc2FnZXMgeWV0LjwvZGl2Pic7XG4gICAgfVxuXG4gICAgY29uc3QgcHVic3ViRXJyb3JFbCA9ICQoJ2xpYnAycC1wdWJzdWItZXJyb3InKTtcbiAgICBpZiAocHVic3ViRXJyb3JFbCkge1xuICAgICAgICBwdWJzdWJFcnJvckVsLnRleHRDb250ZW50ID0gc3RhdGUubGlicDJwLmxhc3RQdWJzdWJFcnJvciB8fCAnJztcbiAgICAgICAgcHVic3ViRXJyb3JFbC5jbGFzc0xpc3QudG9nZ2xlKCdoaWRkZW4nLCAhc3RhdGUubGlicDJwLmxhc3RQdWJzdWJFcnJvcik7XG4gICAgfVxuXG4gICAgY29uc3Qgc3Vic2NyaWJlQnRuID0gJCgnbGlicDJwLXN1YnNjcmliZS1idG4nKTtcbiAgICBpZiAoc3Vic2NyaWJlQnRuKSB7XG4gICAgICAgIHN1YnNjcmliZUJ0bi5kaXNhYmxlZCA9ICFyZWFkeSB8fCBzdGFydGluZyB8fCBzdG9wcGluZztcbiAgICB9XG5cbiAgICBjb25zdCB1bnN1YnNjcmliZUJ0biA9ICQoJ2xpYnAycC11bnN1YnNjcmliZS1idG4nKTtcbiAgICBpZiAodW5zdWJzY3JpYmVCdG4pIHtcbiAgICAgICAgdW5zdWJzY3JpYmVCdG4uZGlzYWJsZWQgPSAhcmVhZHkgfHwgc3RhcnRpbmcgfHwgc3RvcHBpbmc7XG4gICAgfVxuXG4gICAgY29uc3QgcHVibGlzaEJ0biA9ICQoJ2xpYnAycC1wdWJsaXNoLWJ0bicpO1xuICAgIGlmIChwdWJsaXNoQnRuKSB7XG4gICAgICAgIHB1Ymxpc2hCdG4uZGlzYWJsZWQgPSAhcmVhZHkgfHwgc3RhcnRpbmcgfHwgc3RvcHBpbmc7XG4gICAgfVxuXG4gICAgY29uc3QgdG9waWNJbnB1dCA9ICQoJ2xpYnAycC10b3BpYy1pbnB1dCcpO1xuICAgIGlmICh0b3BpY0lucHV0KSB7XG4gICAgICAgIHRvcGljSW5wdXQuZGlzYWJsZWQgPSAhcmVhZHkgfHwgc3RhcnRpbmcgfHwgc3RvcHBpbmc7XG4gICAgfVxuXG4gICAgY29uc3QgcHVibGlzaElucHV0ID0gJCgnbGlicDJwLXB1Ymxpc2gtaW5wdXQnKTtcbiAgICBpZiAocHVibGlzaElucHV0KSB7XG4gICAgICAgIHB1Ymxpc2hJbnB1dC5kaXNhYmxlZCA9ICFyZWFkeSB8fCBzdGFydGluZyB8fCBzdG9wcGluZztcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHN0YXJ0TGlicDJwTm9kZSgpIHtcbiAgICBhd2FpdCBzZW5kTGlicDJwTWVzc2FnZSgnbGlicDJwLnN0YXJ0Jyk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHN0b3BMaWJwMnBOb2RlKCkge1xuICAgIGF3YWl0IHNlbmRMaWJwMnBNZXNzYWdlKCdsaWJwMnAuc3RvcCcpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBkaWFsTGlicDJwUGVlcigpIHtcbiAgICBjb25zdCBwZWVySW5wdXQgPSAkKCdsaWJwMnAtcGVlci1pbnB1dCcpO1xuICAgIGNvbnN0IHRhcmdldCA9IHBlZXJJbnB1dD8udmFsdWUudHJpbSgpO1xuICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgIHN0YXRlLmxpYnAycC5sYXN0RXJyb3IgPSAnRW50ZXIgYSBsaWJwMnAgbXVsdGlhZGRyIGZpcnN0Lic7XG4gICAgICAgIHJlbmRlckxpYnAycCgpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGF3YWl0IHNlbmRMaWJwMnBNZXNzYWdlKCdsaWJwMnAuZGlhbCcsIHRhcmdldCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGJvb3RzdHJhcExpYnAycE5vZGUoKSB7XG4gICAgY29uc3QgaW5wdXQgPSAkKCdsaWJwMnAtYm9vdHN0cmFwLWlucHV0Jyk7XG4gICAgY29uc3QgcmF3ID0gaW5wdXQ/LnZhbHVlIHx8ICcnO1xuICAgIGNvbnN0IGFkZHJzID0gcmF3XG4gICAgICAgIC5zcGxpdCgvXFxyP1xcbnwsLylcbiAgICAgICAgLm1hcCgoYWRkcikgPT4gYWRkci50cmltKCkpXG4gICAgICAgIC5maWx0ZXIoQm9vbGVhbik7XG5cbiAgICBpZiAoIWFkZHJzLmxlbmd0aCkge1xuICAgICAgICBzdGF0ZS5saWJwMnAubGFzdEJvb3RzdHJhcEVycm9yID0gJ0FkZCBhdCBsZWFzdCBvbmUgYm9vdHN0cmFwIG11bHRpYWRkci4nO1xuICAgICAgICByZW5kZXJMaWJwMnAoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGF3YWl0IHNlbmRMaWJwMnBNZXNzYWdlKCdsaWJwMnAuYm9vdHN0cmFwJywgYWRkcnMpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBiaW5kTGlicDJwSWRlbnRpdHkoKSB7XG4gICAgYXdhaXQgc2VuZExpYnAycE1lc3NhZ2UoJ2xpYnAycC5iaW5kSWRlbnRpdHknKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gY2xlYXJMaWJwMnBCaW5kaW5nKCkge1xuICAgIGF3YWl0IHNlbmRMaWJwMnBNZXNzYWdlKCdsaWJwMnAuY2xlYXJCaW5kaW5nJyk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNvcHlMaWJwMnBCaW5kaW5nKCkge1xuICAgIGNvbnN0IHBheWxvYWQgPSBzdGF0ZS5saWJwMnAuYXR0ZXN0YXRpb247XG4gICAgaWYgKCFwYXlsb2FkKSByZXR1cm47XG4gICAgY29uc3QgdGV4dCA9IEpTT04uc3RyaW5naWZ5KHBheWxvYWQsIG51bGwsIDIpO1xuICAgIGlmIChuYXZpZ2F0b3IuY2xpcGJvYXJkPy53cml0ZVRleHQpIHtcbiAgICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGV4dCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAnY29weScsIHBheWxvYWQ6IHRleHQgfSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNvcHlSZWxheURlc2NyaXB0b3IoKSB7XG4gICAgY29uc3QgZGVzY3JpcHRvciA9IHN0YXRlLmxpYnAycC5yZWxheURlc2NyaXB0b3I7XG4gICAgaWYgKCFkZXNjcmlwdG9yKSByZXR1cm47XG4gICAgY29uc3QgdGV4dCA9IEpTT04uc3RyaW5naWZ5KGRlc2NyaXB0b3IsIG51bGwsIDIpO1xuICAgIGlmIChuYXZpZ2F0b3IuY2xpcGJvYXJkPy53cml0ZVRleHQpIHtcbiAgICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGV4dCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAnY29weScsIHBheWxvYWQ6IHRleHQgfSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHN1YnNjcmliZVB1YnN1YlRvcGljKCkge1xuICAgIGNvbnN0IGlucHV0ID0gJCgnbGlicDJwLXRvcGljLWlucHV0Jyk7XG4gICAgY29uc3QgdG9waWMgPSBpbnB1dD8udmFsdWUudHJpbSgpO1xuICAgIGlmICghdG9waWMpIHtcbiAgICAgICAgc3RhdGUubGlicDJwLmxhc3RQdWJzdWJFcnJvciA9ICdFbnRlciBhIHRvcGljIGZpcnN0Lic7XG4gICAgICAgIHJlbmRlckxpYnAycCgpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGF3YWl0IHNlbmRMaWJwMnBNZXNzYWdlKCdsaWJwMnAuc3Vic2NyaWJlVG9waWMnLCB0b3BpYyk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHVuc3Vic2NyaWJlUHVic3ViVG9waWMoKSB7XG4gICAgY29uc3QgaW5wdXQgPSAkKCdsaWJwMnAtdG9waWMtaW5wdXQnKTtcbiAgICBjb25zdCB0b3BpYyA9IGlucHV0Py52YWx1ZS50cmltKCk7XG4gICAgaWYgKCF0b3BpYykge1xuICAgICAgICBzdGF0ZS5saWJwMnAubGFzdFB1YnN1YkVycm9yID0gJ0VudGVyIGEgdG9waWMgZmlyc3QuJztcbiAgICAgICAgcmVuZGVyTGlicDJwKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgYXdhaXQgc2VuZExpYnAycE1lc3NhZ2UoJ2xpYnAycC51bnN1YnNjcmliZVRvcGljJywgdG9waWMpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBwdWJsaXNoUHVic3ViTWVzc2FnZSgpIHtcbiAgICBjb25zdCB0b3BpY0lucHV0ID0gJCgnbGlicDJwLXRvcGljLWlucHV0Jyk7XG4gICAgY29uc3QgcHVibGlzaElucHV0ID0gJCgnbGlicDJwLXB1Ymxpc2gtaW5wdXQnKTtcbiAgICBjb25zdCB0b3BpYyA9IHRvcGljSW5wdXQ/LnZhbHVlLnRyaW0oKTtcbiAgICBjb25zdCBkYXRhID0gcHVibGlzaElucHV0Py52YWx1ZSB8fCAnJztcbiAgICBpZiAoIXRvcGljKSB7XG4gICAgICAgIHN0YXRlLmxpYnAycC5sYXN0UHVic3ViRXJyb3IgPSAnRW50ZXIgYSB0b3BpYyBmaXJzdC4nO1xuICAgICAgICByZW5kZXJMaWJwMnAoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBhd2FpdCBzZW5kTGlicDJwTWVzc2FnZSgnbGlicDJwLnB1Ymxpc2hUb3BpYycsIHsgdG9waWMsIGRhdGEgfSk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZVJ1bnRpbWVNZXNzYWdlKG1lc3NhZ2UpIHtcbiAgICBpZiAobWVzc2FnZT8ua2luZCA9PT0gJ2xpYnAycC5zdGF0dXNVcGRhdGUnKSB7XG4gICAgICAgIGFwcGx5U3RhdHVzVXBkYXRlKG1lc3NhZ2UucGF5bG9hZCk7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBpbml0KCkge1xuICAgIGFwaS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihoYW5kbGVSdW50aW1lTWVzc2FnZSk7XG5cbiAgICBhd2FpdCByZWxvYWRGZWF0dXJlcygpO1xuICAgIGNvbnN0IHN0YXR1c1Jlc3BvbnNlID0gYXdhaXQgc2VuZExpYnAycE1lc3NhZ2UoJ2xpYnAycC5zdGF0dXMnKTtcbiAgICBpZiAoc3RhdHVzUmVzcG9uc2U/LnN0YXR1cykge1xuICAgICAgICBhcHBseVN0YXR1c1VwZGF0ZShzdGF0dXNSZXNwb25zZS5zdGF0dXMpO1xuICAgIH1cblxuICAgICQoJ2xpYnAycC1zdGFydC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IHN0YXJ0TGlicDJwTm9kZSgpO1xuICAgIH0pO1xuXG4gICAgJCgnbGlicDJwLXN0b3AtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBhd2FpdCBzdG9wTGlicDJwTm9kZSgpO1xuICAgIH0pO1xuXG4gICAgJCgnbGlicDJwLWRpYWwtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBhd2FpdCBkaWFsTGlicDJwUGVlcigpO1xuICAgIH0pO1xuXG4gICAgJCgnbGlicDJwLWJpbmQtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBhd2FpdCBiaW5kTGlicDJwSWRlbnRpdHkoKTtcbiAgICB9KTtcblxuICAgICQoJ2xpYnAycC1ib290c3RyYXAtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBhd2FpdCBib290c3RyYXBMaWJwMnBOb2RlKCk7XG4gICAgfSk7XG5cbiAgICAkKCdsaWJwMnAtY29weS1iaW5kLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcbiAgICAgICAgYXdhaXQgY29weUxpYnAycEJpbmRpbmcoKTtcbiAgICB9KTtcblxuICAgICQoJ2xpYnAycC1jb3B5LXJlbGF5LWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcbiAgICAgICAgYXdhaXQgY29weVJlbGF5RGVzY3JpcHRvcigpO1xuICAgIH0pO1xuXG4gICAgJCgnbGlicDJwLWNsZWFyLWJpbmQtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBhd2FpdCBjbGVhckxpYnAycEJpbmRpbmcoKTtcbiAgICB9KTtcblxuICAgICQoJ2xpYnAycC1zdWJzY3JpYmUtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBhd2FpdCBzdWJzY3JpYmVQdWJzdWJUb3BpYygpO1xuICAgIH0pO1xuXG4gICAgJCgnbGlicDJwLXVuc3Vic2NyaWJlLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcbiAgICAgICAgYXdhaXQgdW5zdWJzY3JpYmVQdWJzdWJUb3BpYygpO1xuICAgIH0pO1xuXG4gICAgJCgnbGlicDJwLXB1Ymxpc2gtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBhd2FpdCBwdWJsaXNoUHVic3ViTWVzc2FnZSgpO1xuICAgIH0pO1xuXG4gICAgJCgnbGlicDJwLXB1Ymxpc2gtaW5wdXQnKT8uYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGFzeW5jIChldmVudCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQua2V5ID09PSAnRW50ZXInKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgYXdhaXQgcHVibGlzaFB1YnN1Yk1lc3NhZ2UoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgJCgnbGlicDJwLXBlZXItaW5wdXQnKT8uYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGFzeW5jIChldmVudCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQua2V5ID09PSAnRW50ZXInKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgYXdhaXQgZGlhbExpYnAycFBlZXIoKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgaW5pdCk7XG5cbmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbG9zZS1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgd2luZG93LmNsb3NlKCk7XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7O0FBZ0JBLE1BQU0sV0FDRixPQUFPLFlBQVksY0FBYyxVQUNqQyxPQUFPLFdBQVksY0FBYyxTQUNqQztBQUVKLE1BQUksQ0FBQyxVQUFVO0FBQ1gsVUFBTSxJQUFJLE1BQU0sa0ZBQWtGO0FBQUEsRUFDdEc7QUFNQSxNQUFNLFdBQVcsT0FBTyxZQUFZLGVBQWUsT0FBTyxXQUFXO0FBTXJFLFdBQVMsVUFBVSxTQUFTLFFBQVE7QUFDaEMsV0FBTyxJQUFJLFNBQVM7QUFJaEIsVUFBSTtBQUNBLGNBQU0sU0FBUyxPQUFPLE1BQU0sU0FBUyxJQUFJO0FBQ3pDLFlBQUksVUFBVSxPQUFPLE9BQU8sU0FBUyxZQUFZO0FBQzdDLGlCQUFPO0FBQUEsUUFDWDtBQUFBLE1BQ0osU0FBUyxHQUFHO0FBQUEsTUFFWjtBQUVBLGFBQU8sSUFBSSxRQUFRLENBQUMsU0FBUyxXQUFXO0FBQ3BDLGVBQU8sTUFBTSxTQUFTO0FBQUEsVUFDbEIsR0FBRztBQUFBLFVBQ0gsSUFBSSxXQUFXO0FBQ1gsZ0JBQUksU0FBUyxXQUFXLFNBQVMsUUFBUSxXQUFXO0FBQ2hELHFCQUFPLElBQUksTUFBTSxTQUFTLFFBQVEsVUFBVSxPQUFPLENBQUM7QUFBQSxZQUN4RCxPQUFPO0FBQ0gsc0JBQVEsT0FBTyxVQUFVLElBQUksT0FBTyxDQUFDLElBQUksTUFBTTtBQUFBLFlBQ25EO0FBQUEsVUFDSjtBQUFBLFFBQ0osQ0FBQztBQUFBLE1BQ0wsQ0FBQztBQUFBLElBQ0w7QUFBQSxFQUNKO0FBTUEsTUFBTSxNQUFNLENBQUM7QUFHYixNQUFJLFVBQVU7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUlWLGVBQWUsTUFBTTtBQUNqQixVQUFJLENBQUMsVUFBVTtBQUNYLGVBQU8sU0FBUyxRQUFRLFlBQVksR0FBRyxJQUFJO0FBQUEsTUFDL0M7QUFDQSxhQUFPLFVBQVUsU0FBUyxTQUFTLFNBQVMsUUFBUSxXQUFXLEVBQUUsR0FBRyxJQUFJO0FBQUEsSUFDNUU7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQVFBLFdBQVcsU0FBUyxRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFLNUIsT0FBTyxNQUFNO0FBQ1QsYUFBTyxTQUFTLFFBQVEsT0FBTyxJQUFJO0FBQUEsSUFDdkM7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUtBLGtCQUFrQjtBQUNkLFVBQUksQ0FBQyxVQUFVO0FBQ1gsZUFBTyxTQUFTLFFBQVEsZ0JBQWdCO0FBQUEsTUFDNUM7QUFDQSxhQUFPLFVBQVUsU0FBUyxTQUFTLFNBQVMsUUFBUSxlQUFlLEVBQUU7QUFBQSxJQUN6RTtBQUFBO0FBQUE7QUFBQTtBQUFBLElBS0EsSUFBSSxLQUFLO0FBQ0wsYUFBTyxTQUFTLFFBQVE7QUFBQSxJQUM1QjtBQUFBLEVBQ0o7QUFHQSxNQUFJLFVBQVU7QUFBQSxJQUNWLE9BQU87QUFBQSxNQUNILE9BQU8sTUFBTTtBQUNULFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLE1BQU0sSUFBSSxHQUFHLElBQUk7QUFBQSxRQUM3QztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsT0FBTyxTQUFTLFFBQVEsTUFBTSxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDaEY7QUFBQSxNQUNBLE9BQU8sTUFBTTtBQUNULFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLE1BQU0sSUFBSSxHQUFHLElBQUk7QUFBQSxRQUM3QztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsT0FBTyxTQUFTLFFBQVEsTUFBTSxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDaEY7QUFBQSxNQUNBLFNBQVMsTUFBTTtBQUNYLFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLE1BQU0sTUFBTSxHQUFHLElBQUk7QUFBQSxRQUMvQztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsT0FBTyxTQUFTLFFBQVEsTUFBTSxLQUFLLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDbEY7QUFBQSxNQUNBLFVBQVUsTUFBTTtBQUNaLFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLE1BQU0sT0FBTyxHQUFHLElBQUk7QUFBQSxRQUNoRDtBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsT0FBTyxTQUFTLFFBQVEsTUFBTSxNQUFNLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDbkY7QUFBQSxJQUNKO0FBQUE7QUFBQTtBQUFBLElBSUEsTUFBTSxTQUFTLFNBQVMsT0FBTztBQUFBLE1BQzNCLE9BQU8sTUFBTTtBQUNULFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLEtBQUssSUFBSSxHQUFHLElBQUk7QUFBQSxRQUM1QztBQUNBLGVBQU8sVUFBVSxTQUFTLFFBQVEsTUFBTSxTQUFTLFFBQVEsS0FBSyxHQUFHLEVBQUUsR0FBRyxJQUFJO0FBQUEsTUFDOUU7QUFBQSxNQUNBLE9BQU8sTUFBTTtBQUNULFlBQUksQ0FBQyxVQUFVO0FBQ1gsaUJBQU8sU0FBUyxRQUFRLEtB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
