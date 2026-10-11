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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uLy4uL3NyYy9leHBlcmltZW50YWwvZXhwZXJpbWVudGFsLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIEJyb3dzZXIgQVBJIGNvbXBhdGliaWxpdHkgbGF5ZXIgZm9yIENocm9tZSAvIFNhZmFyaSAvIEZpcmVmb3guXG4gKlxuICogU2FmYXJpIGFuZCBGaXJlZm94IGV4cG9zZSBgYnJvd3Nlci4qYCAoUHJvbWlzZS1iYXNlZCwgV2ViRXh0ZW5zaW9uIHN0YW5kYXJkKS5cbiAqIENocm9tZSBleHBvc2VzIGBjaHJvbWUuKmAgKGNhbGxiYWNrLWJhc2VkIGhpc3RvcmljYWxseSwgYnV0IE1WMyBzdXBwb3J0c1xuICogcHJvbWlzZXMgb24gbW9zdCBBUElzKS4gSW4gYSBzZXJ2aWNlLXdvcmtlciBjb250ZXh0IGBicm93c2VyYCBpcyB1bmRlZmluZWRcbiAqIG9uIENocm9tZSwgc28gd2Ugbm9ybWFsaXNlIGV2ZXJ5dGhpbmcgaGVyZS5cbiAqXG4gKiBVc2FnZTogIGltcG9ydCB7IGFwaSB9IGZyb20gJy4vdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwnO1xuICogICAgICAgICBhcGkucnVudGltZS5zZW5kTWVzc2FnZSguLi4pXG4gKlxuICogVGhlIGV4cG9ydGVkIGBhcGlgIG9iamVjdCBtaXJyb3JzIHRoZSBzdWJzZXQgb2YgdGhlIFdlYkV4dGVuc2lvbiBBUEkgdGhhdFxuICogTm9zdHJLZXkgYWN0dWFsbHkgdXNlcywgd2l0aCBldmVyeSBtZXRob2QgcmV0dXJuaW5nIGEgUHJvbWlzZS5cbiAqL1xuXG4vLyBEZXRlY3Qgd2hpY2ggZ2xvYmFsIG5hbWVzcGFjZSBpcyBhdmFpbGFibGUuXG5jb25zdCBfYnJvd3NlciA9XG4gICAgdHlwZW9mIGJyb3dzZXIgIT09ICd1bmRlZmluZWQnID8gYnJvd3NlciA6XG4gICAgdHlwZW9mIGNocm9tZSAgIT09ICd1bmRlZmluZWQnID8gY2hyb21lICA6XG4gICAgbnVsbDtcblxuaWYgKCFfYnJvd3Nlcikge1xuICAgIHRocm93IG5ldyBFcnJvcignYnJvd3Nlci1wb2x5ZmlsbDogTm8gZXh0ZW5zaW9uIEFQSSBuYW1lc3BhY2UgZm91bmQgKG5laXRoZXIgYnJvd3NlciBub3IgY2hyb21lKS4nKTtcbn1cblxuLyoqXG4gKiBUcnVlIHdoZW4gcnVubmluZyBvbiBDaHJvbWUgKG9yIGFueSBDaHJvbWl1bS1iYXNlZCBicm93c2VyIHRoYXQgb25seVxuICogZXhwb3NlcyB0aGUgYGNocm9tZWAgbmFtZXNwYWNlKS5cbiAqL1xuY29uc3QgaXNDaHJvbWUgPSB0eXBlb2YgYnJvd3NlciA9PT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNocm9tZSAhPT0gJ3VuZGVmaW5lZCc7XG5cbi8qKlxuICogV3JhcCBhIENocm9tZSBjYWxsYmFjay1zdHlsZSBtZXRob2Qgc28gaXQgcmV0dXJucyBhIFByb21pc2UuXG4gKiBJZiB0aGUgbWV0aG9kIGFscmVhZHkgcmV0dXJucyBhIHByb21pc2UgKE1WMykgd2UganVzdCBwYXNzIHRocm91Z2guXG4gKi9cbmZ1bmN0aW9uIHByb21pc2lmeShjb250ZXh0LCBtZXRob2QpIHtcbiAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgLy8gTVYzIENocm9tZSBBUElzIHJldHVybiBwcm9taXNlcyB3aGVuIG5vIGNhbGxiYWNrIGlzIHN1cHBsaWVkLlxuICAgICAgICAvLyBXZSB0cnkgdGhlIHByb21pc2UgcGF0aCBmaXJzdDsgaWYgdGhlIHJ1bnRpbWUgc2lnbmFscyBhbiBlcnJvclxuICAgICAgICAvLyB2aWEgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yIGluc2lkZSBhIGNhbGxiYWNrIHdlIGNhdGNoIHRoYXQgdG9vLlxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gbWV0aG9kLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgICAvLyBmYWxsIHRocm91Z2ggdG8gY2FsbGJhY2sgd3JhcHBpbmdcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBtZXRob2QuYXBwbHkoY29udGV4dCwgW1xuICAgICAgICAgICAgICAgIC4uLmFyZ3MsXG4gICAgICAgICAgICAgICAgKC4uLmNiQXJncykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2Jyb3dzZXIucnVudGltZSAmJiBfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGNiQXJncy5sZW5ndGggPD0gMSA/IGNiQXJnc1swXSA6IGNiQXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQnVpbGQgdGhlIHVuaWZpZWQgYGFwaWAgb2JqZWN0XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuY29uc3QgYXBpID0ge307XG5cbi8vIC0tLSBydW50aW1lIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnJ1bnRpbWUgPSB7XG4gICAgLyoqXG4gICAgICogc2VuZE1lc3NhZ2UgXHUyMDEzIGFsd2F5cyByZXR1cm5zIGEgUHJvbWlzZS5cbiAgICAgKi9cbiAgICBzZW5kTWVzc2FnZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIucnVudGltZSwgX2Jyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSkoLi4uYXJncyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uTWVzc2FnZSBcdTIwMTMgdGhpbiB3cmFwcGVyIHNvIGNhbGxlcnMgdXNlIGEgY29uc2lzdGVudCByZWZlcmVuY2UuXG4gICAgICogVGhlIGxpc3RlbmVyIHNpZ25hdHVyZSBpcyAobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpLlxuICAgICAqIE9uIENocm9tZSB0aGUgbGlzdGVuZXIgY2FuIHJldHVybiBgdHJ1ZWAgdG8ga2VlcCB0aGUgY2hhbm5lbCBvcGVuLFxuICAgICAqIG9yIHJldHVybiBhIFByb21pc2UgKE1WMykuICBTYWZhcmkgLyBGaXJlZm94IGV4cGVjdCBhIFByb21pc2UgcmV0dXJuLlxuICAgICAqL1xuICAgIG9uTWVzc2FnZTogX2Jyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UsXG5cbiAgICAvKipcbiAgICAgKiBnZXRVUkwgXHUyMDEzIHN5bmNocm9ub3VzIG9uIGFsbCBicm93c2Vycy5cbiAgICAgKi9cbiAgICBnZXRVUkwocGF0aCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5nZXRVUkwocGF0aCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9wZW5PcHRpb25zUGFnZVxuICAgICAqL1xuICAgIG9wZW5PcHRpb25zUGFnZSgpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUub3Blbk9wdGlvbnNQYWdlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5ydW50aW1lLCBfYnJvd3Nlci5ydW50aW1lLm9wZW5PcHRpb25zUGFnZSkoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXhwb3NlIHRoZSBpZCBmb3IgY29udmVuaWVuY2UuXG4gICAgICovXG4gICAgZ2V0IGlkKCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5pZDtcbiAgICB9LFxufTtcblxuLy8gLS0tIHN0b3JhZ2UubG9jYWwgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkuc3RvcmFnZSA9IHtcbiAgICBsb2NhbDoge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICAvLyAtLS0gc3RvcmFnZS5zeW5jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBOdWxsIHdoZW4gdGhlIGJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IHN5bmMgKG9sZGVyIFNhZmFyaSwgZXRjLilcbiAgICBzeW5jOiBfYnJvd3Nlci5zdG9yYWdlPy5zeW5jID8ge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuc2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBnZXRCeXRlc0luVXNlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpIHtcbiAgICAgICAgICAgICAgICAvLyBTYWZhcmkgZG9lc24ndCBzdXBwb3J0IGdldEJ5dGVzSW5Vc2UgXHUyMDE0IHJldHVybiAwXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0gOiBudWxsLFxuXG4gICAgLy8gLS0tIHN0b3JhZ2Uuc2Vzc2lvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gTVYzIGluLW1lbW9yeSBhcmVhIHRoYXQgc3Vydml2ZXMgc2VydmljZS13b3JrZXIgZXZpY3Rpb24gYnV0IG5ldmVyIHRvdWNoZXNcbiAgICAvLyBkaXNrLiBOdWxsIG9uIGVuZ2luZXMgdGhhdCBkb24ndCBpbXBsZW1lbnQgaXQgKFNhZmFyaSBiYWNrZ3JvdW5kIHBhZ2UsXG4gICAgLy8gb2xkZXIgRmlyZWZveCkgXHUyMDE0IGNhbGxlcnMgbXVzdCBmZWF0dXJlLWRldGVjdCBhbmQgZmFsbCBiYWNrLlxuICAgIHNlc3Npb246IF9icm93c2VyLnN0b3JhZ2U/LnNlc3Npb24gPyB7XG4gICAgICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLmdldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24sIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5jbGVhcikoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXN0cmljdCB0aGUgYXJlYSB0byBleHRlbnNpb24tcHJpdmlsZWdlZCBjb250ZXh0cy4gQ2hyb21lLW9ubHk7XG4gICAgICAgICAqIHJlc29sdmVzIGhhcm1sZXNzbHkgd2hlcmUgdGhlIG1ldGhvZCBpcyBhYnNlbnQuXG4gICAgICAgICAqL1xuICAgICAgICBzZXRBY2Nlc3NMZXZlbCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIV9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXRBY2Nlc3NMZXZlbCkgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uc2V0QWNjZXNzTGV2ZWwoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldEFjY2Vzc0xldmVsKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9IDogbnVsbCxcblxuICAgIC8vIC0tLSBzdG9yYWdlLm9uQ2hhbmdlZCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIG9uQ2hhbmdlZDogX2Jyb3dzZXIuc3RvcmFnZT8ub25DaGFuZ2VkIHx8IG51bGwsXG59O1xuXG4vLyAtLS0gdGFicyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS50YWJzID0ge1xuICAgIGNyZWF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmNyZWF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuY3JlYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHF1ZXJ5KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMucXVlcnkoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnF1ZXJ5KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMucmVtb3ZlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHVwZGF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnVwZGF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMudXBkYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmdldCguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuZ2V0KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldEN1cnJlbnQoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHNlbmRNZXNzYWdlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuc2VuZE1lc3NhZ2UoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnNlbmRNZXNzYWdlKSguLi5hcmdzKTtcbiAgICB9LFxufTtcblxuLy8gLS0tIGFsYXJtcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBjaHJvbWUuYWxhcm1zIHN1cnZpdmVzIE1WMyBzZXJ2aWNlLXdvcmtlciBldmljdGlvbjsgc2V0VGltZW91dCBkb2VzIG5vdC5cbmFwaS5hbGFybXMgPSBfYnJvd3Nlci5hbGFybXMgPyB7XG4gICAgY3JlYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgLy8gYWxhcm1zLmNyZWF0ZSBpcyBzeW5jaHJvbm91cyBvbiBDaHJvbWUsIHJldHVybnMgUHJvbWlzZSBvbiBGaXJlZm94L1NhZmFyaVxuICAgICAgICBjb25zdCByZXN1bHQgPSBfYnJvd3Nlci5hbGFybXMuY3JlYXRlKC4uLmFyZ3MpO1xuICAgICAgICByZXR1cm4gcmVzdWx0ICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gJ2Z1bmN0aW9uJyA/IHJlc3VsdCA6IFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH0sXG4gICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuYWxhcm1zLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuYWxhcm1zLCBfYnJvd3Nlci5hbGFybXMuY2xlYXIpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgb25BbGFybTogX2Jyb3dzZXIuYWxhcm1zLm9uQWxhcm0sXG59IDogbnVsbDtcblxuZXhwb3J0IHsgYXBpLCBpc0Nocm9tZSB9O1xuIiwgImltcG9ydCB7IGFwaSB9IGZyb20gJy4uL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsJztcblxuY29uc3QgRkVBVFVSRVMgPSBbXG4gICAgW1xuICAgICAgICAnbm9uZScsXG4gICAgICAgICdOSVAtWFg6IE5vbmUnLFxuICAgICAgICAnUmVzZXJ2ZWQgZm9yIHRoZSBmdXR1cmUgdXNlLicsXG4gICAgXSxcbl07XG5cbmNvbnN0ICQgPSAoaWQpID0+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcblxuY29uc3Qgc3RhdGUgPSB7XG4gICAgZmVhdHVyZXM6IFtdLFxuICAgIGxpYnAycDoge1xuICAgICAgICByZWFkeTogZmFsc2UsXG4gICAgICAgIHN0YXJ0aW5nOiBmYWxzZSxcbiAgICAgICAgc3RvcHBpbmc6IGZhbHNlLFxuICAgICAgICBiaW5kaW5nOiBmYWxzZSxcbiAgICAgICAgYm9vdHN0cmFwcGluZzogZmFsc2UsXG4gICAgICAgIHBlZXJJZDogJycsXG4gICAgICAgIHBlZXJJZFNob3J0OiAnJyxcbiAgICAgICAgYWN0aXZlUHVia2V5OiAnJyxcbiAgICAgICAgYWN0aXZlTnB1YjogJycsXG4gICAgICAgIGF0dGVzdGF0aW9uOiBudWxsLFxuICAgICAgICByZWxheURlc2NyaXB0b3I6IG51bGwsXG4gICAgICAgIGRlZmF1bHRCb290c3RyYXBBZGRyczogW10sXG4gICAgICAgIGRpc2NvdmVyeUJvb3RzdHJhcEFkZHJzOiBbXSxcbiAgICAgICAgYm9vdHN0cmFwQWRkcnM6IFtdLFxuICAgICAgICBsaXN0ZW5BZGRyczogW10sXG4gICAgICAgIGNvbm5lY3Rpb25Db3VudDogMCxcbiAgICAgICAgbGFzdERpYWxUYXJnZXQ6ICcnLFxuICAgICAgICBsYXN0RGlhbFBlZXI6ICcnLFxuICAgICAgICBsYXN0UGluZ0xhdGVuY3k6ICcnLFxuICAgICAgICBsYXN0QmluZEVycm9yOiAnJyxcbiAgICAgICAgbGFzdEJvb3RzdHJhcEVycm9yOiAnJyxcbiAgICAgICAgbGFzdEVycm9yOiAnJyxcbiAgICAgICAgbG9nczogW10sXG4gICAgfSxcbn07XG5cbmZ1bmN0aW9uIGVzY2FwZUh0bWwodmFsdWUpIHtcbiAgICByZXR1cm4gU3RyaW5nKHZhbHVlKVxuICAgICAgICAucmVwbGFjZUFsbCgnJicsICcmYW1wOycpXG4gICAgICAgIC5yZXBsYWNlQWxsKCc8JywgJyZsdDsnKVxuICAgICAgICAucmVwbGFjZUFsbCgnPicsICcmZ3Q7JylcbiAgICAgICAgLnJlcGxhY2VBbGwoJ1wiJywgJyZxdW90OycpXG4gICAgICAgIC5yZXBsYWNlQWxsKFwiJ1wiLCAnJiMzOTsnKTtcbn1cblxuZnVuY3Rpb24gc2hvcnRWYWx1ZSh2YWx1ZSwgaGVhZCA9IDEwLCB0YWlsID0gOCkge1xuICAgIGlmICghdmFsdWUpIHJldHVybiAnJztcbiAgICBpZiAodmFsdWUubGVuZ3RoIDw9IGhlYWQgKyB0YWlsICsgMykgcmV0dXJuIHZhbHVlO1xuICAgIHJldHVybiBgJHt2YWx1ZS5zbGljZSgwLCBoZWFkKX1cdTIwMjYke3ZhbHVlLnNsaWNlKC10YWlsKX1gO1xufVxuXG5mdW5jdGlvbiBhcHBseVN0YXR1c1VwZGF0ZShzdGF0dXMpIHtcbiAgICBpZiAoIXN0YXR1cyB8fCB0eXBlb2Ygc3RhdHVzICE9PSAnb2JqZWN0JykgcmV0dXJuO1xuICAgIHN0YXRlLmxpYnAycCA9IHsgLi4uc3RhdGUubGlicDJwLCAuLi5zdGF0dXMgfTtcbiAgICByZW5kZXJMaWJwMnAoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc2VuZExpYnAycE1lc3NhZ2Uoa2luZCwgcGF5bG9hZCkge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kLCBwYXlsb2FkIH0pO1xuICAgICAgICBpZiAocmVzcG9uc2U/LnN0YXR1cykge1xuICAgICAgICAgICAgYXBwbHlTdGF0dXNVcGRhdGUocmVzcG9uc2Uuc3RhdHVzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgc3RhdGUubGlicDJwLmxhc3RFcnJvciA9IG1lc3NhZ2U7XG4gICAgICAgIHJlbmRlckxpYnAycCgpO1xuICAgICAgICByZXR1cm4geyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IG1lc3NhZ2UgfTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHJlbmRlckZlYXR1cmVzKCkge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9ICQoJ2ZlYXR1cmVzLWNvbnRhaW5lcicpO1xuICAgIGlmICghY29udGFpbmVyKSByZXR1cm47XG5cbiAgICBjb250YWluZXIuaW5uZXJIVE1MID0gc3RhdGUuZmVhdHVyZXMubWFwKChbbmFtZSwgYWN0aXZlLCBzaG9ydERlc2MsIGxvbmdEZXNjXSkgPT4gYFxuICAgICAgICA8ZGl2IGNsYXNzPVwibXQtNFwiPlxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgY2xhc3M9XCJjaGVja2JveFwiXG4gICAgICAgICAgICAgICAgdHlwZT1cImNoZWNrYm94XCJcbiAgICAgICAgICAgICAgICBpZD1cIiR7bmFtZX1cIlxuICAgICAgICAgICAgICAgICR7YWN0aXZlID8gJ2NoZWNrZWQnIDogJyd9XG4gICAgICAgICAgICAgICAgZGF0YS1mZWF0dXJlPVwiJHtuYW1lfVwiXG4gICAgICAgICAgICAvPlxuICAgICAgICAgICAgPGxhYmVsIGZvcj1cIiR7bmFtZX1cIiBjbGFzcz1cImZvbnQtYm9sZFwiPiR7c2hvcnREZXNjfTwvbGFiZWw+XG4gICAgICAgICAgICA8cCBjbGFzcz1cIml0YWxpY1wiPiR7bG9uZ0Rlc2N9PC9wPlxuICAgICAgICA8L2Rpdj5cbiAgICBgKS5qb2luKCcnKTtcblxuICAgIGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKS5mb3JFYWNoKChjYikgPT4ge1xuICAgICAgICBjYi5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBhc3luYyAoZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZmVhdHVyZSA9IGUudGFyZ2V0LmRhdGFzZXQuZmVhdHVyZTtcbiAgICAgICAgICAgIGNvbnN0IGFjdGl2ZSA9IGUudGFyZ2V0LmNoZWNrZWQ7XG4gICAgICAgICAgICBhd2FpdCBhcGkuc3RvcmFnZS5sb2NhbC5zZXQoeyBbZmVhdHVyZV06IGFjdGl2ZSB9KTtcbiAgICAgICAgICAgIGF3YWl0IHJlbG9hZEZlYXR1cmVzKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiByZWxvYWRGZWF0dXJlcygpIHtcbiAgICBzdGF0ZS5mZWF0dXJlcyA9IGF3YWl0IFByb21pc2UuYWxsKFxuICAgICAgICBGRUFUVVJFUy5tYXAoYXN5bmMgKFtuYW1lLCBzaG9ydERlc2MsIGxvbmdEZXNjXSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qga2V5ID0gYGZlYXR1cmU6JHtuYW1lfWA7XG4gICAgICAgICAgICBjb25zdCBzdG9yZWQgPSBhd2FpdCBhcGkuc3RvcmFnZS5sb2NhbC5nZXQoeyBba2V5XTogZmFsc2UgfSk7XG4gICAgICAgICAgICByZXR1cm4gW2tleSwgc3RvcmVkW2tleV0sIHNob3J0RGVzYywgbG9uZ0Rlc2NdO1xuICAgICAgICB9KVxuICAgICk7XG4gICAgcmVuZGVyRmVhdHVyZXMoKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyTGlicDJwKCkge1xuICAgIGNvbnN0IHtcbiAgICAgICAgcmVhZHksXG4gICAgICAgIHN0YXJ0aW5nLFxuICAgICAgICBzdG9wcGluZyxcbiAgICAgICAgYmluZGluZyxcbiAgICAgICAgYm9vdHN0cmFwcGluZyxcbiAgICAgICAgcGVlcklkLFxuICAgICAgICBwZWVySWRTaG9ydCxcbiAgICAgICAgYWN0aXZlUHVia2V5LFxuICAgICAgICBhY3RpdmVOcHViLFxuICAgICAgICBhdHRlc3RhdGlvbixcbiAgICAgICAgbGlzdGVuQWRkcnMsXG4gICAgICAgIGRlZmF1bHRCb290c3RyYXBBZGRycyxcbiAgICAgICAgYm9vdHN0cmFwQWRkcnMsXG4gICAgICAgIGNvbm5lY3Rpb25Db3VudCxcbiAgICAgICAgbGFzdERpYWxUYXJnZXQsXG4gICAgICAgIGxhc3REaWFsUGVlcixcbiAgICAgICAgbGFzdFBpbmdMYXRlbmN5LFxuICAgICAgICBsYXN0QmluZEVycm9yLFxuICAgICAgICBsYXN0Qm9vdHN0cmFwRXJyb3IsXG4gICAgICAgIGxhc3RFcnJvcixcbiAgICAgICAgbG9ncyxcbiAgICB9ID0gc3RhdGUubGlicDJwO1xuXG4gICAgY29uc3Qgc3RhdHVzRWwgPSAkKCdsaWJwMnAtc3RhdHVzJyk7XG4gICAgaWYgKHN0YXR1c0VsKSB7XG4gICAgICAgIHN0YXR1c0VsLnRleHRDb250ZW50ID0gcmVhZHlcbiAgICAgICAgICAgID8gJ1JlYWR5J1xuICAgICAgICAgICAgOiBzdGFydGluZ1xuICAgICAgICAgICAgICAgID8gJ1N0YXJ0aW5nXHUyMDI2J1xuICAgICAgICAgICAgICAgIDogc3RvcHBpbmdcbiAgICAgICAgICAgICAgICAgICAgPyAnU3RvcHBpbmdcdTIwMjYnXG4gICAgICAgICAgICAgICAgICAgIDogJ1N0b3BwZWQnO1xuICAgIH1cblxuICAgIGNvbnN0IHBlZXJJZEVsID0gJCgnbGlicDJwLXBlZXItaWQnKTtcbiAgICBpZiAocGVlcklkRWwpIHtcbiAgICAgICAgcGVlcklkRWwudGV4dENvbnRlbnQgPSBwZWVySWRTaG9ydCB8fCBwZWVySWQgfHwgJ05vdCBzdGFydGVkJztcbiAgICB9XG5cbiAgICBjb25zdCBsaXN0ZW5BZGRyc0VsID0gJCgnbGlicDJwLWxpc3Rlbi1hZGRycycpO1xuICAgIGlmIChsaXN0ZW5BZGRyc0VsKSB7XG4gICAgICAgIGxpc3RlbkFkZHJzRWwudGV4dENvbnRlbnQgPSBsaXN0ZW5BZGRycy5sZW5ndGggPyBsaXN0ZW5BZGRycy5qb2luKCdcXG4nKSA6ICdObyBhZHZlcnRpc2VkIGxpc3RlbiBhZGRyZXNzZXMgaW4gdGhpcyBicm93c2VyIG5vZGUuJztcbiAgICB9XG5cbiAgICBjb25zdCBkZWZhdWx0Qm9vdHN0cmFwRWwgPSAkKCdsaWJwMnAtZGVmYXVsdC1ib290c3RyYXAnKTtcbiAgICBpZiAoZGVmYXVsdEJvb3RzdHJhcEVsKSB7XG4gICAgICAgIGRlZmF1bHRCb290c3RyYXBFbC50ZXh0Q29udGVudCA9IGRlZmF1bHRCb290c3RyYXBBZGRycy5sZW5ndGhcbiAgICAgICAgICAgID8gZGVmYXVsdEJvb3RzdHJhcEFkZHJzLmpvaW4oJ1xcbicpXG4gICAgICAgICAgICA6ICdObyBkZWZhdWx0IFdTUyBib290c3RyYXAgcmVsYXlzIGNvbmZpZ3VyZWQuJztcbiAgICB9XG5cbiAgICBjb25zdCBkaXNjb3ZlcnlCb290c3RyYXBFbCA9ICQoJ2xpYnAycC1kaXNjb3ZlcnktYm9vdHN0cmFwJyk7XG4gICAgaWYgKGRpc2NvdmVyeUJvb3RzdHJhcEVsKSB7XG4gICAgICAgIGRpc2NvdmVyeUJvb3RzdHJhcEVsLnRleHRDb250ZW50ID0gc3RhdGUubGlicDJwLmRpc2NvdmVyeUJvb3RzdHJhcEFkZHJzLmxlbmd0aFxuICAgICAgICAgICAgPyBzdGF0ZS5saWJwMnAuZGlzY292ZXJ5Qm9vdHN0cmFwQWRkcnMuam9pbignXFxuJylcbiAgICAgICAgICAgIDogJ05vIGNhbm9uaWNhbCBsaWJwMnAgYm9vdHN0cmFwIHJlbGF5cyBjb25maWd1cmVkLic7XG4gICAgfVxuXG4gICAgY29uc3QgY29ubmVjdGlvbkNvdW50RWwgPSAkKCdsaWJwMnAtY29ubmVjdGlvbi1jb3VudCcpO1xuICAgIGlmIChjb25uZWN0aW9uQ291bnRFbCkge1xuICAgICAgICBjb25uZWN0aW9uQ291bnRFbC50ZXh0Q29udGVudCA9IFN0cmluZyhjb25uZWN0aW9uQ291bnQpO1xuICAgIH1cblxuICAgIGNvbnN0IGxhc3REaWFsVGFyZ2V0RWwgPSAkKCdsaWJwMnAtbGFzdC1kaWFsLXRhcmdldCcpO1xuICAgIGlmIChsYXN0RGlhbFRhcmdldEVsKSB7XG4gICAgICAgIGxhc3REaWFsVGFyZ2V0RWwudGV4dENvbnRlbnQgPSBsYXN0RGlhbFRhcmdldCB8fCAnXHUyMDE0JztcbiAgICB9XG5cbiAgICBjb25zdCBsYXN0RGlhbFBlZXJFbCA9ICQoJ2xpYnAycC1sYXN0LWRpYWwtcGVlcicpO1xuICAgIGlmIChsYXN0RGlhbFBlZXJFbCkge1xuICAgICAgICBsYXN0RGlhbFBlZXJFbC50ZXh0Q29udGVudCA9IGxhc3REaWFsUGVlciB8fCAnXHUyMDE0JztcbiAgICB9XG5cbiAgICBjb25zdCBsYXN0UGluZ0VsID0gJCgnbGlicDJwLWxhc3QtcGluZycpO1xuICAgIGlmIChsYXN0UGluZ0VsKSB7XG4gICAgICAgIGxhc3RQaW5nRWwudGV4dENvbnRlbnQgPSBsYXN0UGluZ0xhdGVuY3kgfHwgJ1x1MjAxNCc7XG4gICAgfVxuXG4gICAgY29uc3QgZXJyb3JFbCA9ICQoJ2xpYnAycC1lcnJvcicpO1xuICAgIGlmIChlcnJvckVsKSB7XG4gICAgICAgIGVycm9yRWwudGV4dENvbnRlbnQgPSBsYXN0RXJyb3IgfHwgJyc7XG4gICAgICAgIGVycm9yRWwuY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZGVuJywgIWxhc3RFcnJvcik7XG4gICAgfVxuXG4gICAgY29uc3QgYmluZEVycm9yRWwgPSAkKCdsaWJwMnAtYmluZC1lcnJvcicpO1xuICAgIGlmIChiaW5kRXJyb3JFbCkge1xuICAgICAgICBiaW5kRXJyb3JFbC50ZXh0Q29udGVudCA9IGxhc3RCaW5kRXJyb3IgfHwgJyc7XG4gICAgICAgIGJpbmRFcnJvckVsLmNsYXNzTGlzdC50b2dnbGUoJ2hpZGRlbicsICFsYXN0QmluZEVycm9yKTtcbiAgICB9XG5cbiAgICBjb25zdCBib290c3RyYXBFcnJvckVsID0gJCgnbGlicDJwLWJvb3RzdHJhcC1lcnJvcicpO1xuICAgIGlmIChib290c3RyYXBFcnJvckVsKSB7XG4gICAgICAgIGJvb3RzdHJhcEVycm9yRWwudGV4dENvbnRlbnQgPSBsYXN0Qm9vdHN0cmFwRXJyb3IgfHwgJyc7XG4gICAgICAgIGJvb3RzdHJhcEVycm9yRWwuY2xhc3NMaXN0LnRvZ2dsZSgnaGlkZGVuJywgIWxhc3RCb290c3RyYXBFcnJvcik7XG4gICAgfVxuXG4gICAgY29uc3QgYWN0aXZlUHVia2V5RWwgPSAkKCdsaWJwMnAtYWN0aXZlLXB1YmtleScpO1xuICAgIGlmIChhY3RpdmVQdWJrZXlFbCkge1xuICAgICAgICBhY3RpdmVQdWJrZXlFbC50ZXh0Q29udGVudCA9IGFjdGl2ZVB1YmtleSA/IHNob3J0VmFsdWUoYWN0aXZlUHVia2V5LCAxNiwgMTIpIDogJ05vdCBib3VuZCc7XG4gICAgfVxuXG4gICAgY29uc3QgYWN0aXZlTnB1YkVsID0gJCgnbGlicDJwLWFjdGl2ZS1ucHViJyk7XG4gICAgaWYgKGFjdGl2ZU5wdWJFbCkge1xuICAgICAgICBhY3RpdmVOcHViRWwudGV4dENvbnRlbnQgPSBhY3RpdmVOcHViIHx8ICdOb3QgYm91bmQnO1xuICAgIH1cblxuICAgIGNvbnN0IGF0dGVzdGF0aW9uRWwgPSAkKCdsaWJwMnAtYXR0ZXN0YXRpb24nKTtcbiAgICBpZiAoYXR0ZXN0YXRpb25FbCkge1xuICAgICAgICBhdHRlc3RhdGlvbkVsLnRleHRDb250ZW50ID0gYXR0ZXN0YXRpb24gPyBKU09OLnN0cmluZ2lmeShhdHRlc3RhdGlvbiwgbnVsbCwgMikgOiAnTm8gYXR0ZXN0YXRpb24geWV0Lic7XG4gICAgfVxuXG4gICAgY29uc3QgcmVsYXlEZXNjcmlwdG9yRWwgPSAkKCdsaWJwMnAtcmVsYXktZGVzY3JpcHRvcicpO1xuICAgIGlmIChyZWxheURlc2NyaXB0b3JFbCkge1xuICAgICAgICByZWxheURlc2NyaXB0b3JFbC50ZXh0Q29udGVudCA9IHN0YXRlLmxpYnAycC5yZWxheURlc2NyaXB0b3JcbiAgICAgICAgICAgID8gSlNPTi5zdHJpbmdpZnkoc3RhdGUubGlicDJwLnJlbGF5RGVzY3JpcHRvciwgbnVsbCwgMilcbiAgICAgICAgICAgIDogJ05vIHJlbGF5IGRlc2NyaXB0b3IgeWV0Lic7XG4gICAgfVxuXG4gICAgY29uc3QgYmluZFN0YXRlRWwgPSAkKCdsaWJwMnAtYmluZC1zdGF0ZScpO1xuICAgIGlmIChiaW5kU3RhdGVFbCkge1xuICAgICAgICBiaW5kU3RhdGVFbC50ZXh0Q29udGVudCA9IGJpbmRpbmdcbiAgICAgICAgICAgID8gJ0JpbmRpbmdcdTIwMjYnXG4gICAgICAgICAgICA6IGF0dGVzdGF0aW9uXG4gICAgICAgICAgICAgICAgPyAnQXR0ZXN0ZWQnXG4gICAgICAgICAgICAgICAgOiAnVW5ib3VuZCc7XG4gICAgfVxuXG4gICAgY29uc3QgbG9nRWwgPSAkKCdsaWJwMnAtbG9nJyk7XG4gICAgaWYgKGxvZ0VsKSB7XG4gICAgICAgIGxvZ0VsLmlubmVySFRNTCA9IGxvZ3MubGVuZ3RoXG4gICAgICAgICAgICA/IGxvZ3MubWFwKCh7IHRzLCBraW5kLCBtZXNzYWdlIH0pID0+IGBcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibGlicDJwLWxvZy1saW5lIGxpYnAycC1sb2ctbGluZS0tJHtraW5kfVwiPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImxpYnAycC1sb2ctdHNcIj4ke2VzY2FwZUh0bWwodHMpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJsaWJwMnAtbG9nLW1zZ1wiPiR7ZXNjYXBlSHRtbChtZXNzYWdlKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICBgKS5qb2luKCcnKVxuICAgICAgICAgICAgOiAnPGRpdiBjbGFzcz1cImxpYnAycC1sb2ctZW1wdHlcIj5ObyBhY3Rpdml0eSB5ZXQuPC9kaXY+JztcbiAgICB9XG5cbiAgICBjb25zdCBzdGFydEJ0biA9ICQoJ2xpYnAycC1zdGFydC1idG4nKTtcbiAgICBpZiAoc3RhcnRCdG4pIHtcbiAgICAgICAgc3RhcnRCdG4uZGlzYWJsZWQgPSByZWFkeSB8fCBzdGFydGluZyB8fCBzdG9wcGluZztcbiAgICB9XG5cbiAgICBjb25zdCBzdG9wQnRuID0gJCgnbGlicDJwLXN0b3AtYnRuJyk7XG4gICAgaWYgKHN0b3BCdG4pIHtcbiAgICAgICAgc3RvcEJ0bi5kaXNhYmxlZCA9ICFyZWFkeSB8fCBzdG9wcGluZztcbiAgICB9XG5cbiAgICBjb25zdCBkaWFsQnRuID0gJCgnbGlicDJwLWRpYWwtYnRuJyk7XG4gICAgaWYgKGRpYWxCdG4pIHtcbiAgICAgICAgZGlhbEJ0bi5kaXNhYmxlZCA9ICFyZWFkeSB8fCBzdGFydGluZyB8fCBzdG9wcGluZztcbiAgICB9XG5cbiAgICBjb25zdCBwZWVySW5wdXQgPSAkKCdsaWJwMnAtcGVlci1pbnB1dCcpO1xuICAgIGlmIChwZWVySW5wdXQpIHtcbiAgICAgICAgcGVlcklucHV0LmRpc2FibGVkID0gIXJlYWR5IHx8IHN0YXJ0aW5nIHx8IHN0b3BwaW5nO1xuICAgIH1cblxuICAgIGNvbnN0IGJpbmRCdG4gPSAkKCdsaWJwMnAtYmluZC1idG4nKTtcbiAgICBpZiAoYmluZEJ0bikge1xuICAgICAgICBiaW5kQnRuLmRpc2FibGVkID0gIXJlYWR5IHx8IHN0YXJ0aW5nIHx8IHN0b3BwaW5nIHx8IGJpbmRpbmc7XG4gICAgfVxuXG4gICAgY29uc3QgY29weUJpbmRCdG4gPSAkKCdsaWJwMnAtY29weS1iaW5kLWJ0bicpO1xuICAgIGlmIChjb3B5QmluZEJ0bikge1xuICAgICAgICBjb3B5QmluZEJ0bi5kaXNhYmxlZCA9ICFhdHRlc3RhdGlvbjtcbiAgICB9XG5cbiAgICBjb25zdCBjbGVhckJpbmRCdG4gPSAkKCdsaWJwMnAtY2xlYXItYmluZC1idG4nKTtcbiAgICBpZiAoY2xlYXJCaW5kQnRuKSB7XG4gICAgICAgIGNsZWFyQmluZEJ0bi5kaXNhYmxlZCA9ICFhdHRlc3RhdGlvbiAmJiAhYWN0aXZlUHVia2V5ICYmICFhY3RpdmVOcHViO1xuICAgIH1cblxuICAgIGNvbnN0IGNvcHlSZWxheUJ0biA9ICQoJ2xpYnAycC1jb3B5LXJlbGF5LWJ0bicpO1xuICAgIGlmIChjb3B5UmVsYXlCdG4pIHtcbiAgICAgICAgY29weVJlbGF5QnRuLmRpc2FibGVkID0gIXN0YXRlLmxpYnAycC5yZWxheURlc2NyaXB0b3I7XG4gICAgfVxuXG4gICAgY29uc3QgYm9vdHN0cmFwQnRuID0gJCgnbGlicDJwLWJvb3RzdHJhcC1idG4nKTtcbiAgICBpZiAoYm9vdHN0cmFwQnRuKSB7XG4gICAgICAgIGJvb3RzdHJhcEJ0bi5kaXNhYmxlZCA9ICFyZWFkeSB8fCBzdGFydGluZyB8fCBzdG9wcGluZyB8fCBib290c3RyYXBwaW5nO1xuICAgIH1cblxuICAgIGNvbnN0IGJvb3RzdHJhcElucHV0ID0gJCgnbGlicDJwLWJvb3RzdHJhcC1pbnB1dCcpO1xuICAgIGlmIChib290c3RyYXBJbnB1dCkge1xuICAgICAgICBjb25zdCBuZXh0VmFsdWUgPSBib290c3RyYXBBZGRycy5qb2luKCdcXG4nKTtcbiAgICAgICAgaWYgKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IGJvb3RzdHJhcElucHV0ICYmIGJvb3RzdHJhcElucHV0LnZhbHVlICE9PSBuZXh0VmFsdWUpIHtcbiAgICAgICAgICAgIGJvb3RzdHJhcElucHV0LnZhbHVlID0gbmV4dFZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGJvb3RzdHJhcElucHV0LmRpc2FibGVkID0gIXJlYWR5IHx8IHN0YXJ0aW5nIHx8IHN0b3BwaW5nO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gc3RhcnRMaWJwMnBOb2RlKCkge1xuICAgIGF3YWl0IHNlbmRMaWJwMnBNZXNzYWdlKCdsaWJwMnAuc3RhcnQnKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc3RvcExpYnAycE5vZGUoKSB7XG4gICAgYXdhaXQgc2VuZExpYnAycE1lc3NhZ2UoJ2xpYnAycC5zdG9wJyk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGRpYWxMaWJwMnBQZWVyKCkge1xuICAgIGNvbnN0IHBlZXJJbnB1dCA9ICQoJ2xpYnAycC1wZWVyLWlucHV0Jyk7XG4gICAgY29uc3QgdGFyZ2V0ID0gcGVlcklucHV0Py52YWx1ZS50cmltKCk7XG4gICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgICAgc3RhdGUubGlicDJwLmxhc3RFcnJvciA9ICdFbnRlciBhIGxpYnAycCBtdWx0aWFkZHIgZmlyc3QuJztcbiAgICAgICAgcmVuZGVyTGlicDJwKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgYXdhaXQgc2VuZExpYnAycE1lc3NhZ2UoJ2xpYnAycC5kaWFsJywgdGFyZ2V0KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gYm9vdHN0cmFwTGlicDJwTm9kZSgpIHtcbiAgICBjb25zdCBpbnB1dCA9ICQoJ2xpYnAycC1ib290c3RyYXAtaW5wdXQnKTtcbiAgICBjb25zdCByYXcgPSBpbnB1dD8udmFsdWUgfHwgJyc7XG4gICAgY29uc3QgYWRkcnMgPSByYXdcbiAgICAgICAgLnNwbGl0KC9cXHI/XFxufCwvKVxuICAgICAgICAubWFwKChhZGRyKSA9PiBhZGRyLnRyaW0oKSlcbiAgICAgICAgLmZpbHRlcihCb29sZWFuKTtcblxuICAgIGlmICghYWRkcnMubGVuZ3RoKSB7XG4gICAgICAgIHN0YXRlLmxpYnAycC5sYXN0Qm9vdHN0cmFwRXJyb3IgPSAnQWRkIGF0IGxlYXN0IG9uZSBib290c3RyYXAgbXVsdGlhZGRyLic7XG4gICAgICAgIHJlbmRlckxpYnAycCgpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgYXdhaXQgc2VuZExpYnAycE1lc3NhZ2UoJ2xpYnAycC5ib290c3RyYXAnLCBhZGRycyk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGJpbmRMaWJwMnBJZGVudGl0eSgpIHtcbiAgICBhd2FpdCBzZW5kTGlicDJwTWVzc2FnZSgnbGlicDJwLmJpbmRJZGVudGl0eScpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBjbGVhckxpYnAycEJpbmRpbmcoKSB7XG4gICAgYXdhaXQgc2VuZExpYnAycE1lc3NhZ2UoJ2xpYnAycC5jbGVhckJpbmRpbmcnKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gY29weUxpYnAycEJpbmRpbmcoKSB7XG4gICAgY29uc3QgcGF5bG9hZCA9IHN0YXRlLmxpYnAycC5hdHRlc3RhdGlvbjtcbiAgICBpZiAoIXBheWxvYWQpIHJldHVybjtcbiAgICBjb25zdCB0ZXh0ID0gSlNPTi5zdHJpbmdpZnkocGF5bG9hZCwgbnVsbCwgMik7XG4gICAgaWYgKG5hdmlnYXRvci5jbGlwYm9hcmQ/LndyaXRlVGV4dCkge1xuICAgICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0ZXh0KTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdjb3B5JywgcGF5bG9hZDogdGV4dCB9KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gY29weVJlbGF5RGVzY3JpcHRvcigpIHtcbiAgICBjb25zdCBkZXNjcmlwdG9yID0gc3RhdGUubGlicDJwLnJlbGF5RGVzY3JpcHRvcjtcbiAgICBpZiAoIWRlc2NyaXB0b3IpIHJldHVybjtcbiAgICBjb25zdCB0ZXh0ID0gSlNPTi5zdHJpbmdpZnkoZGVzY3JpcHRvciwgbnVsbCwgMik7XG4gICAgaWYgKG5hdmlnYXRvci5jbGlwYm9hcmQ/LndyaXRlVGV4dCkge1xuICAgICAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dCh0ZXh0KTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdjb3B5JywgcGF5bG9hZDogdGV4dCB9KTtcbn1cblxuZnVuY3Rpb24gaGFuZGxlUnVudGltZU1lc3NhZ2UobWVzc2FnZSkge1xuICAgIGlmIChtZXNzYWdlPy5raW5kID09PSAnbGlicDJwLnN0YXR1c1VwZGF0ZScpIHtcbiAgICAgICAgYXBwbHlTdGF0dXNVcGRhdGUobWVzc2FnZS5wYXlsb2FkKTtcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgYXBpLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKGhhbmRsZVJ1bnRpbWVNZXNzYWdlKTtcblxuICAgIGF3YWl0IHJlbG9hZEZlYXR1cmVzKCk7XG4gICAgY29uc3Qgc3RhdHVzUmVzcG9uc2UgPSBhd2FpdCBzZW5kTGlicDJwTWVzc2FnZSgnbGlicDJwLnN0YXR1cycpO1xuICAgIGlmIChzdGF0dXNSZXNwb25zZT8uc3RhdHVzKSB7XG4gICAgICAgIGFwcGx5U3RhdHVzVXBkYXRlKHN0YXR1c1Jlc3BvbnNlLnN0YXR1cyk7XG4gICAgfVxuXG4gICAgJCgnbGlicDJwLXN0YXJ0LWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcbiAgICAgICAgYXdhaXQgc3RhcnRMaWJwMnBOb2RlKCk7XG4gICAgfSk7XG5cbiAgICAkKCdsaWJwMnAtc3RvcC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IHN0b3BMaWJwMnBOb2RlKCk7XG4gICAgfSk7XG5cbiAgICAkKCdsaWJwMnAtZGlhbC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IGRpYWxMaWJwMnBQZWVyKCk7XG4gICAgfSk7XG5cbiAgICAkKCdsaWJwMnAtYmluZC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IGJpbmRMaWJwMnBJZGVudGl0eSgpO1xuICAgIH0pO1xuXG4gICAgJCgnbGlicDJwLWJvb3RzdHJhcC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IGJvb3RzdHJhcExpYnAycE5vZGUoKTtcbiAgICB9KTtcblxuICAgICQoJ2xpYnAycC1jb3B5LWJpbmQtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBhd2FpdCBjb3B5TGlicDJwQmluZGluZygpO1xuICAgIH0pO1xuXG4gICAgJCgnbGlicDJwLWNvcHktcmVsYXktYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBhd2FpdCBjb3B5UmVsYXlEZXNjcmlwdG9yKCk7XG4gICAgfSk7XG5cbiAgICAkKCdsaWJwMnAtY2xlYXItYmluZC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IGNsZWFyTGlicDJwQmluZGluZygpO1xuICAgIH0pO1xuXG4gICAgJCgnbGlicDJwLXBlZXItaW5wdXQnKT8uYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGFzeW5jIChldmVudCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQua2V5ID09PSAnRW50ZXInKSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgYXdhaXQgZGlhbExpYnAycFBlZXIoKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgaW5pdCk7XG5cbmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjbG9zZS1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgd2luZG93LmNsb3NlKCk7XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7O0FBZ0JBLE1BQU0sV0FDRixPQUFPLFlBQVksY0FBYyxVQUNqQyxPQUFPLFdBQVksY0FBYyxTQUNqQztBQUVKLE1BQUksQ0FBQyxVQUFVO0FBQ1gsVUFBTSxJQUFJLE1BQU0sa0ZBQWtGO0FBQUEsRUFDdEc7QUFNQSxNQUFNLFdB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UyxLQUFLLENBQUM7QUFBQSxFQUNqRTtBQUVBLFdBQVMscUJBQXFCLFNBQVM7QUFDbkMsUUFBSSxTQUFTLFNBQVMsdUJBQXVCO0FBQ3pDLHdCQUFrQixRQUFRLE9BQU87QUFBQSxJQUNyQztBQUFBLEVBQ0o7QUFFQSxpQkFBZSxPQUFPO0FBQ2xCLFFBQUksUUFBUSxVQUFVLFlBQVksb0JBQW9CO0FBRXRELFVBQU0sZUFBZTtBQUNyQixVQUFNLGlCQUFpQixNQUFNLGtCQUFrQixlQUFlO0FBQzlELFFBQUksZ0JBQWdCLFFBQVE7QUFDeEIsd0JBQWtCLGVBQWUsTUFBTTtBQUFBLElBQzNDO0FBRUEsTUFBRSxrQkFBa0IsR0FBRyxpQkFBaUIsU0FBUyxZQUFZO0FBQ3pELFlBQU0sZ0JBQWdCO0FBQUEsSUFDMUIsQ0FBQztBQUVELE1BQUUsaUJBQWlCLEdBQUcsaUJBQWlCLFNBQVMsWUFBWTtBQUN4RCxZQUFNLGVBQWU7QUFBQSxJQUN6QixDQUFDO0FBRUQsTUFBRSxpQkFBaUIsR0FBRyxpQkFBaUIsU0FBUyxZQUFZO0FBQ3hELFlBQU0sZUFBZTtBQUFBLElBQ3pCLENBQUM7QUFFRCxNQUFFLGlCQUFpQixHQUFHLGlCQUFpQixTQUFTLFlBQVk7QUFDeEQsWUFBTSxtQkFBbUI7QUFBQSxJQUM3QixDQUFDO0FBRUQsTUFBRSxzQkFBc0IsR0FBRyxpQkFBaUIsU0FBUyxZQUFZO0FBQzdELFlBQU0sb0JBQW9CO0FBQUEsSUFDOUIsQ0FBQztBQUVELE1BQUUsc0JBQXNCLEdBQUcsaUJBQWlCLFNBQVMsWUFBWTtBQUM3RCxZQUFNLGtCQUFrQjtBQUFBLElBQzVCLENBQUM7QUFFRCxNQUFFLHVCQUF1QixHQUFHLGlCQUFpQixTQUFTLFlBQVk7QUFDOUQsWUFBTSxvQkFBb0I7QUFBQSxJQUM5QixDQUFDO0FBRUQsTUFBRSx1QkFBdUIsR0FBRyxpQkFBaUIsU0FBUyxZQUFZO0FBQzlELFlBQU0sbUJBQW1CO0FBQUEsSUFDN0IsQ0FBQztBQUVELE1BQUUsbUJBQW1CLEdBQUcsaUJBQWlCLFdBQVcsT0FBTyxVQUFVO0FBQ2pFLFVBQUksTUFBTSxRQUFRLFNBQVM7QUFDdkIsY0FBTSxlQUFlO0FBQ3JCLGNBQU0sZUFBZTtBQUFBLE1BQ3pCO0FBQUEsSUFDSixDQUFDO0FBQUEsRUFDTDtBQUVBLFdBQVMsaUJBQWlCLG9CQUFvQixJQUFJO0FBRWxELFdBQVMsZUFBZSxXQUFXLEdBQUcsaUJBQWlCLFNBQVMsTUFBTTtBQUNsRSxXQUFPLE1BQU07QUFBQSxFQUNqQixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
