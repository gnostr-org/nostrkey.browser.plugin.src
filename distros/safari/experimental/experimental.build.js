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
      defaultBootstrapEl.textContent = defaultBootstrapAddrs.length ? defaultBootstrapAddrs.join("\n") : "No default IPFS bootstrap relays configured.";
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uLy4uL3NyYy9leHBlcmltZW50YWwvZXhwZXJpbWVudGFsLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvKipcbiAqIEJyb3dzZXIgQVBJIGNvbXBhdGliaWxpdHkgbGF5ZXIgZm9yIENocm9tZSAvIFNhZmFyaSAvIEZpcmVmb3guXG4gKlxuICogU2FmYXJpIGFuZCBGaXJlZm94IGV4cG9zZSBgYnJvd3Nlci4qYCAoUHJvbWlzZS1iYXNlZCwgV2ViRXh0ZW5zaW9uIHN0YW5kYXJkKS5cbiAqIENocm9tZSBleHBvc2VzIGBjaHJvbWUuKmAgKGNhbGxiYWNrLWJhc2VkIGhpc3RvcmljYWxseSwgYnV0IE1WMyBzdXBwb3J0c1xuICogcHJvbWlzZXMgb24gbW9zdCBBUElzKS4gSW4gYSBzZXJ2aWNlLXdvcmtlciBjb250ZXh0IGBicm93c2VyYCBpcyB1bmRlZmluZWRcbiAqIG9uIENocm9tZSwgc28gd2Ugbm9ybWFsaXNlIGV2ZXJ5dGhpbmcgaGVyZS5cbiAqXG4gKiBVc2FnZTogIGltcG9ydCB7IGFwaSB9IGZyb20gJy4vdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwnO1xuICogICAgICAgICBhcGkucnVudGltZS5zZW5kTWVzc2FnZSguLi4pXG4gKlxuICogVGhlIGV4cG9ydGVkIGBhcGlgIG9iamVjdCBtaXJyb3JzIHRoZSBzdWJzZXQgb2YgdGhlIFdlYkV4dGVuc2lvbiBBUEkgdGhhdFxuICogTm9zdHJLZXkgYWN0dWFsbHkgdXNlcywgd2l0aCBldmVyeSBtZXRob2QgcmV0dXJuaW5nIGEgUHJvbWlzZS5cbiAqL1xuXG4vLyBEZXRlY3Qgd2hpY2ggZ2xvYmFsIG5hbWVzcGFjZSBpcyBhdmFpbGFibGUuXG5jb25zdCBfYnJvd3NlciA9XG4gICAgdHlwZW9mIGJyb3dzZXIgIT09ICd1bmRlZmluZWQnID8gYnJvd3NlciA6XG4gICAgdHlwZW9mIGNocm9tZSAgIT09ICd1bmRlZmluZWQnID8gY2hyb21lICA6XG4gICAgbnVsbDtcblxuaWYgKCFfYnJvd3Nlcikge1xuICAgIHRocm93IG5ldyBFcnJvcignYnJvd3Nlci1wb2x5ZmlsbDogTm8gZXh0ZW5zaW9uIEFQSSBuYW1lc3BhY2UgZm91bmQgKG5laXRoZXIgYnJvd3NlciBub3IgY2hyb21lKS4nKTtcbn1cblxuLyoqXG4gKiBUcnVlIHdoZW4gcnVubmluZyBvbiBDaHJvbWUgKG9yIGFueSBDaHJvbWl1bS1iYXNlZCBicm93c2VyIHRoYXQgb25seVxuICogZXhwb3NlcyB0aGUgYGNocm9tZWAgbmFtZXNwYWNlKS5cbiAqL1xuY29uc3QgaXNDaHJvbWUgPSB0eXBlb2YgYnJvd3NlciA9PT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNocm9tZSAhPT0gJ3VuZGVmaW5lZCc7XG5cbi8qKlxuICogV3JhcCBhIENocm9tZSBjYWxsYmFjay1zdHlsZSBtZXRob2Qgc28gaXQgcmV0dXJucyBhIFByb21pc2UuXG4gKiBJZiB0aGUgbWV0aG9kIGFscmVhZHkgcmV0dXJucyBhIHByb21pc2UgKE1WMykgd2UganVzdCBwYXNzIHRocm91Z2guXG4gKi9cbmZ1bmN0aW9uIHByb21pc2lmeShjb250ZXh0LCBtZXRob2QpIHtcbiAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgLy8gTVYzIENocm9tZSBBUElzIHJldHVybiBwcm9taXNlcyB3aGVuIG5vIGNhbGxiYWNrIGlzIHN1cHBsaWVkLlxuICAgICAgICAvLyBXZSB0cnkgdGhlIHByb21pc2UgcGF0aCBmaXJzdDsgaWYgdGhlIHJ1bnRpbWUgc2lnbmFscyBhbiBlcnJvclxuICAgICAgICAvLyB2aWEgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yIGluc2lkZSBhIGNhbGxiYWNrIHdlIGNhdGNoIHRoYXQgdG9vLlxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gbWV0aG9kLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgICAvLyBmYWxsIHRocm91Z2ggdG8gY2FsbGJhY2sgd3JhcHBpbmdcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBtZXRob2QuYXBwbHkoY29udGV4dCwgW1xuICAgICAgICAgICAgICAgIC4uLmFyZ3MsXG4gICAgICAgICAgICAgICAgKC4uLmNiQXJncykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2Jyb3dzZXIucnVudGltZSAmJiBfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGNiQXJncy5sZW5ndGggPD0gMSA/IGNiQXJnc1swXSA6IGNiQXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQnVpbGQgdGhlIHVuaWZpZWQgYGFwaWAgb2JqZWN0XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuY29uc3QgYXBpID0ge307XG5cbi8vIC0tLSBydW50aW1lIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnJ1bnRpbWUgPSB7XG4gICAgLyoqXG4gICAgICogc2VuZE1lc3NhZ2UgXHUyMDEzIGFsd2F5cyByZXR1cm5zIGEgUHJvbWlzZS5cbiAgICAgKi9cbiAgICBzZW5kTWVzc2FnZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIucnVudGltZSwgX2Jyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSkoLi4uYXJncyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uTWVzc2FnZSBcdTIwMTMgdGhpbiB3cmFwcGVyIHNvIGNhbGxlcnMgdXNlIGEgY29uc2lzdGVudCByZWZlcmVuY2UuXG4gICAgICogVGhlIGxpc3RlbmVyIHNpZ25hdHVyZSBpcyAobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpLlxuICAgICAqIE9uIENocm9tZSB0aGUgbGlzdGVuZXIgY2FuIHJldHVybiBgdHJ1ZWAgdG8ga2VlcCB0aGUgY2hhbm5lbCBvcGVuLFxuICAgICAqIG9yIHJldHVybiBhIFByb21pc2UgKE1WMykuICBTYWZhcmkgLyBGaXJlZm94IGV4cGVjdCBhIFByb21pc2UgcmV0dXJuLlxuICAgICAqL1xuICAgIG9uTWVzc2FnZTogX2Jyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UsXG5cbiAgICAvKipcbiAgICAgKiBnZXRVUkwgXHUyMDEzIHN5bmNocm9ub3VzIG9uIGFsbCBicm93c2Vycy5cbiAgICAgKi9cbiAgICBnZXRVUkwocGF0aCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5nZXRVUkwocGF0aCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9wZW5PcHRpb25zUGFnZVxuICAgICAqL1xuICAgIG9wZW5PcHRpb25zUGFnZSgpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUub3Blbk9wdGlvbnNQYWdlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5ydW50aW1lLCBfYnJvd3Nlci5ydW50aW1lLm9wZW5PcHRpb25zUGFnZSkoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXhwb3NlIHRoZSBpZCBmb3IgY29udmVuaWVuY2UuXG4gICAgICovXG4gICAgZ2V0IGlkKCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5pZDtcbiAgICB9LFxufTtcblxuLy8gLS0tIHN0b3JhZ2UubG9jYWwgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkuc3RvcmFnZSA9IHtcbiAgICBsb2NhbDoge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICAvLyAtLS0gc3RvcmFnZS5zeW5jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBOdWxsIHdoZW4gdGhlIGJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IHN5bmMgKG9sZGVyIFNhZmFyaSwgZXRjLilcbiAgICBzeW5jOiBfYnJvd3Nlci5zdG9yYWdlPy5zeW5jID8ge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuc2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBnZXRCeXRlc0luVXNlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpIHtcbiAgICAgICAgICAgICAgICAvLyBTYWZhcmkgZG9lc24ndCBzdXBwb3J0IGdldEJ5dGVzSW5Vc2UgXHUyMDE0IHJldHVybiAwXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0gOiBudWxsLFxuXG4gICAgLy8gLS0tIHN0b3JhZ2Uuc2Vzc2lvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gTVYzIGluLW1lbW9yeSBhcmVhIHRoYXQgc3Vydml2ZXMgc2VydmljZS13b3JrZXIgZXZpY3Rpb24gYnV0IG5ldmVyIHRvdWNoZXNcbiAgICAvLyBkaXNrLiBOdWxsIG9uIGVuZ2luZXMgdGhhdCBkb24ndCBpbXBsZW1lbnQgaXQgKFNhZmFyaSBiYWNrZ3JvdW5kIHBhZ2UsXG4gICAgLy8gb2xkZXIgRmlyZWZveCkgXHUyMDE0IGNhbGxlcnMgbXVzdCBmZWF0dXJlLWRldGVjdCBhbmQgZmFsbCBiYWNrLlxuICAgIHNlc3Npb246IF9icm93c2VyLnN0b3JhZ2U/LnNlc3Npb24gPyB7XG4gICAgICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLmdldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24sIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5jbGVhcikoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXN0cmljdCB0aGUgYXJlYSB0byBleHRlbnNpb24tcHJpdmlsZWdlZCBjb250ZXh0cy4gQ2hyb21lLW9ubHk7XG4gICAgICAgICAqIHJlc29sdmVzIGhhcm1sZXNzbHkgd2hlcmUgdGhlIG1ldGhvZCBpcyBhYnNlbnQuXG4gICAgICAgICAqL1xuICAgICAgICBzZXRBY2Nlc3NMZXZlbCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIV9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXRBY2Nlc3NMZXZlbCkgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uc2V0QWNjZXNzTGV2ZWwoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldEFjY2Vzc0xldmVsKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9IDogbnVsbCxcblxuICAgIC8vIC0tLSBzdG9yYWdlLm9uQ2hhbmdlZCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIG9uQ2hhbmdlZDogX2Jyb3dzZXIuc3RvcmFnZT8ub25DaGFuZ2VkIHx8IG51bGwsXG59O1xuXG4vLyAtLS0gdGFicyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS50YWJzID0ge1xuICAgIGNyZWF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmNyZWF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuY3JlYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHF1ZXJ5KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMucXVlcnkoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnF1ZXJ5KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMucmVtb3ZlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHVwZGF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnVwZGF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMudXBkYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmdldCguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuZ2V0KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldEN1cnJlbnQoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHNlbmRNZXNzYWdlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuc2VuZE1lc3NhZ2UoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnNlbmRNZXNzYWdlKSguLi5hcmdzKTtcbiAgICB9LFxufTtcblxuLy8gLS0tIGFsYXJtcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBjaHJvbWUuYWxhcm1zIHN1cnZpdmVzIE1WMyBzZXJ2aWNlLXdvcmtlciBldmljdGlvbjsgc2V0VGltZW91dCBkb2VzIG5vdC5cbmFwaS5hbGFybXMgPSBfYnJvd3Nlci5hbGFybXMgPyB7XG4gICAgY3JlYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgLy8gYWxhcm1zLmNyZWF0ZSBpcyBzeW5jaHJvbm91cyBvbiBDaHJvbWUsIHJldHVybnMgUHJvbWlzZSBvbiBGaXJlZm94L1NhZmFyaVxuICAgICAgICBjb25zdCByZXN1bHQgPSBfYnJvd3Nlci5hbGFybXMuY3JlYXRlKC4uLmFyZ3MpO1xuICAgICAgICByZXR1cm4gcmVzdWx0ICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gJ2Z1bmN0aW9uJyA/IHJlc3VsdCA6IFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH0sXG4gICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuYWxhcm1zLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuYWxhcm1zLCBfYnJvd3Nlci5hbGFybXMuY2xlYXIpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgb25BbGFybTogX2Jyb3dzZXIuYWxhcm1zLm9uQWxhcm0sXG59IDogbnVsbDtcblxuZXhwb3J0IHsgYXBpLCBpc0Nocm9tZSB9O1xuIiwgImltcG9ydCB7IGFwaSB9IGZyb20gJy4uL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsJztcblxuY29uc3QgRkVBVFVSRVMgPSBbXG4gICAgW1xuICAgICAgICAnbm9uZScsXG4gICAgICAgICdOSVAtWFg6IE5vbmUnLFxuICAgICAgICAnUmVzZXJ2ZWQgZm9yIHRoZSBmdXR1cmUgdXNlLicsXG4gICAgXSxcbl07XG5cbmNvbnN0ICQgPSAoaWQpID0+IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcblxuY29uc3Qgc3RhdGUgPSB7XG4gICAgZmVhdHVyZXM6IFtdLFxuICAgIGxpYnAycDoge1xuICAgICAgICByZWFkeTogZmFsc2UsXG4gICAgICAgIHN0YXJ0aW5nOiBmYWxzZSxcbiAgICAgICAgc3RvcHBpbmc6IGZhbHNlLFxuICAgICAgICBiaW5kaW5nOiBmYWxzZSxcbiAgICAgICAgYm9vdHN0cmFwcGluZzogZmFsc2UsXG4gICAgICAgIHBlZXJJZDogJycsXG4gICAgICAgIHBlZXJJZFNob3J0OiAnJyxcbiAgICAgICAgYWN0aXZlUHVia2V5OiAnJyxcbiAgICAgICAgYWN0aXZlTnB1YjogJycsXG4gICAgICAgIGF0dGVzdGF0aW9uOiBudWxsLFxuICAgICAgICByZWxheURlc2NyaXB0b3I6IG51bGwsXG4gICAgICAgIGRlZmF1bHRCb290c3RyYXBBZGRyczogW10sXG4gICAgICAgIGJvb3RzdHJhcEFkZHJzOiBbXSxcbiAgICAgICAgbGlzdGVuQWRkcnM6IFtdLFxuICAgICAgICBjb25uZWN0aW9uQ291bnQ6IDAsXG4gICAgICAgIGxhc3REaWFsVGFyZ2V0OiAnJyxcbiAgICAgICAgbGFzdERpYWxQZWVyOiAnJyxcbiAgICAgICAgbGFzdFBpbmdMYXRlbmN5OiAnJyxcbiAgICAgICAgbGFzdEJpbmRFcnJvcjogJycsXG4gICAgICAgIGxhc3RCb290c3RyYXBFcnJvcjogJycsXG4gICAgICAgIGxhc3RFcnJvcjogJycsXG4gICAgICAgIGxvZ3M6IFtdLFxuICAgIH0sXG59O1xuXG5mdW5jdGlvbiBlc2NhcGVIdG1sKHZhbHVlKSB7XG4gICAgcmV0dXJuIFN0cmluZyh2YWx1ZSlcbiAgICAgICAgLnJlcGxhY2VBbGwoJyYnLCAnJmFtcDsnKVxuICAgICAgICAucmVwbGFjZUFsbCgnPCcsICcmbHQ7JylcbiAgICAgICAgLnJlcGxhY2VBbGwoJz4nLCAnJmd0OycpXG4gICAgICAgIC5yZXBsYWNlQWxsKCdcIicsICcmcXVvdDsnKVxuICAgICAgICAucmVwbGFjZUFsbChcIidcIiwgJyYjMzk7Jyk7XG59XG5cbmZ1bmN0aW9uIHNob3J0VmFsdWUodmFsdWUsIGhlYWQgPSAxMCwgdGFpbCA9IDgpIHtcbiAgICBpZiAoIXZhbHVlKSByZXR1cm4gJyc7XG4gICAgaWYgKHZhbHVlLmxlbmd0aCA8PSBoZWFkICsgdGFpbCArIDMpIHJldHVybiB2YWx1ZTtcbiAgICByZXR1cm4gYCR7dmFsdWUuc2xpY2UoMCwgaGVhZCl9XHUyMDI2JHt2YWx1ZS5zbGljZSgtdGFpbCl9YDtcbn1cblxuZnVuY3Rpb24gYXBwbHlTdGF0dXNVcGRhdGUoc3RhdHVzKSB7XG4gICAgaWYgKCFzdGF0dXMgfHwgdHlwZW9mIHN0YXR1cyAhPT0gJ29iamVjdCcpIHJldHVybjtcbiAgICBzdGF0ZS5saWJwMnAgPSB7IC4uLnN0YXRlLmxpYnAycCwgLi4uc3RhdHVzIH07XG4gICAgcmVuZGVyTGlicDJwKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHNlbmRMaWJwMnBNZXNzYWdlKGtpbmQsIHBheWxvYWQpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZCwgcGF5bG9hZCB9KTtcbiAgICAgICAgaWYgKHJlc3BvbnNlPy5zdGF0dXMpIHtcbiAgICAgICAgICAgIGFwcGx5U3RhdHVzVXBkYXRlKHJlc3BvbnNlLnN0YXR1cyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIHN0YXRlLmxpYnAycC5sYXN0RXJyb3IgPSBtZXNzYWdlO1xuICAgICAgICByZW5kZXJMaWJwMnAoKTtcbiAgICAgICAgcmV0dXJuIHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBtZXNzYWdlIH07XG4gICAgfVxufVxuXG5mdW5jdGlvbiByZW5kZXJGZWF0dXJlcygpIHtcbiAgICBjb25zdCBjb250YWluZXIgPSAkKCdmZWF0dXJlcy1jb250YWluZXInKTtcbiAgICBpZiAoIWNvbnRhaW5lcikgcmV0dXJuO1xuXG4gICAgY29udGFpbmVyLmlubmVySFRNTCA9IHN0YXRlLmZlYXR1cmVzLm1hcCgoW25hbWUsIGFjdGl2ZSwgc2hvcnREZXNjLCBsb25nRGVzY10pID0+IGBcbiAgICAgICAgPGRpdiBjbGFzcz1cIm10LTRcIj5cbiAgICAgICAgICAgIDxpbnB1dFxuICAgICAgICAgICAgICAgIGNsYXNzPVwiY2hlY2tib3hcIlxuICAgICAgICAgICAgICAgIHR5cGU9XCJjaGVja2JveFwiXG4gICAgICAgICAgICAgICAgaWQ9XCIke25hbWV9XCJcbiAgICAgICAgICAgICAgICAke2FjdGl2ZSA/ICdjaGVja2VkJyA6ICcnfVxuICAgICAgICAgICAgICAgIGRhdGEtZmVhdHVyZT1cIiR7bmFtZX1cIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxsYWJlbCBmb3I9XCIke25hbWV9XCIgY2xhc3M9XCJmb250LWJvbGRcIj4ke3Nob3J0RGVzY308L2xhYmVsPlxuICAgICAgICAgICAgPHAgY2xhc3M9XCJpdGFsaWNcIj4ke2xvbmdEZXNjfTwvcD5cbiAgICAgICAgPC9kaXY+XG4gICAgYCkuam9pbignJyk7XG5cbiAgICBjb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJykuZm9yRWFjaCgoY2IpID0+IHtcbiAgICAgICAgY2IuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgYXN5bmMgKGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGZlYXR1cmUgPSBlLnRhcmdldC5kYXRhc2V0LmZlYXR1cmU7XG4gICAgICAgICAgICBjb25zdCBhY3RpdmUgPSBlLnRhcmdldC5jaGVja2VkO1xuICAgICAgICAgICAgYXdhaXQgYXBpLnN0b3JhZ2UubG9jYWwuc2V0KHsgW2ZlYXR1cmVdOiBhY3RpdmUgfSk7XG4gICAgICAgICAgICBhd2FpdCByZWxvYWRGZWF0dXJlcygpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gcmVsb2FkRmVhdHVyZXMoKSB7XG4gICAgc3RhdGUuZmVhdHVyZXMgPSBhd2FpdCBQcm9taXNlLmFsbChcbiAgICAgICAgRkVBVFVSRVMubWFwKGFzeW5jIChbbmFtZSwgc2hvcnREZXNjLCBsb25nRGVzY10pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IGBmZWF0dXJlOiR7bmFtZX1gO1xuICAgICAgICAgICAgY29uc3Qgc3RvcmVkID0gYXdhaXQgYXBpLnN0b3JhZ2UubG9jYWwuZ2V0KHsgW2tleV06IGZhbHNlIH0pO1xuICAgICAgICAgICAgcmV0dXJuIFtrZXksIHN0b3JlZFtrZXldLCBzaG9ydERlc2MsIGxvbmdEZXNjXTtcbiAgICAgICAgfSlcbiAgICApO1xuICAgIHJlbmRlckZlYXR1cmVzKCk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlckxpYnAycCgpIHtcbiAgICBjb25zdCB7XG4gICAgICAgIHJlYWR5LFxuICAgICAgICBzdGFydGluZyxcbiAgICAgICAgc3RvcHBpbmcsXG4gICAgICAgIGJpbmRpbmcsXG4gICAgICAgIGJvb3RzdHJhcHBpbmcsXG4gICAgICAgIHBlZXJJZCxcbiAgICAgICAgcGVlcklkU2hvcnQsXG4gICAgICAgIGFjdGl2ZVB1YmtleSxcbiAgICAgICAgYWN0aXZlTnB1YixcbiAgICAgICAgYXR0ZXN0YXRpb24sXG4gICAgICAgIGxpc3RlbkFkZHJzLFxuICAgICAgICBkZWZhdWx0Qm9vdHN0cmFwQWRkcnMsXG4gICAgICAgIGJvb3RzdHJhcEFkZHJzLFxuICAgICAgICBjb25uZWN0aW9uQ291bnQsXG4gICAgICAgIGxhc3REaWFsVGFyZ2V0LFxuICAgICAgICBsYXN0RGlhbFBlZXIsXG4gICAgICAgIGxhc3RQaW5nTGF0ZW5jeSxcbiAgICAgICAgbGFzdEJpbmRFcnJvcixcbiAgICAgICAgbGFzdEJvb3RzdHJhcEVycm9yLFxuICAgICAgICBsYXN0RXJyb3IsXG4gICAgICAgIGxvZ3MsXG4gICAgfSA9IHN0YXRlLmxpYnAycDtcblxuICAgIGNvbnN0IHN0YXR1c0VsID0gJCgnbGlicDJwLXN0YXR1cycpO1xuICAgIGlmIChzdGF0dXNFbCkge1xuICAgICAgICBzdGF0dXNFbC50ZXh0Q29udGVudCA9IHJlYWR5XG4gICAgICAgICAgICA/ICdSZWFkeSdcbiAgICAgICAgICAgIDogc3RhcnRpbmdcbiAgICAgICAgICAgICAgICA/ICdTdGFydGluZ1x1MjAyNidcbiAgICAgICAgICAgICAgICA6IHN0b3BwaW5nXG4gICAgICAgICAgICAgICAgICAgID8gJ1N0b3BwaW5nXHUyMDI2J1xuICAgICAgICAgICAgICAgICAgICA6ICdTdG9wcGVkJztcbiAgICB9XG5cbiAgICBjb25zdCBwZWVySWRFbCA9ICQoJ2xpYnAycC1wZWVyLWlkJyk7XG4gICAgaWYgKHBlZXJJZEVsKSB7XG4gICAgICAgIHBlZXJJZEVsLnRleHRDb250ZW50ID0gcGVlcklkU2hvcnQgfHwgcGVlcklkIHx8ICdOb3Qgc3RhcnRlZCc7XG4gICAgfVxuXG4gICAgY29uc3QgbGlzdGVuQWRkcnNFbCA9ICQoJ2xpYnAycC1saXN0ZW4tYWRkcnMnKTtcbiAgICBpZiAobGlzdGVuQWRkcnNFbCkge1xuICAgICAgICBsaXN0ZW5BZGRyc0VsLnRleHRDb250ZW50ID0gbGlzdGVuQWRkcnMubGVuZ3RoID8gbGlzdGVuQWRkcnMuam9pbignXFxuJykgOiAnTm8gYWR2ZXJ0aXNlZCBsaXN0ZW4gYWRkcmVzc2VzIGluIHRoaXMgYnJvd3NlciBub2RlLic7XG4gICAgfVxuXG4gICAgY29uc3QgZGVmYXVsdEJvb3RzdHJhcEVsID0gJCgnbGlicDJwLWRlZmF1bHQtYm9vdHN0cmFwJyk7XG4gICAgaWYgKGRlZmF1bHRCb290c3RyYXBFbCkge1xuICAgICAgICBkZWZhdWx0Qm9vdHN0cmFwRWwudGV4dENvbnRlbnQgPSBkZWZhdWx0Qm9vdHN0cmFwQWRkcnMubGVuZ3RoXG4gICAgICAgICAgICA/IGRlZmF1bHRCb290c3RyYXBBZGRycy5qb2luKCdcXG4nKVxuICAgICAgICAgICAgOiAnTm8gZGVmYXVsdCBJUEZTIGJvb3RzdHJhcCByZWxheXMgY29uZmlndXJlZC4nO1xuICAgIH1cblxuICAgIGNvbnN0IGNvbm5lY3Rpb25Db3VudEVsID0gJCgnbGlicDJwLWNvbm5lY3Rpb24tY291bnQnKTtcbiAgICBpZiAoY29ubmVjdGlvbkNvdW50RWwpIHtcbiAgICAgICAgY29ubmVjdGlvbkNvdW50RWwudGV4dENvbnRlbnQgPSBTdHJpbmcoY29ubmVjdGlvbkNvdW50KTtcbiAgICB9XG5cbiAgICBjb25zdCBsYXN0RGlhbFRhcmdldEVsID0gJCgnbGlicDJwLWxhc3QtZGlhbC10YXJnZXQnKTtcbiAgICBpZiAobGFzdERpYWxUYXJnZXRFbCkge1xuICAgICAgICBsYXN0RGlhbFRhcmdldEVsLnRleHRDb250ZW50ID0gbGFzdERpYWxUYXJnZXQgfHwgJ1x1MjAxNCc7XG4gICAgfVxuXG4gICAgY29uc3QgbGFzdERpYWxQZWVyRWwgPSAkKCdsaWJwMnAtbGFzdC1kaWFsLXBlZXInKTtcbiAgICBpZiAobGFzdERpYWxQZWVyRWwpIHtcbiAgICAgICAgbGFzdERpYWxQZWVyRWwudGV4dENvbnRlbnQgPSBsYXN0RGlhbFBlZXIgfHwgJ1x1MjAxNCc7XG4gICAgfVxuXG4gICAgY29uc3QgbGFzdFBpbmdFbCA9ICQoJ2xpYnAycC1sYXN0LXBpbmcnKTtcbiAgICBpZiAobGFzdFBpbmdFbCkge1xuICAgICAgICBsYXN0UGluZ0VsLnRleHRDb250ZW50ID0gbGFzdFBpbmdMYXRlbmN5IHx8ICdcdTIwMTQnO1xuICAgIH1cblxuICAgIGNvbnN0IGVycm9yRWwgPSAkKCdsaWJwMnAtZXJyb3InKTtcbiAgICBpZiAoZXJyb3JFbCkge1xuICAgICAgICBlcnJvckVsLnRleHRDb250ZW50ID0gbGFzdEVycm9yIHx8ICcnO1xuICAgICAgICBlcnJvckVsLmNsYXNzTGlzdC50b2dnbGUoJ2hpZGRlbicsICFsYXN0RXJyb3IpO1xuICAgIH1cblxuICAgIGNvbnN0IGJpbmRFcnJvckVsID0gJCgnbGlicDJwLWJpbmQtZXJyb3InKTtcbiAgICBpZiAoYmluZEVycm9yRWwpIHtcbiAgICAgICAgYmluZEVycm9yRWwudGV4dENvbnRlbnQgPSBsYXN0QmluZEVycm9yIHx8ICcnO1xuICAgICAgICBiaW5kRXJyb3JFbC5jbGFzc0xpc3QudG9nZ2xlKCdoaWRkZW4nLCAhbGFzdEJpbmRFcnJvcik7XG4gICAgfVxuXG4gICAgY29uc3QgYm9vdHN0cmFwRXJyb3JFbCA9ICQoJ2xpYnAycC1ib290c3RyYXAtZXJyb3InKTtcbiAgICBpZiAoYm9vdHN0cmFwRXJyb3JFbCkge1xuICAgICAgICBib290c3RyYXBFcnJvckVsLnRleHRDb250ZW50ID0gbGFzdEJvb3RzdHJhcEVycm9yIHx8ICcnO1xuICAgICAgICBib290c3RyYXBFcnJvckVsLmNsYXNzTGlzdC50b2dnbGUoJ2hpZGRlbicsICFsYXN0Qm9vdHN0cmFwRXJyb3IpO1xuICAgIH1cblxuICAgIGNvbnN0IGFjdGl2ZVB1YmtleUVsID0gJCgnbGlicDJwLWFjdGl2ZS1wdWJrZXknKTtcbiAgICBpZiAoYWN0aXZlUHVia2V5RWwpIHtcbiAgICAgICAgYWN0aXZlUHVia2V5RWwudGV4dENvbnRlbnQgPSBhY3RpdmVQdWJrZXkgPyBzaG9ydFZhbHVlKGFjdGl2ZVB1YmtleSwgMTYsIDEyKSA6ICdOb3QgYm91bmQnO1xuICAgIH1cblxuICAgIGNvbnN0IGFjdGl2ZU5wdWJFbCA9ICQoJ2xpYnAycC1hY3RpdmUtbnB1YicpO1xuICAgIGlmIChhY3RpdmVOcHViRWwpIHtcbiAgICAgICAgYWN0aXZlTnB1YkVsLnRleHRDb250ZW50ID0gYWN0aXZlTnB1YiB8fCAnTm90IGJvdW5kJztcbiAgICB9XG5cbiAgICBjb25zdCBhdHRlc3RhdGlvbkVsID0gJCgnbGlicDJwLWF0dGVzdGF0aW9uJyk7XG4gICAgaWYgKGF0dGVzdGF0aW9uRWwpIHtcbiAgICAgICAgYXR0ZXN0YXRpb25FbC50ZXh0Q29udGVudCA9IGF0dGVzdGF0aW9uID8gSlNPTi5zdHJpbmdpZnkoYXR0ZXN0YXRpb24sIG51bGwsIDIpIDogJ05vIGF0dGVzdGF0aW9uIHlldC4nO1xuICAgIH1cblxuICAgIGNvbnN0IHJlbGF5RGVzY3JpcHRvckVsID0gJCgnbGlicDJwLXJlbGF5LWRlc2NyaXB0b3InKTtcbiAgICBpZiAocmVsYXlEZXNjcmlwdG9yRWwpIHtcbiAgICAgICAgcmVsYXlEZXNjcmlwdG9yRWwudGV4dENvbnRlbnQgPSBzdGF0ZS5saWJwMnAucmVsYXlEZXNjcmlwdG9yXG4gICAgICAgICAgICA/IEpTT04uc3RyaW5naWZ5KHN0YXRlLmxpYnAycC5yZWxheURlc2NyaXB0b3IsIG51bGwsIDIpXG4gICAgICAgICAgICA6ICdObyByZWxheSBkZXNjcmlwdG9yIHlldC4nO1xuICAgIH1cblxuICAgIGNvbnN0IGJpbmRTdGF0ZUVsID0gJCgnbGlicDJwLWJpbmQtc3RhdGUnKTtcbiAgICBpZiAoYmluZFN0YXRlRWwpIHtcbiAgICAgICAgYmluZFN0YXRlRWwudGV4dENvbnRlbnQgPSBiaW5kaW5nXG4gICAgICAgICAgICA/ICdCaW5kaW5nXHUyMDI2J1xuICAgICAgICAgICAgOiBhdHRlc3RhdGlvblxuICAgICAgICAgICAgICAgID8gJ0F0dGVzdGVkJ1xuICAgICAgICAgICAgICAgIDogJ1VuYm91bmQnO1xuICAgIH1cblxuICAgIGNvbnN0IGxvZ0VsID0gJCgnbGlicDJwLWxvZycpO1xuICAgIGlmIChsb2dFbCkge1xuICAgICAgICBsb2dFbC5pbm5lckhUTUwgPSBsb2dzLmxlbmd0aFxuICAgICAgICAgICAgPyBsb2dzLm1hcCgoeyB0cywga2luZCwgbWVzc2FnZSB9KSA9PiBgXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImxpYnAycC1sb2ctbGluZSBsaWJwMnAtbG9nLWxpbmUtLSR7a2luZH1cIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJsaWJwMnAtbG9nLXRzXCI+JHtlc2NhcGVIdG1sKHRzKX08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibGlicDJwLWxvZy1tc2dcIj4ke2VzY2FwZUh0bWwobWVzc2FnZSl9PC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgYCkuam9pbignJylcbiAgICAgICAgICAgIDogJzxkaXYgY2xhc3M9XCJsaWJwMnAtbG9nLWVtcHR5XCI+Tm8gYWN0aXZpdHkgeWV0LjwvZGl2Pic7XG4gICAgfVxuXG4gICAgY29uc3Qgc3RhcnRCdG4gPSAkKCdsaWJwMnAtc3RhcnQtYnRuJyk7XG4gICAgaWYgKHN0YXJ0QnRuKSB7XG4gICAgICAgIHN0YXJ0QnRuLmRpc2FibGVkID0gcmVhZHkgfHwgc3RhcnRpbmcgfHwgc3RvcHBpbmc7XG4gICAgfVxuXG4gICAgY29uc3Qgc3RvcEJ0biA9ICQoJ2xpYnAycC1zdG9wLWJ0bicpO1xuICAgIGlmIChzdG9wQnRuKSB7XG4gICAgICAgIHN0b3BCdG4uZGlzYWJsZWQgPSAhcmVhZHkgfHwgc3RvcHBpbmc7XG4gICAgfVxuXG4gICAgY29uc3QgZGlhbEJ0biA9ICQoJ2xpYnAycC1kaWFsLWJ0bicpO1xuICAgIGlmIChkaWFsQnRuKSB7XG4gICAgICAgIGRpYWxCdG4uZGlzYWJsZWQgPSAhcmVhZHkgfHwgc3RhcnRpbmcgfHwgc3RvcHBpbmc7XG4gICAgfVxuXG4gICAgY29uc3QgcGVlcklucHV0ID0gJCgnbGlicDJwLXBlZXItaW5wdXQnKTtcbiAgICBpZiAocGVlcklucHV0KSB7XG4gICAgICAgIHBlZXJJbnB1dC5kaXNhYmxlZCA9ICFyZWFkeSB8fCBzdGFydGluZyB8fCBzdG9wcGluZztcbiAgICB9XG5cbiAgICBjb25zdCBiaW5kQnRuID0gJCgnbGlicDJwLWJpbmQtYnRuJyk7XG4gICAgaWYgKGJpbmRCdG4pIHtcbiAgICAgICAgYmluZEJ0bi5kaXNhYmxlZCA9ICFyZWFkeSB8fCBzdGFydGluZyB8fCBzdG9wcGluZyB8fCBiaW5kaW5nO1xuICAgIH1cblxuICAgIGNvbnN0IGNvcHlCaW5kQnRuID0gJCgnbGlicDJwLWNvcHktYmluZC1idG4nKTtcbiAgICBpZiAoY29weUJpbmRCdG4pIHtcbiAgICAgICAgY29weUJpbmRCdG4uZGlzYWJsZWQgPSAhYXR0ZXN0YXRpb247XG4gICAgfVxuXG4gICAgY29uc3QgY2xlYXJCaW5kQnRuID0gJCgnbGlicDJwLWNsZWFyLWJpbmQtYnRuJyk7XG4gICAgaWYgKGNsZWFyQmluZEJ0bikge1xuICAgICAgICBjbGVhckJpbmRCdG4uZGlzYWJsZWQgPSAhYXR0ZXN0YXRpb24gJiYgIWFjdGl2ZVB1YmtleSAmJiAhYWN0aXZlTnB1YjtcbiAgICB9XG5cbiAgICBjb25zdCBjb3B5UmVsYXlCdG4gPSAkKCdsaWJwMnAtY29weS1yZWxheS1idG4nKTtcbiAgICBpZiAoY29weVJlbGF5QnRuKSB7XG4gICAgICAgIGNvcHlSZWxheUJ0bi5kaXNhYmxlZCA9ICFzdGF0ZS5saWJwMnAucmVsYXlEZXNjcmlwdG9yO1xuICAgIH1cblxuICAgIGNvbnN0IGJvb3RzdHJhcEJ0biA9ICQoJ2xpYnAycC1ib290c3RyYXAtYnRuJyk7XG4gICAgaWYgKGJvb3RzdHJhcEJ0bikge1xuICAgICAgICBib290c3RyYXBCdG4uZGlzYWJsZWQgPSAhcmVhZHkgfHwgc3RhcnRpbmcgfHwgc3RvcHBpbmcgfHwgYm9vdHN0cmFwcGluZztcbiAgICB9XG5cbiAgICBjb25zdCBib290c3RyYXBJbnB1dCA9ICQoJ2xpYnAycC1ib290c3RyYXAtaW5wdXQnKTtcbiAgICBpZiAoYm9vdHN0cmFwSW5wdXQpIHtcbiAgICAgICAgY29uc3QgbmV4dFZhbHVlID0gYm9vdHN0cmFwQWRkcnMuam9pbignXFxuJyk7XG4gICAgICAgIGlmIChkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSBib290c3RyYXBJbnB1dCAmJiBib290c3RyYXBJbnB1dC52YWx1ZSAhPT0gbmV4dFZhbHVlKSB7XG4gICAgICAgICAgICBib290c3RyYXBJbnB1dC52YWx1ZSA9IG5leHRWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBib290c3RyYXBJbnB1dC5kaXNhYmxlZCA9ICFyZWFkeSB8fCBzdGFydGluZyB8fCBzdG9wcGluZztcbiAgICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHN0YXJ0TGlicDJwTm9kZSgpIHtcbiAgICBhd2FpdCBzZW5kTGlicDJwTWVzc2FnZSgnbGlicDJwLnN0YXJ0Jyk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHN0b3BMaWJwMnBOb2RlKCkge1xuICAgIGF3YWl0IHNlbmRMaWJwMnBNZXNzYWdlKCdsaWJwMnAuc3RvcCcpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBkaWFsTGlicDJwUGVlcigpIHtcbiAgICBjb25zdCBwZWVySW5wdXQgPSAkKCdsaWJwMnAtcGVlci1pbnB1dCcpO1xuICAgIGNvbnN0IHRhcmdldCA9IHBlZXJJbnB1dD8udmFsdWUudHJpbSgpO1xuICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgIHN0YXRlLmxpYnAycC5sYXN0RXJyb3IgPSAnRW50ZXIgYSBsaWJwMnAgbXVsdGlhZGRyIGZpcnN0Lic7XG4gICAgICAgIHJlbmRlckxpYnAycCgpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGF3YWl0IHNlbmRMaWJwMnBNZXNzYWdlKCdsaWJwMnAuZGlhbCcsIHRhcmdldCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGJvb3RzdHJhcExpYnAycE5vZGUoKSB7XG4gICAgY29uc3QgaW5wdXQgPSAkKCdsaWJwMnAtYm9vdHN0cmFwLWlucHV0Jyk7XG4gICAgY29uc3QgcmF3ID0gaW5wdXQ/LnZhbHVlIHx8ICcnO1xuICAgIGNvbnN0IGFkZHJzID0gcmF3XG4gICAgICAgIC5zcGxpdCgvXFxyP1xcbnwsLylcbiAgICAgICAgLm1hcCgoYWRkcikgPT4gYWRkci50cmltKCkpXG4gICAgICAgIC5maWx0ZXIoQm9vbGVhbik7XG5cbiAgICBpZiAoIWFkZHJzLmxlbmd0aCkge1xuICAgICAgICBzdGF0ZS5saWJwMnAubGFzdEJvb3RzdHJhcEVycm9yID0gJ0FkZCBhdCBsZWFzdCBvbmUgYm9vdHN0cmFwIG11bHRpYWRkci4nO1xuICAgICAgICByZW5kZXJMaWJwMnAoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGF3YWl0IHNlbmRMaWJwMnBNZXNzYWdlKCdsaWJwMnAuYm9vdHN0cmFwJywgYWRkcnMpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBiaW5kTGlicDJwSWRlbnRpdHkoKSB7XG4gICAgYXdhaXQgc2VuZExpYnAycE1lc3NhZ2UoJ2xpYnAycC5iaW5kSWRlbnRpdHknKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gY2xlYXJMaWJwMnBCaW5kaW5nKCkge1xuICAgIGF3YWl0IHNlbmRMaWJwMnBNZXNzYWdlKCdsaWJwMnAuY2xlYXJCaW5kaW5nJyk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNvcHlMaWJwMnBCaW5kaW5nKCkge1xuICAgIGNvbnN0IHBheWxvYWQgPSBzdGF0ZS5saWJwMnAuYXR0ZXN0YXRpb247XG4gICAgaWYgKCFwYXlsb2FkKSByZXR1cm47XG4gICAgY29uc3QgdGV4dCA9IEpTT04uc3RyaW5naWZ5KHBheWxvYWQsIG51bGwsIDIpO1xuICAgIGlmIChuYXZpZ2F0b3IuY2xpcGJvYXJkPy53cml0ZVRleHQpIHtcbiAgICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGV4dCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAnY29weScsIHBheWxvYWQ6IHRleHQgfSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGNvcHlSZWxheURlc2NyaXB0b3IoKSB7XG4gICAgY29uc3QgZGVzY3JpcHRvciA9IHN0YXRlLmxpYnAycC5yZWxheURlc2NyaXB0b3I7XG4gICAgaWYgKCFkZXNjcmlwdG9yKSByZXR1cm47XG4gICAgY29uc3QgdGV4dCA9IEpTT04uc3RyaW5naWZ5KGRlc2NyaXB0b3IsIG51bGwsIDIpO1xuICAgIGlmIChuYXZpZ2F0b3IuY2xpcGJvYXJkPy53cml0ZVRleHQpIHtcbiAgICAgICAgYXdhaXQgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQodGV4dCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAnY29weScsIHBheWxvYWQ6IHRleHQgfSk7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZVJ1bnRpbWVNZXNzYWdlKG1lc3NhZ2UpIHtcbiAgICBpZiAobWVzc2FnZT8ua2luZCA9PT0gJ2xpYnAycC5zdGF0dXNVcGRhdGUnKSB7XG4gICAgICAgIGFwcGx5U3RhdHVzVXBkYXRlKG1lc3NhZ2UucGF5bG9hZCk7XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBpbml0KCkge1xuICAgIGFwaS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihoYW5kbGVSdW50aW1lTWVzc2FnZSk7XG5cbiAgICBhd2FpdCByZWxvYWRGZWF0dXJlcygpO1xuICAgIGNvbnN0IHN0YXR1c1Jlc3BvbnNlID0gYXdhaXQgc2VuZExpYnAycE1lc3NhZ2UoJ2xpYnAycC5zdGF0dXMnKTtcbiAgICBpZiAoc3RhdHVzUmVzcG9uc2U/LnN0YXR1cykge1xuICAgICAgICBhcHBseVN0YXR1c1VwZGF0ZShzdGF0dXNSZXNwb25zZS5zdGF0dXMpO1xuICAgIH1cblxuICAgICQoJ2xpYnAycC1zdGFydC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGF3YWl0IHN0YXJ0TGlicDJwTm9kZSgpO1xuICAgIH0pO1xuXG4gICAgJCgnbGlicDJwLXN0b3AtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBhd2FpdCBzdG9wTGlicDJwTm9kZSgpO1xuICAgIH0pO1xuXG4gICAgJCgnbGlicDJwLWRpYWwtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBhd2FpdCBkaWFsTGlicDJwUGVlcigpO1xuICAgIH0pO1xuXG4gICAgJCgnbGlicDJwLWJpbmQtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBhd2FpdCBiaW5kTGlicDJwSWRlbnRpdHkoKTtcbiAgICB9KTtcblxuICAgICQoJ2xpYnAycC1ib290c3RyYXAtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBhd2FpdCBib290c3RyYXBMaWJwMnBOb2RlKCk7XG4gICAgfSk7XG5cbiAgICAkKCdsaWJwMnAtY29weS1iaW5kLWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcbiAgICAgICAgYXdhaXQgY29weUxpYnAycEJpbmRpbmcoKTtcbiAgICB9KTtcblxuICAgICQoJ2xpYnAycC1jb3B5LXJlbGF5LWJ0bicpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGFzeW5jICgpID0+IHtcbiAgICAgICAgYXdhaXQgY29weVJlbGF5RGVzY3JpcHRvcigpO1xuICAgIH0pO1xuXG4gICAgJCgnbGlicDJwLWNsZWFyLWJpbmQtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgYXN5bmMgKCkgPT4ge1xuICAgICAgICBhd2FpdCBjbGVhckxpYnAycEJpbmRpbmcoKTtcbiAgICB9KTtcblxuICAgICQoJ2xpYnAycC1wZWVyLWlucHV0Jyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBhc3luYyAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LmtleSA9PT0gJ0VudGVyJykge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGF3YWl0IGRpYWxMaWJwMnBQZWVyKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGluaXQpO1xuXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2xvc2UtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgIHdpbmRvdy5jbG9zZSgpO1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiOztBQWdCQSxNQUFNLFdBQ0YsT0FBTyxZQUFZLGNBQWMsVUFDakMsT0FBTyxXQUFZLGNBQWMsU0FDakM7QUFFSixNQUFJLENBQUMsVUFBVTtBQUNYLFVBQU0sSUFBSSxNQUFNLGtGQUFrRjtBQUFBLEVBQ3RHO0FBTUEsTUFBTSxXQUFXLE9BQU8sWUFBWSxlQUFlLE9BQU8sV0FBVztBQU1yRSxXQUFTLFVBQVUsU0FBUyxRQUFRO0FBQ2hDLFdBQU8sSUFBSSxTQUFTO0FBSWhCLFVBQUk7QUFDQSxjQUFNLFNBQVMsT0FBTyxNQUFNLFNBQVMsSUFBSTtBQUN6QyxZQUFJLFVBQVUsT0FBTyxPQUFPLFNBQVMsWUFBWTtBQUM3QyxpQkFBTztBQUFBLFFBQ1g7QUFBQSxNQUNKLFNBQVMsR0FBRztBQUFBLE1BRVo7QUFFQSxhQUFPLElBQUksUUFBUSxDQUFDLFNBQVMsV0FBVztBQUNwQyxlQUFPLE1BQU0sU0FBUztBQUFBLFVBQ2xCLEdBQUc7QUFBQSxVQUNILElBQUksV0FBVztBQUNYLGdCQUFJLFNBQVMsV0FBVyxTQUFTLFFBQVEsV0FBVztBQUNoRCxxQkFBTyxJQUFJLE1BQU0sU0FBUyxR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
