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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uLy4uL3NyYy9leHBlcmltZW50YWwvZXhwZXJpbWVudGFsLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIEJyb3dzZXIgQVBJIGNvbXBhdGliaWxpdHkgbGF5ZXIgZm9yIENocm9tZSAvIFNhZmFyaSAvIEZpcmVmb3guXG4gKlxuICogU2FmYXJpIGFuZCBGaXJlZm94IGV4cG9zZSBgYnJvd3Nlci4qYCAoUHJvbWlzZS1iYXNlZCwgV2ViRXh0ZW5zaW9uIHN0YW5kYXJkKS5cbiAqIENocm9tZSBleHBvc2VzIGBjaHJvbWUuKmAgKGNhbGxiYWNrLWJhc2VkIGhpc3RvcmljYWxseSwgYnV0IE1WMyBzdXBwb3J0c1xuICogcHJvbWlzZXMgb24gbW9zdCBBUElzKS4gSW4gYSBzZXJ2aWNlLXdvcmtlciBjb250ZXh0IGBicm93c2VyYCBpcyB1bmRlZmluZWRcbiAqIG9uIENocm9tZSwgc28gd2Ugbm9ybWFsaXNlIGV2ZXJ5dGhpbmcgaGVyZS5cbiAqXG4gKiBVc2FnZTogIGltcG9ydCB7IGFwaSB9IGZyb20gJy4vdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwnO1xuICogICAgICAgICBhcGkucnVudGltZS5zZW5kTWVzc2FnZSguLi4pXG4gKlxuICogVGhlIGV4cG9ydGVkIGBhcGlgIG9iamVjdCBtaXJyb3JzIHRoZSBzdWJzZXQgb2YgdGhlIFdlYkV4dGVuc2lvbiBBUEkgdGhhdFxuICogTm9zdHJLZXkgYWN0dWFsbHkgdXNlcywgd2l0aCBldmVyeSBtZXRob2QgcmV0dXJuaW5nIGEgUHJvbWlzZS5cbiAqL1xuXG4vLyBEZXRlY3Qgd2hpY2ggZ2xvYmFsIG5hbWVzcGFjZSBpcyBhdmFpbGFibGUuXG5jb25zdCBfYnJvd3NlciA9XG4gICAgdHlwZW9mIGJyb3dzZXIgIT09ICd1bmRlZmluZWQnID8gYnJvd3NlciA6XG4gICAgdHlwZW9mIGNocm9tZSAgIT09ICd1bmRlZmluZWQnID8gY2hyb21lICA6XG4gICAgbnVsbDtcblxuaWYgKCFfYnJvd3Nlcikge1xuICAgIHRocm93IG5ldyBFcnJvcignYnJvd3Nlci1wb2x5ZmlsbDogTm8gZXh0ZW5zaW9uIEFQSSBuYW1lc3BhY2UgZm91bmQgKG5laXRoZXIgYnJvd3NlciBub3IgY2hyb21lKS4nKTtcbn1cblxuLyoqXG4gKiBUcnVlIHdoZW4gcnVubmluZyBvbiBDaHJvbWUgKG9yIGFueSBDaHJvbWl1bS1iYXNlZCBicm93c2VyIHRoYXQgb25seVxuICogZXhwb3NlcyB0aGUgYGNocm9tZWAgbmFtZXNwYWNlKS5cbiAqL1xuY29uc3QgaXNDaHJvbWUgPSB0eXBlb2YgYnJvd3NlciA9PT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNocm9tZSAhPT0gJ3VuZGVmaW5lZCc7XG5cbi8qKlxuICogV3JhcCBhIENocm9tZSBjYWxsYmFjay1zdHlsZSBtZXRob2Qgc28gaXQgcmV0dXJucyBhIFByb21pc2UuXG4gKiBJZiB0aGUgbWV0aG9kIGFscmVhZHkgcmV0dXJucyBhIHByb21pc2UgKE1WMykgd2UganVzdCBwYXNzIHRocm91Z2guXG4gKi9cbmZ1bmN0aW9uIHByb21pc2lmeShjb250ZXh0LCBtZXRob2QpIHtcbiAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgLy8gTVYzIENocm9tZSBBUElzIHJldHVybiBwcm9taXNlcyB3aGVuIG5vIGNhbGxiYWNrIGlzIHN1cHBsaWVkLlxuICAgICAgICAvLyBXZSB0cnkgdGhlIHByb21pc2UgcGF0aCBmaXJzdDsgaWYgdGhlIHJ1bnRpbWUgc2lnbmFscyBhbiBlcnJvclxuICAgICAgICAvLyB2aWEgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yIGluc2lkZSBhIGNhbGxiYWNrIHdlIGNhdGNoIHRoYXQgdG9vLlxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gbWV0aG9kLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgICAvLyBmYWxsIHRocm91Z2ggdG8gY2FsbGJhY2sgd3JhcHBpbmdcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBtZXRob2QuYXBwbHkoY29udGV4dCwgW1xuICAgICAgICAgICAgICAgIC4uLmFyZ3MsXG4gICAgICAgICAgICAgICAgKC4uLmNiQXJncykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2Jyb3dzZXIucnVudGltZSAmJiBfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGNiQXJncy5sZW5ndGggPD0gMSA/IGNiQXJnc1swXSA6IGNiQXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQnVpbGQgdGhlIHVuaWZpZWQgYGFwaWAgb2JqZWN0XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuY29uc3QgYXBpID0ge307XG5cbi8vIC0tLSBydW50aW1lIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnJ1bnRpbWUgPSB7XG4gICAgLyoqXG4gICAgICogc2VuZE1lc3NhZ2UgXHUyMDEzIGFsd2F5cyByZXR1cm5zIGEgUHJvbWlzZS5cbiAgICAgKi9cbiAgICBzZW5kTWVzc2FnZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIucnVudGltZSwgX2Jyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSkoLi4uYXJncyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uTWVzc2FnZSBcdTIwMTMgdGhpbiB3cmFwcGVyIHNvIGNhbGxlcnMgdXNlIGEgY29uc2lzdGVudCByZWZlcmVuY2UuXG4gICAgICogVGhlIGxpc3RlbmVyIHNpZ25hdHVyZSBpcyAobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpLlxuICAgICAqIE9uIENocm9tZSB0aGUgbGlzdGVuZXIgY2FuIHJldHVybiBgdHJ1ZWAgdG8ga2VlcCB0aGUgY2hhbm5lbCBvcGVuLFxuICAgICAqIG9yIHJldHVybiBhIFByb21pc2UgKE1WMykuICBTYWZhcmkgLyBGaXJlZm94IGV4cGVjdCBhIFByb21pc2UgcmV0dXJuLlxuICAgICAqL1xuICAgIG9uTWVzc2FnZTogX2Jyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UsXG5cbiAgICAvKipcbiAgICAgKiBnZXRVUkwgXHUyMDEzIHN5bmNocm9ub3VzIG9uIGFsbCBicm93c2Vycy5cbiAgICAgKi9cbiAgICBnZXRVUkwocGF0aCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5nZXRVUkwocGF0aCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9wZW5PcHRpb25zUGFnZVxuICAgICAqL1xuICAgIG9wZW5PcHRpb25zUGFnZSgpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUub3Blbk9wdGlvbnNQYWdlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5ydW50aW1lLCBfYnJvd3Nlci5ydW50aW1lLm9wZW5PcHRpb25zUGFnZSkoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXhwb3NlIHRoZSBpZCBmb3IgY29udmVuaWVuY2UuXG4gICAgICovXG4gICAgZ2V0IGlkKCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5pZDtcbiAgICB9LFxufTtcblxuLy8gLS0tIHN0b3JhZ2UubG9jYWwgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkuc3RvcmFnZSA9IHtcbiAgICBsb2NhbDoge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICAvLyAtLS0gc3RvcmFnZS5zeW5jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBOdWxsIHdoZW4gdGhlIGJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IHN5bmMgKG9sZGVyIFNhZmFyaSwgZXRjLilcbiAgICBzeW5jOiBfYnJvd3Nlci5zdG9yYWdlPy5zeW5jID8ge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuc2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBnZXRCeXRlc0luVXNlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpIHtcbiAgICAgICAgICAgICAgICAvLyBTYWZhcmkgZG9lc24ndCBzdXBwb3J0IGdldEJ5dGVzSW5Vc2UgXHUyMDE0IHJldHVybiAwXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0gOiBudWxsLFxuXG4gICAgLy8gLS0tIHN0b3JhZ2Uuc2Vzc2lvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gTVYzIGluLW1lbW9yeSBhcmVhIHRoYXQgc3Vydml2ZXMgc2VydmljZS13b3JrZXIgZXZpY3Rpb24gYnV0IG5ldmVyIHRvdWNoZXNcbiAgICAvLyBkaXNrLiBOdWxsIG9uIGVuZ2luZXMgdGhhdCBkb24ndCBpbXBsZW1lbnQgaXQgKFNhZmFyaSBiYWNrZ3JvdW5kIHBhZ2UsXG4gICAgLy8gb2xkZXIgRmlyZWZveCkgXHUyMDE0IGNhbGxlcnMgbXVzdCBmZWF0dXJlLWRldGVjdCBhbmQgZmFsbCBiYWNrLlxuICAgIHNlc3Npb246IF9icm93c2VyLnN0b3JhZ2U/LnNlc3Npb24gPyB7XG4gICAgICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLmdldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24sIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5jbGVhcikoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXN0cmljdCB0aGUgYXJlYSB0byBleHRlbnNpb24tcHJpdmlsZWdlZCBjb250ZXh0cy4gQ2hyb21lLW9ubHk7XG4gICAgICAgICAqIHJlc29sdmVzIGhhcm1sZXNzbHkgd2hlcmUgdGhlIG1ldGhvZCBpcyBhYnNlbnQuXG4gICAgICAgICAqL1xuICAgICAgICBzZXRBY2Nlc3NMZXZlbCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIV9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXRBY2Nlc3NMZXZlbCkgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uc2V0QWNjZXNzTGV2ZWwoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldEFjY2Vzc0xldmVsKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9IDogbnVsbCxcblxuICAgIC8vIC0tLSBzdG9yYWdlLm9uQ2hhbmdlZCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIG9uQ2hhbmdlZDogX2Jyb3dzZXIuc3RvcmFnZT8ub25DaGFuZ2VkIHx8IG51bGwsXG59O1xuXG4vLyAtLS0gdGFicyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS50YWJzID0ge1xuICAgIGNyZWF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmNyZWF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuY3JlYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHF1ZXJ5KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMucXVlcnkoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnF1ZXJ5KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMucmVtb3ZlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHVwZGF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnVwZGF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMudXBkYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmdldCguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuZ2V0KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldEN1cnJlbnQoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHNlbmRNZXNzYWdlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuc2VuZE1lc3NhZ2UoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnNlbmRNZXNzYWdlKSguLi5hcmdzKTtcbiAgICB9LFxufTtcblxuLy8gLS0tIGFsYXJtcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBjaHJvbWUuYWxhcm1zIHN1cnZpdmVzIE1WMyBzZXJ2aWNlLXdvcmtlciBldmljdGlvbjsgc2V0VGltZW91dCBkb2VzIG5vdC5cbmFwaS5hbGFybXMgPSBfYnJvd3Nlci5hbGFybXMgPyB7XG4gICAgY3JlYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgLy8gYWxhcm1zLmNyZWF0ZSBpcyBzeW5jaHJvbm91cyBvbiBDaHJvbWUsIHJldHVybnMgUHJvbWlzZSBvbiBGaXJlZm94L1NhZmFyaVxuICAgICAgICBjb25zdCByZXN1bHQgPSBfYnJvd3Nlci5hbGFybXMuY3JlYXRlKC4uLmFyZ3MpO1xuICAgICAgICByZXR1cm4gcmVzdWx0ICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gJ2Z1bmN0aW9uJyA/IHJlc3VsdCA6IFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH0sXG4gICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuYWxhcm1zLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuYWxhcm1zLCBfYnJvd3Nlci5hbGFybXMuY2xlYXIpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgb25BbGFybTogX2Jyb3dzZXIuYWxhcm1zLm9uQWxhcm0sXG59IDogbnVsbDtcblxuZXhwb3J0IHsgYXBpLCBpc0Nocm9tZSB9O1xuIiwgImltcG9ydCB7IGFwaSB9IGZyb20gJy4uL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsJztcblxuY29uc3QgRkVBVFVSRVMgPSBbXG4gICAgW1xuICAgICAgICAnbm9uZScsXG4gICAgICAgICdOSVAtWFg6IE5vbmUnLFxuICAgICAgICAnUmVzZXJ2ZWQgZm9yIHRoZSBmdXR1cmUgdXNlLicsXG4gICAgXSxcbl07XG5cbmNvbnN0ICQgPSAoaWQpID0+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcblxuY29uc3Qgc3RhdGUgPSB7XG4gICAgZmVhdHVyZXM6IFtdLFxuICAgIGxpYnAycDoge1xuICAgICAgICByZWFkeTogZmFsc2UsXG4gICAgICAgIHN0YXJ0aW5nOiBmYWxzZSxcbiAgICAgICAgc3RvcHBpbmc6IGZhbHNlLFxuICAgICAgICBiaW5kaW5nOiBmYWxzZSxcbiAgICAgICAgYm9vdHN0cmFwcGluZzogZmFsc2UsXG4gICAgICAgIHBlZXJJZDogJycsXG4gICAgICAgIHBlZXJJZFNob3J0OiAnJyxcbiAgICAgICAgYWN0aXZlUHVia2V5OiAnJyxcbiAgICAgICAgYWN0aXZlTnB1YjogJycsXG4gICAgICAgIGF0dGVzdGF0aW9uOiBudWxsLFxuICAgICAgICByZWxheURlc2NyaXB0b3I6IG51bGwsXG4gICAgICAgIGRlZmF1bHRCb290c3RyYXBBZGRyczogW10sXG4gICAgICAgIGRpc2NvdmVyeUJvb3RzdHJhcEFkZHJzOiBbXSxcbiAgICAgICAgYm9vdHN0cmFwQWRkcnM6IFtdLFxuICAgICAgICBsaXN0ZW5BZGRyczogW10sXG4gICAgICAgIGNvbm5lY3Rpb25Db3VudDogMCxcbiAgICAgICAgcHVic3ViUGVlcnM6IFtdLFxuICAgICAgICBzdWJzY3JpYmVkVG9waWNzOiBbXSxcbiAgICAgICAgcHVic3ViTWVzc2FnZXM6IFtdLFxuICAgICAgICBsYXN0RGlhbFRhcmdldDogJycsXG4gICAgICAgIGxhc3REaWFsUGVlcjogJycsXG4gICAgICAgIGxhc3RQaW5nTGF0ZW5jeTogJycsXG4gICAgICAgIGxhc3RCaW5kRXJyb3I6ICcnLFxuICAgICAgICBsYXN0Qm9vdHN0cmFwRXJyb3I6ICcnLFxuICAgICAgICBsYXN0RXJyb3I6ICcnLFxuICAgICAgICBsb2dzOiBbXSxcbiAgICB9LFxufTtcblxuZnVuY3Rpb24gZXNjYXBlSHRtbCh2YWx1ZSkge1xuICAgIHJldHVybiBTdHJpbmcodmFsdWUpXG4gICAgICAgIC5yZXBsYWNlQWxsKCcmJywgJyZhbXA7JylcbiAgICAgICAgLnJlcGxhY2VBbGwoJzwnLCAnJmx0OycpXG4gICAgICAgIC5yZXBsYWNlQWxsKCc+JywgJyZndDsnKVxuICAgICAgICAucmVwbGFjZUFsbCgnXCInLCAnJnF1b3Q7JylcbiAgICAgICAgLnJlcGxhY2VBbGwoXCInXCIsICcmIzM5OycpO1xufVxuXG5mdW5jdGlvbiBzaG9ydFZhbHVlKHZhbHVlLCBoZWFkID0gMTAsIHRhaWwgPSA4KSB7XG4gICAgaWYgKCF2YWx1ZSkgcmV0dXJuICcnO1xuICAgIGlmICh2YWx1ZS5sZW5ndGggPD0gaGVhZCArIHRhaWwgKyAzKSByZXR1cm4gdmFsdWU7XG4gICAgcmV0dXJuIGAke3ZhbHVlLnNsaWNlKDAsIGhlYWQpfVx1MjAyNiR7dmFsdWUuc2xpY2UoLXRhaWwpfWA7XG59XG5cbmZ1bmN0aW9uIGFwcGx5U3RhdHVzVXBkYXRlKHN0YXR1cykge1xuICAgIGlmICghc3RhdHVzIHx8IHR5cGVvZiBzdGF0dXMgIT09ICdvYmplY3QnKSByZXR1cm47XG4gICAgc3RhdGUubGlicDJwID0geyAuLi5zdGF0ZS5saWJwMnAsIC4uLnN0YXR1cyB9O1xuICAgIHJlbmRlckxpYnAycCgpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBzZW5kTGlicDJwTWVzc2FnZShraW5kLCBwYXlsb2FkKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQsIHBheWxvYWQgfSk7XG4gICAgICAgIGlmIChyZXNwb25zZT8uc3RhdHVzKSB7XG4gICAgICAgICAgICBhcHBseVN0YXR1c1VwZGF0ZShyZXNwb25zZS5zdGF0dXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXNwb25zZTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICBzdGF0ZS5saWJwMnAubGFzdEVycm9yID0gbWVzc2FnZTtcbiAgICAgICAgcmVuZGVyTGlicDJwKCk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogbWVzc2FnZSB9O1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVuZGVyRmVhdHVyZXMoKSB7XG4gICAgY29uc3QgY29udGFpbmVyID0gJCgnZmVhdHVyZXMtY29udGFpbmVyJyk7XG4gICAgaWYgKCFjb250YWluZXIpIHJldHVybjtcblxuICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSBzdGF0ZS5mZWF0dXJlcy5tYXAoKFtuYW1lLCBhY3RpdmUsIHNob3J0RGVzYywgbG9uZ0Rlc2NdKSA9PiBgXG4gICAgICAgIDxkaXYgY2xhc3M9XCJtdC00XCI+XG4gICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICBjbGFzcz1cImNoZWNrYm94XCJcbiAgICAgICAgICAgICAgICB0eXBlPVwiY2hlY2tib3hcIlxuICAgICAgICAgICAgICAgIGlkPVwiJHtuYW1lfVwiXG4gICAgICAgICAgICAgICAgJHthY3RpdmUgPyAnY2hlY2tlZCcgOiAnJ31cbiAgICAgICAgICAgICAgICBkYXRhLWZlYXR1cmU9XCIke25hbWV9XCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgICA8bGFiZWwgZm9yPVwiJHtuYW1lfVwiIGNsYXNzPVwiZm9udC1ib2xkXCI+JHtzaG9ydERlc2N9PC9sYWJlbD5cbiAgICAgICAgICAgIDxwIGNsYXNzPVwiaXRhbGljXCI+JHtsb25nRGVzY308L3A+XG4gICAgICAgIDwvZGl2PlxuICAgIGApLmpvaW4oJycpO1xuXG4gICAgY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXScpLmZvckVhY2goKGNiKSA9PiB7XG4gICAgICAgIGNiLmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIGFzeW5jIChlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBmZWF0dXJlID0gZS50YXJnZXQuZGF0YXNldC5mZWF0dXJlO1xuICAgICAgICAgICAgY29uc3QgYWN0aXZlID0gZS50YXJnZXQuY2hlY2tlZDtcbiAgICAgICAgICAgIGF3YWl0IGFwaS5zdG9yYWdlLmxvY2FsLnNldCh7IFtmZWF0dXJlXTogYWN0aXZlIH0pO1xuICAgICAgICAgICAgYXdhaXQgcmVsb2FkRmVhdHVyZXMoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJlbG9hZEZlYXR1cmVzKCkge1xuICAgIHN0YXRlLmZlYXR1cmVzID0gYXdhaXQgUHJvbWlzZS5hbGwoXG4gICAgICAgIEZFQVRVUkVTLm1hcChhc3luYyAoW25hbWUsIHNob3J0RGVzYywgbG9uZ0Rlc2NdKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSBgZmVhdHVyZToke25hbWV9YDtcbiAgICAgICAgICAgIGNvbnN0IHN0b3JlZCA9IGF3YWl0IGFwaS5zdG9yYWdlLmxvY2FsLmdldCh7IFtrZXldOiBmYWxzZSB9KTtcbiAgICAgICAgICAgIHJldHVybiBba2V5LCBzdG9yZWRba2V5XSwgc2hvcnREZXNjLCBsb25nRGVzY107XG4gICAgICAgIH0pXG4gICAgKTtcbiAgICByZW5kZXJGZWF0dXJlcygpO1xufVxuXG5mdW5jdGlvbiByZW5kZXJMaWJwMnAoKSB7XG4gICAgY29uc3Qge1xuICAgICAgICByZWFkeSxcbiAgICAgICAgc3RhcnRpbmcsXG4gICAgICAgIHN0b3BwaW5nLFxuICAgICAgICBiaW5kaW5nLFxuICAgICAgICBib290c3RyYXBwaW5nLFxuICAgICAgICBwZWVySWQsXG4gICAgICAgIHBlZXJJZFNob3J0LFxuICAgICAgICBhY3RpdmVQdWJrZXksXG4gICAgICAgIGFjdGl2ZU5wdWIsXG4gICAgICAgIGF0dGVzdGF0aW9uLFxuICAgICAgICBsaXN0ZW5BZGRycyxcbiAgICAgICAgZGVmYXVsdEJvb3RzdHJhcEFkZHJzLFxuICAgICAgICBib290c3RyYXBBZGRycyxcbiAgICAgICAgY29ubmVjdGlvbkNvdW50LFxuICAgICAgICBsYXN0RGlhbFRhcmdldCxcbiAgICAgICAgbGFzdERpYWxQZWVyLFxuICAgICAgICBsYXN0UGluZ0xhdGVuY3ksXG4gICAgICAgIGxhc3RCaW5kRXJyb3IsXG4gICAgICAgIGxhc3RCb290c3RyYXBFcnJvcixcbiAgICAgICAgbGFzdEVycm9yLFxuICAgICAgICBsb2dzLFxuICAgIH0gPSBzdGF0ZS5saWJwMnA7XG5cbiAgICBjb25zdCBzdGF0dXNFbCA9ICQoJ2xpYnAycC1zdGF0dXMnKTtcbiAgICBpZiAoc3RhdHVzRWwpIHtcbiAgICAgICAgc3RhdHVzRWwudGV4dENvbnRlbnQgPSByZWFkeVxuICAgICAgICAgICAgPyAnUmVhZHknXG4gICAgICAgICAgICA6IHN0YXJ0aW5nXG4gICAgICAgICAgICAgICAgPyAnU3RhcnRpbmdcdTIwMjYnXG4gICAgICAgICAgICAgICAgOiBzdG9wcGluZ1xuICAgICAgICAgICAgICAgICAgICA/ICdTdG9wcGluZ1x1MjAyNidcbiAgICAgICAgICAgICAgICAgICAgOiAnU3RvcHBlZCc7XG4gICAgfVxuXG4gICAgY29uc3QgcGVlcklkRWwgPSAkKCdsaWJwMnAtcGVlci1pZCcpO1xuICAgIGlmIChwZWVySWRFbCkge1xuICAgICAgICBwZWVySWRFbC50ZXh0Q29udGVudCA9IHBlZXJJZFNob3J0IHx8IHBlZXJJZCB8fCAnTm90IHN0YXJ0ZWQnO1xuICAgIH1cblxuICAgIGNvbnN0IGxpc3RlbkFkZHJzRWwgPSAkKCdsaWJwMnAtbGlzdGVuLWFkZHJzJyk7XG4gICAgaWYgKGxpc3RlbkFkZHJzRWwpIHtcbiAgICAgICAgbGlzdGVuQWRkcnNFbC50ZXh0Q29udGVudCA9IGxpc3RlbkFkZHJzLmxlbmd0aCA/IGxpc3RlbkFkZHJzLmpvaW4oJ1xcbicpIDogJ05vIGFkdmVydGlzZWQgbGlzdGVuIGFkZHJlc3NlcyBpbiB0aGlzIGJyb3dzZXIgbm9kZS4nO1xuICAgIH1cblxuICAgIGNvbnN0IGRlZmF1bHRCb290c3RyYXBFbCA9ICQoJ2xpYnAycC1kZWZhdWx0LWJvb3RzdHJhcCcpO1xuICAgIGlmIChkZWZhdWx0Qm9vdHN0cmFwRWwpIHtcbiAgICAgICAgZGVmYXVsdEJvb3RzdHJhcEVsLnRleHRDb250ZW50ID0gZGVmYXVsdEJvb3RzdHJhcEFkZHJzLmxlbmd0aFxuICAgICAgICAgICAgPyBkZWZhdWx0Qm9vdHN0cmFwQWRkcnMuam9pbignXFxuJylcbiAgICAgICAgICAgIDogJ05vIGRlZmF1bHQgV1NTIGJvb3RzdHJhcCByZWxheXMgY29uZmlndXJlZC4nO1xuICAgIH1cblxuICAgIGNvbnN0IGRpc2NvdmVyeUJvb3RzdHJhcEVsID0gJCgnbGlicDJwLWRpc2NvdmVyeS1ib290c3RyYXAnKTtcbiAgICBpZiAoZGlzY292ZXJ5Qm9vdHN0cmFwRWwpIHtcbiAgICAgICAgZGlzY292ZXJ5Qm9vdHN0cmFwRWwudGV4dENvbnRlbnQgPSBzdGF0ZS5saWJwMnAuZGlzY292ZXJ5Qm9vdHN0cmFwQWRkcnMubGVuZ3RoXG4gICAgICAgICAgICA/IHN0YXRlLmxpYnAycC5kaXNjb3ZlcnlCb290c3RyYXBBZGRycy5qb2luKCdcXG4nKVxuICAgICAgICAgICAgOiAnTm8gY2Fub25pY2FsIGxpYnAycCBib290c3RyYXAgcmVsYXlzIGNvbmZpZ3VyZWQuJztcbiAgICB9XG5cbiAgICBjb25zdCBjb25uZWN0aW9uQ291bnRFbCA9ICQoJ2xpYnAycC1jb25uZWN0aW9uLWNvdW50Jyk7XG4gICAgaWYgKGNvbm5lY3Rpb25Db3VudEVsKSB7XG4gICAgICAgIGNvbm5lY3Rpb25Db3VudEVsLnRleHRDb250ZW50ID0gU3RyaW5nKGNvbm5lY3Rpb25Db3VudCk7XG4gICAgfVxuXG4gICAgY29uc3QgbGFzdERpYWxUYXJnZXRFbCA9ICQoJ2xpYnAycC1sYXN0LWRpYWwtdGFyZ2V0Jyk7XG4gICAgaWYgKGxhc3REaWFsVGFyZ2V0RWwpIHtcbiAgICAgICAgbGFzdERpYWxUYXJnZXRFbC50ZXh0Q29udGVudCA9IGxhc3REaWFsVGFyZ2V0IHx8ICdcdTIwMTQnO1xuICAgIH1cblxuICAgIGNvbnN0IGxhc3REaWFsUGVlckVsID0gJCgnbGlicDJwLWxhc3QtZGlhbC1wZWVyJyk7XG4gICAgaWYgKGxhc3REaWFsUGVlckVsKSB7XG4gICAgICAgIGxhc3REaWFsUGVlckVsLnRleHRDb250ZW50ID0gbGFzdERpYWxQZWVyIHx8ICdcdTIwMTQnO1xuICAgIH1cblxuICAgIGNvbnN0IGxhc3RQaW5nRWwgPSAkKCdsaWJwMnAtbGFzdC1waW5nJyk7XG4gICAgaWYgKGxhc3RQaW5nRWwpIHtcbiAgICAgICAgbGFzdFBpbmdFbC50ZXh0Q29udGVudCA9IGxhc3RQaW5nTGF0ZW5jeSB8fCAnXHUyMDE0JztcbiAgICB9XG5cbiAgICBjb25zdCBlcnJvckVsID0gJCgnbGlicDJwLWVycm9yJyk7XG4gICAgaWYgKGVycm9yRWwpIHtcbiAgICAgICAgZXJyb3JFbC50ZXh0Q29udGVudCA9IGxhc3RFcnJvciB8fCAnJztcbiAgICAgICAgZXJyb3JFbC5jbGFzc0xpc3QudG9nZ2xlKCdoaWRkZW4nLCAhbGFzdEVycm9yKTtcbiAgICB9XG5cbiAgICBjb25zdCBiaW5kRXJyb3JFbCA9ICQoJ2xpYnAycC1iaW5kLWVycm9yJyk7XG4gICAgaWYgKGJpbmRFcnJvckVsKSB7XG4gICAgICAgIGJpbmRFcnJvckVsLnRleHRDb250ZW50ID0gbGFzdEJpbmRFcnJvciB8fCAnJztcbiAgICAgICAgYmluZEVycm9yRWwuY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZGVuJywgIWxhc3RCaW5kRXJyb3IpO1xuICAgIH1cblxuICAgIGNvbnN0IGJvb3RzdHJhcEVycm9yRWwgPSAkKCdsaWJwMnAtYm9vdHN0cmFwLWVycm9yJyk7XG4gICAgaWYgKGJvb3RzdHJhcEVycm9yRWwpIHtcbiAgICAgICAgYm9vdHN0cmFwRXJyb3JFbC50ZXh0Q29udGVudCA9IGxhc3RCb290c3RyYXBFcnJvciB8fCAnJztcbiAgICAgICAgYm9vdHN0cmFwRXJyb3JFbC5jbGFzc0xpc3QudG9nZ2xlKCdoaWRkZW4nLCAhbGFzdEJvb3RzdHJhcEVycm9yKTtcbiAgICB9XG5cbiAgICBjb25zdCBhY3RpdmVQdWJrZXlFbCA9ICQoJ2xpYnAycC1hY3RpdmUtcHVia2V5Jyk7XG4gICAgaWYgKGFjdGl2ZVB1YmtleUVsKSB7XG4gICAgICAgIGFjdGl2ZVB1YmtleUVsLnRleHRDb250ZW50ID0gYWN0aXZlUHVia2V5ID8gc2hvcnRWYWx1ZShhY3RpdmVQdWJrZXksIDE2LCAxMikgOiAnTm90IGJvdW5kJztcbiAgICB9XG5cbiAgICBjb25zdCBhY3RpdmVOcHViRWwgPSAkKCdsaWJwMnAtYWN0aXZlLW5wdWInKTtcbiAgICBpZiAoYWN0aXZlTnB1YkVsKSB7XG4gICAgICAgIGFjdGl2ZU5wdWJFbC50ZXh0Q29udGVudCA9IGFjdGl2ZU5wdWIgfHwgJ05vdCBib3VuZCc7XG4gICAgfVxuXG4gICAgY29uc3QgYXR0ZXN0YXRpb25FbCA9ICQoJ2xpYnAycC1hdHRlc3RhdGlvbicpO1xuICAgIGlmIChhdHRlc3RhdGlvbkVsKSB7XG4gICAgICAgIGF0dGVzdGF0aW9uRWwudGV4dENvbnRlbnQgPSBhdHRlc3RhdGlvbiA/IEpTT04uc3RyaW5naWZ5KGF0dGVzdGF0aW9uLCBudWxsLCAyKSA6ICdObyBhdHRlc3RhdGlvbiB5ZXQuJztcbiAgICB9XG5cbiAgICBjb25zdCByZWxheURlc2NyaXB0b3JFbCA9ICQoJ2xpYnAycC1yZWxheS1kZXNjcmlwdG9yJyk7XG4gICAgaWYgKHJlbGF5RGVzY3JpcHRvckVsKSB7XG4gICAgICAgIHJlbGF5RGVzY3JpcHRvckVsLnRleHRDb250ZW50ID0gc3RhdGUubGlicDJwLnJlbGF5RGVzY3JpcHRvclxuICAgICAgICAgICAgPyBKU09OLnN0cmluZ2lmeShzdGF0ZS5saWJwMnAucmVsYXlEZXNjcmlwdG9yLCBudWxsLCAyKVxuICAgICAgICAgICAgOiAnTm8gcmVsYXkgZGVzY3JpcHRvciB5ZXQuJztcbiAgICB9XG5cbiAgICBjb25zdCBiaW5kU3RhdGVFbCA9ICQoJ2xpYnAycC1iaW5kLXN0YXRlJyk7XG4gICAgaWYgKGJpbmRTdGF0ZUVsKSB7XG4gICAgICAgIGJpbmRTdGF0ZUVsLnRleHRDb250ZW50ID0gYmluZGluZ1xuICAgICAgICAgICAgPyAnQmluZGluZ1x1MjAyNidcbiAgICAgICAgICAgIDogYXR0ZXN0YXRpb25cbiAgICAgICAgICAgICAgICA/ICdBdHRlc3RlZCdcbiAgICAgICAgICAgICAgICA6ICdVbmJvdW5kJztcbiAgICB9XG5cbiAgICBjb25zdCBsb2dFbCA9ICQoJ2xpYnAycC1sb2cnKTtcbiAgICBpZiAobG9nRWwpIHtcbiAgICAgICAgbG9nRWwuaW5uZXJIVE1MID0gbG9ncy5sZW5ndGhcbiAgICAgICAgICAgID8gbG9ncy5tYXAoKHsgdHMsIGtpbmQsIG1lc3NhZ2UgfSkgPT4gYFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJsaWJwMnAtbG9nLWxpbmUgbGlicDJwLWxvZy1saW5lLS0ke2tpbmR9XCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibGlicDJwLWxvZy10c1wiPiR7ZXNjYXBlSHRtbCh0cyl9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImxpYnAycC1sb2ctbXNnXCI+JHtlc2NhcGVIdG1sKG1lc3NhZ2UpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIGApLmpvaW4oJycpXG4gICAgICAgICAgICA6ICc8ZGl2IGNsYXNzPVwibGlicDJwLWxvZy1lbXB0eVwiPk5vIGFjdGl2aXR5IHlldC48L2Rpdj4nO1xuICAgIH1cblxuICAgIGNvbnN0IHN0YXJ0QnRuID0gJCgnbGlicDJwLXN0YXJ0LWJ0bicpO1xuICAgIGlmIChzdGFydEJ0bikge1xuICAgICAgICBzdGFydEJ0bi5kaXNhYmxlZCA9IHJlYWR5IHx8IHN0YXJ0aW5nIHx8IHN0b3BwaW5nO1xuICAgIH1cblxuICAgIGNvbnN0IHN0b3BCdG4gPSAkKCdsaWJwMnAtc3RvcC1idG4nKTtcbiAgICBpZiAoc3RvcEJ0bikge1xuICAgICAgICBzdG9wQnRuLmRpc2FibGVkID0gIXJlYWR5IHx8IHN0b3BwaW5nO1xuICAgIH1cblxuICAgIGNvbnN0IGRpYWxCdG4gPSAkKCdsaWJwMnAtZGlhbC1idG4nKTtcbiAgICBpZiAoZGlhbEJ0bikge1xuICAgICAgICBkaWFsQnRuLmRpc2FibGVkID0gIXJlYWR5IHx8IHN0YXJ0aW5nIHx8IHN0b3BwaW5nO1xuICAgIH1cblxuICAgIGNvbnN0IHBlZXJJbnB1dCA9ICQoJ2xpYnAycC1wZWVyLWlucHV0Jyk7XG4gICAgaWYgKHBlZXJJbnB1dCkge1xuICAgICAgICBwZWVySW5wdXQuZGlzYWJsZWQgPSAhcmVhZHkgfHwgc3RhcnRpbmcgfHwgc3RvcHBpbmc7XG4gICAgfVxuXG4gICAgY29uc3QgYmluZEJ0biA9ICQoJ2xpYnAycC1iaW5kLWJ0bicpO1xuICAgIGlmIChiaW5kQnRuKSB7XG4gICAgICAgIGJpbmRCdG4uZGlzYWJsZWQgPSAhcmVhZHkgfHwgc3RhcnRpbmcgfHwgc3RvcHBpbmcgfHwgYmluZGluZztcbiAgICB9XG5cbiAgICBjb25zdCBjb3B5QmluZEJ0biA9ICQoJ2xpYnAycC1jb3B5LWJpbmQtYnRuJyk7XG4gICAgaWYgKGNvcHlCaW5kQnRuKSB7XG4gICAgICAgIGNvcHlCaW5kQnRuLmRpc2FibGVkID0gIWF0dGVzdGF0aW9uO1xuICAgIH1cblxuICAgIGNvbnN0IGNsZWFyQmluZEJ0biA9ICQoJ2xpYnAycC1jbGVhci1iaW5kLWJ0bicpO1xuICAgIGlmIChjbGVhckJpbmRCdG4pIHtcbiAgICAgICAgY2xlYXJCaW5kQnRuLmRpc2FibGVkID0gIWF0dGVzdGF0aW9uICYmICFhY3RpdmVQdWJrZXkgJiYgIWFjdGl2ZU5wdWI7XG4gICAgfVxuXG4gICAgY29uc3QgY29weVJlbGF5QnRuID0gJCgnbGlicDJwLWNvcHktcmVsYXktYnRuJyk7XG4gICAgaWYgKGNvcHlSZWxheUJ0bikge1xuICAgICAgICBjb3B5UmVsYXlCdG4uZGlzYWJsZWQgPSAhc3RhdGUubGlicDJwLnJlbGF5RGVzY3JpcHRvcjtcbiAgICB9XG5cbiAgICBjb25zdCBib290c3RyYXBCdG4gPSAkKCdsaWJwMnAtYm9vdHN0cmFwLWJ0bicpO1xuICAgIGlmIChib290c3RyYXBCdG4pIHtcbiAgICAgICAgYm9vdHN0cmFwQnRuLmRpc2FibGVkID0gIXJlYWR5IHx8IHN0YXJ0aW5nIHx8IHN0b3BwaW5nIHx8IGJvb3RzdHJhcHBpbmc7XG4gICAgfVxuXG4gICAgY29uc3QgYm9vdHN0cmFwSW5wdXQgPSAkKCdsaWJwMnAtYm9vdHN0cmFwLWlucHV0Jyk7XG4gICAgaWYgKGJvb3RzdHJhcElucHV0KSB7XG4gICAgICAgIGNvbnN0IG5leHRWYWx1ZSA9IGJvb3RzdHJhcEFkZHJzLmpvaW4oJ1xcbicpO1xuICAgICAgICBpZiAoZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPT0gYm9vdHN0cmFwSW5wdXQgJiYgYm9vdHN0cmFwSW5wdXQudmFsdWUgIT09IG5leHRWYWx1ZSkge1xuICAgICAgICAgICAgYm9vdHN0cmFwSW5wdXQudmFsdWUgPSBuZXh0VmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgYm9vdHN0cmFwSW5wdXQuZGlzYWJsZWQgPSAhcmVhZHkgfHwgc3RhcnRpbmcgfHwgc3RvcHBpbmc7XG4gICAgfVxuXG4gICAgY29uc3QgcHVic3ViUGVlcnNFbCA9ICQoJ2xpYnAycC1wdWJzdWItcGVlcnMnKTtcbiAgICBpZiAocHVic3ViUGVlcnNFbCkge1xuICAgICAgICBwdWJzdWJQZWVyc0VsLnRleHRDb250ZW50ID0gc3RhdGUubGlicDJwLnB1YnN1YlBlZXJzLmxlbmd0aFxuICAgICAgICAgICAgPyBzdGF0ZS5saWJwMnAucHVic3ViUGVlcnMuam9pbignXFxuJylcbiAgICAgICAgICAgIDogJ05vIHB1YnN1YiBwZWVycyB5ZXQuJztcbiAgICB9XG5cbiAgICBjb25zdCBzdWJzY3JpYmVkVG9waWNzRWwgPSAkKCdsaWJwMnAtc3Vic2NyaWJlZC10b3BpY3MnKTtcbiAgICBpZiAoc3Vic2NyaWJlZFRvcGljc0VsKSB7XG4gICAgICAgIHN1YnNjcmliZWRUb3BpY3NFbC50ZXh0Q29udGVudCA9IHN0YXRlLmxpYnAycC5zdWJzY3JpYmVkVG9waWNzLmxlbmd0aFxuICAgICAgICAgICAgPyBzdGF0ZS5saWJwMnAuc3Vic2NyaWJlZFRvcGljcy5qb2luKCdcXG4nKVxuICAgICAgICAgICAgOiAnTm90IHN1YnNjcmliZWQgdG8gYW55IHRvcGljcy4nO1xuICAgIH1cblxuICAgIGNvbnN0IHB1YnN1Yk1lc3NhZ2VzRWwgPSAkKCdsaWJwMnAtcHVic3ViLW1lc3NhZ2VzJyk7XG4gICAgaWYgKHB1YnN1Yk1lc3NhZ2VzRWwpIHtcbiAgICAgICAgcHVic3ViTWVzc2FnZXNFbC5pbm5lckhUTUwgPSBzdGF0ZS5saWJwMnAucHVic3ViTWVzc2FnZXMubGVuZ3RoXG4gICAgICAgICAgICA/IHN0YXRlLmxpYnAycC5wdWJzdWJNZXNzYWdlcy5tYXAoKGVudHJ5KSA9PiBgXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImxpYnAycC1sb2ctbGluZVwiPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImxpYnAycC1sb2ctdHNcIj4ke2VzY2FwZUh0bWwoZW50cnkudHMpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJsaWJwMnAtbG9nLW1zZ1wiPlske2VzY2FwZUh0bWwoZW50cnkudG9waWMpfV0gJHtlc2NhcGVIdG1sKGVudHJ5LmZyb20pfTogJHtlc2NhcGVIdG1sKGVudHJ5LmRhdGEpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIGApLmpvaW4oJycpXG4gICAgICAgICAgICA6ICc8ZGl2IGNsYXNzPVwibGlicDJwLWxvZy1lbXB0eVwiPk5vIHB1YnN1YiBtZXNzYWdlcyB5ZXQuPC9kaXY+JztcbiAgICB9XG5cbiAgICBjb25zdCBwdWJzdWJFcnJvckVsID0gJCgnbGlicDJwLXB1YnN1Yi1lcnJvcicpO1xuICAgIGlmIChwdWJzdWJFcnJvckVsKSB7XG4gICAgICAgIHB1YnN1YkVycm9yRWwudGV4dENvbnRlbnQgPSBzdGF0ZS5saWJwMnAubGFzdFB1YnN1YkVycm9yIHx8ICcnO1xuICAgICAgICBwdWJzdWJFcnJvckVsLmNsYXNzTGlzdC50b2dnbGUoJ2hpZGRlbicsICFzdGF0ZS5saWJwMnAubGFzdFB1YnN1YkVycm9yKTtcbiAgICB9XG5cbiAgICBjb25zdCBzdWJzY3JpYmVCdG4gPSAkKCdsaWJwMnAtc3Vic2NyaWJlLWJ0bicpO1xuICAgIGlmIChzdWJzY3JpYmVCdG4pIHtcbiAgICAgICAgc3Vic2NyaWJlQnRuLmRpc2FibGVkID0gIXJlYWR5IHx8IHN0YXJ0aW5nIHx8IHN0b3BwaW5nO1xuICAgIH1cblxuICAgIGNvbnN0IHVuc3Vic2NyaWJlQnRuID0gJCgnbGlicDJwLXVuc3Vic2NyaWJlLWJ0bicpO1xuICAgIGlmICh1bnN1YnNjcmliZUJ0bikge1xuICAgICAgICB1bnN1YnNjcmliZUJ0bi5kaXNhYmxlZCA9ICFyZWFkeSB8fCBzdGFydGluZyB8fCBzdG9wcGluZztcbiAgICB9XG5cbiAgICBjb25zdCBwdWJsaXNoQnRuID0gJCgnbGlicDJwLXB1Ymxpc2gtYnRuJyk7XG4gICAgaWYgKHB1Ymxpc2hCdG4pIHtcbiAgICAgICAgcHVibGlzaEJ0bi5kaXNhYmxlZCA9ICFyZWFkeSB8fCBzdGFydGluZyB8fCBzdG9wcGluZztcbiAgICB9XG5cbiAgICBjb25zdCB0b3BpY0lucHV0ID0gJCgnbGlicDJwLXRvcGljLWlucHV0Jyk7XG4gICAgaWYgKHRvcGljSW5wdXQpIHtcbiAgICAgICAgdG9waWNJbnB1dC5kaXNhYmxlZCA9ICFyZWFkeSB8fCBzdGFydGluZyB8fCBzdG9wcGluZztcbiAgICB9XG5cbiAgICBjb25zdCBwdWJsaXNoSW5wdXQgPSAkKCdsaWJwMnAtcHVibGlzaC1pbnB1dCcpO1xuICAgIGlmIChwdWJsaXNoSW5wdXQpIHtcbiAgICAgICAgcHVibGlzaElucHV0LmRpc2FibGVkID0gIXJlYWR5IHx8IHN0YXJ0aW5nIHx8IHN0b3BwaW5nO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gc3RhcnRMaWJwMnBOb2RlKCkge1xuICAgIGF3YWl0IHNlbmRMaWJwMnBNZXNzYWdlKCdsaWJwMnAuc3RhcnQnKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc3RvcExpYnAycE5vZGUoKSB7XG4gICAgYXdhaXQgc2VuZExpYnAycE1lc3NhZ2UoJ2xpYnAycC5zdG9wJyk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGRpYWxMaWJwMnBQZWVyKCkge1xuICAgIGNvbnN0IHBlZXJJbnB1dCA9ICQoJ2xpYnAycC1wZWVyLWlucHV0Jyk7XG4gICAgY29uc3QgdGFyZ2V0ID0gcGVlcklucHV0Py52YWx1ZS50cmltKCk7XG4gICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgICAgc3RhdGUubGlicDJwLmxhc3RFcnJvciA9ICdFbnRlciBhIGxpYnAycCBtdWx0aWFkZHIgZmlyc3QuJztcbiAgICAgICAgcmVuZGVyTGlicDJwKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgYXdhaXQgc2VuZExpYnAycE1lc3NhZ2UoJ2xpYnAycC5kaWFsJywgdGFyZ2V0KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gYm9vdHN0cmFwTGlicDJwTm9kZSgpIHtcbiAgICBjb25zdCBpbnB1dCA9ICQoJ2xpYnAycC1ib290c3RyYXAtaW5wdXQnKTtcbiAgICBjb25zdCByYXcgPSBpbnB1dD8udmFsdWUgfHwgJyc7XG4gICAgY29uc3QgYWRkcnMgPSByYXdcbiAgICAgICAgLnNwbGl0KC9cXHI/XFxufCwvKVxuICAgICAgICAubWFwKChhZGRyKSA9PiBhZGRyLnRyaW0oKSlcbiAgICAgICAgLmZpbHRlcihCb29sZWFuKTtcblxuICAgIGlmICghYWRkcnMubGVuZ3RoKSB7XG4gICAgICAgIHN0YXRlLmxpYnAycC5sYXN0Qm9vdHN0cmFwRXJyb3IgPSAnQWRkIGF0IGxlYXN0IG9uZSBib290c3RyYXAgbXVsdGlhZGRyLic7XG4gICAgICAgIHJlbmRlckxpYnAycCgpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgYXdhaXQgc2VuZExpYnAycE1lc3NhZ2UoJ2xpYnAycC5ib290c3RyYXAnLCBhZGRycyk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGJpbmRMaWJwMnBJZGVudGl0eSgpIHtcbiAgICBhd2FpdCBzZW5kTGlicDJwTWVzc2FnZSgnbGlicDJwLmJpbmRJZGVudGl0eScpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBjbGVhckxpYnAycEJpbmRpbmcoKSB7XG4gICAgYXdhaXQgc2VuZExpYnAycE1lc3NhZ2UoJ2xpYnAycC5jbGVhckJpbmRpbmcnKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gY29weUxpYnAycEJpbmRpbmcoKSB7XG4gICAgY29uc3QgcGF5bG9hZCA9IHN0YXRlLmxpYnAycC5hdHRlc3RhdGlvbjtcbiAgICBpZiAoIXBheWxvYWQpIHJldHVybjtcbiAgICBjb25zdCB0ZXh0ID0gSlNPTi5zdHJpbmdpZnkocGF5bG9hZCwgbnVsbCwgMik7XG4gICAgaWYgKG5hdmlnYXRvci5jbGlwYm9hcmQ/LndyaXRlVGV4dCkge1xuICAgICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0ZXh0KTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdjb3B5JywgcGF5bG9hZDogdGV4dCB9KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gY29weVJlbGF5RGVzY3JpcHRvcigpIHtcbiAgICBjb25zdCBkZXNjcmlwdG9yID0gc3RhdGUubGlicDJwLnJlbGF5RGVzY3JpcHRvcjtcbiAgICBpZiAoIWRlc2NyaXB0b3IpIHJldHVybjtcbiAgICBjb25zdCB0ZXh0ID0gSlNPTi5zdHJpbmdpZnkoZGVzY3JpcHRvciwgbnVsbCwgMik7XG4gICAgaWYgKG5hdmlnYXRvci5jbGlwYm9hcmQ/LndyaXRlVGV4dCkge1xuICAgICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0ZXh0KTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdjb3B5JywgcGF5bG9hZDogdGV4dCB9KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc3Vic2NyaWJlUHVic3ViVG9waWMoKSB7XG4gICAgY29uc3QgaW5wdXQgPSAkKCdsaWJwMnAtdG9waWMtaW5wdXQnKTtcbiAgICBjb25zdCB0b3BpYyA9IGlucHV0Py52YWx1ZS50cmltKCk7XG4gICAgaWYgKCF0b3BpYykge1xuICAgICAgICBzdGF0ZS5saWJwMnAubGFzdFB1YnN1YkVycm9yID0gJ0VudGVyIGEgdG9waWMgZmlyc3QuJztcbiAgICAgICAgcmVuZGVyTGlicDJwKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgYXdhaXQgc2VuZExpYnAycE1lc3NhZ2UoJ2xpYnAycC5zdWJzY3JpYmVUb3BpYycsIHRvcGljKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gdW5zdWJzY3JpYmVQdWJzdWJUb3BpYygpIHtcbiAgICBjb25zdCBpbnB1dCA9ICQoJ2xpYnAycC10b3BpYy1pbnB1dCcpO1xuICAgIGNvbnN0IHRvcGljID0gaW5wdXQ/LnZhbHVlLnRyaW0oKTtcbiAgICBpZiAoIXRvcGljKSB7XG4gICAgICAgIHN0YXRlLmxpYnAycC5sYXN0UHVic3ViRXJyb3IgPSAnRW50ZXIgYSB0b3BpYyBmaXJzdC4nO1xuICAgICAgICByZW5kZXJMaWJwMnAoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBhd2FpdCBzZW5kTGlicDJwTWVzc2FnZSgnbGlicDJwLnVuc3Vic2NyaWJlVG9waWMnLCB0b3BpYyk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHB1Ymxpc2hQdWJzdWJNZXNzYWdlKCkge1xuICAgIGNvbnN0IHRvcGljSW5wdXQgPSAkKCdsaWJwMnAtdG9waWMtaW5wdXQnKTtcbiAgICBjb25zdCBwdWJsaXNoSW5wdXQgPSAkKCdsaWJwMnAtcHVibGlzaC1pbnB1dCcpO1xuICAgIGNvbnN0IHRvcGljID0gdG9waWNJbnB1dD8udmFsdWUudHJpbSgpO1xuICAgIGNvbnN0IGRhdGEgPSBwdWJsaXNoSW5wdXQ/LnZhbHVlIHx8ICcnO1xuICAgIGlmICghdG9waWMpIHtcbiAgICAgICAgc3RhdGUubGlicDJwLmxhc3RQdWJzdWJFcnJvciA9ICdFbnRlciBhIHRvcGljIGZpcnN0Lic7XG4gICAgICAgIHJlbmRlckxpYnAycCgpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGF3YWl0IHNlbmRMaWJwMnBNZXNzYWdlKCdsaWJwMnAucHVibGlzaFRvcGljJywgeyB0b3BpYywgZGF0YSB9KTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlUnVudGltZU1lc3NhZ2UobWVzc2FnZSkge1xuICAgIGlmIChtZXNzYWdlPy5raW5kID09PSAnbGlicDJwLnN0YXR1c1VwZGF0ZScpIHtcbiAgICAgICAgYXBwbHlTdGF0dXNVcGRhdGUobWVzc2FnZS5wYXlsb2FkKTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgYXBpLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKGhhbmRsZVJ1bnRpbWVNZXNzYWdlKTtcblxuICAgIGF3YWl0IHJlbG9hZEZlYXR1cmVzKCk7XG4gICAgY29uc3Qgc3RhdHVzUmVzcG9uc2UgPSBhd2FpdCBzZW5kTGlicDJwTWVzc2FnZSgnbGlicDJwLnN0YXR1cycpO1xuICAgIGlmIChzdGF0dXNSZXNwb25zZT8uc3RhdHVzKSB7XG4gICAgICAgIGFwcGx5U3RhdHVzVXBkYXRlKHN0YXR1c1Jlc3BvbnNlLnN0YXR1cyk7XG4gICAgfVxuXG4gICAgJCgnbGlicDJwLXN0YXJ0LWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcbiAgICAgICAgYXdhaXQgc3RhcnRMaWJwMnBOb2RlKCk7XG4gICAgfSk7XG5cbiAgICAkKCdsaWJwMnAtc3RvcC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IHN0b3BMaWJwMnBOb2RlKCk7XG4gICAgfSk7XG5cbiAgICAkKCdsaWJwMnAtZGlhbC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IGRpYWxMaWJwMnBQZWVyKCk7XG4gICAgfSk7XG5cbiAgICAkKCdsaWJwMnAtYmluZC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IGJpbmRMaWJwMnBJZGVudGl0eSgpO1xuICAgIH0pO1xuXG4gICAgJCgnbGlicDJwLWJvb3RzdHJhcC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IGJvb3RzdHJhcExpYnAycE5vZGUoKTtcbiAgICB9KTtcblxuICAgICQoJ2xpYnAycC1jb3B5LWJpbmQtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBhd2FpdCBjb3B5TGlicDJwQmluZGluZygpO1xuICAgIH0pO1xuXG4gICAgJCgnbGlicDJwLWNvcHktcmVsYXktYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBhd2FpdCBjb3B5UmVsYXlEZXNjcmlwdG9yKCk7XG4gICAgfSk7XG5cbiAgICAkKCdsaWJwMnAtY2xlYXItYmluZC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IGNsZWFyTGlicDJwQmluZGluZygpO1xuICAgIH0pO1xuXG4gICAgJCgnbGlicDJwLXN1YnNjcmliZS1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IHN1YnNjcmliZVB1YnN1YlRvcGljKCk7XG4gICAgfSk7XG5cbiAgICAkKCdsaWJwMnAtdW5zdWJzY3JpYmUtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBhd2FpdCB1bnN1YnNjcmliZVB1YnN1YlRvcGljKCk7XG4gICAgfSk7XG5cbiAgICAkKCdsaWJwMnAtcHVibGlzaC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IHB1Ymxpc2hQdWJzdWJNZXNzYWdlKCk7XG4gICAgfSk7XG5cbiAgICAkKCdsaWJwMnAtcHVibGlzaC1pbnB1dCcpPy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldmVudC5rZXkgPT09ICdFbnRlcicpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBhd2FpdCBwdWJsaXNoUHVic3ViTWVzc2FnZSgpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAkKCdsaWJwMnAtcGVlci1pbnB1dCcpPy5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgYXN5bmMgKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldmVudC5rZXkgPT09ICdFbnRlcicpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBhd2FpdCBkaWFsTGlicDJwUGVlcigpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBpbml0KTtcblxuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2Nsb3NlLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICB3aW5kb3cuY2xvc2UoKTtcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7QUFnQkEsTUFBTSxXQUNGLE9BQU8sWUFBWSxjQUFjLFVBQ2pDLE9BQU8sV0FBWSxjQUFjLFNBQ2pDO0FBRUosTUFBSSxDQUFDLFVBQVU7QUFDWCxVQUFNLElBQUksTUFBTSxrRkFBa0Y7QUFBQSxFQUN0RztBQU1BLE1BQU0sV0FBVyxPQUFPLFlBQVksZUFBZSxPQUFPLFdBQVc7QUFNckUsV0FBUyxVQUFVLFNBQVMsUUFBUTtBQUNoQyxXQUFPLElBQUksU0FBUztBQUloQixVQUFJO0FBQ0EsY0FBTSxTQUFTLE9BQU8sTUFBTSxTQUFTLElBQUk7QUFDekMsWUFBSSxVQUFVLE9BQU8sT0FBTyxTQUFTLFlBQVk7QUFDN0MsaUJBQU87QUFBQSxRQUNYO0FBQUEsTUFDSixTQUFTLEdBQUc7QUFBQSxNQUVaO0FBRUEsYUFBTyxJQUFJLFFBQVEsQ0FBQyxTQUFTLFdBQVc7QUFDcEMsZUFBTyxNQUFNLFNBQVM7QUFBQSxVQUNsQixHQUFHO0FBQUEsVUFDSCxJQUFJLFdBQVc7QUFDWCxnQkFBSSxTQUFTLFdBQVcsU0FBUyxRQUFRLFdBQVc7QUFDaEQscUJBQU8sSUFBSSxNQUFNLFNBQVMsUUFBUSxVQUFVLE9BQU8sQ0FBQztBQUFBLFlBQ3hELE9BQU87QUFDSCxzQkFBUSxPQUFPLFVBQVUsSUFBSSxPQUFPLENBQUMsSUFBSSxNQUFNO0FBQUEsWUFDbkQ7QUFBQSxVQUNKO0FBQUEsUUFDSixDQUFDO0FBQUEsTUFDTCxDQUFDO0FBQUEsSUFDTDtBQUFBLEVBQ0o7QUFNQSxNQUFNLE1BQU0sQ0FBQztBQUdiLE1BQUksVUFBVTtBQUFBO0FBQUE7QUFBQTtBQUFBLElB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
