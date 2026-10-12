(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // src/shims/process.js
  var init_process = __esm({
    "src/shims/process.js"() {
    }
  });

  // src/utilities/browser-polyfill.js
  var browser_polyfill_exports = {};
  __export(browser_polyfill_exports, {
    api: () => api,
    isChrome: () => isChrome
  });
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
  var _browser, isChrome, api;
  var init_browser_polyfill = __esm({
    "src/utilities/browser-polyfill.js"() {
      init_process();
      _browser = typeof browser !== "undefined" ? browser : typeof chrome !== "undefined" ? chrome : null;
      if (!_browser) {
        throw new Error("browser-polyfill: No extension API namespace found (neither browser nor chrome).");
      }
      isChrome = typeof browser === "undefined" && typeof chrome !== "undefined";
      api = {};
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
    }
  });

  // node_modules/idb/build/index.js
  var build_exports = {};
  __export(build_exports, {
    deleteDB: () => deleteDB,
    openDB: () => openDB,
    unwrap: () => unwrap,
    wrap: () => wrap
  });
  function getIdbProxyableTypes() {
    return idbProxyableTypes || (idbProxyableTypes = [
      IDBIndex,
      IDBObjectStore,
      IDBCursor,
      IDBDatabase,
      IDBTransaction
    ]);
  }
  function getCursorAdvanceMethods() {
    return cursorAdvanceMethods || (cursorAdvanceMethods = ["advance", "continue", "continuePrimaryKey"].map((method) => IDBCursor.prototype[method]));
  }
  function promisifyRequest(request) {
    const promise = new Promise((resolve, reject) => {
      const unlisten = () => {
        request.removeEventListener("success", success);
        request.removeEventListener("error", error);
      };
      const success = () => {
        resolve(wrap(request.result));
        unlisten();
      };
      const error = () => {
        reject(request.error);
        unlisten();
      };
      request.addEventListener("success", success);
      request.addEventListener("error", error);
    });
    reverseTransformCache.set(promise, request);
    return promise;
  }
  function cacheDonePromiseForTransaction(tx) {
    if (transactionDoneMap.has(tx))
      return;
    const done = new Promise((resolve, reject) => {
      const unlisten = () => {
        tx.removeEventListener("complete", complete);
        tx.removeEventListener("error", error);
        tx.removeEventListener("abort", error);
      };
      const complete = () => {
        resolve();
        unlisten();
      };
      const error = () => {
        reject(tx.error || new DOMException("AbortError", "AbortError"));
        unlisten();
      };
      tx.addEventListener("complete", complete);
      tx.addEventListener("error", error);
      tx.addEventListener("abort", error);
    });
    transactionDoneMap.set(tx, done);
  }
  function replaceTraps(callback) {
    idbProxyTraps = callback(idbProxyTraps);
  }
  function wrapFunction(func) {
    if (getCursorAdvanceMethods().includes(func)) {
      return function(...args) {
        func.apply(unwrap(this), args);
        return wrap(this.request);
      };
    }
    return function(...args) {
      return wrap(func.apply(unwrap(this), args));
    };
  }
  function transformCachableValue(value) {
    if (typeof value === "function")
      return wrapFunction(value);
    if (value instanceof IDBTransaction)
      cacheDonePromiseForTransaction(value);
    if (instanceOfAny(value, getIdbProxyableTypes()))
      return new Proxy(value, idbProxyTraps);
    return value;
  }
  function wrap(value) {
    if (value instanceof IDBRequest)
      return promisifyRequest(value);
    if (transformCache.has(value))
      return transformCache.get(value);
    const newValue = transformCachableValue(value);
    if (!Object.is(newValue, value)) {
      transformCache.set(value, newValue);
      reverseTransformCache.set(newValue, value);
    }
    return newValue;
  }
  function openDB(name, version, { blocked, upgrade, blocking, terminated } = {}) {
    const request = indexedDB.open(name, version);
    const openPromise = wrap(request);
    if (upgrade) {
      request.addEventListener("upgradeneeded", (event) => {
        upgrade(wrap(request.result), event.oldVersion, event.newVersion, wrap(request.transaction), event);
      });
    }
    if (blocked) {
      request.addEventListener("blocked", (event) => blocked(
        // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
        event.oldVersion,
        event.newVersion,
        event
      ));
    }
    openPromise.then((db) => {
      if (terminated)
        db.addEventListener("close", () => terminated());
      if (blocking) {
        db.addEventListener("versionchange", (event) => blocking(event.oldVersion, event.newVersion, event));
      }
    }).catch(() => {
    });
    return openPromise;
  }
  function deleteDB(name, { blocked } = {}) {
    const request = indexedDB.deleteDatabase(name);
    if (blocked) {
      request.addEventListener("blocked", (event) => blocked(
        // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
        event.oldVersion,
        event
      ));
    }
    return wrap(request).then(() => void 0);
  }
  function getMethod(target, prop) {
    if (!(target instanceof IDBDatabase && !(prop in target) && typeof prop === "string")) {
      return;
    }
    if (cachedMethods[prop])
      return cachedMethods[prop];
    const targetFuncName = prop.replace(/FromIndex$/, "");
    const useIndex = prop !== targetFuncName;
    const isWrite = writeMethods.includes(targetFuncName);
    if (
      // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
      !(targetFuncName in (useIndex ? IDBIndex : IDBObjectStore).prototype) || !(isWrite || readMethods.includes(targetFuncName))
    ) {
      return;
    }
    const method = async function(storeName, ...args) {
      const tx = this.transaction(storeName, isWrite ? "readwrite" : "readonly");
      let target2 = tx.store;
      if (useIndex)
        target2 = target2.index(args.shift());
      return (await Promise.all([
        target2[targetFuncName](...args),
        isWrite && tx.done
      ]))[0];
    };
    return cachedMethods[prop] = method;
  }
  async function* iterate(...args) {
    let cursor = this;
    if (!(cursor instanceof IDBCursor)) {
      cursor = await cursor.openCursor(...args);
    }
    if (!cursor)
      return;
    cursor = cursor;
    const proxiedCursor = new Proxy(cursor, cursorIteratorTraps);
    ittrProxiedCursorToOriginalProxy.set(proxiedCursor, cursor);
    reverseTransformCache.set(proxiedCursor, unwrap(cursor));
    while (cursor) {
      yield proxiedCursor;
      cursor = await (advanceResults.get(proxiedCursor) || cursor.continue());
      advanceResults.delete(proxiedCursor);
    }
  }
  function isIteratorProp(target, prop) {
    return prop === Symbol.asyncIterator && instanceOfAny(target, [IDBIndex, IDBObjectStore, IDBCursor]) || prop === "iterate" && instanceOfAny(target, [IDBIndex, IDBObjectStore]);
  }
  var instanceOfAny, idbProxyableTypes, cursorAdvanceMethods, transactionDoneMap, transformCache, reverseTransformCache, idbProxyTraps, unwrap, readMethods, writeMethods, cachedMethods, advanceMethodProps, methodMap, advanceResults, ittrProxiedCursorToOriginalProxy, cursorIteratorTraps;
  var init_build = __esm({
    "node_modules/idb/build/index.js"() {
      init_process();
      instanceOfAny = (object, constructors) => constructors.some((c) => object instanceof c);
      transactionDoneMap = /* @__PURE__ */ new WeakMap();
      transformCache = /* @__PURE__ */ new WeakMap();
      reverseTransformCache = /* @__PURE__ */ new WeakMap();
      idbProxyTraps = {
        get(target, prop, receiver) {
          if (target instanceof IDBTransaction) {
            if (prop === "done")
              return transactionDoneMap.get(target);
            if (prop === "store") {
              return receiver.objectStoreNames[1] ? void 0 : receiver.objectStore(receiver.objectStoreNames[0]);
            }
          }
          return wrap(target[prop]);
        },
        set(target, prop, value) {
          target[prop] = value;
          return true;
        },
        has(target, prop) {
          if (target instanceof IDBTransaction && (prop === "done" || prop === "store")) {
            return true;
          }
          return prop in target;
        }
      };
      unwrap = (value) => reverseTransformCache.get(value);
      readMethods = ["get", "getKey", "getAll", "getAllKeys", "count"];
      writeMethods = ["put", "add", "delete", "clear"];
      cachedMethods = {};
      replaceTraps((oldTraps) => ({
        ...oldTraps,
        get: (target, prop, receiver) => getMethod(target, prop) || oldTraps.get(target, prop, receiver),
        has: (target, prop) => !!getMethod(target, prop) || oldTraps.has(target, prop)
      }));
      advanceMethodProps = ["advance", "continue", "continuePrimaryKey"];
      methodMap = {};
      advanceResults = /* @__PURE__ */ new WeakMap();
      ittrProxiedCursorToOriginalProxy = /* @__PURE__ */ new WeakMap();
      cursorIteratorTraps = {
        get(target, prop) {
          if (!advanceMethodProps.includes(prop))
            return target[prop];
          let cachedFunc = methodMap[prop];
          if (!cachedFunc) {
            cachedFunc = methodMap[prop] = function(...args) {
              advanceResults.set(this, ittrProxiedCursorToOriginalProxy.get(this)[prop](...args));
            };
          }
          return cachedFunc;
        }
      };
      replaceTraps((oldTraps) => ({
        ...oldTraps,
        get(target, prop, receiver) {
          if (isIteratorProp(target, prop))
            return iterate;
          return oldTraps.get(target, prop, receiver);
        },
        has(target, prop) {
          return isIteratorProp(target, prop) || oldTraps.has(target, prop);
        }
      }));
    }
  });

  // src/api-keys/api-keys.js
  init_process();
  init_browser_polyfill();

  // src/ins-confirm.js
  init_process();
  var queue = Promise.resolve();
  var idCounter = 0;
  function motionOff() {
    if (document.documentElement.getAttribute("data-ins-motion") === "off") return true;
    try {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (_) {
      return false;
    }
  }
  function openDialog({ title, body, confirmLabel, cancelLabel, destructive, variant, notice }) {
    return new Promise((resolve) => {
      const prevFocus = document.activeElement;
      const root = document.createElement("div");
      root.className = "ins-consent-root";
      const backdrop = document.createElement("div");
      backdrop.className = "ins-consent-backdrop";
      const isSheet = variant !== "popover";
      const dialog = document.createElement("div");
      dialog.className = isSheet ? "ins-consent-sheet" : "ins-consent-popover";
      dialog.setAttribute("role", destructive || notice ? "alertdialog" : "dialog");
      dialog.setAttribute("aria-modal", "true");
      if (isSheet) {
        const handle = document.createElement("div");
        handle.className = "ins-consent-handle";
        dialog.appendChild(handle);
      }
      const uid = ++idCounter;
      const titleEl = document.createElement("h2");
      titleEl.className = "ins-consent-title";
      titleEl.id = `ins-consent-title-${uid}`;
      titleEl.textContent = title || "";
      dialog.appendChild(titleEl);
      dialog.setAttribute("aria-labelledby", titleEl.id);
      const bodyEl = document.createElement("p");
      bodyEl.className = "ins-consent-body";
      bodyEl.id = `ins-consent-body-${uid}`;
      bodyEl.textContent = body || "";
      dialog.appendChild(bodyEl);
      dialog.setAttribute("aria-describedby", bodyEl.id);
      const actions = document.createElement("div");
      actions.className = "ins-consent-actions";
      const buttons = [];
      let cancelBtn = null;
      const confirmBtn = document.createElement("button");
      confirmBtn.type = "button";
      confirmBtn.textContent = confirmLabel;
      if (notice) {
        confirmBtn.className = "btn";
      } else {
        cancelBtn = document.createElement("button");
        cancelBtn.type = "button";
        cancelBtn.className = "btn btn--ghost";
        cancelBtn.textContent = cancelLabel;
        actions.appendChild(cancelBtn);
        buttons.push(cancelBtn);
        confirmBtn.className = destructive ? "btn btn--destructive" : "btn btn--primary";
      }
      actions.appendChild(confirmBtn);
      buttons.push(confirmBtn);
      dialog.appendChild(actions);
      root.appendChild(backdrop);
      root.appendChild(dialog);
      let settled = false;
      function settle(result) {
        if (settled) return;
        settled = true;
        document.removeEventListener("keydown", onKeydown, true);
        backdrop.classList.remove("is-open");
        dialog.classList.remove("is-open");
        const finish = () => {
          root.remove();
          try {
            if (prevFocus && typeof prevFocus.focus === "function" && document.contains(prevFocus)) {
              prevFocus.focus();
            }
          } catch (_) {
          }
          resolve(result);
        };
        if (motionOff()) finish();
        else setTimeout(finish, 250);
      }
      function onKeydown(ev) {
        if (ev.key === "Escape") {
          ev.preventDefault();
          settle(false);
          return;
        }
        if (ev.key === "Tab") {
          ev.preventDefault();
          const idx = buttons.indexOf(document.activeElement);
          const dir = ev.shiftKey ? -1 : 1;
          buttons[(idx + dir + buttons.length) % buttons.length].focus();
        }
      }
      backdrop.addEventListener("click", () => settle(false));
      if (cancelBtn) cancelBtn.addEventListener("click", () => settle(false));
      confirmBtn.addEventListener("click", () => settle(true));
      document.addEventListener("keydown", onKeydown, true);
      document.body.appendChild(root);
      requestAnimationFrame(() => {
        backdrop.classList.add("is-open");
        dialog.classList.add("is-open");
        const initial = notice ? confirmBtn : destructive ? cancelBtn : confirmBtn;
        (initial || confirmBtn).focus();
      });
    });
  }
  function insConfirm({
    title,
    body,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    destructive = false,
    variant = "sheet"
  } = {}) {
    const result = queue.then(() => openDialog({ title, body, confirmLabel, cancelLabel, destructive, variant, notice: false }));
    queue = result.catch(() => {
    });
    return result;
  }

  // src/utilities/api-key-store.js
  init_process();
  init_browser_polyfill();

  // src/utilities/sync-manager.js
  init_process();
  init_browser_polyfill();

  // src/utilities/secret-vault.js
  init_process();

  // src/utilities/crypto.js
  init_process();
  var IV_BYTES = 12;
  function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  function base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
  async function encryptWithKey(plaintext, key, salt) {
    const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
    const enc = new TextEncoder();
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      enc.encode(plaintext)
    );
    return JSON.stringify({
      salt: arrayBufferToBase64(salt),
      iv: arrayBufferToBase64(iv),
      ciphertext: arrayBufferToBase64(ciphertext)
    });
  }
  async function decryptWithKey(encryptedData, key) {
    const { iv, ciphertext } = JSON.parse(encryptedData);
    const ivBuf = new Uint8Array(base64ToArrayBuffer(iv));
    const ctBuf = base64ToArrayBuffer(ciphertext);
    const plainBuf = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: ivBuf },
      key,
      ctBuf
    );
    return new TextDecoder().decode(plainBuf);
  }

  // src/utilities/secret-vault.js
  var IV_BYTES2 = 12;
  var DEVICE_DB = "nostrkey-secret-vault";
  var DEVICE_STORE = "keys";
  var DEVICE_KEY_ID = "device-wrap-key-v1";
  var DEVICE_SEED_KEY = "deviceKeySeed";
  var DEVICE_SEED_BYTES = 32;
  var DEVICE_STRATEGY_KEY = "deviceKeyStrategy";
  function abToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }
  function base64ToAb(b64) {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  }
  var _sessionKey = null;
  var _sessionSalt = null;
  var _unlocked = null;
  var _deviceKeyPromise = null;
  var _deviceStrategy = null;
  var _memoryDeviceKey = null;
  var _legacyIdbKeyPromise = null;
  var _existingSeedKeyPromise = null;
  async function generateDeviceKey() {
    return crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      false,
      // NON-extractable: raw bytes can never be read back out
      ["encrypt", "decrypt"]
    );
  }
  function indexedDbAvailable() {
    return typeof indexedDB !== "undefined" && indexedDB !== null;
  }
  async function keyRoundTrips(key) {
    if (!key) return false;
    try {
      const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES2));
      const probe = new TextEncoder().encode("nostrkey-device-probe");
      const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, probe);
      const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
      return new TextDecoder().decode(pt) === "nostrkey-device-probe";
    } catch {
      return false;
    }
  }
  async function openDeviceDb() {
    const { openDB: openDB2 } = await Promise.resolve().then(() => (init_build(), build_exports));
    return openDB2(DEVICE_DB, 1, {
      upgrade(d) {
        if (!d.objectStoreNames.contains(DEVICE_STORE)) {
          d.createObjectStore(DEVICE_STORE);
        }
      }
    });
  }
  async function tryIdbDeviceKey() {
    if (!indexedDbAvailable()) return null;
    try {
      const db = await openDeviceDb();
      const existing = await db.get(DEVICE_STORE, DEVICE_KEY_ID);
      if (!existing) return null;
      return await keyRoundTrips(existing) ? existing : null;
    } catch {
      return null;
    }
  }
  async function seedStorage() {
    try {
      const { api: api2 } = await Promise.resolve().then(() => (init_browser_polyfill(), browser_polyfill_exports));
      return api2?.storage?.local || null;
    } catch {
      return null;
    }
  }
  function looksLikeWebKitOnlyUa() {
    try {
      const ua = typeof navigator !== "undefined" && navigator.userAgent || "";
      return /Safari|AppleWebKit/.test(ua) && !/Chrom(e|ium)|Edg\/|OPR\//.test(ua);
    } catch {
      return false;
    }
  }
  async function isSafariEngine() {
    let origin = null;
    try {
      const { api: api2 } = await Promise.resolve().then(() => (init_browser_polyfill(), browser_polyfill_exports));
      const url = api2?.runtime?.getURL?.("");
      origin = typeof url === "string" ? url : null;
    } catch {
      origin = null;
    }
    if (origin && origin.startsWith("safari-web-extension://")) return true;
    if (looksLikeWebKitOnlyUa()) return true;
    if (origin && (origin.startsWith("chrome-extension://") || origin.startsWith("moz-extension://"))) {
      return false;
    }
    return true;
  }
  async function importSeedKey(seedB64) {
    return crypto.subtle.importKey(
      "raw",
      base64ToAb(seedB64),
      { name: "AES-GCM" },
      false,
      // NON-extractable once imported
      ["encrypt", "decrypt"]
    );
  }
  async function readStickyStrategy() {
    const store = await seedStorage();
    if (!store) return null;
    try {
      const got = await store.get({ [DEVICE_STRATEGY_KEY]: null });
      const s = got?.[DEVICE_STRATEGY_KEY];
      return s === "idb" || s === "seed" ? s : null;
    } catch {
      return null;
    }
  }
  async function writeStickyStrategy(strategy) {
    if (strategy !== "idb" && strategy !== "seed") return;
    const store = await seedStorage();
    if (!store) return;
    try {
      await store.set({ [DEVICE_STRATEGY_KEY]: strategy });
    } catch {
    }
  }
  async function trySeedDeviceKey() {
    const store = await seedStorage();
    if (!store) return null;
    try {
      const got = await store.get({ [DEVICE_SEED_KEY]: null });
      let seed = got?.[DEVICE_SEED_KEY];
      if (!seed) {
        seed = abToBase64(crypto.getRandomValues(new Uint8Array(DEVICE_SEED_BYTES)).buffer);
        await store.set({ [DEVICE_SEED_KEY]: seed });
        const check = await store.get({ [DEVICE_SEED_KEY]: null });
        const persisted = check?.[DEVICE_SEED_KEY];
        if (persisted !== seed) {
          if (typeof persisted !== "string" || persisted.length === 0) return null;
          seed = persisted;
        }
      }
      const key = await importSeedKey(seed);
      return await keyRoundTrips(key) ? key : null;
    } catch {
      return null;
    }
  }
  async function getDeviceKey() {
    if (_deviceKeyPromise) return _deviceKeyPromise;
    _deviceKeyPromise = (async () => {
      const sticky = await readStickyStrategy();
      if (sticky !== "seed" && !await isSafariEngine()) {
        const idbKey = await tryIdbDeviceKey();
        if (idbKey) {
          _deviceStrategy = "idb";
          await writeStickyStrategy("idb");
          return idbKey;
        }
      }
      const seedKey = await trySeedDeviceKey();
      if (seedKey) {
        _deviceStrategy = "seed";
        await writeStickyStrategy("seed");
        return seedKey;
      }
      if (!_memoryDeviceKey) _memoryDeviceKey = await generateDeviceKey();
      _deviceStrategy = "memory";
      return _memoryDeviceKey;
    })();
    return _deviceKeyPromise;
  }
  async function getLegacyIdbKey() {
    if (_legacyIdbKeyPromise) return _legacyIdbKeyPromise;
    _legacyIdbKeyPromise = (async () => {
      if (!indexedDbAvailable()) return null;
      try {
        const db = await openDeviceDb();
        const key = await db.get(DEVICE_STORE, DEVICE_KEY_ID);
        return await keyRoundTrips(key) ? key : null;
      } catch {
        return null;
      }
    })();
    return _legacyIdbKeyPromise;
  }
  async function getExistingSeedKey() {
    if (_existingSeedKeyPromise) return _existingSeedKeyPromise;
    _existingSeedKeyPromise = (async () => {
      const store = await seedStorage();
      if (!store) return null;
      try {
        const got = await store.get({ [DEVICE_SEED_KEY]: null });
        const seed = got?.[DEVICE_SEED_KEY];
        if (!seed) return null;
        const key = await importSeedKey(seed);
        return await keyRoundTrips(key) ? key : null;
      } catch {
        return null;
      }
    })();
    return _existingSeedKeyPromise;
  }
  async function fallbackDeviceKeys() {
    const keys = [];
    if (_deviceStrategy !== "idb") {
      const legacy = await getLegacyIdbKey();
      if (legacy) keys.push(legacy);
    }
    if (_deviceStrategy !== "seed") {
      const seedKey = await getExistingSeedKey();
      if (seedKey) keys.push(seedKey);
    }
    return keys;
  }
  async function decryptDeviceBlobAnyKey(iv, ciphertext) {
    const key = await getDeviceKey();
    try {
      return { plaintext: await decryptDeviceBlobWith(key, iv, ciphertext), stale: false };
    } catch (e) {
      for (const fallback of await fallbackDeviceKeys()) {
        try {
          return {
            plaintext: await decryptDeviceBlobWith(fallback, iv, ciphertext),
            stale: true
          };
        } catch {
        }
      }
      throw e;
    }
  }
  async function encryptWithDeviceKey(plaintext) {
    const key = await getDeviceKey();
    const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES2));
    const enc = new TextEncoder();
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      enc.encode(plaintext)
    );
    return JSON.stringify({
      v: 1,
      k: "device",
      iv: abToBase64(iv),
      ciphertext: abToBase64(ciphertext)
    });
  }
  async function decryptDeviceBlobWith(key, iv, ciphertext) {
    const plainBuf = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(base64ToAb(iv)) },
      key,
      base64ToAb(ciphertext)
    );
    return new TextDecoder().decode(plainBuf);
  }
  async function decryptWithDeviceKey(encryptedData) {
    const { iv, ciphertext } = JSON.parse(encryptedData);
    const { plaintext } = await decryptDeviceBlobAnyKey(iv, ciphertext);
    return plaintext;
  }
  function isPasswordBlob(value) {
    if (typeof value !== "string") return false;
    try {
      const p = JSON.parse(value);
      return !!(p && p.salt && p.iv && p.ciphertext && p.k !== "device");
    } catch {
      return false;
    }
  }
  function isDeviceKeyBlob(value) {
    if (typeof value !== "string") return false;
    try {
      const p = JSON.parse(value);
      return !!(p && p.k === "device" && p.iv && p.ciphertext);
    } catch {
      return false;
    }
  }
  function isCiphertext(value) {
    return isPasswordBlob(value) || isDeviceKeyBlob(value);
  }
  async function wrapSecret(plaintext) {
    if (typeof plaintext !== "string" || plaintext.length === 0) return plaintext;
    if (isCiphertext(plaintext)) return plaintext;
    if (_sessionKey) {
      return encryptWithKey(plaintext, _sessionKey, _sessionSalt);
    }
    return encryptWithDeviceKey(plaintext);
  }
  async function unwrapSecret(value) {
    if (typeof value !== "string" || value.length === 0) return value;
    if (!isCiphertext(value)) return value;
    if (_unlocked === false) {
      throw new Error("locked: session is locked \u2014 cannot read secret");
    }
    if (isDeviceKeyBlob(value)) {
      return decryptWithDeviceKey(value);
    }
    if (!_sessionKey) {
      throw new Error("locked: no session key available to decrypt secret");
    }
    return decryptWithKey(value, _sessionKey);
  }

  // src/utilities/sync-manager.js
  var SYNC_QUOTA = 102400;
  var MAX_ITEM = 8192;
  var MAX_ITEMS = 512;
  var CHUNK_PREFIX = "_chunk:";
  var SYNC_META_KEY = "_sync_meta";
  var LOCAL_ENABLED_KEY = "platformSyncEnabled";
  var PRIORITY = {
    // Tombstones (deletion records) get the guaranteed top slot: a deletion must
    // never lose its budget race to bulky vault content, or the deleted item
    // resurrects on the next device that still has a stale copy (issue #3).
    P0_TOMBSTONES: 0,
    P1_PROFILES: 1,
    P2_SETTINGS: 2,
    P3_APIKEYS: 3,
    P4_VAULT: 4
  };
  var storage = api.storage.local;
  var pushTimer = null;
  function chunkValue(key, jsonString) {
    const chunks = [];
    for (let i = 0; i < jsonString.length; i += MAX_ITEM - 100) {
      chunks.push(jsonString.slice(i, i + MAX_ITEM - 100));
    }
    if (chunks.length === 1) {
      return [{ key, value: jsonString }];
    }
    const entries = [];
    for (let i = 0; i < chunks.length; i++) {
      entries.push({ key: `${CHUNK_PREFIX}${key}:${i}`, value: chunks[i] });
    }
    entries.push({ key, value: JSON.stringify({ __chunked: true, count: chunks.length }) });
    return entries;
  }
  function reassembleFromSyncData(key, syncData) {
    try {
      const meta = typeof syncData[key] === "string" ? JSON.parse(syncData[key]) : syncData[key];
      if (!meta || !meta.__chunked) {
        return typeof syncData[key] === "string" ? JSON.parse(syncData[key]) : syncData[key];
      }
      let combined = "";
      for (let i = 0; i < meta.count; i++) {
        const chunkKey = `${CHUNK_PREFIX}${key}:${i}`;
        if (syncData[chunkKey] == null) return null;
        combined += syncData[chunkKey];
      }
      return JSON.parse(combined);
    } catch {
      return null;
    }
  }
  function compareSemver(a, b) {
    const pa = String(a).split(".");
    const pb = String(b).split(".");
    const len = Math.max(pa.length, pb.length);
    for (let i = 0; i < len; i++) {
      const x = parseInt(pa[i], 10) || 0;
      const y = parseInt(pb[i], 10) || 0;
      if (x > y) return 1;
      if (x < y) return -1;
    }
    return 0;
  }
  async function buildSyncPayload() {
    const all = await storage.get(null);
    const entries = [];
    const secretOk = (v) => !v || isCiphertext(v);
    const deletedDocs = all.deletedDocs && typeof all.deletedDocs === "object" ? all.deletedDocs : {};
    const deletedKeys = all.deletedKeys && typeof all.deletedKeys === "object" ? all.deletedKeys : {};
    const deletedProfiles = all.deletedProfiles && typeof all.deletedProfiles === "object" ? all.deletedProfiles : {};
    const identityOf = (p) => p && (p.pubKey || p.remotePubkey) || null;
    if (Object.keys(deletedDocs).length > 0) {
      const json = JSON.stringify(deletedDocs);
      entries.push({ key: "deletedDocs", jsonString: json, priority: PRIORITY.P0_TOMBSTONES, size: json.length });
    }
    if (Object.keys(deletedKeys).length > 0) {
      const json = JSON.stringify(deletedKeys);
      entries.push({ key: "deletedKeys", jsonString: json, priority: PRIORITY.P0_TOMBSTONES, size: json.length });
    }
    if (Object.keys(deletedProfiles).length > 0) {
      const json = JSON.stringify(deletedProfiles);
      entries.push({ key: "deletedProfiles", jsonString: json, priority: PRIORITY.P0_TOMBSTONES, size: json.length });
    }
    if (all.profiles) {
      const cleanProfiles = all.profiles.filter((p) => {
        const id = identityOf(p);
        return !(id != null && deletedProfiles[id] != null && deletedProfiles[id] >= (p.updatedAt || 0));
      }).map((p) => {
        const { hosts, ...rest } = p;
        if (rest.privKey && !secretOk(rest.privKey)) {
          console.warn("[SyncManager] Refusing to sync plaintext privKey \u2014 dropped");
          rest.privKey = "";
        }
        return rest;
      });
      const json = JSON.stringify(cleanProfiles);
      entries.push({ key: "profiles", jsonString: json, priority: PRIORITY.P1_PROFILES, size: json.length });
    }
    if (all.profileIndex != null) {
      const json = JSON.stringify(all.profileIndex);
      entries.push({ key: "profileIndex", jsonString: json, priority: PRIORITY.P1_PROFILES, size: json.length });
    }
    const settingsKeys = ["autoLockMinutes", "version", "protocol_handler", LOCAL_ENABLED_KEY];
    for (const k of settingsKeys) {
      if (all[k] != null) {
        const json = JSON.stringify(all[k]);
        entries.push({ key: k, jsonString: json, priority: PRIORITY.P2_SETTINGS, size: json.length });
      }
    }
    for (const k of Object.keys(all)) {
      if (k.startsWith("feature:")) {
        const json = JSON.stringify(all[k]);
        entries.push({ key: k, jsonString: json, priority: PRIORITY.P2_SETTINGS, size: json.length });
      }
    }
    if (all.apiKeyVault && all.apiKeyVault.keys) {
      const safeKeys = {};
      for (const [id, key] of Object.entries(all.apiKeyVault.keys)) {
        if (deletedKeys[id] != null && deletedKeys[id] >= (key.updatedAt || 0)) {
          continue;
        }
        if (secretOk(key.secret)) {
          safeKeys[id] = key;
        } else {
          console.warn("[SyncManager] Refusing to sync plaintext API secret \u2014 dropped");
        }
      }
      const safeVault = { ...all.apiKeyVault, keys: safeKeys };
      const json = JSON.stringify(safeVault);
      entries.push({ key: "apiKeyVault", jsonString: json, priority: PRIORITY.P3_APIKEYS, size: json.length });
    }
    if (all.vaultDocs && typeof all.vaultDocs === "object") {
      const docs = Object.values(all.vaultDocs).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      for (const doc of docs) {
        if (deletedDocs[doc.path] != null && deletedDocs[doc.path] >= (doc.updatedAt || 0)) {
          continue;
        }
        if (!secretOk(doc.content)) {
          console.warn("[SyncManager] Refusing to sync plaintext vault content \u2014 dropped");
          continue;
        }
        const docKey = `vaultDoc:${doc.path}`;
        const json = JSON.stringify(doc);
        entries.push({ key: docKey, jsonString: json, priority: PRIORITY.P4_VAULT, size: json.length });
      }
    }
    return entries;
  }
  async function setSyncRespectingQuota(included) {
    let tiers = included.slice();
    for (let attempt = 0; ; attempt++) {
      const syncPayload = {};
      const allSyncKeys = [];
      for (const item of tiers) {
        for (const c of item.chunks) {
          syncPayload[c.key] = c.value;
          allSyncKeys.push(c.key);
        }
      }
      syncPayload[SYNC_META_KEY] = JSON.stringify({ lastWrittenAt: Date.now(), keys: allSyncKeys });
      try {
        await api.storage.sync.set(syncPayload);
        try {
          const existing = await api.storage.sync.get(null);
          const orphanKeys = Object.keys(existing).filter(
            (k) => k !== SYNC_META_KEY && !allSyncKeys.includes(k)
          );
          if (orphanKeys.length > 0) {
            await api.storage.sync.remove(orphanKeys);
          }
        } catch {
        }
        return allSyncKeys.length;
      } catch (e) {
        const maxPriority = tiers.reduce((m, t) => Math.max(m, t.priority), -1);
        if (maxPriority <= PRIORITY.P1_PROFILES) {
          throw e;
        }
        const before = tiers.length;
        tiers = tiers.filter((t) => t.priority < maxPriority);
        if (tiers.length === before) throw e;
        console.warn(`[SyncManager] sync.set over quota \u2014 dropped priority ${maxPriority} tier, retrying`);
      }
    }
  }
  async function pushToSync() {
    if (!api.storage.sync) return;
    const enabled = await isSyncEnabled();
    if (!enabled) return;
    try {
      const remote = await pullFromSync();
      if (remote) await mergeIntoLocal(remote);
      const entries = await buildSyncPayload();
      entries.sort((a, b) => a.priority - b.priority);
      let usedBytes = 0;
      let usedItems = 0;
      const included = [];
      let budgetExhausted = false;
      for (const entry of entries) {
        if (budgetExhausted) break;
        const chunks = chunkValue(entry.key, entry.jsonString);
        let entrySize = 0;
        for (const c of chunks) {
          entrySize += c.key.length + (typeof c.value === "string" ? c.value.length : JSON.stringify(c.value).length);
        }
        if (usedBytes + entrySize > SYNC_QUOTA - 500 || usedItems + chunks.length > MAX_ITEMS - 5) {
          if (entry.priority <= PRIORITY.P3_APIKEYS) {
          } else {
            console.warn(`[SyncManager] Budget exhausted at priority ${entry.priority}, skipping remaining entries`);
            budgetExhausted = true;
            break;
          }
        }
        included.push({ priority: entry.priority, chunks });
        usedBytes += entrySize;
        usedItems += chunks.length;
      }
      const written = await setSyncRespectingQuota(included);
      console.log(`[SyncManager] Pushed ${written} entries (${usedBytes} bytes) to sync storage`);
    } catch (e) {
      console.error("[SyncManager] pushToSync error:", e);
    }
  }
  async function pullFromSync() {
    if (!api.storage.sync) return null;
    try {
      const raw = await api.storage.sync.get(null);
      if (!raw || Object.keys(raw).length === 0) return null;
      const metaStr = raw[SYNC_META_KEY];
      if (!metaStr) return null;
      let meta;
      try {
        meta = JSON.parse(metaStr);
      } catch {
        return null;
      }
      const result = {};
      const dataKeys = meta.keys.filter((k) => !k.startsWith(CHUNK_PREFIX) && k !== SYNC_META_KEY);
      for (const key of dataKeys) {
        const value = reassembleFromSyncData(key, raw);
        if (value != null) {
          result[key] = value;
        }
      }
      result._syncMeta = meta;
      return result;
    } catch (e) {
      console.error("[SyncManager] pullFromSync error:", e);
      return null;
    }
  }
  async function mergeIntoLocal(syncData) {
    if (!syncData) return;
    const local = await storage.get(null);
    const updates = {};
    let changed = false;
    const hasIdentity = (p) => !!(p && (p.privKey || p.pubKey || p.type === "bunker" || p.bunkerUrl || p.remotePubkey));
    const lone = local.profiles && local.profiles.length === 1 ? local.profiles[0] : null;
    const isFresh = !local.profiles || local.profiles.length === 0 || lone && !lone.privKey && !hasIdentity(lone) || lone && lone.name === "Default Nostr Profile" && Object.keys(lone.hosts || {}).length === 0;
    const identityOf = (p) => p && (p.pubKey || p.remotePubkey) || null;
    const localActiveIndex = local.profileIndex != null ? local.profileIndex : 0;
    const activeId = local.profiles && local.profiles[localActiveIndex] ? identityOf(local.profiles[localActiveIndex]) : null;
    const deletedProfiles = { ...local.deletedProfiles && typeof local.deletedProfiles === "object" ? local.deletedProfiles : {} };
    if (syncData.deletedProfiles && typeof syncData.deletedProfiles === "object") {
      for (const [id, ts] of Object.entries(syncData.deletedProfiles)) {
        if (deletedProfiles[id] == null || ts > deletedProfiles[id]) deletedProfiles[id] = ts;
      }
    }
    let mergedProfiles = local.profiles ? [...local.profiles] : null;
    let profilesChanged = false;
    if (syncData.profiles) {
      if (isFresh) {
        mergedProfiles = syncData.profiles.slice();
        profilesChanged = true;
      } else if (local.profiles) {
        const indexByIdentity = /* @__PURE__ */ new Map();
        mergedProfiles.forEach((p, i) => {
          const id = identityOf(p);
          if (id && !indexByIdentity.has(id)) indexByIdentity.set(id, i);
        });
        for (const syncProfile of syncData.profiles) {
          const id = identityOf(syncProfile);
          if (id && indexByIdentity.has(id)) {
            const i = indexByIdentity.get(id);
            const localProfile = mergedProfiles[i];
            if ((syncProfile.updatedAt || 0) > (localProfile.updatedAt || 0)) {
              mergedProfiles[i] = { ...syncProfile, hosts: localProfile.hosts || {} };
              profilesChanged = true;
            }
          } else if (id) {
            indexByIdentity.set(id, mergedProfiles.length);
            mergedProfiles.push(syncProfile);
            profilesChanged = true;
          }
        }
      }
    }
    if (mergedProfiles && Object.keys(deletedProfiles).length > 0) {
      const kept = mergedProfiles.filter((p) => {
        const id = identityOf(p);
        const ts = id != null ? deletedProfiles[id] : null;
        return !(ts != null && (p.updatedAt || 0) <= ts);
      });
      if (kept.length !== mergedProfiles.length && kept.length > 0) {
        mergedProfiles = kept;
        profilesChanged = true;
      }
    }
    if (profilesChanged && mergedProfiles) {
      updates.profiles = mergedProfiles;
      changed = true;
    }
    if (mergedProfiles && mergedProfiles.length > 0) {
      let desiredIndex;
      if (syncData.profiles && isFresh) {
        const base = syncData.profileIndex != null ? syncData.profileIndex : 0;
        desiredIndex = Math.min(Math.max(base, 0), mergedProfiles.length - 1);
      } else {
        const followed = activeId != null ? mergedProfiles.findIndex((p) => identityOf(p) === activeId) : -1;
        desiredIndex = followed >= 0 ? followed : Math.min(Math.max(localActiveIndex, 0), mergedProfiles.length - 1);
      }
      if (desiredIndex !== local.profileIndex) {
        updates.profileIndex = desiredIndex;
        changed = true;
      }
    }
    const settingsKeys = ["autoLockMinutes", "version", "protocol_handler", LOCAL_ENABLED_KEY];
    for (const key of settingsKeys) {
      if (syncData[key] != null && syncData[key] !== local[key]) {
        if (key === "version" && local.version && compareSemver(syncData.version, local.version) <= 0) continue;
        updates[key] = syncData[key];
        changed = true;
      }
    }
    for (const key of Object.keys(syncData)) {
      if (key.startsWith("feature:") && syncData[key] !== local[key]) {
        updates[key] = syncData[key];
        changed = true;
      }
    }
    const deletedDocs = { ...local.deletedDocs && typeof local.deletedDocs === "object" ? local.deletedDocs : {} };
    if (syncData.deletedDocs && typeof syncData.deletedDocs === "object") {
      for (const [path, ts] of Object.entries(syncData.deletedDocs)) {
        if (deletedDocs[path] == null || ts > deletedDocs[path]) deletedDocs[path] = ts;
      }
    }
    const deletedKeys = { ...local.deletedKeys && typeof local.deletedKeys === "object" ? local.deletedKeys : {} };
    if (syncData.deletedKeys && typeof syncData.deletedKeys === "object") {
      for (const [id, ts] of Object.entries(syncData.deletedKeys)) {
        if (deletedKeys[id] == null || ts > deletedKeys[id]) deletedKeys[id] = ts;
      }
    }
    {
      let baseVault = local.apiKeyVault || null;
      let mergedKeys = { ...local.apiKeyVault && local.apiKeyVault.keys || {} };
      let apiChanged = false;
      if ((!local.apiKeyVault || isFresh) && syncData.apiKeyVault) {
        baseVault = syncData.apiKeyVault;
        mergedKeys = { ...syncData.apiKeyVault.keys || {} };
        apiChanged = true;
      } else if (syncData.apiKeyVault) {
        const syncKeys = syncData.apiKeyVault.keys || {};
        for (const [id, syncKey] of Object.entries(syncKeys)) {
          const localKey = mergedKeys[id];
          if (!localKey || (syncKey.updatedAt || 0) > (localKey.updatedAt || 0)) {
            mergedKeys[id] = syncKey;
            apiChanged = true;
          }
        }
      }
      for (const id of Object.keys(mergedKeys)) {
        const ts = deletedKeys[id];
        if (ts != null && (mergedKeys[id].updatedAt || 0) <= ts) {
          delete mergedKeys[id];
          apiChanged = true;
        }
      }
      if (apiChanged && baseVault) {
        updates.apiKeyVault = { ...baseVault, keys: mergedKeys };
        changed = true;
      }
    }
    const mergedDocs = { ...local.vaultDocs || {} };
    let docsChanged = false;
    for (const key of Object.keys(syncData)) {
      if (!key.startsWith("vaultDoc:")) continue;
      const doc = syncData[key];
      if (!doc || !doc.path) continue;
      const localDoc = mergedDocs[doc.path];
      if (!localDoc || (doc.updatedAt || 0) > (localDoc.updatedAt || 0)) {
        mergedDocs[doc.path] = doc;
        docsChanged = true;
      }
    }
    for (const path of Object.keys(mergedDocs)) {
      const ts = deletedDocs[path];
      if (ts != null && (mergedDocs[path].updatedAt || 0) <= ts) {
        delete mergedDocs[path];
        docsChanged = true;
      }
    }
    if (docsChanged) {
      updates.vaultDocs = mergedDocs;
      changed = true;
    }
    if (JSON.stringify(deletedDocs) !== JSON.stringify(local.deletedDocs || {})) {
      updates.deletedDocs = deletedDocs;
      changed = true;
    }
    if (JSON.stringify(deletedKeys) !== JSON.stringify(local.deletedKeys || {})) {
      updates.deletedKeys = deletedKeys;
      changed = true;
    }
    if (JSON.stringify(deletedProfiles) !== JSON.stringify(local.deletedProfiles || {})) {
      updates.deletedProfiles = deletedProfiles;
      changed = true;
    }
    if (changed) {
      await storage.set(updates);
      console.log("[SyncManager] Merged sync data into local:", Object.keys(updates));
    }
  }
  function scheduleSyncPush() {
    if (!api.storage.sync) return;
    if (pushTimer) clearTimeout(pushTimer);
    pushTimer = setTimeout(() => {
      pushTimer = null;
      pushToSync();
    }, 2e3);
  }
  async function isSyncEnabled() {
    const data = await storage.get({ [LOCAL_ENABLED_KEY]: true });
    return data[LOCAL_ENABLED_KEY];
  }

  // src/utilities/api-key-store.js
  var storage2 = api.storage.local;
  var STORAGE_KEY = "apiKeyVault";
  var DELETED_KEY = "deletedKeys";
  async function getDeletedKeys() {
    const data = await storage2.get({ [DELETED_KEY]: {} });
    return data[DELETED_KEY] && typeof data[DELETED_KEY] === "object" ? data[DELETED_KEY] : {};
  }
  async function decryptKey(key) {
    if (!key) return key;
    try {
      return { ...key, secret: await unwrapSecret(key.secret) };
    } catch (e) {
      if (String(e.message || "").startsWith("locked")) throw e;
      return { ...key, secret: null, undecryptable: true };
    }
  }
  var DEFAULT_STORE = {
    keys: {},
    syncEnabled: true,
    eventId: null,
    relayCreatedAt: null,
    syncStatus: "synced"
  };
  async function getStore() {
    const data = await storage2.get({ [STORAGE_KEY]: DEFAULT_STORE });
    return { ...DEFAULT_STORE, ...data[STORAGE_KEY] };
  }
  async function setStore(store) {
    await storage2.set({ [STORAGE_KEY]: store });
    scheduleSyncPush();
  }
  async function getApiKeyStore() {
    const store = await getStore();
    const keys = {};
    for (const [id, key] of Object.entries(store.keys)) {
      keys[id] = await decryptKey(key);
    }
    return { ...store, keys };
  }
  async function saveApiKey(id, label, secret) {
    const store = await getStore();
    const now = Math.floor(Date.now() / 1e3);
    const existing = store.keys[id];
    store.keys[id] = {
      id,
      label,
      secret: await wrapSecret(secret),
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      profileScope: existing?.profileScope ?? null
    };
    const deleted = await getDeletedKeys();
    if (deleted[id] != null) {
      delete deleted[id];
      await storage2.set({ [STORAGE_KEY]: store, [DELETED_KEY]: deleted });
      scheduleSyncPush();
    } else {
      await setStore(store);
    }
    return decryptKey(store.keys[id]);
  }
  async function deleteApiKey(id) {
    const store = await getStore();
    delete store.keys[id];
    const deleted = await getDeletedKeys();
    deleted[id] = Math.floor(Date.now() / 1e3);
    await storage2.set({ [STORAGE_KEY]: store, [DELETED_KEY]: deleted });
    scheduleSyncPush();
  }
  async function listApiKeys() {
    const store = await getStore();
    const decrypted = [];
    for (const key of Object.values(store.keys)) {
      decrypted.push(await decryptKey(key));
    }
    return decrypted.sort(
      (a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase())
    );
  }
  async function setSyncEnabled(enabled) {
    const store = await getStore();
    store.syncEnabled = enabled;
    await setStore(store);
  }
  async function isSyncEnabled2() {
    const store = await getStore();
    return store.syncEnabled;
  }
  async function updateStoreSyncState(syncStatus, eventId = null, relayCreatedAt = null) {
    const store = await getStore();
    store.syncStatus = syncStatus;
    if (eventId !== null) store.eventId = eventId;
    if (relayCreatedAt !== null) store.relayCreatedAt = relayCreatedAt;
    await setStore(store);
  }
  async function exportStore() {
    const store = await getStore();
    const keys = {};
    const undecryptable = [];
    for (const [id, key] of Object.entries(store.keys)) {
      const decrypted = await decryptKey(key);
      if (decrypted?.undecryptable) {
        keys[id] = { ...key };
        undecryptable.push(key.label || id);
        continue;
      }
      keys[id] = decrypted;
    }
    return { keys, undecryptable };
  }
  async function importStore(keys) {
    const store = await getStore();
    for (const [id, key] of Object.entries(keys)) {
      const secret = isCiphertext(key.secret) ? key.secret : await wrapSecret(key.secret);
      store.keys[id] = { ...key, secret };
    }
    await setStore(store);
  }

  // src/api-keys/api-keys.js
  var state = {
    keys: [],
    newLabel: "",
    newSecret: "",
    editingId: null,
    editLabel: "",
    editSecret: "",
    copiedId: null,
    revealedId: null,
    syncEnabled: true,
    globalSyncStatus: "idle",
    syncError: "",
    saving: false,
    toast: "",
    relayInfo: { read: [], write: [] }
  };
  function $(id) {
    return document.getElementById(id);
  }
  function hasRelays() {
    return state.relayInfo.read.length > 0 || state.relayInfo.write.length > 0;
  }
  function sortedKeys() {
    return [...state.keys].sort(
      (a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase())
    );
  }
  function maskSecret(secret) {
    if (!secret) return "";
    if (secret.length <= 8) return "\u2022".repeat(secret.length);
    return secret.slice(0, 4) + "\u2022".repeat(4) + secret.slice(-4);
  }
  function showToast(msg) {
    state.toast = msg;
    render();
    setTimeout(() => {
      state.toast = "";
      render();
    }, 2e3);
  }
  function syncStatusClass(status) {
    if (status === "idle") return state.syncEnabled ? "led--green" : "led--off";
    if (status === "syncing") return "led--amber animate-pulse";
    return "led--red";
  }
  function syncStatusText() {
    if (state.globalSyncStatus === "syncing") return "Syncing...";
    if (state.globalSyncStatus === "error") return state.syncError;
    return state.syncEnabled ? "Synced" : "Local only";
  }
  function render() {
    const syncDot = $("sync-dot");
    const syncText = $("sync-text");
    const syncBtn = $("sync-btn");
    const syncToggle = $("sync-toggle");
    const keyCount = $("key-count");
    if (syncDot) syncDot.className = `led ${syncStatusClass(state.globalSyncStatus)}`;
    if (syncText) syncText.textContent = syncStatusText();
    if (syncBtn) syncBtn.disabled = state.globalSyncStatus === "syncing" || !hasRelays() || !state.syncEnabled;
    if (syncToggle) syncToggle.setAttribute("aria-pressed", String(state.syncEnabled));
    if (keyCount) keyCount.textContent = state.keys.length + " key" + (state.keys.length !== 1 ? "s" : "");
    const keyTableContainer = $("key-table-container");
    const noKeysMsg = $("no-keys");
    const keyTableBody = $("key-table-body");
    if (keyTableContainer) keyTableContainer.style.display = state.keys.length > 0 ? "block" : "none";
    if (noKeysMsg) noKeysMsg.style.display = state.keys.length === 0 ? "block" : "none";
    if (keyTableBody) {
      const sorted = sortedKeys();
      keyTableBody.innerHTML = sorted.map((key) => {
        if (state.editingId === key.id) {
          return `
                    <div class="module is-live">
                        <div class="module-header">Edit key</div>
                        <div class="module-body flex flex-col gap-2">
                            <input
                                type="text"
                                class="ins-input"
                                autocomplete="off"
                                aria-label="Key label"
                                data-edit-label="${key.id}"
                                value="${escapeAttr(state.editLabel)}"
                            />
                            <input
                                type="text"
                                class="ins-input mono"
                                autocomplete="off"
                                spellcheck="false"
                                aria-label="Secret key"
                                data-edit-secret="${key.id}"
                                value="${escapeAttr(state.editSecret)}"
                            />
                            <div class="flex gap-2 justify-end">
                                <button class="btn btn--ghost btn--sm" type="button" data-action="cancel-edit">Cancel</button>
                                <button class="btn btn--primary btn--sm" type="button" data-action="save-edit">Save</button>
                            </div>
                        </div>
                    </div>
                `;
        }
        const revealed = state.revealedId === key.id;
        const displaySecret = key.undecryptable ? "unreadable on this device" : revealed ? escapeHtml(key.secret) : escapeHtml(maskSecret(key.secret));
        const copyLabel = state.copiedId === key.id ? "Copied!" : "Copy";
        return `
                <div class="module${revealed ? " is-live" : ""}">
                    <div class="module-row">
                        <button
                            class="patch-point"
                            type="button"
                            data-action="toggle-reveal"
                            data-key-id="${key.id}"
                            aria-pressed="${revealed}"
                            title="${revealed ? "Hide secret" : "Reveal secret"}"
                            aria-label="${revealed ? "Hide" : "Reveal"} secret for ${escapeAttr(key.label)}"
                        ><span class="patch-jack"></span></button>
                        <div class="flex flex-col gap-0.5 min-w-0 flex-1">
                            <span class="text-sm font-semibold cursor-pointer hover:underline" data-action="start-edit" data-key-id="${key.id}" title="Edit key">${escapeHtml(key.label)}</span>
                            <span class="mono text-xs ${revealed ? "" : "ins-muted "}ins-truncate cursor-pointer" data-action="toggle-reveal" data-key-id="${key.id}">${displaySecret}</span>
                        </div>
                        <span class="row-value">
                            <button class="btn btn--sm" type="button" data-action="copy-secret" data-key-id="${key.id}">${copyLabel}</button>
                            <button class="btn btn--sm btn--destructive" type="button" data-action="delete-key" data-key-id="${key.id}">Del</button>
                        </span>
                    </div>
                </div>
            `;
      }).join("");
      keyTableBody.querySelectorAll('[data-action="start-edit"]').forEach((el) => {
        el.addEventListener("click", () => startEdit(el.dataset.keyId));
      });
      keyTableBody.querySelectorAll('[data-action="toggle-reveal"]').forEach((el) => {
        el.addEventListener("click", () => {
          state.revealedId = state.revealedId === el.dataset.keyId ? null : el.dataset.keyId;
          render();
        });
      });
      keyTableBody.querySelectorAll('[data-action="copy-secret"]').forEach((el) => {
        el.addEventListener("click", () => copySecret(el.dataset.keyId));
      });
      keyTableBody.querySelectorAll('[data-action="delete-key"]').forEach((el) => {
        el.addEventListener("click", () => deleteKey(el.dataset.keyId));
      });
      keyTableBody.querySelectorAll('[data-action="save-edit"]').forEach((el) => {
        el.addEventListener("click", saveEdit);
      });
      keyTableBody.querySelectorAll('[data-action="cancel-edit"]').forEach((el) => {
        el.addEventListener("click", cancelEdit);
      });
      keyTableBody.querySelectorAll("[data-edit-label]").forEach((el) => {
        el.addEventListener("input", (e) => {
          state.editLabel = e.target.value;
        });
        el.addEventListener("keyup", (e) => {
          if (e.key === "Enter") saveEdit();
          if (e.key === "Escape") cancelEdit();
        });
      });
      keyTableBody.querySelectorAll("[data-edit-secret]").forEach((el) => {
        el.addEventListener("input", (e) => {
          state.editSecret = e.target.value;
        });
        el.addEventListener("keyup", (e) => {
          if (e.key === "Enter") saveEdit();
          if (e.key === "Escape") cancelEdit();
        });
      });
    }
    const newLabelInput = $("new-label");
    const newSecretInput = $("new-secret");
    const addKeyBtn = $("add-key-btn");
    if (newLabelInput && document.activeElement !== newLabelInput) newLabelInput.value = state.newLabel;
    if (newSecretInput && document.activeElement !== newSecretInput) newSecretInput.value = state.newSecret;
    if (addKeyBtn) {
      addKeyBtn.disabled = state.saving || state.newLabel.trim().length === 0 || state.newSecret.trim().length === 0;
      addKeyBtn.textContent = state.saving ? "Saving..." : "Save";
    }
    const toast = $("toast");
    if (toast) {
      toast.textContent = state.toast;
      toast.style.display = state.toast ? "block" : "none";
    }
  }
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
  function escapeAttr(str) {
    return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  async function addKey() {
    const label = state.newLabel.trim();
    const secret = state.newSecret.trim();
    if (!label || !secret) return;
    state.saving = true;
    render();
    const id = crypto.randomUUID();
    await saveApiKey(id, label, secret);
    state.keys = await listApiKeys();
    state.newLabel = "";
    state.newSecret = "";
    if (state.syncEnabled && hasRelays()) {
      await publishToRelay();
    }
    state.saving = false;
    showToast("Key added");
  }
  function startEdit(id) {
    const key = state.keys.find((k) => k.id === id);
    if (!key) return;
    if (key.undecryptable) {
      showToast("This key could not be decrypted on this device \u2014 it was left untouched");
      return;
    }
    state.editingId = key.id;
    state.editLabel = key.label;
    state.editSecret = key.secret;
    render();
  }
  async function saveEdit() {
    if (!state.editingId) return;
    const label = state.editLabel.trim();
    const secret = state.editSecret.trim();
    if (!label || !secret) return;
    await saveApiKey(state.editingId, label, secret);
    state.keys = await listApiKeys();
    state.editingId = null;
    state.editLabel = "";
    state.editSecret = "";
    if (state.syncEnabled && hasRelays()) {
      await publishToRelay();
    }
    showToast("Key updated");
  }
  function cancelEdit() {
    state.editingId = null;
    state.editLabel = "";
    state.editSecret = "";
    render();
  }
  async function deleteKey(id) {
    const key = state.keys.find((k) => k.id === id);
    if (!key) return;
    if (!await insConfirm({ title: `Delete "${key.label}"?`, body: "The stored secret is removed from your encrypted vault.", confirmLabel: "Delete key", destructive: true })) return;
    await deleteApiKey(id);
    state.keys = await listApiKeys();
    if (state.syncEnabled && hasRelays()) {
      await publishToRelay();
    }
    showToast("Key deleted");
  }
  async function copySecret(id) {
    const key = state.keys.find((k) => k.id === id);
    if (!key) return;
    if (key.undecryptable) {
      showToast("This key could not be decrypted on this device");
      return;
    }
    await navigator.clipboard.writeText(key.secret);
    state.copiedId = id;
    render();
    setTimeout(() => {
      state.copiedId = null;
      render();
    }, 2e3);
    setTimeout(() => {
      navigator.clipboard.writeText("").catch(() => {
      });
    }, 3e4);
  }
  async function publishToRelay() {
    try {
      const store = await getApiKeyStore();
      const result = await api.runtime.sendMessage({
        kind: "apikeys.publish",
        payload: { keys: store.keys }
      });
      if (result.success) {
        await updateStoreSyncState("synced", result.eventId, result.createdAt);
      }
      return result;
    } catch (e) {
      await updateStoreSyncState("local-only");
      return { success: false, error: e.message };
    }
  }
  async function syncAll() {
    state.globalSyncStatus = "syncing";
    state.syncError = "";
    render();
    try {
      const result = await api.runtime.sendMessage({ kind: "apikeys.fetch" });
      if (!result.success) {
        state.globalSyncStatus = "error";
        state.syncError = result.error || "Sync failed";
        render();
        return;
      }
      if (result.keys) {
        const store = await getApiKeyStore();
        const localKeys = store.keys;
        const localCount = Object.keys(localKeys).length;
        if (localCount === 0) {
          await importStore(result.keys);
        } else if (!store.relayCreatedAt || result.createdAt > store.relayCreatedAt) {
          await importStore(result.keys);
        }
        await updateStoreSyncState("synced", result.eventId, result.createdAt);
        state.keys = await listApiKeys();
      }
      state.globalSyncStatus = "idle";
    } catch (e) {
      state.globalSyncStatus = "error";
      state.syncError = e.message || "Sync failed";
    }
    render();
  }
  async function toggleSync() {
    await setSyncEnabled(state.syncEnabled);
    if (state.syncEnabled && hasRelays()) {
      await syncAll();
    }
  }
  async function exportKeys() {
    const { keys, undecryptable } = await exportStore();
    const plainText = JSON.stringify(keys, null, 2);
    const result = await api.runtime.sendMessage({
      kind: "apikeys.encrypt",
      payload: { plainText }
    });
    if (!result.success) {
      showToast("Export failed: " + (result.error || "unknown"));
      return;
    }
    const blob = new Blob(
      [JSON.stringify({ encrypted: true, data: result.cipherText })],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nostrkey-api-keys-backup.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast(undecryptable.length ? `Exported \u2014 ${undecryptable.length} key(s) could not be decrypted here and were backed up still-encrypted: ${undecryptable.join(", ")}` : "Exported");
  }
  async function importKeys(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      let keys;
      if (parsed.encrypted && parsed.data) {
        const result = await api.runtime.sendMessage({
          kind: "apikeys.decrypt",
          payload: { cipherText: parsed.data }
        });
        if (!result.success) {
          showToast("Decrypt failed: " + (result.error || "unknown"));
          return;
        }
        keys = JSON.parse(result.plainText);
      } else {
        keys = parsed;
      }
      await importStore(keys);
      state.keys = await listApiKeys();
      if (state.syncEnabled && hasRelays()) {
        await publishToRelay();
      }
      showToast("Imported " + Object.keys(keys).length + " keys");
    } catch (e) {
      showToast("Import failed: " + e.message);
    }
    event.target.value = "";
  }
  function bindEvents() {
    $("sync-btn")?.addEventListener("click", syncAll);
    $("add-key-btn")?.addEventListener("click", addKey);
    $("export-btn")?.addEventListener("click", exportKeys);
    $("import-file")?.addEventListener("change", importKeys);
    $("close-btn")?.addEventListener("click", () => window.close());
    $("sync-toggle")?.addEventListener("click", () => {
      state.syncEnabled = !state.syncEnabled;
      render();
      toggleSync();
    });
    $("new-label")?.addEventListener("input", (e) => {
      state.newLabel = e.target.value;
      render();
    });
    $("new-secret")?.addEventListener("input", (e) => {
      state.newSecret = e.target.value;
      render();
    });
  }
  function showGate(gate, main, { title, message, button }) {
    if (gate) gate.style.display = "block";
    if (main) main.style.display = "none";
    const t = $("gate-title");
    if (t && title) t.textContent = title;
    const m = $("gate-message");
    if (m && message) m.textContent = message;
    const b = $("gate-security-btn");
    if (b && button) b.textContent = button;
    b?.addEventListener("click", () => {
      const url = api.runtime.getURL("security/security.html");
      window.open(url, "nostrkey-options");
    });
  }
  async function init() {
    const isEncrypted = await api.runtime.sendMessage({ kind: "isEncrypted" });
    const locked = await api.runtime.sendMessage({ kind: "isLocked" });
    const gate = $("vault-locked-gate");
    const main = $("vault-main-content");
    if (!isEncrypted) {
      setUnlocked(true);
      showGate(gate, main, {});
      return;
    }
    if (locked) {
      setUnlocked(false);
      showGate(gate, main, {
        title: "Vault Locked",
        message: "Unlock NostrKey with your master password to view your API keys.",
        button: "Unlock"
      });
      return;
    }
    setUnlocked(true);
    if (gate) gate.style.display = "none";
    if (main) main.style.display = "block";
    const relays = await api.runtime.sendMessage({ kind: "vault.getRelays" });
    state.relayInfo = relays || { read: [], write: [] };
    state.syncEnabled = await isSyncEnabled2();
    state.keys = await listApiKeys();
    bindEvents();
    render();
    if (state.syncEnabled && hasRelays()) {
      await syncAll();
    }
  }
  document.addEventListener("DOMContentLoaded", init);
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vc3JjL3NoaW1zL3Byb2Nlc3MuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9icm93c2VyLXBvbHlmaWxsLmpzIiwgIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9pZGIvYnVpbGQvaW5kZXguanMiLCAiLi4vLi4vLi4vc3JjL2FwaS1rZXlzL2FwaS1rZXlzLmpzIiwgIi4uLy4uLy4uL3NyYy9pbnMtY29uZmlybS5qcyIsICIuLi8uLi8uLi9zcmMvdXRpbGl0aWVzL2FwaS1rZXktc3RvcmUuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9zeW5jLW1hbmFnZXIuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9zZWNyZXQtdmF1bHQuanMiLCAiLi4vLi4vLi4vc3JjL3V0aWxpdGllcy9jcnlwdG8uanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogTWluaW1hbCBwcm9jZXNzIHNoaW0gZm9yIGJyb3dzZXIgY29udGV4dC5cbiAqIE5vZGUuanMgbGlicmFyaWVzIGJ1bmRsZWQgdmlhIG5vc3RyLWNyeXB0by11dGlscyAoY3J5cHRvLWJyb3dzZXJpZnksXG4gKiByZWFkYWJsZS1zdHJlYW0sIGV0Yy4pIHJlZmVyZW5jZSB0aGUgZ2xvYmFsIGBwcm9jZXNzYCBvYmplY3QuXG4gKiBUaGlzIHByb3ZpZGVzIGp1c3QgZW5vdWdoIGZvciB0aGVtIHRvIHdvcmsgaW4gYSBicm93c2VyIGV4dGVuc2lvbi5cbiAqL1xuZXhwb3J0IHZhciBwcm9jZXNzID0ge1xuICAgIGVudjogeyBOT0RFX0VOVjogJ3Byb2R1Y3Rpb24nLCBMT0dfTEVWRUw6ICd3YXJuJyB9LFxuICAgIGJyb3dzZXI6IHRydWUsXG4gICAgdmVyc2lvbjogJycsXG4gICAgc3Rkb3V0OiBudWxsLFxuICAgIHN0ZGVycjogbnVsbCxcbiAgICBuZXh0VGljazogZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgUHJvbWlzZS5yZXNvbHZlKCkudGhlbihmdW5jdGlvbiAoKSB7IGZuLmFwcGx5KG51bGwsIGFyZ3MpOyB9KTtcbiAgICB9LFxufTtcbiIsICIvKipcbiAqIEJyb3dzZXIgQVBJIGNvbXBhdGliaWxpdHkgbGF5ZXIgZm9yIENocm9tZSAvIFNhZmFyaSAvIEZpcmVmb3guXG4gKlxuICogU2FmYXJpIGFuZCBGaXJlZm94IGV4cG9zZSBgYnJvd3Nlci4qYCAoUHJvbWlzZS1iYXNlZCwgV2ViRXh0ZW5zaW9uIHN0YW5kYXJkKS5cbiAqIENocm9tZSBleHBvc2VzIGBjaHJvbWUuKmAgKGNhbGxiYWNrLWJhc2VkIGhpc3RvcmljYWxseSwgYnV0IE1WMyBzdXBwb3J0c1xuICogcHJvbWlzZXMgb24gbW9zdCBBUElzKS4gSW4gYSBzZXJ2aWNlLXdvcmtlciBjb250ZXh0IGBicm93c2VyYCBpcyB1bmRlZmluZWRcbiAqIG9uIENocm9tZSwgc28gd2Ugbm9ybWFsaXNlIGV2ZXJ5dGhpbmcgaGVyZS5cbiAqXG4gKiBVc2FnZTogIGltcG9ydCB7IGFwaSB9IGZyb20gJy4vdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwnO1xuICogICAgICAgICBhcGkucnVudGltZS5zZW5kTWVzc2FnZSguLi4pXG4gKlxuICogVGhlIGV4cG9ydGVkIGBhcGlgIG9iamVjdCBtaXJyb3JzIHRoZSBzdWJzZXQgb2YgdGhlIFdlYkV4dGVuc2lvbiBBUEkgdGhhdFxuICogTm9zdHJLZXkgYWN0dWFsbHkgdXNlcywgd2l0aCBldmVyeSBtZXRob2QgcmV0dXJuaW5nIGEgUHJvbWlzZS5cbiAqL1xuXG4vLyBEZXRlY3Qgd2hpY2ggZ2xvYmFsIG5hbWVzcGFjZSBpcyBhdmFpbGFibGUuXG5jb25zdCBfYnJvd3NlciA9XG4gICAgdHlwZW9mIGJyb3dzZXIgIT09ICd1bmRlZmluZWQnID8gYnJvd3NlciA6XG4gICAgdHlwZW9mIGNocm9tZSAgIT09ICd1bmRlZmluZWQnID8gY2hyb21lICA6XG4gICAgbnVsbDtcblxuaWYgKCFfYnJvd3Nlcikge1xuICAgIHRocm93IG5ldyBFcnJvcignYnJvd3Nlci1wb2x5ZmlsbDogTm8gZXh0ZW5zaW9uIEFQSSBuYW1lc3BhY2UgZm91bmQgKG5laXRoZXIgYnJvd3NlciBub3IgY2hyb21lKS4nKTtcbn1cblxuLyoqXG4gKiBUcnVlIHdoZW4gcnVubmluZyBvbiBDaHJvbWUgKG9yIGFueSBDaHJvbWl1bS1iYXNlZCBicm93c2VyIHRoYXQgb25seVxuICogZXhwb3NlcyB0aGUgYGNocm9tZWAgbmFtZXNwYWNlKS5cbiAqL1xuY29uc3QgaXNDaHJvbWUgPSB0eXBlb2YgYnJvd3NlciA9PT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNocm9tZSAhPT0gJ3VuZGVmaW5lZCc7XG5cbi8qKlxuICogV3JhcCBhIENocm9tZSBjYWxsYmFjay1zdHlsZSBtZXRob2Qgc28gaXQgcmV0dXJucyBhIFByb21pc2UuXG4gKiBJZiB0aGUgbWV0aG9kIGFscmVhZHkgcmV0dXJucyBhIHByb21pc2UgKE1WMykgd2UganVzdCBwYXNzIHRocm91Z2guXG4gKi9cbmZ1bmN0aW9uIHByb21pc2lmeShjb250ZXh0LCBtZXRob2QpIHtcbiAgICByZXR1cm4gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgLy8gTVYzIENocm9tZSBBUElzIHJldHVybiBwcm9taXNlcyB3aGVuIG5vIGNhbGxiYWNrIGlzIHN1cHBsaWVkLlxuICAgICAgICAvLyBXZSB0cnkgdGhlIHByb21pc2UgcGF0aCBmaXJzdDsgaWYgdGhlIHJ1bnRpbWUgc2lnbmFscyBhbiBlcnJvclxuICAgICAgICAvLyB2aWEgY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yIGluc2lkZSBhIGNhbGxiYWNrIHdlIGNhdGNoIHRoYXQgdG9vLlxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gbWV0aG9kLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKHJlc3VsdCAmJiB0eXBlb2YgcmVzdWx0LnRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgICAvLyBmYWxsIHRocm91Z2ggdG8gY2FsbGJhY2sgd3JhcHBpbmdcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBtZXRob2QuYXBwbHkoY29udGV4dCwgW1xuICAgICAgICAgICAgICAgIC4uLmFyZ3MsXG4gICAgICAgICAgICAgICAgKC4uLmNiQXJncykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoX2Jyb3dzZXIucnVudGltZSAmJiBfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihfYnJvd3Nlci5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlKSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGNiQXJncy5sZW5ndGggPD0gMSA/IGNiQXJnc1swXSA6IGNiQXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgXSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQnVpbGQgdGhlIHVuaWZpZWQgYGFwaWAgb2JqZWN0XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuY29uc3QgYXBpID0ge307XG5cbi8vIC0tLSBydW50aW1lIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuYXBpLnJ1bnRpbWUgPSB7XG4gICAgLyoqXG4gICAgICogc2VuZE1lc3NhZ2UgXHUyMDEzIGFsd2F5cyByZXR1cm5zIGEgUHJvbWlzZS5cbiAgICAgKi9cbiAgICBzZW5kTWVzc2FnZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIucnVudGltZSwgX2Jyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSkoLi4uYXJncyk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9uTWVzc2FnZSBcdTIwMTMgdGhpbiB3cmFwcGVyIHNvIGNhbGxlcnMgdXNlIGEgY29uc2lzdGVudCByZWZlcmVuY2UuXG4gICAgICogVGhlIGxpc3RlbmVyIHNpZ25hdHVyZSBpcyAobWVzc2FnZSwgc2VuZGVyLCBzZW5kUmVzcG9uc2UpLlxuICAgICAqIE9uIENocm9tZSB0aGUgbGlzdGVuZXIgY2FuIHJldHVybiBgdHJ1ZWAgdG8ga2VlcCB0aGUgY2hhbm5lbCBvcGVuLFxuICAgICAqIG9yIHJldHVybiBhIFByb21pc2UgKE1WMykuICBTYWZhcmkgLyBGaXJlZm94IGV4cGVjdCBhIFByb21pc2UgcmV0dXJuLlxuICAgICAqL1xuICAgIG9uTWVzc2FnZTogX2Jyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UsXG5cbiAgICAvKipcbiAgICAgKiBnZXRVUkwgXHUyMDEzIHN5bmNocm9ub3VzIG9uIGFsbCBicm93c2Vycy5cbiAgICAgKi9cbiAgICBnZXRVUkwocGF0aCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5nZXRVUkwocGF0aCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIG9wZW5PcHRpb25zUGFnZVxuICAgICAqL1xuICAgIG9wZW5PcHRpb25zUGFnZSgpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnJ1bnRpbWUub3Blbk9wdGlvbnNQYWdlKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5ydW50aW1lLCBfYnJvd3Nlci5ydW50aW1lLm9wZW5PcHRpb25zUGFnZSkoKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRXhwb3NlIHRoZSBpZCBmb3IgY29udmVuaWVuY2UuXG4gICAgICovXG4gICAgZ2V0IGlkKCkge1xuICAgICAgICByZXR1cm4gX2Jyb3dzZXIucnVudGltZS5pZDtcbiAgICB9LFxufTtcblxuLy8gLS0tIHN0b3JhZ2UubG9jYWwgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5hcGkuc3RvcmFnZSA9IHtcbiAgICBsb2NhbDoge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLmdldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnNldCguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2UubG9jYWwsIF9icm93c2VyLnN0b3JhZ2UubG9jYWwuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLmxvY2FsLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbCwgX2Jyb3dzZXIuc3RvcmFnZS5sb2NhbC5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICAvLyAtLS0gc3RvcmFnZS5zeW5jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAvLyBOdWxsIHdoZW4gdGhlIGJyb3dzZXIgZG9lc24ndCBzdXBwb3J0IHN5bmMgKG9sZGVyIFNhZmFyaSwgZXRjLilcbiAgICBzeW5jOiBfYnJvd3Nlci5zdG9yYWdlPy5zeW5jID8ge1xuICAgICAgICBnZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuZ2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5nZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuc2V0KC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5zZXQpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmUoLi4uYXJncykge1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnN5bmMucmVtb3ZlKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnN5bmMsIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5yZW1vdmUpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhciguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc3luYy5jbGVhciguLi5hcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLCBfYnJvd3Nlci5zdG9yYWdlLnN5bmMuY2xlYXIpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBnZXRCeXRlc0luVXNlKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpIHtcbiAgICAgICAgICAgICAgICAvLyBTYWZhcmkgZG9lc24ndCBzdXBwb3J0IGdldEJ5dGVzSW5Vc2UgXHUyMDE0IHJldHVybiAwXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc3luYywgX2Jyb3dzZXIuc3RvcmFnZS5zeW5jLmdldEJ5dGVzSW5Vc2UpKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgIH0gOiBudWxsLFxuXG4gICAgLy8gLS0tIHN0b3JhZ2Uuc2Vzc2lvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy8gTVYzIGluLW1lbW9yeSBhcmVhIHRoYXQgc3Vydml2ZXMgc2VydmljZS13b3JrZXIgZXZpY3Rpb24gYnV0IG5ldmVyIHRvdWNoZXNcbiAgICAvLyBkaXNrLiBOdWxsIG9uIGVuZ2luZXMgdGhhdCBkb24ndCBpbXBsZW1lbnQgaXQgKFNhZmFyaSBiYWNrZ3JvdW5kIHBhZ2UsXG4gICAgLy8gb2xkZXIgRmlyZWZveCkgXHUyMDE0IGNhbGxlcnMgbXVzdCBmZWF0dXJlLWRldGVjdCBhbmQgZmFsbCBiYWNrLlxuICAgIHNlc3Npb246IF9icm93c2VyLnN0b3JhZ2U/LnNlc3Npb24gPyB7XG4gICAgICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5nZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLmdldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHNldCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXQoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldCkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5yZW1vdmUoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnJlbW92ZSkoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24sIF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5jbGVhcikoLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZXN0cmljdCB0aGUgYXJlYSB0byBleHRlbnNpb24tcHJpdmlsZWdlZCBjb250ZXh0cy4gQ2hyb21lLW9ubHk7XG4gICAgICAgICAqIHJlc29sdmVzIGhhcm1sZXNzbHkgd2hlcmUgdGhlIG1ldGhvZCBpcyBhYnNlbnQuXG4gICAgICAgICAqL1xuICAgICAgICBzZXRBY2Nlc3NMZXZlbCguLi5hcmdzKSB7XG4gICAgICAgICAgICBpZiAoIV9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbi5zZXRBY2Nlc3NMZXZlbCkgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci5zdG9yYWdlLnNlc3Npb24uc2V0QWNjZXNzTGV2ZWwoLi4uYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnN0b3JhZ2Uuc2Vzc2lvbiwgX2Jyb3dzZXIuc3RvcmFnZS5zZXNzaW9uLnNldEFjY2Vzc0xldmVsKSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICB9IDogbnVsbCxcblxuICAgIC8vIC0tLSBzdG9yYWdlLm9uQ2hhbmdlZCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIG9uQ2hhbmdlZDogX2Jyb3dzZXIuc3RvcmFnZT8ub25DaGFuZ2VkIHx8IG51bGwsXG59O1xuXG4vLyAtLS0gdGFicyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmFwaS50YWJzID0ge1xuICAgIGNyZWF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmNyZWF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuY3JlYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHF1ZXJ5KC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMucXVlcnkoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnF1ZXJ5KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHJlbW92ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnJlbW92ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMucmVtb3ZlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHVwZGF0ZSguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLnVwZGF0ZSguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMudXBkYXRlKSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldCguLi5hcmdzKSB7XG4gICAgICAgIGlmICghaXNDaHJvbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBfYnJvd3Nlci50YWJzLmdldCguLi5hcmdzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJvbWlzaWZ5KF9icm93c2VyLnRhYnMsIF9icm93c2VyLnRhYnMuZ2V0KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIGdldEN1cnJlbnQoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIudGFicywgX2Jyb3dzZXIudGFicy5nZXRDdXJyZW50KSguLi5hcmdzKTtcbiAgICB9LFxuICAgIHNlbmRNZXNzYWdlKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCFpc0Nocm9tZSkge1xuICAgICAgICAgICAgcmV0dXJuIF9icm93c2VyLnRhYnMuc2VuZE1lc3NhZ2UoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb21pc2lmeShfYnJvd3Nlci50YWJzLCBfYnJvd3Nlci50YWJzLnNlbmRNZXNzYWdlKSguLi5hcmdzKTtcbiAgICB9LFxufTtcblxuLy8gLS0tIGFsYXJtcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBjaHJvbWUuYWxhcm1zIHN1cnZpdmVzIE1WMyBzZXJ2aWNlLXdvcmtlciBldmljdGlvbjsgc2V0VGltZW91dCBkb2VzIG5vdC5cbmFwaS5hbGFybXMgPSBfYnJvd3Nlci5hbGFybXMgPyB7XG4gICAgY3JlYXRlKC4uLmFyZ3MpIHtcbiAgICAgICAgLy8gYWxhcm1zLmNyZWF0ZSBpcyBzeW5jaHJvbm91cyBvbiBDaHJvbWUsIHJldHVybnMgUHJvbWlzZSBvbiBGaXJlZm94L1NhZmFyaVxuICAgICAgICBjb25zdCByZXN1bHQgPSBfYnJvd3Nlci5hbGFybXMuY3JlYXRlKC4uLmFyZ3MpO1xuICAgICAgICByZXR1cm4gcmVzdWx0ICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gJ2Z1bmN0aW9uJyA/IHJlc3VsdCA6IFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH0sXG4gICAgY2xlYXIoLi4uYXJncykge1xuICAgICAgICBpZiAoIWlzQ2hyb21lKSB7XG4gICAgICAgICAgICByZXR1cm4gX2Jyb3dzZXIuYWxhcm1zLmNsZWFyKC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9taXNpZnkoX2Jyb3dzZXIuYWxhcm1zLCBfYnJvd3Nlci5hbGFybXMuY2xlYXIpKC4uLmFyZ3MpO1xuICAgIH0sXG4gICAgb25BbGFybTogX2Jyb3dzZXIuYWxhcm1zLm9uQWxhcm0sXG59IDogbnVsbDtcblxuZXhwb3J0IHsgYXBpLCBpc0Nocm9tZSB9O1xuIiwgImNvbnN0IGluc3RhbmNlT2ZBbnkgPSAob2JqZWN0LCBjb25zdHJ1Y3RvcnMpID0+IGNvbnN0cnVjdG9ycy5zb21lKChjKSA9PiBvYmplY3QgaW5zdGFuY2VvZiBjKTtcblxubGV0IGlkYlByb3h5YWJsZVR5cGVzO1xubGV0IGN1cnNvckFkdmFuY2VNZXRob2RzO1xuLy8gVGhpcyBpcyBhIGZ1bmN0aW9uIHRvIHByZXZlbnQgaXQgdGhyb3dpbmcgdXAgaW4gbm9kZSBlbnZpcm9ubWVudHMuXG5mdW5jdGlvbiBnZXRJZGJQcm94eWFibGVUeXBlcygpIHtcbiAgICByZXR1cm4gKGlkYlByb3h5YWJsZVR5cGVzIHx8XG4gICAgICAgIChpZGJQcm94eWFibGVUeXBlcyA9IFtcbiAgICAgICAgICAgIElEQkluZGV4LFxuICAgICAgICAgICAgSURCT2JqZWN0U3RvcmUsXG4gICAgICAgICAgICBJREJDdXJzb3IsXG4gICAgICAgICAgICBJREJEYXRhYmFzZSxcbiAgICAgICAgICAgIElEQlRyYW5zYWN0aW9uLFxuICAgICAgICBdKSk7XG59XG4vLyBUaGlzIGlzIGEgZnVuY3Rpb24gdG8gcHJldmVudCBpdCB0aHJvd2luZyB1cCBpbiBub2RlIGVudmlyb25tZW50cy5cbmZ1bmN0aW9uIGdldEN1cnNvckFkdmFuY2VNZXRob2RzKCkge1xuICAgIHJldHVybiAoY3Vyc29yQWR2YW5jZU1ldGhvZHMgfHxcbiAgICAgICAgKGN1cnNvckFkdmFuY2VNZXRob2RzID0gWydhZHZhbmNlJywgJ2NvbnRpbnVlJywgJ2NvbnRpbnVlUHJpbWFyeUtleSddLm1hcCgobWV0aG9kKSA9PiBJREJDdXJzb3IucHJvdG90eXBlW21ldGhvZF0pKSk7XG59XG5jb25zdCB0cmFuc2FjdGlvbkRvbmVNYXAgPSBuZXcgV2Vha01hcCgpO1xuY29uc3QgdHJhbnNmb3JtQ2FjaGUgPSBuZXcgV2Vha01hcCgpO1xuY29uc3QgcmV2ZXJzZVRyYW5zZm9ybUNhY2hlID0gbmV3IFdlYWtNYXAoKTtcbmZ1bmN0aW9uIHByb21pc2lmeVJlcXVlc3QocmVxdWVzdCkge1xuICAgIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IHVubGlzdGVuID0gKCkgPT4ge1xuICAgICAgICAgICAgcmVxdWVzdC5yZW1vdmVFdmVudExpc3RlbmVyKCdzdWNjZXNzJywgc3VjY2Vzcyk7XG4gICAgICAgICAgICByZXF1ZXN0LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZXJyb3IpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBzdWNjZXNzID0gKCkgPT4ge1xuICAgICAgICAgICAgcmVzb2x2ZSh3cmFwKHJlcXVlc3QucmVzdWx0KSk7XG4gICAgICAgICAgICB1bmxpc3RlbigpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBlcnJvciA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlamVjdChyZXF1ZXN0LmVycm9yKTtcbiAgICAgICAgICAgIHVubGlzdGVuKCk7XG4gICAgICAgIH07XG4gICAgICAgIHJlcXVlc3QuYWRkRXZlbnRMaXN0ZW5lcignc3VjY2VzcycsIHN1Y2Nlc3MpO1xuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgZXJyb3IpO1xuICAgIH0pO1xuICAgIC8vIFRoaXMgbWFwcGluZyBleGlzdHMgaW4gcmV2ZXJzZVRyYW5zZm9ybUNhY2hlIGJ1dCBkb2Vzbid0IGV4aXN0IGluIHRyYW5zZm9ybUNhY2hlLiBUaGlzXG4gICAgLy8gaXMgYmVjYXVzZSB3ZSBjcmVhdGUgbWFueSBwcm9taXNlcyBmcm9tIGEgc2luZ2xlIElEQlJlcXVlc3QuXG4gICAgcmV2ZXJzZVRyYW5zZm9ybUNhY2hlLnNldChwcm9taXNlLCByZXF1ZXN0KTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbn1cbmZ1bmN0aW9uIGNhY2hlRG9uZVByb21pc2VGb3JUcmFuc2FjdGlvbih0eCkge1xuICAgIC8vIEVhcmx5IGJhaWwgaWYgd2UndmUgYWxyZWFkeSBjcmVhdGVkIGEgZG9uZSBwcm9taXNlIGZvciB0aGlzIHRyYW5zYWN0aW9uLlxuICAgIGlmICh0cmFuc2FjdGlvbkRvbmVNYXAuaGFzKHR4KSlcbiAgICAgICAgcmV0dXJuO1xuICAgIGNvbnN0IGRvbmUgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IHVubGlzdGVuID0gKCkgPT4ge1xuICAgICAgICAgICAgdHgucmVtb3ZlRXZlbnRMaXN0ZW5lcignY29tcGxldGUnLCBjb21wbGV0ZSk7XG4gICAgICAgICAgICB0eC5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIGVycm9yKTtcbiAgICAgICAgICAgIHR4LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Fib3J0JywgZXJyb3IpO1xuICAgICAgICB9O1xuICAgICAgICBjb25zdCBjb21wbGV0ZSA9ICgpID0+IHtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIHVubGlzdGVuKCk7XG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGVycm9yID0gKCkgPT4ge1xuICAgICAgICAgICAgcmVqZWN0KHR4LmVycm9yIHx8IG5ldyBET01FeGNlcHRpb24oJ0Fib3J0RXJyb3InLCAnQWJvcnRFcnJvcicpKTtcbiAgICAgICAgICAgIHVubGlzdGVuKCk7XG4gICAgICAgIH07XG4gICAgICAgIHR4LmFkZEV2ZW50TGlzdGVuZXIoJ2NvbXBsZXRlJywgY29tcGxldGUpO1xuICAgICAgICB0eC5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGVycm9yKTtcbiAgICAgICAgdHguYWRkRXZlbnRMaXN0ZW5lcignYWJvcnQnLCBlcnJvcik7XG4gICAgfSk7XG4gICAgLy8gQ2FjaGUgaXQgZm9yIGxhdGVyIHJldHJpZXZhbC5cbiAgICB0cmFuc2FjdGlvbkRvbmVNYXAuc2V0KHR4LCBkb25lKTtcbn1cbmxldCBpZGJQcm94eVRyYXBzID0ge1xuICAgIGdldCh0YXJnZXQsIHByb3AsIHJlY2VpdmVyKSB7XG4gICAgICAgIGlmICh0YXJnZXQgaW5zdGFuY2VvZiBJREJUcmFuc2FjdGlvbikge1xuICAgICAgICAgICAgLy8gU3BlY2lhbCBoYW5kbGluZyBmb3IgdHJhbnNhY3Rpb24uZG9uZS5cbiAgICAgICAgICAgIGlmIChwcm9wID09PSAnZG9uZScpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRyYW5zYWN0aW9uRG9uZU1hcC5nZXQodGFyZ2V0KTtcbiAgICAgICAgICAgIC8vIE1ha2UgdHguc3RvcmUgcmV0dXJuIHRoZSBvbmx5IHN0b3JlIGluIHRoZSB0cmFuc2FjdGlvbiwgb3IgdW5kZWZpbmVkIGlmIHRoZXJlIGFyZSBtYW55LlxuICAgICAgICAgICAgaWYgKHByb3AgPT09ICdzdG9yZScpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVjZWl2ZXIub2JqZWN0U3RvcmVOYW1lc1sxXVxuICAgICAgICAgICAgICAgICAgICA/IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICA6IHJlY2VpdmVyLm9iamVjdFN0b3JlKHJlY2VpdmVyLm9iamVjdFN0b3JlTmFtZXNbMF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIEVsc2UgdHJhbnNmb3JtIHdoYXRldmVyIHdlIGdldCBiYWNrLlxuICAgICAgICByZXR1cm4gd3JhcCh0YXJnZXRbcHJvcF0pO1xuICAgIH0sXG4gICAgc2V0KHRhcmdldCwgcHJvcCwgdmFsdWUpIHtcbiAgICAgICAgdGFyZ2V0W3Byb3BdID0gdmFsdWU7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG4gICAgaGFzKHRhcmdldCwgcHJvcCkge1xuICAgICAgICBpZiAodGFyZ2V0IGluc3RhbmNlb2YgSURCVHJhbnNhY3Rpb24gJiZcbiAgICAgICAgICAgIChwcm9wID09PSAnZG9uZScgfHwgcHJvcCA9PT0gJ3N0b3JlJykpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwcm9wIGluIHRhcmdldDtcbiAgICB9LFxufTtcbmZ1bmN0aW9uIHJlcGxhY2VUcmFwcyhjYWxsYmFjaykge1xuICAgIGlkYlByb3h5VHJhcHMgPSBjYWxsYmFjayhpZGJQcm94eVRyYXBzKTtcbn1cbmZ1bmN0aW9uIHdyYXBGdW5jdGlvbihmdW5jKSB7XG4gICAgLy8gRHVlIHRvIGV4cGVjdGVkIG9iamVjdCBlcXVhbGl0eSAod2hpY2ggaXMgZW5mb3JjZWQgYnkgdGhlIGNhY2hpbmcgaW4gYHdyYXBgKSwgd2VcbiAgICAvLyBvbmx5IGNyZWF0ZSBvbmUgbmV3IGZ1bmMgcGVyIGZ1bmMuXG4gICAgLy8gQ3Vyc29yIG1ldGhvZHMgYXJlIHNwZWNpYWwsIGFzIHRoZSBiZWhhdmlvdXIgaXMgYSBsaXR0bGUgbW9yZSBkaWZmZXJlbnQgdG8gc3RhbmRhcmQgSURCLiBJblxuICAgIC8vIElEQiwgeW91IGFkdmFuY2UgdGhlIGN1cnNvciBhbmQgd2FpdCBmb3IgYSBuZXcgJ3N1Y2Nlc3MnIG9uIHRoZSBJREJSZXF1ZXN0IHRoYXQgZ2F2ZSB5b3UgdGhlXG4gICAgLy8gY3Vyc29yLiBJdCdzIGtpbmRhIGxpa2UgYSBwcm9taXNlIHRoYXQgY2FuIHJlc29sdmUgd2l0aCBtYW55IHZhbHVlcy4gVGhhdCBkb2Vzbid0IG1ha2Ugc2Vuc2VcbiAgICAvLyB3aXRoIHJlYWwgcHJvbWlzZXMsIHNvIGVhY2ggYWR2YW5jZSBtZXRob2RzIHJldHVybnMgYSBuZXcgcHJvbWlzZSBmb3IgdGhlIGN1cnNvciBvYmplY3QsIG9yXG4gICAgLy8gdW5kZWZpbmVkIGlmIHRoZSBlbmQgb2YgdGhlIGN1cnNvciBoYXMgYmVlbiByZWFjaGVkLlxuICAgIGlmIChnZXRDdXJzb3JBZHZhbmNlTWV0aG9kcygpLmluY2x1ZGVzKGZ1bmMpKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICAgICAgLy8gQ2FsbGluZyB0aGUgb3JpZ2luYWwgZnVuY3Rpb24gd2l0aCB0aGUgcHJveHkgYXMgJ3RoaXMnIGNhdXNlcyBJTExFR0FMIElOVk9DQVRJT04sIHNvIHdlIHVzZVxuICAgICAgICAgICAgLy8gdGhlIG9yaWdpbmFsIG9iamVjdC5cbiAgICAgICAgICAgIGZ1bmMuYXBwbHkodW53cmFwKHRoaXMpLCBhcmdzKTtcbiAgICAgICAgICAgIHJldHVybiB3cmFwKHRoaXMucmVxdWVzdCk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICAvLyBDYWxsaW5nIHRoZSBvcmlnaW5hbCBmdW5jdGlvbiB3aXRoIHRoZSBwcm94eSBhcyAndGhpcycgY2F1c2VzIElMTEVHQUwgSU5WT0NBVElPTiwgc28gd2UgdXNlXG4gICAgICAgIC8vIHRoZSBvcmlnaW5hbCBvYmplY3QuXG4gICAgICAgIHJldHVybiB3cmFwKGZ1bmMuYXBwbHkodW53cmFwKHRoaXMpLCBhcmdzKSk7XG4gICAgfTtcbn1cbmZ1bmN0aW9uIHRyYW5zZm9ybUNhY2hhYmxlVmFsdWUodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnZnVuY3Rpb24nKVxuICAgICAgICByZXR1cm4gd3JhcEZ1bmN0aW9uKHZhbHVlKTtcbiAgICAvLyBUaGlzIGRvZXNuJ3QgcmV0dXJuLCBpdCBqdXN0IGNyZWF0ZXMgYSAnZG9uZScgcHJvbWlzZSBmb3IgdGhlIHRyYW5zYWN0aW9uLFxuICAgIC8vIHdoaWNoIGlzIGxhdGVyIHJldHVybmVkIGZvciB0cmFuc2FjdGlvbi5kb25lIChzZWUgaWRiT2JqZWN0SGFuZGxlcikuXG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgSURCVHJhbnNhY3Rpb24pXG4gICAgICAgIGNhY2hlRG9uZVByb21pc2VGb3JUcmFuc2FjdGlvbih2YWx1ZSk7XG4gICAgaWYgKGluc3RhbmNlT2ZBbnkodmFsdWUsIGdldElkYlByb3h5YWJsZVR5cGVzKCkpKVxuICAgICAgICByZXR1cm4gbmV3IFByb3h5KHZhbHVlLCBpZGJQcm94eVRyYXBzKTtcbiAgICAvLyBSZXR1cm4gdGhlIHNhbWUgdmFsdWUgYmFjayBpZiB3ZSdyZSBub3QgZ29pbmcgdG8gdHJhbnNmb3JtIGl0LlxuICAgIHJldHVybiB2YWx1ZTtcbn1cbmZ1bmN0aW9uIHdyYXAodmFsdWUpIHtcbiAgICAvLyBXZSBzb21ldGltZXMgZ2VuZXJhdGUgbXVsdGlwbGUgcHJvbWlzZXMgZnJvbSBhIHNpbmdsZSBJREJSZXF1ZXN0IChlZyB3aGVuIGN1cnNvcmluZyksIGJlY2F1c2VcbiAgICAvLyBJREIgaXMgd2VpcmQgYW5kIGEgc2luZ2xlIElEQlJlcXVlc3QgY2FuIHlpZWxkIG1hbnkgcmVzcG9uc2VzLCBzbyB0aGVzZSBjYW4ndCBiZSBjYWNoZWQuXG4gICAgaWYgKHZhbHVlIGluc3RhbmNlb2YgSURCUmVxdWVzdClcbiAgICAgICAgcmV0dXJuIHByb21pc2lmeVJlcXVlc3QodmFsdWUpO1xuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgdHJhbnNmb3JtZWQgdGhpcyB2YWx1ZSBiZWZvcmUsIHJldXNlIHRoZSB0cmFuc2Zvcm1lZCB2YWx1ZS5cbiAgICAvLyBUaGlzIGlzIGZhc3RlciwgYnV0IGl0IGFsc28gcHJvdmlkZXMgb2JqZWN0IGVxdWFsaXR5LlxuICAgIGlmICh0cmFuc2Zvcm1DYWNoZS5oYXModmFsdWUpKVxuICAgICAgICByZXR1cm4gdHJhbnNmb3JtQ2FjaGUuZ2V0KHZhbHVlKTtcbiAgICBjb25zdCBuZXdWYWx1ZSA9IHRyYW5zZm9ybUNhY2hhYmxlVmFsdWUodmFsdWUpO1xuICAgIC8vIE5vdCBhbGwgdHlwZXMgYXJlIHRyYW5zZm9ybWVkLlxuICAgIC8vIFRoZXNlIG1heSBiZSBwcmltaXRpdmUgdHlwZXMsIHNvIHRoZXkgY2FuJ3QgYmUgV2Vha01hcCBrZXlzLlxuICAgIGlmICghT2JqZWN0LmlzKG5ld1ZhbHVlLCB2YWx1ZSkpIHtcbiAgICAgICAgdHJhbnNmb3JtQ2FjaGUuc2V0KHZhbHVlLCBuZXdWYWx1ZSk7XG4gICAgICAgIHJldmVyc2VUcmFuc2Zvcm1DYWNoZS5zZXQobmV3VmFsdWUsIHZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ld1ZhbHVlO1xufVxuY29uc3QgdW53cmFwID0gKHZhbHVlKSA9PiByZXZlcnNlVHJhbnNmb3JtQ2FjaGUuZ2V0KHZhbHVlKTtcblxuLyoqXG4gKiBPcGVuIGEgZGF0YWJhc2UuXG4gKlxuICogQHBhcmFtIG5hbWUgTmFtZSBvZiB0aGUgZGF0YWJhc2UuXG4gKiBAcGFyYW0gdmVyc2lvbiBTY2hlbWEgdmVyc2lvbi5cbiAqIEBwYXJhbSBjYWxsYmFja3MgQWRkaXRpb25hbCBjYWxsYmFja3MuXG4gKi9cbmZ1bmN0aW9uIG9wZW5EQihuYW1lLCB2ZXJzaW9uLCB7IGJsb2NrZWQsIHVwZ3JhZGUsIGJsb2NraW5nLCB0ZXJtaW5hdGVkIH0gPSB7fSkge1xuICAgIGNvbnN0IHJlcXVlc3QgPSBpbmRleGVkREIub3BlbihuYW1lLCB2ZXJzaW9uKTtcbiAgICBjb25zdCBvcGVuUHJvbWlzZSA9IHdyYXAocmVxdWVzdCk7XG4gICAgaWYgKHVwZ3JhZGUpIHtcbiAgICAgICAgcmVxdWVzdC5hZGRFdmVudExpc3RlbmVyKCd1cGdyYWRlbmVlZGVkJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICB1cGdyYWRlKHdyYXAocmVxdWVzdC5yZXN1bHQpLCBldmVudC5vbGRWZXJzaW9uLCBldmVudC5uZXdWZXJzaW9uLCB3cmFwKHJlcXVlc3QudHJhbnNhY3Rpb24pLCBldmVudCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoYmxvY2tlZCkge1xuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2Jsb2NrZWQnLCAoZXZlbnQpID0+IGJsb2NrZWQoXG4gICAgICAgIC8vIENhc3RpbmcgZHVlIHRvIGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvVHlwZVNjcmlwdC1ET00tbGliLWdlbmVyYXRvci9wdWxsLzE0MDVcbiAgICAgICAgZXZlbnQub2xkVmVyc2lvbiwgZXZlbnQubmV3VmVyc2lvbiwgZXZlbnQpKTtcbiAgICB9XG4gICAgb3BlblByb21pc2VcbiAgICAgICAgLnRoZW4oKGRiKSA9PiB7XG4gICAgICAgIGlmICh0ZXJtaW5hdGVkKVxuICAgICAgICAgICAgZGIuYWRkRXZlbnRMaXN0ZW5lcignY2xvc2UnLCAoKSA9PiB0ZXJtaW5hdGVkKCkpO1xuICAgICAgICBpZiAoYmxvY2tpbmcpIHtcbiAgICAgICAgICAgIGRiLmFkZEV2ZW50TGlzdGVuZXIoJ3ZlcnNpb25jaGFuZ2UnLCAoZXZlbnQpID0+IGJsb2NraW5nKGV2ZW50Lm9sZFZlcnNpb24sIGV2ZW50Lm5ld1ZlcnNpb24sIGV2ZW50KSk7XG4gICAgICAgIH1cbiAgICB9KVxuICAgICAgICAuY2F0Y2goKCkgPT4geyB9KTtcbiAgICByZXR1cm4gb3BlblByb21pc2U7XG59XG4vKipcbiAqIERlbGV0ZSBhIGRhdGFiYXNlLlxuICpcbiAqIEBwYXJhbSBuYW1lIE5hbWUgb2YgdGhlIGRhdGFiYXNlLlxuICovXG5mdW5jdGlvbiBkZWxldGVEQihuYW1lLCB7IGJsb2NrZWQgfSA9IHt9KSB7XG4gICAgY29uc3QgcmVxdWVzdCA9IGluZGV4ZWREQi5kZWxldGVEYXRhYmFzZShuYW1lKTtcbiAgICBpZiAoYmxvY2tlZCkge1xuICAgICAgICByZXF1ZXN0LmFkZEV2ZW50TGlzdGVuZXIoJ2Jsb2NrZWQnLCAoZXZlbnQpID0+IGJsb2NrZWQoXG4gICAgICAgIC8vIENhc3RpbmcgZHVlIHRvIGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvVHlwZVNjcmlwdC1ET00tbGliLWdlbmVyYXRvci9wdWxsLzE0MDVcbiAgICAgICAgZXZlbnQub2xkVmVyc2lvbiwgZXZlbnQpKTtcbiAgICB9XG4gICAgcmV0dXJuIHdyYXAocmVxdWVzdCkudGhlbigoKSA9PiB1bmRlZmluZWQpO1xufVxuXG5jb25zdCByZWFkTWV0aG9kcyA9IFsnZ2V0JywgJ2dldEtleScsICdnZXRBbGwnLCAnZ2V0QWxsS2V5cycsICdjb3VudCddO1xuY29uc3Qgd3JpdGVNZXRob2RzID0gWydwdXQnLCAnYWRkJywgJ2RlbGV0ZScsICdjbGVhciddO1xuY29uc3QgY2FjaGVkTWV0aG9kcyA9IHt9O1xuZnVuY3Rpb24gZ2V0TWV0aG9kKHRhcmdldCwgcHJvcCkge1xuICAgIGlmICghKHRhcmdldCBpbnN0YW5jZW9mIElEQkRhdGFiYXNlICYmXG4gICAgICAgICEocHJvcCBpbiB0YXJnZXQpICYmXG4gICAgICAgIHR5cGVvZiBwcm9wID09PSAnc3RyaW5nJykpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoY2FjaGVkTWV0aG9kc1twcm9wXSlcbiAgICAgICAgcmV0dXJuIGNhY2hlZE1ldGhvZHNbcHJvcF07XG4gICAgY29uc3QgdGFyZ2V0RnVuY05hbWUgPSBwcm9wLnJlcGxhY2UoL0Zyb21JbmRleCQvLCAnJyk7XG4gICAgY29uc3QgdXNlSW5kZXggPSBwcm9wICE9PSB0YXJnZXRGdW5jTmFtZTtcbiAgICBjb25zdCBpc1dyaXRlID0gd3JpdGVNZXRob2RzLmluY2x1ZGVzKHRhcmdldEZ1bmNOYW1lKTtcbiAgICBpZiAoXG4gICAgLy8gQmFpbCBpZiB0aGUgdGFyZ2V0IGRvZXNuJ3QgZXhpc3Qgb24gdGhlIHRhcmdldC4gRWcsIGdldEFsbCBpc24ndCBpbiBFZGdlLlxuICAgICEodGFyZ2V0RnVuY05hbWUgaW4gKHVzZUluZGV4ID8gSURCSW5kZXggOiBJREJPYmplY3RTdG9yZSkucHJvdG90eXBlKSB8fFxuICAgICAgICAhKGlzV3JpdGUgfHwgcmVhZE1ldGhvZHMuaW5jbHVkZXModGFyZ2V0RnVuY05hbWUpKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG1ldGhvZCA9IGFzeW5jIGZ1bmN0aW9uIChzdG9yZU5hbWUsIC4uLmFyZ3MpIHtcbiAgICAgICAgLy8gaXNXcml0ZSA/ICdyZWFkd3JpdGUnIDogdW5kZWZpbmVkIGd6aXBwcyBiZXR0ZXIsIGJ1dCBmYWlscyBpbiBFZGdlIDooXG4gICAgICAgIGNvbnN0IHR4ID0gdGhpcy50cmFuc2FjdGlvbihzdG9yZU5hbWUsIGlzV3JpdGUgPyAncmVhZHdyaXRlJyA6ICdyZWFkb25seScpO1xuICAgICAgICBsZXQgdGFyZ2V0ID0gdHguc3RvcmU7XG4gICAgICAgIGlmICh1c2VJbmRleClcbiAgICAgICAgICAgIHRhcmdldCA9IHRhcmdldC5pbmRleChhcmdzLnNoaWZ0KCkpO1xuICAgICAgICAvLyBNdXN0IHJlamVjdCBpZiBvcCByZWplY3RzLlxuICAgICAgICAvLyBJZiBpdCdzIGEgd3JpdGUgb3BlcmF0aW9uLCBtdXN0IHJlamVjdCBpZiB0eC5kb25lIHJlamVjdHMuXG4gICAgICAgIC8vIE11c3QgcmVqZWN0IHdpdGggb3AgcmVqZWN0aW9uIGZpcnN0LlxuICAgICAgICAvLyBNdXN0IHJlc29sdmUgd2l0aCBvcCB2YWx1ZS5cbiAgICAgICAgLy8gTXVzdCBoYW5kbGUgYm90aCBwcm9taXNlcyAobm8gdW5oYW5kbGVkIHJlamVjdGlvbnMpXG4gICAgICAgIHJldHVybiAoYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAgICAgdGFyZ2V0W3RhcmdldEZ1bmNOYW1lXSguLi5hcmdzKSxcbiAgICAgICAgICAgIGlzV3JpdGUgJiYgdHguZG9uZSxcbiAgICAgICAgXSkpWzBdO1xuICAgIH07XG4gICAgcmV0dXJuIChjYWNoZWRNZXRob2RzW3Byb3BdID0gbWV0aG9kKTtcbn1cbnJlcGxhY2VUcmFwcygob2xkVHJhcHMpID0+ICh7XG4gICAgLi4ub2xkVHJhcHMsXG4gICAgZ2V0OiAodGFyZ2V0LCBwcm9wLCByZWNlaXZlcikgPT4gZ2V0TWV0aG9kKHRhcmdldCwgcHJvcCkgfHwgb2xkVHJhcHMuZ2V0KHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpLFxuICAgIGhhczogKHRhcmdldCwgcHJvcCkgPT4gISFnZXRNZXRob2QodGFyZ2V0LCBwcm9wKSB8fCBvbGRUcmFwcy5oYXModGFyZ2V0LCBwcm9wKSxcbn0pKTtcblxuY29uc3QgYWR2YW5jZU1ldGhvZFByb3BzID0gWydhZHZhbmNlJywgJ2NvbnRpbnVlJywgJ2NvbnRpbnVlUHJpbWFyeUtleSddO1xuY29uc3QgbWV0aG9kTWFwID0ge307XG5jb25zdCBhZHZhbmNlUmVzdWx0cyA9IG5ldyBXZWFrTWFwKCk7XG5jb25zdCBpdHRyUHJveGllZEN1cnNvclRvT3JpZ2luYWxQcm94eSA9IG5ldyBXZWFrTWFwKCk7XG5jb25zdCBjdXJzb3JJdGVyYXRvclRyYXBzID0ge1xuICAgIGdldCh0YXJnZXQsIHByb3ApIHtcbiAgICAgICAgaWYgKCFhZHZhbmNlTWV0aG9kUHJvcHMuaW5jbHVkZXMocHJvcCkpXG4gICAgICAgICAgICByZXR1cm4gdGFyZ2V0W3Byb3BdO1xuICAgICAgICBsZXQgY2FjaGVkRnVuYyA9IG1ldGhvZE1hcFtwcm9wXTtcbiAgICAgICAgaWYgKCFjYWNoZWRGdW5jKSB7XG4gICAgICAgICAgICBjYWNoZWRGdW5jID0gbWV0aG9kTWFwW3Byb3BdID0gZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgICAgICBhZHZhbmNlUmVzdWx0cy5zZXQodGhpcywgaXR0clByb3hpZWRDdXJzb3JUb09yaWdpbmFsUHJveHkuZ2V0KHRoaXMpW3Byb3BdKC4uLmFyZ3MpKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNhY2hlZEZ1bmM7XG4gICAgfSxcbn07XG5hc3luYyBmdW5jdGlvbiogaXRlcmF0ZSguLi5hcmdzKSB7XG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm5vLXRoaXMtYXNzaWdubWVudFxuICAgIGxldCBjdXJzb3IgPSB0aGlzO1xuICAgIGlmICghKGN1cnNvciBpbnN0YW5jZW9mIElEQkN1cnNvcikpIHtcbiAgICAgICAgY3Vyc29yID0gYXdhaXQgY3Vyc29yLm9wZW5DdXJzb3IoLi4uYXJncyk7XG4gICAgfVxuICAgIGlmICghY3Vyc29yKVxuICAgICAgICByZXR1cm47XG4gICAgY3Vyc29yID0gY3Vyc29yO1xuICAgIGNvbnN0IHByb3hpZWRDdXJzb3IgPSBuZXcgUHJveHkoY3Vyc29yLCBjdXJzb3JJdGVyYXRvclRyYXBzKTtcbiAgICBpdHRyUHJveGllZEN1cnNvclRvT3JpZ2luYWxQcm94eS5zZXQocHJveGllZEN1cnNvciwgY3Vyc29yKTtcbiAgICAvLyBNYXAgdGhpcyBkb3VibGUtcHJveHkgYmFjayB0byB0aGUgb3JpZ2luYWwsIHNvIG90aGVyIGN1cnNvciBtZXRob2RzIHdvcmsuXG4gICAgcmV2ZXJzZVRyYW5zZm9ybUNhY2hlLnNldChwcm94aWVkQ3Vyc29yLCB1bndyYXAoY3Vyc29yKSk7XG4gICAgd2hpbGUgKGN1cnNvcikge1xuICAgICAgICB5aWVsZCBwcm94aWVkQ3Vyc29yO1xuICAgICAgICAvLyBJZiBvbmUgb2YgdGhlIGFkdmFuY2luZyBtZXRob2RzIHdhcyBub3QgY2FsbGVkLCBjYWxsIGNvbnRpbnVlKCkuXG4gICAgICAgIGN1cnNvciA9IGF3YWl0IChhZHZhbmNlUmVzdWx0cy5nZXQocHJveGllZEN1cnNvcikgfHwgY3Vyc29yLmNvbnRpbnVlKCkpO1xuICAgICAgICBhZHZhbmNlUmVzdWx0cy5kZWxldGUocHJveGllZEN1cnNvcik7XG4gICAgfVxufVxuZnVuY3Rpb24gaXNJdGVyYXRvclByb3AodGFyZ2V0LCBwcm9wKSB7XG4gICAgcmV0dXJuICgocHJvcCA9PT0gU3ltYm9sLmFzeW5jSXRlcmF0b3IgJiZcbiAgICAgICAgaW5zdGFuY2VPZkFueSh0YXJnZXQsIFtJREJJbmRleCwgSURCT2JqZWN0U3RvcmUsIElEQkN1cnNvcl0pKSB8fFxuICAgICAgICAocHJvcCA9PT0gJ2l0ZXJhdGUnICYmIGluc3RhbmNlT2ZBbnkodGFyZ2V0LCBbSURCSW5kZXgsIElEQk9iamVjdFN0b3JlXSkpKTtcbn1cbnJlcGxhY2VUcmFwcygob2xkVHJhcHMpID0+ICh7XG4gICAgLi4ub2xkVHJhcHMsXG4gICAgZ2V0KHRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpIHtcbiAgICAgICAgaWYgKGlzSXRlcmF0b3JQcm9wKHRhcmdldCwgcHJvcCkpXG4gICAgICAgICAgICByZXR1cm4gaXRlcmF0ZTtcbiAgICAgICAgcmV0dXJuIG9sZFRyYXBzLmdldCh0YXJnZXQsIHByb3AsIHJlY2VpdmVyKTtcbiAgICB9LFxuICAgIGhhcyh0YXJnZXQsIHByb3ApIHtcbiAgICAgICAgcmV0dXJuIGlzSXRlcmF0b3JQcm9wKHRhcmdldCwgcHJvcCkgfHwgb2xkVHJhcHMuaGFzKHRhcmdldCwgcHJvcCk7XG4gICAgfSxcbn0pKTtcblxuZXhwb3J0IHsgZGVsZXRlREIsIG9wZW5EQiwgdW53cmFwLCB3cmFwIH07XG4iLCAiaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi4vdXRpbGl0aWVzL2Jyb3dzZXItcG9seWZpbGwnO1xuaW1wb3J0IHsgaW5zQ29uZmlybSB9IGZyb20gJy4uL2lucy1jb25maXJtLmpzJztcbmltcG9ydCB7XG4gICAgZ2V0QXBpS2V5U3RvcmUsXG4gICAgc2F2ZUFwaUtleSxcbiAgICBkZWxldGVBcGlLZXksXG4gICAgbGlzdEFwaUtleXMsXG4gICAgc2V0U3luY0VuYWJsZWQsXG4gICAgaXNTeW5jRW5hYmxlZCxcbiAgICB1cGRhdGVTdG9yZVN5bmNTdGF0ZSxcbiAgICBleHBvcnRTdG9yZSxcbiAgICBpbXBvcnRTdG9yZSxcbn0gZnJvbSAnLi4vdXRpbGl0aWVzL2FwaS1rZXktc3RvcmUnO1xuXG5jb25zdCBzdGF0ZSA9IHtcbiAgICBrZXlzOiBbXSxcbiAgICBuZXdMYWJlbDogJycsXG4gICAgbmV3U2VjcmV0OiAnJyxcbiAgICBlZGl0aW5nSWQ6IG51bGwsXG4gICAgZWRpdExhYmVsOiAnJyxcbiAgICBlZGl0U2VjcmV0OiAnJyxcbiAgICBjb3BpZWRJZDogbnVsbCxcbiAgICByZXZlYWxlZElkOiBudWxsLFxuICAgIHN5bmNFbmFibGVkOiB0cnVlLFxuICAgIGdsb2JhbFN5bmNTdGF0dXM6ICdpZGxlJyxcbiAgICBzeW5jRXJyb3I6ICcnLFxuICAgIHNhdmluZzogZmFsc2UsXG4gICAgdG9hc3Q6ICcnLFxuICAgIHJlbGF5SW5mbzogeyByZWFkOiBbXSwgd3JpdGU6IFtdIH0sXG59O1xuXG5mdW5jdGlvbiAkKGlkKSB7IHJldHVybiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7IH1cblxuZnVuY3Rpb24gaGFzUmVsYXlzKCkge1xuICAgIHJldHVybiBzdGF0ZS5yZWxheUluZm8ucmVhZC5sZW5ndGggPiAwIHx8IHN0YXRlLnJlbGF5SW5mby53cml0ZS5sZW5ndGggPiAwO1xufVxuXG5mdW5jdGlvbiBzb3J0ZWRLZXlzKCkge1xuICAgIHJldHVybiBbLi4uc3RhdGUua2V5c10uc29ydCgoYSwgYikgPT5cbiAgICAgICAgYS5sYWJlbC50b0xvd2VyQ2FzZSgpLmxvY2FsZUNvbXBhcmUoYi5sYWJlbC50b0xvd2VyQ2FzZSgpKSxcbiAgICApO1xufVxuXG5mdW5jdGlvbiBtYXNrU2VjcmV0KHNlY3JldCkge1xuICAgIGlmICghc2VjcmV0KSByZXR1cm4gJyc7XG4gICAgaWYgKHNlY3JldC5sZW5ndGggPD0gOCkgcmV0dXJuICdcXHUyMDIyJy5yZXBlYXQoc2VjcmV0Lmxlbmd0aCk7XG4gICAgcmV0dXJuIHNlY3JldC5zbGljZSgwLCA0KSArICdcXHUyMDIyJy5yZXBlYXQoNCkgKyBzZWNyZXQuc2xpY2UoLTQpO1xufVxuXG5mdW5jdGlvbiBzaG93VG9hc3QobXNnKSB7XG4gICAgc3RhdGUudG9hc3QgPSBtc2c7XG4gICAgcmVuZGVyKCk7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7IHN0YXRlLnRvYXN0ID0gJyc7IHJlbmRlcigpOyB9LCAyMDAwKTtcbn1cblxuZnVuY3Rpb24gc3luY1N0YXR1c0NsYXNzKHN0YXR1cykge1xuICAgIGlmIChzdGF0dXMgPT09ICdpZGxlJykgcmV0dXJuIHN0YXRlLnN5bmNFbmFibGVkID8gJ2xlZC0tZ3JlZW4nIDogJ2xlZC0tb2ZmJztcbiAgICBpZiAoc3RhdHVzID09PSAnc3luY2luZycpIHJldHVybiAnbGVkLS1hbWJlciBhbmltYXRlLXB1bHNlJztcbiAgICByZXR1cm4gJ2xlZC0tcmVkJztcbn1cblxuZnVuY3Rpb24gc3luY1N0YXR1c1RleHQoKSB7XG4gICAgaWYgKHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPT09ICdzeW5jaW5nJykgcmV0dXJuICdTeW5jaW5nLi4uJztcbiAgICBpZiAoc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9PT0gJ2Vycm9yJykgcmV0dXJuIHN0YXRlLnN5bmNFcnJvcjtcbiAgICByZXR1cm4gc3RhdGUuc3luY0VuYWJsZWQgPyAnU3luY2VkJyA6ICdMb2NhbCBvbmx5Jztcbn1cblxuLy8gLS0tIFJlbmRlciAtLS1cblxuZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgIC8vIFN5bmMgYmFyXG4gICAgY29uc3Qgc3luY0RvdCA9ICQoJ3N5bmMtZG90Jyk7XG4gICAgY29uc3Qgc3luY1RleHQgPSAkKCdzeW5jLXRleHQnKTtcbiAgICBjb25zdCBzeW5jQnRuID0gJCgnc3luYy1idG4nKTtcbiAgICBjb25zdCBzeW5jVG9nZ2xlID0gJCgnc3luYy10b2dnbGUnKTtcbiAgICBjb25zdCBrZXlDb3VudCA9ICQoJ2tleS1jb3VudCcpO1xuXG4gICAgaWYgKHN5bmNEb3QpIHN5bmNEb3QuY2xhc3NOYW1lID0gYGxlZCAke3N5bmNTdGF0dXNDbGFzcyhzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzKX1gO1xuICAgIGlmIChzeW5jVGV4dCkgc3luY1RleHQudGV4dENvbnRlbnQgPSBzeW5jU3RhdHVzVGV4dCgpO1xuICAgIGlmIChzeW5jQnRuKSBzeW5jQnRuLmRpc2FibGVkID0gc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9PT0gJ3N5bmNpbmcnIHx8ICFoYXNSZWxheXMoKSB8fCAhc3RhdGUuc3luY0VuYWJsZWQ7XG4gICAgaWYgKHN5bmNUb2dnbGUpIHN5bmNUb2dnbGUuc2V0QXR0cmlidXRlKCdhcmlhLXByZXNzZWQnLCBTdHJpbmcoc3RhdGUuc3luY0VuYWJsZWQpKTtcbiAgICBpZiAoa2V5Q291bnQpIGtleUNvdW50LnRleHRDb250ZW50ID0gc3RhdGUua2V5cy5sZW5ndGggKyAnIGtleScgKyAoc3RhdGUua2V5cy5sZW5ndGggIT09IDEgPyAncycgOiAnJyk7XG5cbiAgICAvLyBLZXkgdGFibGVcbiAgICBjb25zdCBrZXlUYWJsZUNvbnRhaW5lciA9ICQoJ2tleS10YWJsZS1jb250YWluZXInKTtcbiAgICBjb25zdCBub0tleXNNc2cgPSAkKCduby1rZXlzJyk7XG4gICAgY29uc3Qga2V5VGFibGVCb2R5ID0gJCgna2V5LXRhYmxlLWJvZHknKTtcblxuICAgIGlmIChrZXlUYWJsZUNvbnRhaW5lcikga2V5VGFibGVDb250YWluZXIuc3R5bGUuZGlzcGxheSA9IHN0YXRlLmtleXMubGVuZ3RoID4gMCA/ICdibG9jaycgOiAnbm9uZSc7XG4gICAgaWYgKG5vS2V5c01zZykgbm9LZXlzTXNnLnN0eWxlLmRpc3BsYXkgPSBzdGF0ZS5rZXlzLmxlbmd0aCA9PT0gMCA/ICdibG9jaycgOiAnbm9uZSc7XG5cbiAgICBpZiAoa2V5VGFibGVCb2R5KSB7XG4gICAgICAgIGNvbnN0IHNvcnRlZCA9IHNvcnRlZEtleXMoKTtcbiAgICAgICAga2V5VGFibGVCb2R5LmlubmVySFRNTCA9IHNvcnRlZC5tYXAoa2V5ID0+IHtcbiAgICAgICAgICAgIGlmIChzdGF0ZS5lZGl0aW5nSWQgPT09IGtleS5pZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBgXG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2R1bGUgaXMtbGl2ZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZHVsZS1oZWFkZXJcIj5FZGl0IGtleTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZHVsZS1ib2R5IGZsZXggZmxleC1jb2wgZ2FwLTJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImlucy1pbnB1dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG9jb21wbGV0ZT1cIm9mZlwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFyaWEtbGFiZWw9XCJLZXkgbGFiZWxcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLWVkaXQtbGFiZWw9XCIke2tleS5pZH1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT1cIiR7ZXNjYXBlQXR0cihzdGF0ZS5lZGl0TGFiZWwpfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzcz1cImlucy1pbnB1dCBtb25vXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0b2NvbXBsZXRlPVwib2ZmXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BlbGxjaGVjaz1cImZhbHNlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1sYWJlbD1cIlNlY3JldCBrZXlcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLWVkaXQtc2VjcmV0PVwiJHtrZXkuaWR9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9XCIke2VzY2FwZUF0dHIoc3RhdGUuZWRpdFNlY3JldCl9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGdhcC0yIGp1c3RpZnktZW5kXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLS1naG9zdCBidG4tLXNtXCIgdHlwZT1cImJ1dHRvblwiIGRhdGEtYWN0aW9uPVwiY2FuY2VsLWVkaXRcIj5DYW5jZWw8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tLXByaW1hcnkgYnRuLS1zbVwiIHR5cGU9XCJidXR0b25cIiBkYXRhLWFjdGlvbj1cInNhdmUtZWRpdFwiPlNhdmU8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICBgO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcmV2ZWFsZWQgPSBzdGF0ZS5yZXZlYWxlZElkID09PSBrZXkuaWQ7XG4gICAgICAgICAgICAvLyBBbiB1bmRlY3J5cHRhYmxlIHNlY3JldCBtdXN0IHJlYWQgYXMgYSBQUk9CTEVNLCBuZXZlciBhcyBibGFuayBcdTIwMTRcbiAgICAgICAgICAgIC8vIGJsYW5rIGlzIHdoYXQgbWFkZSB0aGUgb2xkIGRhdGEgbG9zcyBpbnZpc2libGUuXG4gICAgICAgICAgICBjb25zdCBkaXNwbGF5U2VjcmV0ID0ga2V5LnVuZGVjcnlwdGFibGVcbiAgICAgICAgICAgICAgICA/ICd1bnJlYWRhYmxlIG9uIHRoaXMgZGV2aWNlJ1xuICAgICAgICAgICAgICAgIDogKHJldmVhbGVkID8gZXNjYXBlSHRtbChrZXkuc2VjcmV0KSA6IGVzY2FwZUh0bWwobWFza1NlY3JldChrZXkuc2VjcmV0KSkpO1xuICAgICAgICAgICAgY29uc3QgY29weUxhYmVsID0gc3RhdGUuY29waWVkSWQgPT09IGtleS5pZCA/ICdDb3BpZWQhJyA6ICdDb3B5JztcbiAgICAgICAgICAgIHJldHVybiBgXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm1vZHVsZSR7cmV2ZWFsZWQgPyAnIGlzLWxpdmUnIDogJyd9XCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtb2R1bGUtcm93XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M9XCJwYXRjaC1wb2ludFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS1hY3Rpb249XCJ0b2dnbGUtcmV2ZWFsXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLWtleS1pZD1cIiR7a2V5LmlkfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXJpYS1wcmVzc2VkPVwiJHtyZXZlYWxlZH1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlPVwiJHtyZXZlYWxlZCA/ICdIaWRlIHNlY3JldCcgOiAnUmV2ZWFsIHNlY3JldCd9XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcmlhLWxhYmVsPVwiJHtyZXZlYWxlZCA/ICdIaWRlJyA6ICdSZXZlYWwnfSBzZWNyZXQgZm9yICR7ZXNjYXBlQXR0cihrZXkubGFiZWwpfVwiXG4gICAgICAgICAgICAgICAgICAgICAgICA+PHNwYW4gY2xhc3M9XCJwYXRjaC1qYWNrXCI+PC9zcGFuPjwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggZmxleC1jb2wgZ2FwLTAuNSBtaW4tdy0wIGZsZXgtMVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGV4dC1zbSBmb250LXNlbWlib2xkIGN1cnNvci1wb2ludGVyIGhvdmVyOnVuZGVybGluZVwiIGRhdGEtYWN0aW9uPVwic3RhcnQtZWRpdFwiIGRhdGEta2V5LWlkPVwiJHtrZXkuaWR9XCIgdGl0bGU9XCJFZGl0IGtleVwiPiR7ZXNjYXBlSHRtbChrZXkubGFiZWwpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cIm1vbm8gdGV4dC14cyAke3JldmVhbGVkID8gJycgOiAnaW5zLW11dGVkICd9aW5zLXRydW5jYXRlIGN1cnNvci1wb2ludGVyXCIgZGF0YS1hY3Rpb249XCJ0b2dnbGUtcmV2ZWFsXCIgZGF0YS1rZXktaWQ9XCIke2tleS5pZH1cIj4ke2Rpc3BsYXlTZWNyZXR9PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInJvdy12YWx1ZVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJidG4gYnRuLS1zbVwiIHR5cGU9XCJidXR0b25cIiBkYXRhLWFjdGlvbj1cImNvcHktc2VjcmV0XCIgZGF0YS1rZXktaWQ9XCIke2tleS5pZH1cIj4ke2NvcHlMYWJlbH08L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi0tc20gYnRuLS1kZXN0cnVjdGl2ZVwiIHR5cGU9XCJidXR0b25cIiBkYXRhLWFjdGlvbj1cImRlbGV0ZS1rZXlcIiBkYXRhLWtleS1pZD1cIiR7a2V5LmlkfVwiPkRlbDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIGA7XG4gICAgICAgIH0pLmpvaW4oJycpO1xuXG4gICAgICAgIC8vIEJpbmQgdGFibGUgZXZlbnRzXG4gICAgICAgIGtleVRhYmxlQm9keS5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1hY3Rpb249XCJzdGFydC1lZGl0XCJdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHN0YXJ0RWRpdChlbC5kYXRhc2V0LmtleUlkKSk7XG4gICAgICAgIH0pO1xuICAgICAgICBrZXlUYWJsZUJvZHkucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtYWN0aW9uPVwidG9nZ2xlLXJldmVhbFwiXScpLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgc3RhdGUucmV2ZWFsZWRJZCA9IHN0YXRlLnJldmVhbGVkSWQgPT09IGVsLmRhdGFzZXQua2V5SWQgPyBudWxsIDogZWwuZGF0YXNldC5rZXlJZDtcbiAgICAgICAgICAgICAgICByZW5kZXIoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAga2V5VGFibGVCb2R5LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWFjdGlvbj1cImNvcHktc2VjcmV0XCJdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IGNvcHlTZWNyZXQoZWwuZGF0YXNldC5rZXlJZCkpO1xuICAgICAgICB9KTtcbiAgICAgICAga2V5VGFibGVCb2R5LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWFjdGlvbj1cImRlbGV0ZS1rZXlcIl0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gZGVsZXRlS2V5KGVsLmRhdGFzZXQua2V5SWQpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGtleVRhYmxlQm9keS5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1hY3Rpb249XCJzYXZlLWVkaXRcIl0nKS5mb3JFYWNoKGVsID0+IHtcbiAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc2F2ZUVkaXQpO1xuICAgICAgICB9KTtcbiAgICAgICAga2V5VGFibGVCb2R5LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWFjdGlvbj1cImNhbmNlbC1lZGl0XCJdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNhbmNlbEVkaXQpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBCaW5kIGVkaXQgaW5wdXQgZXZlbnRzXG4gICAgICAgIGtleVRhYmxlQm9keS5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1lZGl0LWxhYmVsXScpLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4geyBzdGF0ZS5lZGl0TGFiZWwgPSBlLnRhcmdldC52YWx1ZTsgfSk7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGUua2V5ID09PSAnRW50ZXInKSBzYXZlRWRpdCgpO1xuICAgICAgICAgICAgICAgIGlmIChlLmtleSA9PT0gJ0VzY2FwZScpIGNhbmNlbEVkaXQoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAga2V5VGFibGVCb2R5LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWVkaXQtc2VjcmV0XScpLmZvckVhY2goZWwgPT4ge1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4geyBzdGF0ZS5lZGl0U2VjcmV0ID0gZS50YXJnZXQudmFsdWU7IH0pO1xuICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlLmtleSA9PT0gJ0VudGVyJykgc2F2ZUVkaXQoKTtcbiAgICAgICAgICAgICAgICBpZiAoZS5rZXkgPT09ICdFc2NhcGUnKSBjYW5jZWxFZGl0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gQWRkIGtleSBmb3JtXG4gICAgY29uc3QgbmV3TGFiZWxJbnB1dCA9ICQoJ25ldy1sYWJlbCcpO1xuICAgIGNvbnN0IG5ld1NlY3JldElucHV0ID0gJCgnbmV3LXNlY3JldCcpO1xuICAgIGNvbnN0IGFkZEtleUJ0biA9ICQoJ2FkZC1rZXktYnRuJyk7XG5cbiAgICBpZiAobmV3TGFiZWxJbnB1dCAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9PSBuZXdMYWJlbElucHV0KSBuZXdMYWJlbElucHV0LnZhbHVlID0gc3RhdGUubmV3TGFiZWw7XG4gICAgaWYgKG5ld1NlY3JldElucHV0ICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT09IG5ld1NlY3JldElucHV0KSBuZXdTZWNyZXRJbnB1dC52YWx1ZSA9IHN0YXRlLm5ld1NlY3JldDtcbiAgICBpZiAoYWRkS2V5QnRuKSB7XG4gICAgICAgIGFkZEtleUJ0bi5kaXNhYmxlZCA9IHN0YXRlLnNhdmluZyB8fCBzdGF0ZS5uZXdMYWJlbC50cmltKCkubGVuZ3RoID09PSAwIHx8IHN0YXRlLm5ld1NlY3JldC50cmltKCkubGVuZ3RoID09PSAwO1xuICAgICAgICBhZGRLZXlCdG4udGV4dENvbnRlbnQgPSBzdGF0ZS5zYXZpbmcgPyAnU2F2aW5nLi4uJyA6ICdTYXZlJztcbiAgICB9XG5cbiAgICAvLyBUb2FzdFxuICAgIGNvbnN0IHRvYXN0ID0gJCgndG9hc3QnKTtcbiAgICBpZiAodG9hc3QpIHtcbiAgICAgICAgdG9hc3QudGV4dENvbnRlbnQgPSBzdGF0ZS50b2FzdDtcbiAgICAgICAgdG9hc3Quc3R5bGUuZGlzcGxheSA9IHN0YXRlLnRvYXN0ID8gJ2Jsb2NrJyA6ICdub25lJztcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGVzY2FwZUh0bWwoc3RyKSB7XG4gICAgY29uc3QgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZGl2LnRleHRDb250ZW50ID0gc3RyO1xuICAgIHJldHVybiBkaXYuaW5uZXJIVE1MO1xufVxuXG5mdW5jdGlvbiBlc2NhcGVBdHRyKHN0cikge1xuICAgIHJldHVybiBzdHIucmVwbGFjZSgvJi9nLCAnJmFtcDsnKS5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JykucmVwbGFjZSgvPC9nLCAnJmx0OycpLnJlcGxhY2UoLz4vZywgJyZndDsnKTtcbn1cblxuLy8gLS0tIENSVUQgLS0tXG5cbmFzeW5jIGZ1bmN0aW9uIGFkZEtleSgpIHtcbiAgICBjb25zdCBsYWJlbCA9IHN0YXRlLm5ld0xhYmVsLnRyaW0oKTtcbiAgICBjb25zdCBzZWNyZXQgPSBzdGF0ZS5uZXdTZWNyZXQudHJpbSgpO1xuICAgIGlmICghbGFiZWwgfHwgIXNlY3JldCkgcmV0dXJuO1xuXG4gICAgc3RhdGUuc2F2aW5nID0gdHJ1ZTtcbiAgICByZW5kZXIoKTtcblxuICAgIGNvbnN0IGlkID0gY3J5cHRvLnJhbmRvbVVVSUQoKTtcbiAgICBhd2FpdCBzYXZlQXBpS2V5KGlkLCBsYWJlbCwgc2VjcmV0KTtcbiAgICBzdGF0ZS5rZXlzID0gYXdhaXQgbGlzdEFwaUtleXMoKTtcbiAgICBzdGF0ZS5uZXdMYWJlbCA9ICcnO1xuICAgIHN0YXRlLm5ld1NlY3JldCA9ICcnO1xuXG4gICAgaWYgKHN0YXRlLnN5bmNFbmFibGVkICYmIGhhc1JlbGF5cygpKSB7XG4gICAgICAgIGF3YWl0IHB1Ymxpc2hUb1JlbGF5KCk7XG4gICAgfVxuXG4gICAgc3RhdGUuc2F2aW5nID0gZmFsc2U7XG4gICAgc2hvd1RvYXN0KCdLZXkgYWRkZWQnKTtcbn1cblxuZnVuY3Rpb24gc3RhcnRFZGl0KGlkKSB7XG4gICAgY29uc3Qga2V5ID0gc3RhdGUua2V5cy5maW5kKGsgPT4gay5pZCA9PT0gaWQpO1xuICAgIGlmICgha2V5KSByZXR1cm47XG4gICAgaWYgKGtleS51bmRlY3J5cHRhYmxlKSB7XG4gICAgICAgIC8vIE9wZW5pbmcgaXQgd291bGQgc2VlZCB0aGUgZWRpdG9yIHdpdGggbm90aGluZyBhbmQgU2F2ZSB3b3VsZCB3cml0ZVxuICAgICAgICAvLyB0aGF0IG5vdGhpbmcgb3ZlciB0aGUgc3RvcmVkIGNpcGhlcnRleHQuXG4gICAgICAgIHNob3dUb2FzdCgnVGhpcyBrZXkgY291bGQgbm90IGJlIGRlY3J5cHRlZCBvbiB0aGlzIGRldmljZSBcdTIwMTQgaXQgd2FzIGxlZnQgdW50b3VjaGVkJyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgc3RhdGUuZWRpdGluZ0lkID0ga2V5LmlkO1xuICAgIHN0YXRlLmVkaXRMYWJlbCA9IGtleS5sYWJlbDtcbiAgICBzdGF0ZS5lZGl0U2VjcmV0ID0ga2V5LnNlY3JldDtcbiAgICByZW5kZXIoKTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc2F2ZUVkaXQoKSB7XG4gICAgaWYgKCFzdGF0ZS5lZGl0aW5nSWQpIHJldHVybjtcbiAgICBjb25zdCBsYWJlbCA9IHN0YXRlLmVkaXRMYWJlbC50cmltKCk7XG4gICAgY29uc3Qgc2VjcmV0ID0gc3RhdGUuZWRpdFNlY3JldC50cmltKCk7XG4gICAgaWYgKCFsYWJlbCB8fCAhc2VjcmV0KSByZXR1cm47XG5cbiAgICBhd2FpdCBzYXZlQXBpS2V5KHN0YXRlLmVkaXRpbmdJZCwgbGFiZWwsIHNlY3JldCk7XG4gICAgc3RhdGUua2V5cyA9IGF3YWl0IGxpc3RBcGlLZXlzKCk7XG4gICAgc3RhdGUuZWRpdGluZ0lkID0gbnVsbDtcbiAgICBzdGF0ZS5lZGl0TGFiZWwgPSAnJztcbiAgICBzdGF0ZS5lZGl0U2VjcmV0ID0gJyc7XG5cbiAgICBpZiAoc3RhdGUuc3luY0VuYWJsZWQgJiYgaGFzUmVsYXlzKCkpIHtcbiAgICAgICAgYXdhaXQgcHVibGlzaFRvUmVsYXkoKTtcbiAgICB9XG5cbiAgICBzaG93VG9hc3QoJ0tleSB1cGRhdGVkJyk7XG59XG5cbmZ1bmN0aW9uIGNhbmNlbEVkaXQoKSB7XG4gICAgc3RhdGUuZWRpdGluZ0lkID0gbnVsbDtcbiAgICBzdGF0ZS5lZGl0TGFiZWwgPSAnJztcbiAgICBzdGF0ZS5lZGl0U2VjcmV0ID0gJyc7XG4gICAgcmVuZGVyKCk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGRlbGV0ZUtleShpZCkge1xuICAgIGNvbnN0IGtleSA9IHN0YXRlLmtleXMuZmluZChrID0+IGsuaWQgPT09IGlkKTtcbiAgICBpZiAoIWtleSkgcmV0dXJuO1xuICAgIGlmICghKGF3YWl0IGluc0NvbmZpcm0oeyB0aXRsZTogYERlbGV0ZSBcIiR7a2V5LmxhYmVsfVwiP2AsIGJvZHk6ICdUaGUgc3RvcmVkIHNlY3JldCBpcyByZW1vdmVkIGZyb20geW91ciBlbmNyeXB0ZWQgdmF1bHQuJywgY29uZmlybUxhYmVsOiAnRGVsZXRlIGtleScsIGRlc3RydWN0aXZlOiB0cnVlIH0pKSkgcmV0dXJuO1xuXG4gICAgYXdhaXQgZGVsZXRlQXBpS2V5KGlkKTtcbiAgICBzdGF0ZS5rZXlzID0gYXdhaXQgbGlzdEFwaUtleXMoKTtcblxuICAgIGlmIChzdGF0ZS5zeW5jRW5hYmxlZCAmJiBoYXNSZWxheXMoKSkge1xuICAgICAgICBhd2FpdCBwdWJsaXNoVG9SZWxheSgpO1xuICAgIH1cblxuICAgIHNob3dUb2FzdCgnS2V5IGRlbGV0ZWQnKTtcbn1cblxuLy8gLS0tIENsaXBib2FyZCAtLS1cblxuYXN5bmMgZnVuY3Rpb24gY29weVNlY3JldChpZCkge1xuICAgIGNvbnN0IGtleSA9IHN0YXRlLmtleXMuZmluZChrID0+IGsuaWQgPT09IGlkKTtcbiAgICBpZiAoIWtleSkgcmV0dXJuO1xuICAgIGlmIChrZXkudW5kZWNyeXB0YWJsZSkge1xuICAgICAgICBzaG93VG9hc3QoJ1RoaXMga2V5IGNvdWxkIG5vdCBiZSBkZWNyeXB0ZWQgb24gdGhpcyBkZXZpY2UnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBhd2FpdCBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChrZXkuc2VjcmV0KTtcbiAgICBzdGF0ZS5jb3BpZWRJZCA9IGlkO1xuICAgIHJlbmRlcigpO1xuICAgIHNldFRpbWVvdXQoKCkgPT4geyBzdGF0ZS5jb3BpZWRJZCA9IG51bGw7IHJlbmRlcigpOyB9LCAyMDAwKTtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQoJycpLmNhdGNoKCgpID0+IHt9KTtcbiAgICB9LCAzMDAwMCk7XG59XG5cbi8vIC0tLSBTeW5jIC0tLVxuXG5hc3luYyBmdW5jdGlvbiBwdWJsaXNoVG9SZWxheSgpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBzdG9yZSA9IGF3YWl0IGdldEFwaUtleVN0b3JlKCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHtcbiAgICAgICAgICAgIGtpbmQ6ICdhcGlrZXlzLnB1Ymxpc2gnLFxuICAgICAgICAgICAgcGF5bG9hZDogeyBrZXlzOiBzdG9yZS5rZXlzIH0sXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIGF3YWl0IHVwZGF0ZVN0b3JlU3luY1N0YXRlKCdzeW5jZWQnLCByZXN1bHQuZXZlbnRJZCwgcmVzdWx0LmNyZWF0ZWRBdCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGF3YWl0IHVwZGF0ZVN0b3JlU3luY1N0YXRlKCdsb2NhbC1vbmx5Jyk7XG4gICAgICAgIHJldHVybiB7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZS5tZXNzYWdlIH07XG4gICAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBzeW5jQWxsKCkge1xuICAgIHN0YXRlLmdsb2JhbFN5bmNTdGF0dXMgPSAnc3luY2luZyc7XG4gICAgc3RhdGUuc3luY0Vycm9yID0gJyc7XG4gICAgcmVuZGVyKCk7XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7IGtpbmQ6ICdhcGlrZXlzLmZldGNoJyB9KTtcblxuICAgICAgICBpZiAoIXJlc3VsdC5zdWNjZXNzKSB7XG4gICAgICAgICAgICBzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzID0gJ2Vycm9yJztcbiAgICAgICAgICAgIHN0YXRlLnN5bmNFcnJvciA9IHJlc3VsdC5lcnJvciB8fCAnU3luYyBmYWlsZWQnO1xuICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmVzdWx0LmtleXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0QXBpS2V5U3RvcmUoKTtcbiAgICAgICAgICAgIGNvbnN0IGxvY2FsS2V5cyA9IHN0b3JlLmtleXM7XG4gICAgICAgICAgICBjb25zdCBsb2NhbENvdW50ID0gT2JqZWN0LmtleXMobG9jYWxLZXlzKS5sZW5ndGg7XG5cbiAgICAgICAgICAgIGlmIChsb2NhbENvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgaW1wb3J0U3RvcmUocmVzdWx0LmtleXMpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghc3RvcmUucmVsYXlDcmVhdGVkQXQgfHwgcmVzdWx0LmNyZWF0ZWRBdCA+IHN0b3JlLnJlbGF5Q3JlYXRlZEF0KSB7XG4gICAgICAgICAgICAgICAgYXdhaXQgaW1wb3J0U3RvcmUocmVzdWx0LmtleXMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhd2FpdCB1cGRhdGVTdG9yZVN5bmNTdGF0ZSgnc3luY2VkJywgcmVzdWx0LmV2ZW50SWQsIHJlc3VsdC5jcmVhdGVkQXQpO1xuICAgICAgICAgICAgc3RhdGUua2V5cyA9IGF3YWl0IGxpc3RBcGlLZXlzKCk7XG4gICAgICAgIH1cblxuICAgICAgICBzdGF0ZS5nbG9iYWxTeW5jU3RhdHVzID0gJ2lkbGUnO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgc3RhdGUuZ2xvYmFsU3luY1N0YXR1cyA9ICdlcnJvcic7XG4gICAgICAgIHN0YXRlLnN5bmNFcnJvciA9IGUubWVzc2FnZSB8fCAnU3luYyBmYWlsZWQnO1xuICAgIH1cblxuICAgIHJlbmRlcigpO1xufVxuXG5hc3luYyBmdW5jdGlvbiB0b2dnbGVTeW5jKCkge1xuICAgIGF3YWl0IHNldFN5bmNFbmFibGVkKHN0YXRlLnN5bmNFbmFibGVkKTtcbiAgICBpZiAoc3RhdGUuc3luY0VuYWJsZWQgJiYgaGFzUmVsYXlzKCkpIHtcbiAgICAgICAgYXdhaXQgc3luY0FsbCgpO1xuICAgIH1cbn1cblxuLy8gLS0tIEltcG9ydCAvIEV4cG9ydCAtLS1cblxuYXN5bmMgZnVuY3Rpb24gZXhwb3J0S2V5cygpIHtcbiAgICBjb25zdCB7IGtleXMsIHVuZGVjcnlwdGFibGUgfSA9IGF3YWl0IGV4cG9ydFN0b3JlKCk7XG4gICAgY29uc3QgcGxhaW5UZXh0ID0gSlNPTi5zdHJpbmdpZnkoa2V5cywgbnVsbCwgMik7XG5cbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBhcGkucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgIGtpbmQ6ICdhcGlrZXlzLmVuY3J5cHQnLFxuICAgICAgICBwYXlsb2FkOiB7IHBsYWluVGV4dCB9LFxuICAgIH0pO1xuXG4gICAgaWYgKCFyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICBzaG93VG9hc3QoJ0V4cG9ydCBmYWlsZWQ6ICcgKyAocmVzdWx0LmVycm9yIHx8ICd1bmtub3duJykpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFxuICAgICAgICBbSlNPTi5zdHJpbmdpZnkoeyBlbmNyeXB0ZWQ6IHRydWUsIGRhdGE6IHJlc3VsdC5jaXBoZXJUZXh0IH0pXSxcbiAgICAgICAgeyB0eXBlOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICApO1xuICAgIGNvbnN0IHVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG4gICAgY29uc3QgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICBhLmhyZWYgPSB1cmw7XG4gICAgYS5kb3dubG9hZCA9ICdub3N0cmtleS1hcGkta2V5cy1iYWNrdXAuanNvbic7XG4gICAgYS5jbGljaygpO1xuICAgIFVSTC5yZXZva2VPYmplY3RVUkwodXJsKTtcbiAgICBzaG93VG9hc3QodW5kZWNyeXB0YWJsZS5sZW5ndGhcbiAgICAgICAgPyBgRXhwb3J0ZWQgXHUyMDE0ICR7dW5kZWNyeXB0YWJsZS5sZW5ndGh9IGtleShzKSBjb3VsZCBub3QgYmUgZGVjcnlwdGVkIGhlcmUgYW5kIHdlcmUgYmFja2VkIHVwIHN0aWxsLWVuY3J5cHRlZDogJHt1bmRlY3J5cHRhYmxlLmpvaW4oJywgJyl9YFxuICAgICAgICA6ICdFeHBvcnRlZCcpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBpbXBvcnRLZXlzKGV2ZW50KSB7XG4gICAgY29uc3QgZmlsZSA9IGV2ZW50LnRhcmdldC5maWxlcz8uWzBdO1xuICAgIGlmICghZmlsZSkgcmV0dXJuO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgdGV4dCA9IGF3YWl0IGZpbGUudGV4dCgpO1xuICAgICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKHRleHQpO1xuXG4gICAgICAgIGxldCBrZXlzO1xuICAgICAgICBpZiAocGFyc2VkLmVuY3J5cHRlZCAmJiBwYXJzZWQuZGF0YSkge1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgICAgICAgICAgIGtpbmQ6ICdhcGlrZXlzLmRlY3J5cHQnLFxuICAgICAgICAgICAgICAgIHBheWxvYWQ6IHsgY2lwaGVyVGV4dDogcGFyc2VkLmRhdGEgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKCFyZXN1bHQuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgIHNob3dUb2FzdCgnRGVjcnlwdCBmYWlsZWQ6ICcgKyAocmVzdWx0LmVycm9yIHx8ICd1bmtub3duJykpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGtleXMgPSBKU09OLnBhcnNlKHJlc3VsdC5wbGFpblRleHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAga2V5cyA9IHBhcnNlZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGF3YWl0IGltcG9ydFN0b3JlKGtleXMpO1xuICAgICAgICBzdGF0ZS5rZXlzID0gYXdhaXQgbGlzdEFwaUtleXMoKTtcblxuICAgICAgICBpZiAoc3RhdGUuc3luY0VuYWJsZWQgJiYgaGFzUmVsYXlzKCkpIHtcbiAgICAgICAgICAgIGF3YWl0IHB1Ymxpc2hUb1JlbGF5KCk7XG4gICAgICAgIH1cblxuICAgICAgICBzaG93VG9hc3QoJ0ltcG9ydGVkICcgKyBPYmplY3Qua2V5cyhrZXlzKS5sZW5ndGggKyAnIGtleXMnKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHNob3dUb2FzdCgnSW1wb3J0IGZhaWxlZDogJyArIGUubWVzc2FnZSk7XG4gICAgfVxuXG4gICAgZXZlbnQudGFyZ2V0LnZhbHVlID0gJyc7XG59XG5cbi8vIC0tLSBFdmVudCBiaW5kaW5nIC0tLVxuXG5mdW5jdGlvbiBiaW5kRXZlbnRzKCkge1xuICAgICQoJ3N5bmMtYnRuJyk/LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgc3luY0FsbCk7XG4gICAgJCgnYWRkLWtleS1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhZGRLZXkpO1xuICAgICQoJ2V4cG9ydC1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBleHBvcnRLZXlzKTtcbiAgICAkKCdpbXBvcnQtZmlsZScpPy5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCBpbXBvcnRLZXlzKTtcbiAgICAkKCdjbG9zZS1idG4nKT8uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB3aW5kb3cuY2xvc2UoKSk7XG5cbiAgICAkKCdzeW5jLXRvZ2dsZScpPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgc3RhdGUuc3luY0VuYWJsZWQgPSAhc3RhdGUuc3luY0VuYWJsZWQ7XG4gICAgICAgIHJlbmRlcigpO1xuICAgICAgICB0b2dnbGVTeW5jKCk7XG4gICAgfSk7XG5cbiAgICAkKCduZXctbGFiZWwnKT8uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4ge1xuICAgICAgICBzdGF0ZS5uZXdMYWJlbCA9IGUudGFyZ2V0LnZhbHVlO1xuICAgICAgICByZW5kZXIoKTtcbiAgICB9KTtcblxuICAgICQoJ25ldy1zZWNyZXQnKT8uYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCAoZSkgPT4ge1xuICAgICAgICBzdGF0ZS5uZXdTZWNyZXQgPSBlLnRhcmdldC52YWx1ZTtcbiAgICAgICAgcmVuZGVyKCk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHNob3dHYXRlKGdhdGUsIG1haW4sIHsgdGl0bGUsIG1lc3NhZ2UsIGJ1dHRvbiB9KSB7XG4gICAgaWYgKGdhdGUpIGdhdGUuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgaWYgKG1haW4pIG1haW4uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICBjb25zdCB0ID0gJCgnZ2F0ZS10aXRsZScpOyBpZiAodCAmJiB0aXRsZSkgdC50ZXh0Q29udGVudCA9IHRpdGxlO1xuICAgIGNvbnN0IG0gPSAkKCdnYXRlLW1lc3NhZ2UnKTsgaWYgKG0gJiYgbWVzc2FnZSkgbS50ZXh0Q29udGVudCA9IG1lc3NhZ2U7XG4gICAgY29uc3QgYiA9ICQoJ2dhdGUtc2VjdXJpdHktYnRuJyk7IGlmIChiICYmIGJ1dHRvbikgYi50ZXh0Q29udGVudCA9IGJ1dHRvbjtcbiAgICBiPy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgY29uc3QgdXJsID0gYXBpLnJ1bnRpbWUuZ2V0VVJMKCdzZWN1cml0eS9zZWN1cml0eS5odG1sJyk7XG4gICAgICAgIHdpbmRvdy5vcGVuKHVybCwgJ25vc3Rya2V5LW9wdGlvbnMnKTtcbiAgICB9KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICAvLyBHYXRlOiByZXF1aXJlIG1hc3RlciBwYXNzd29yZCBBTkQgYW4gdW5sb2NrZWQgc2Vzc2lvbiBiZWZvcmUgcmVuZGVyaW5nLlxuICAgIGNvbnN0IGlzRW5jcnlwdGVkID0gYXdhaXQgYXBpLnJ1bnRpbWUuc2VuZE1lc3NhZ2UoeyBraW5kOiAnaXNFbmNyeXB0ZWQnIH0pO1xuICAgIGNvbnN0IGxvY2tlZCA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ2lzTG9ja2VkJyB9KTtcbiAgICBjb25zdCBnYXRlID0gJCgndmF1bHQtbG9ja2VkLWdhdGUnKTtcbiAgICBjb25zdCBtYWluID0gJCgndmF1bHQtbWFpbi1jb250ZW50Jyk7XG5cbiAgICBpZiAoIWlzRW5jcnlwdGVkKSB7XG4gICAgICAgIC8vIE5vIG1hc3RlciBwYXNzd29yZCBzZXQgeWV0IFx1MjAxNCBkZXZpY2Uta2V5IGVuY3J5cHRpb24gaXMgYWN0aXZlIGJ1dCB0aGVcbiAgICAgICAgLy8gdmF1bHQgVUkgc3RpbGwgYXNrcyB0aGUgdXNlciB0byBzZXQgYSBwYXNzd29yZCBmaXJzdC5cbiAgICAgICAgc2V0VW5sb2NrZWQodHJ1ZSk7XG4gICAgICAgIHNob3dHYXRlKGdhdGUsIG1haW4sIHt9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChsb2NrZWQpIHtcbiAgICAgICAgLy8gRjU6IHNlc3Npb24gaXMgbG9ja2VkIFx1MjAxNCByZWZ1c2UgdG8gcmVhZC9yZW5kZXIgYW55IEFQSS1rZXkgc2VjcmV0LlxuICAgICAgICBzZXRVbmxvY2tlZChmYWxzZSk7XG4gICAgICAgIHNob3dHYXRlKGdhdGUsIG1haW4sIHtcbiAgICAgICAgICAgIHRpdGxlOiAnVmF1bHQgTG9ja2VkJyxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdVbmxvY2sgTm9zdHJLZXkgd2l0aCB5b3VyIG1hc3RlciBwYXNzd29yZCB0byB2aWV3IHlvdXIgQVBJIGtleXMuJyxcbiAgICAgICAgICAgIGJ1dHRvbjogJ1VubG9jaycsXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgc2V0VW5sb2NrZWQodHJ1ZSk7XG4gICAgaWYgKGdhdGUpIGdhdGUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICBpZiAobWFpbikgbWFpbi5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcblxuICAgIGNvbnN0IHJlbGF5cyA9IGF3YWl0IGFwaS5ydW50aW1lLnNlbmRNZXNzYWdlKHsga2luZDogJ3ZhdWx0LmdldFJlbGF5cycgfSk7XG4gICAgc3RhdGUucmVsYXlJbmZvID0gcmVsYXlzIHx8IHsgcmVhZDogW10sIHdyaXRlOiBbXSB9O1xuICAgIHN0YXRlLnN5bmNFbmFibGVkID0gYXdhaXQgaXNTeW5jRW5hYmxlZCgpO1xuICAgIHN0YXRlLmtleXMgPSBhd2FpdCBsaXN0QXBpS2V5cygpO1xuXG4gICAgYmluZEV2ZW50cygpO1xuICAgIHJlbmRlcigpO1xuXG4gICAgaWYgKHN0YXRlLnN5bmNFbmFibGVkICYmIGhhc1JlbGF5cygpKSB7XG4gICAgICAgIGF3YWl0IHN5bmNBbGwoKTtcbiAgICB9XG59XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBpbml0KTtcbiIsICIvKipcbiAqIGlucy1jb25maXJtLmpzIFx1MjAxNCB0aGUgc2hhcmVkIGNvbnNlbnQgb3ZlcmxheSBmb3IgZXh0ZW5zaW9uIHBhZ2VzLlxuICpcbiAqIE9uZSBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgY29uc2VudC1zdXJmYWNlIHN0YW5kYXJkOiBhIGRpbW1lZCBiYWNrZHJvcCBwbHVzXG4gKiBlaXRoZXIgYSBib3R0b20gU0hFRVQgKGRlZmF1bHQ7IGRlc3RydWN0aXZlIC8gaXJyZXZlcnNpYmxlIGFjdHMpIG9yIGFcbiAqIGNlbnRlcmVkIFBPUE9WRVIgKGxvdy1zdGFrZXMsIHJldmVyc2libGUgYWN0cykuIFJlcGxhY2VzIG5hdGl2ZVxuICogY29uZmlybSgpL2FsZXJ0KCkgb24gZXZlcnkgZXh0ZW5zaW9uLXBhZ2Ugc3VyZmFjZS5cbiAqXG4gKiAgIGluc0NvbmZpcm0oeyB0aXRsZSwgYm9keSwgY29uZmlybUxhYmVsLCBjYW5jZWxMYWJlbCwgZGVzdHJ1Y3RpdmUsIHZhcmlhbnQgfSlcbiAqICAgICAgIFx1MjE5MiBQcm9taXNlPGJvb2xlYW4+ICAgKHRydWUgPSBjb25maXJtZWQ7IEVzY2FwZS9iYWNrZHJvcC9jYW5jZWwgPSBmYWxzZSlcbiAqICAgaW5zTm90aWNlKHsgdGl0bGUsIGJvZHksIGRpc21pc3NMYWJlbCB9KVxuICogICAgICAgXHUyMTkyIFByb21pc2U8dm9pZD5cbiAqXG4gKiBTdHlsaW5nIGNvbWVzIGVudGlyZWx5IGZyb20gaW5zdHJ1bWVudC5jc3MgKHNlY3Rpb24gMTggKyB0aGUgLmJ0biBmYW1pbHkpLFxuICogc28gc2tpbiAvIG1vZGUgLyBjb250cmFzdCAvIGRlbnNpdHkgLyB0ZXh0LXNpemUgYXJyaXZlIHZpYSB0aGUgcGFnZSdzXG4gKiBzdGFtcGVkIGRhdGEtaW5zLSogYXR0cmlidXRlcyBcdTIwMTQgbm8gc3RvcmFnZSBhY2Nlc3MsIG5vIG1lc3NhZ2luZyBoZXJlLlxuICpcbiAqIFNhZmV0eTogdGl0bGUvYm9keSBtYXkgY29udGFpbiB1c2VyIGRhdGEgKGtleSBsYWJlbHMsIHZhdWx0IHBhdGhzKTsgdGhlIERPTVxuICogaXMgYnVpbHQgd2l0aCBjcmVhdGVFbGVtZW50ICsgdGV4dENvbnRlbnQgT05MWSBcdTIwMTQgbmV2ZXIgaW5uZXJIVE1MLlxuICovXG5cbi8vIFNlcmlhbGl6ZSBvdmVybGFwcGluZyBjYWxscyBzbyBhIHNlY29uZCBkaWFsb2cgbmV2ZXIgZG91YmxlLXJlbmRlcnMgb24gdG9wXG4vLyBvZiAob3IgaW50ZXJsZWF2ZXMgd2l0aCkgYW4gb3BlbiBvbmUuXG5sZXQgcXVldWUgPSBQcm9taXNlLnJlc29sdmUoKTtcblxubGV0IGlkQ291bnRlciA9IDA7XG5cbmZ1bmN0aW9uIG1vdGlvbk9mZigpIHtcbiAgICBpZiAoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmdldEF0dHJpYnV0ZSgnZGF0YS1pbnMtbW90aW9uJykgPT09ICdvZmYnKSByZXR1cm4gdHJ1ZTtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gd2luZG93Lm1hdGNoTWVkaWEoJyhwcmVmZXJzLXJlZHVjZWQtbW90aW9uOiByZWR1Y2UpJykubWF0Y2hlcztcbiAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59XG5cbi8qKlxuICogQnVpbGQsIHNob3cgYW5kIHNldHRsZSBvbmUgZGlhbG9nLiBSZXNvbHZlcyB0cnVlIChjb25maXJtKSBvciBmYWxzZVxuICogKGNhbmNlbCAvIEVzY2FwZSAvIGJhY2tkcm9wIGNsaWNrKS5cbiAqL1xuZnVuY3Rpb24gb3BlbkRpYWxvZyh7IHRpdGxlLCBib2R5LCBjb25maXJtTGFiZWwsIGNhbmNlbExhYmVsLCBkZXN0cnVjdGl2ZSwgdmFyaWFudCwgbm90aWNlIH0pIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgY29uc3QgcHJldkZvY3VzID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcblxuICAgICAgICBjb25zdCByb290ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIHJvb3QuY2xhc3NOYW1lID0gJ2lucy1jb25zZW50LXJvb3QnO1xuXG4gICAgICAgIGNvbnN0IGJhY2tkcm9wID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGJhY2tkcm9wLmNsYXNzTmFtZSA9ICdpbnMtY29uc2VudC1iYWNrZHJvcCc7XG5cbiAgICAgICAgY29uc3QgaXNTaGVldCA9IHZhcmlhbnQgIT09ICdwb3BvdmVyJztcbiAgICAgICAgY29uc3QgZGlhbG9nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGRpYWxvZy5jbGFzc05hbWUgPSBpc1NoZWV0ID8gJ2lucy1jb25zZW50LXNoZWV0JyA6ICdpbnMtY29uc2VudC1wb3BvdmVyJztcbiAgICAgICAgZGlhbG9nLnNldEF0dHJpYnV0ZSgncm9sZScsIChkZXN0cnVjdGl2ZSB8fCBub3RpY2UpID8gJ2FsZXJ0ZGlhbG9nJyA6ICdkaWFsb2cnKTtcbiAgICAgICAgZGlhbG9nLnNldEF0dHJpYnV0ZSgnYXJpYS1tb2RhbCcsICd0cnVlJyk7XG5cbiAgICAgICAgaWYgKGlzU2hlZXQpIHtcbiAgICAgICAgICAgIGNvbnN0IGhhbmRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgaGFuZGxlLmNsYXNzTmFtZSA9ICdpbnMtY29uc2VudC1oYW5kbGUnO1xuICAgICAgICAgICAgZGlhbG9nLmFwcGVuZENoaWxkKGhhbmRsZSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB1aWQgPSArK2lkQ291bnRlcjtcbiAgICAgICAgY29uc3QgdGl0bGVFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gyJyk7XG4gICAgICAgIHRpdGxlRWwuY2xhc3NOYW1lID0gJ2lucy1jb25zZW50LXRpdGxlJztcbiAgICAgICAgdGl0bGVFbC5pZCA9IGBpbnMtY29uc2VudC10aXRsZS0ke3VpZH1gO1xuICAgICAgICB0aXRsZUVsLnRleHRDb250ZW50ID0gdGl0bGUgfHwgJyc7XG4gICAgICAgIGRpYWxvZy5hcHBlbmRDaGlsZCh0aXRsZUVsKTtcbiAgICAgICAgZGlhbG9nLnNldEF0dHJpYnV0ZSgnYXJpYS1sYWJlbGxlZGJ5JywgdGl0bGVFbC5pZCk7XG5cbiAgICAgICAgY29uc3QgYm9keUVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xuICAgICAgICBib2R5RWwuY2xhc3NOYW1lID0gJ2lucy1jb25zZW50LWJvZHknO1xuICAgICAgICBib2R5RWwuaWQgPSBgaW5zLWNvbnNlbnQtYm9keS0ke3VpZH1gO1xuICAgICAgICBib2R5RWwudGV4dENvbnRlbnQgPSBib2R5IHx8ICcnO1xuICAgICAgICBkaWFsb2cuYXBwZW5kQ2hpbGQoYm9keUVsKTtcbiAgICAgICAgZGlhbG9nLnNldEF0dHJpYnV0ZSgnYXJpYS1kZXNjcmliZWRieScsIGJvZHlFbC5pZCk7XG5cbiAgICAgICAgY29uc3QgYWN0aW9ucyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBhY3Rpb25zLmNsYXNzTmFtZSA9ICdpbnMtY29uc2VudC1hY3Rpb25zJztcblxuICAgICAgICBjb25zdCBidXR0b25zID0gW107XG4gICAgICAgIGxldCBjYW5jZWxCdG4gPSBudWxsO1xuICAgICAgICBjb25zdCBjb25maXJtQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgIGNvbmZpcm1CdG4udHlwZSA9ICdidXR0b24nO1xuICAgICAgICBjb25maXJtQnRuLnRleHRDb250ZW50ID0gY29uZmlybUxhYmVsO1xuICAgICAgICBpZiAobm90aWNlKSB7XG4gICAgICAgICAgICBjb25maXJtQnRuLmNsYXNzTmFtZSA9ICdidG4nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FuY2VsQnRuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gICAgICAgICAgICBjYW5jZWxCdG4udHlwZSA9ICdidXR0b24nO1xuICAgICAgICAgICAgY2FuY2VsQnRuLmNsYXNzTmFtZSA9ICdidG4gYnRuLS1naG9zdCc7XG4gICAgICAgICAgICBjYW5jZWxCdG4udGV4dENvbnRlbnQgPSBjYW5jZWxMYWJlbDtcbiAgICAgICAgICAgIGFjdGlvbnMuYXBwZW5kQ2hpbGQoY2FuY2VsQnRuKTtcbiAgICAgICAgICAgIGJ1dHRvbnMucHVzaChjYW5jZWxCdG4pO1xuICAgICAgICAgICAgY29uZmlybUJ0bi5jbGFzc05hbWUgPSBkZXN0cnVjdGl2ZSA/ICdidG4gYnRuLS1kZXN0cnVjdGl2ZScgOiAnYnRuIGJ0bi0tcHJpbWFyeSc7XG4gICAgICAgIH1cbiAgICAgICAgYWN0aW9ucy5hcHBlbmRDaGlsZChjb25maXJtQnRuKTtcbiAgICAgICAgYnV0dG9ucy5wdXNoKGNvbmZpcm1CdG4pO1xuICAgICAgICBkaWFsb2cuYXBwZW5kQ2hpbGQoYWN0aW9ucyk7XG5cbiAgICAgICAgcm9vdC5hcHBlbmRDaGlsZChiYWNrZHJvcCk7XG4gICAgICAgIHJvb3QuYXBwZW5kQ2hpbGQoZGlhbG9nKTtcblxuICAgICAgICBsZXQgc2V0dGxlZCA9IGZhbHNlO1xuICAgICAgICBmdW5jdGlvbiBzZXR0bGUocmVzdWx0KSB7XG4gICAgICAgICAgICBpZiAoc2V0dGxlZCkgcmV0dXJuO1xuICAgICAgICAgICAgc2V0dGxlZCA9IHRydWU7XG4gICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb25LZXlkb3duLCB0cnVlKTtcbiAgICAgICAgICAgIGJhY2tkcm9wLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgIGRpYWxvZy5jbGFzc0xpc3QucmVtb3ZlKCdpcy1vcGVuJyk7XG4gICAgICAgICAgICBjb25zdCBmaW5pc2ggPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgcm9vdC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocHJldkZvY3VzICYmIHR5cGVvZiBwcmV2Rm9jdXMuZm9jdXMgPT09ICdmdW5jdGlvbicgJiYgZG9jdW1lbnQuY29udGFpbnMocHJldkZvY3VzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJldkZvY3VzLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGNhdGNoIChfKSB7IC8qIGZvY3VzIHJlc3RvcmUgaXMgYmVzdC1lZmZvcnQgKi8gfVxuICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAobW90aW9uT2ZmKCkpIGZpbmlzaCgpO1xuICAgICAgICAgICAgZWxzZSBzZXRUaW1lb3V0KGZpbmlzaCwgMjUwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIG9uS2V5ZG93bihldikge1xuICAgICAgICAgICAgaWYgKGV2LmtleSA9PT0gJ0VzY2FwZScpIHtcbiAgICAgICAgICAgICAgICBldi5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIHNldHRsZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGV2LmtleSA9PT0gJ1RhYicpIHtcbiAgICAgICAgICAgICAgICAvLyBUcmFwIGZvY3VzIGFjcm9zcyB0aGUgZGlhbG9nJ3MgYnV0dG9ucyBvbmx5LlxuICAgICAgICAgICAgICAgIGV2LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgY29uc3QgaWR4ID0gYnV0dG9ucy5pbmRleE9mKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGRpciA9IGV2LnNoaWZ0S2V5ID8gLTEgOiAxO1xuICAgICAgICAgICAgICAgIGJ1dHRvbnNbKGlkeCArIGRpciArIGJ1dHRvbnMubGVuZ3RoKSAlIGJ1dHRvbnMubGVuZ3RoXS5mb2N1cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgYmFja2Ryb3AuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzZXR0bGUoZmFsc2UpKTtcbiAgICAgICAgaWYgKGNhbmNlbEJ0bikgY2FuY2VsQnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gc2V0dGxlKGZhbHNlKSk7XG4gICAgICAgIGNvbmZpcm1CdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBzZXR0bGUodHJ1ZSkpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgb25LZXlkb3duLCB0cnVlKTtcblxuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHJvb3QpO1xuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgICAgICAgICAgYmFja2Ryb3AuY2xhc3NMaXN0LmFkZCgnaXMtb3BlbicpO1xuICAgICAgICAgICAgZGlhbG9nLmNsYXNzTGlzdC5hZGQoJ2lzLW9wZW4nKTtcbiAgICAgICAgICAgIC8vIERlc3RydWN0aXZlIGFjdHMgc3RhcnQgb24gQ2FuY2VsIHNvIEVudGVyIGNhbid0IHJ1c2ggdGhlIGRlbGV0ZTtcbiAgICAgICAgICAgIC8vIGV2ZXJ5dGhpbmcgZWxzZSBzdGFydHMgb24gdGhlIGNvbmZpcm1pbmcgYWN0aW9uLlxuICAgICAgICAgICAgY29uc3QgaW5pdGlhbCA9IG5vdGljZSA/IGNvbmZpcm1CdG4gOiAoZGVzdHJ1Y3RpdmUgPyBjYW5jZWxCdG4gOiBjb25maXJtQnRuKTtcbiAgICAgICAgICAgIChpbml0aWFsIHx8IGNvbmZpcm1CdG4pLmZvY3VzKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5zQ29uZmlybSh7XG4gICAgdGl0bGUsXG4gICAgYm9keSxcbiAgICBjb25maXJtTGFiZWwgPSAnQ29uZmlybScsXG4gICAgY2FuY2VsTGFiZWwgPSAnQ2FuY2VsJyxcbiAgICBkZXN0cnVjdGl2ZSA9IGZhbHNlLFxuICAgIHZhcmlhbnQgPSAnc2hlZXQnLFxufSA9IHt9KSB7XG4gICAgY29uc3QgcmVzdWx0ID0gcXVldWUudGhlbigoKSA9PlxuICAgICAgICBvcGVuRGlhbG9nKHsgdGl0bGUsIGJvZHksIGNvbmZpcm1MYWJlbCwgY2FuY2VsTGFiZWwsIGRlc3RydWN0aXZlLCB2YXJpYW50LCBub3RpY2U6IGZhbHNlIH0pKTtcbiAgICBxdWV1ZSA9IHJlc3VsdC5jYXRjaCgoKSA9PiB7fSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluc05vdGljZSh7IHRpdGxlLCBib2R5LCBkaXNtaXNzTGFiZWwgPSAnT0snIH0gPSB7fSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IHF1ZXVlLnRoZW4oKCkgPT5cbiAgICAgICAgb3BlbkRpYWxvZyh7XG4gICAgICAgICAgICB0aXRsZSxcbiAgICAgICAgICAgIGJvZHksXG4gICAgICAgICAgICBjb25maXJtTGFiZWw6IGRpc21pc3NMYWJlbCxcbiAgICAgICAgICAgIGNhbmNlbExhYmVsOiAnJyxcbiAgICAgICAgICAgIGRlc3RydWN0aXZlOiBmYWxzZSxcbiAgICAgICAgICAgIHZhcmlhbnQ6ICdzaGVldCcsXG4gICAgICAgICAgICBub3RpY2U6IHRydWUsXG4gICAgICAgIH0pLnRoZW4oKCkgPT4gdW5kZWZpbmVkKSk7XG4gICAgcXVldWUgPSByZXN1bHQuY2F0Y2goKCkgPT4ge30pO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG4iLCAiLyoqXG4gKiBBUEkgS2V5IFN0b3JlIFx1MjAxNCBMb2NhbCBjYWNoZSBmb3IgZW5jcnlwdGVkIEFQSSBrZXlzXG4gKlxuICogU3RvcmFnZSBzY2hlbWEgaW4gYnJvd3Nlci5zdG9yYWdlLmxvY2FsOlxuICogICBhcGlLZXlWYXVsdDoge1xuICogICAgIGtleXM6IHtcbiAqICAgICAgIFwiPHV1aWQ+XCI6IHsgaWQsIGxhYmVsLCBzZWNyZXQsIGNyZWF0ZWRBdCwgdXBkYXRlZEF0LCBwcm9maWxlU2NvcGUgfVxuICogICAgIH0sXG4gKiAgICAgc3luY0VuYWJsZWQ6IHRydWUsXG4gKiAgICAgZXZlbnRJZDogbnVsbCxcbiAqICAgICByZWxheUNyZWF0ZWRBdDogbnVsbCxcbiAqICAgICBzeW5jU3RhdHVzOiBcInN5bmNlZFwiICAgIC8vIHN5bmNlZCB8IGxvY2FsLW9ubHkgfCBjb25mbGljdFxuICogICB9XG4gKlxuICogcHJvZmlsZVNjb3BlOiBudWxsIChhbGwgcHJvZmlsZXMpIHwgbnVtYmVyW10gKHNwZWNpZmljIHByb2ZpbGUgaW5kaWNlcylcbiAqL1xuXG5pbXBvcnQgeyBhcGkgfSBmcm9tICcuL2Jyb3dzZXItcG9seWZpbGwnO1xuaW1wb3J0IHsgc2NoZWR1bGVTeW5jUHVzaCB9IGZyb20gJy4vc3luYy1tYW5hZ2VyJztcbmltcG9ydCB7IHdyYXBTZWNyZXQsIHVud3JhcFNlY3JldCwgaXNDaXBoZXJ0ZXh0IH0gZnJvbSAnLi9zZWNyZXQtdmF1bHQnO1xuXG5jb25zdCBzdG9yYWdlID0gYXBpLnN0b3JhZ2UubG9jYWw7XG5jb25zdCBTVE9SQUdFX0tFWSA9ICdhcGlLZXlWYXVsdCc7XG4vLyBEZWxldGlvbiB0b21ic3RvbmVzIGtleWVkIGJ5IGlkIChpc3N1ZSAjMyk6IHsgPGlkPjogZGVsZXRlZEF0U2Vjb25kcyB9LlxuY29uc3QgREVMRVRFRF9LRVkgPSAnZGVsZXRlZEtleXMnO1xuXG5hc3luYyBmdW5jdGlvbiBnZXREZWxldGVkS2V5cygpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBbREVMRVRFRF9LRVldOiB7fSB9KTtcbiAgICByZXR1cm4gZGF0YVtERUxFVEVEX0tFWV0gJiYgdHlwZW9mIGRhdGFbREVMRVRFRF9LRVldID09PSAnb2JqZWN0JyA/IGRhdGFbREVMRVRFRF9LRVldIDoge307XG59XG5cbi8qKlxuICogRGVjcnlwdCBhIGtleSdzIGBzZWNyZXRgIGZpZWxkIGZvciBjYWxsZXJzLiBSZS10aHJvd3MgbG9jayBlcnJvcnMgc28gYSBsb2NrZWRcbiAqIHNlc3Npb24gY2Fubm90IHJlYWQgc2VjcmV0cyAoRjUpLlxuICpcbiAqIEEgZ2VudWluZSBkZWNyeXB0IGZhaWx1cmUgKGUuZy4gYSBkZXZpY2Utd3JhcHBlZCB2YWx1ZSBzeW5jZWQgZnJvbSBhbm90aGVyXG4gKiBkZXZpY2UsIG9yIGEgYmxvYiB3aG9zZSB3cmFwcGluZyBrZXkgcm90YXRlZCBhd2F5KSBpcyByZXBvcnRlZCBhc1xuICogYHVuZGVjcnlwdGFibGU6IHRydWVgIHdpdGggYHNlY3JldDogbnVsbGAgXHUyMDE0IE5PVCBhcyBhbiBlbXB0eSBzdHJpbmcuIEFuIGVtcHR5XG4gKiBzdHJpbmcgaXMgaW5kaXN0aW5ndWlzaGFibGUgZnJvbSBhIHJlYWwgdmFsdWU6IHRoZSBVSSByZW5kZXJlZCBpdCBhcyBibGFua1xuICogYW5kIGV4cG9ydFN0b3JlKCkgd3JvdGUgaXQgaW50byB0aGUgdXNlcidzIGVuY3J5cHRlZCBiYWNrdXAsIHF1aWV0bHlcbiAqIHJlcGxhY2luZyB0aGUgb25seSBjb3B5IG9mIHRoZSBzZWNyZXQgd2l0aCBub3RoaW5nLiBgbnVsbGAgKyB0aGUgZmxhZyBtYWtlc1xuICogdGhlIGZhaWx1cmUgdmlzaWJsZSB0byBldmVyeSBjYWxsZXIsIGFuZCBleHBvcnRTdG9yZSgpIGNhcnJpZXMgdGhlIHVudG91Y2hlZFxuICogY2lwaGVydGV4dCBpbnN0ZWFkLlxuICovXG5hc3luYyBmdW5jdGlvbiBkZWNyeXB0S2V5KGtleSkge1xuICAgIGlmICgha2V5KSByZXR1cm4ga2V5O1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiB7IC4uLmtleSwgc2VjcmV0OiBhd2FpdCB1bndyYXBTZWNyZXQoa2V5LnNlY3JldCkgfTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChTdHJpbmcoZS5tZXNzYWdlIHx8ICcnKS5zdGFydHNXaXRoKCdsb2NrZWQnKSkgdGhyb3cgZTtcbiAgICAgICAgcmV0dXJuIHsgLi4ua2V5LCBzZWNyZXQ6IG51bGwsIHVuZGVjcnlwdGFibGU6IHRydWUgfTtcbiAgICB9XG59XG5cbmNvbnN0IERFRkFVTFRfU1RPUkUgPSB7XG4gICAga2V5czoge30sXG4gICAgc3luY0VuYWJsZWQ6IHRydWUsXG4gICAgZXZlbnRJZDogbnVsbCxcbiAgICByZWxheUNyZWF0ZWRBdDogbnVsbCxcbiAgICBzeW5jU3RhdHVzOiAnc3luY2VkJyxcbn07XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFN0b3JlKCkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBzdG9yYWdlLmdldCh7IFtTVE9SQUdFX0tFWV06IERFRkFVTFRfU1RPUkUgfSk7XG4gICAgcmV0dXJuIHsgLi4uREVGQVVMVF9TVE9SRSwgLi4uZGF0YVtTVE9SQUdFX0tFWV0gfTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc2V0U3RvcmUoc3RvcmUpIHtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IFtTVE9SQUdFX0tFWV06IHN0b3JlIH0pO1xuICAgIHNjaGVkdWxlU3luY1B1c2goKTtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIGZ1bGwgQVBJIGtleSBzdG9yZSBvYmplY3QuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRBcGlLZXlTdG9yZSgpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IGdldFN0b3JlKCk7XG4gICAgY29uc3Qga2V5cyA9IHt9O1xuICAgIGZvciAoY29uc3QgW2lkLCBrZXldIG9mIE9iamVjdC5lbnRyaWVzKHN0b3JlLmtleXMpKSB7XG4gICAgICAgIGtleXNbaWRdID0gYXdhaXQgZGVjcnlwdEtleShrZXkpO1xuICAgIH1cbiAgICByZXR1cm4geyAuLi5zdG9yZSwga2V5cyB9O1xufVxuXG4vKipcbiAqIEdldCBhIHNpbmdsZSBBUEkga2V5IGJ5IGlkIChzZWNyZXQgZGVjcnlwdGVkKS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBpZFxuICogQHJldHVybnMge1Byb21pc2U8T2JqZWN0fG51bGw+fVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0QXBpS2V5KGlkKSB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBnZXRTdG9yZSgpO1xuICAgIHJldHVybiBzdG9yZS5rZXlzW2lkXSA/IGRlY3J5cHRLZXkoc3RvcmUua2V5c1tpZF0pIDogbnVsbDtcbn1cblxuLyoqXG4gKiBVcHNlcnQgYW4gQVBJIGtleS4gQ3JlYXRlcyBpZiBuZXcsIHVwZGF0ZXMgaWYgZXhpc3RpbmcuXG4gKiBAcGFyYW0ge3N0cmluZ30gaWQgLSBVVUlEXG4gKiBAcGFyYW0ge3N0cmluZ30gbGFiZWxcbiAqIEBwYXJhbSB7c3RyaW5nfSBzZWNyZXRcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNhdmVBcGlLZXkoaWQsIGxhYmVsLCBzZWNyZXQpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IGdldFN0b3JlKCk7XG4gICAgY29uc3Qgbm93ID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XG4gICAgY29uc3QgZXhpc3RpbmcgPSBzdG9yZS5rZXlzW2lkXTtcbiAgICAvLyBUMC00OiBlbmNyeXB0IHRoZSBzZWNyZXQgYmVmb3JlIGl0IHRvdWNoZXMgc3RvcmFnZS5cbiAgICBzdG9yZS5rZXlzW2lkXSA9IHtcbiAgICAgICAgaWQsXG4gICAgICAgIGxhYmVsLFxuICAgICAgICBzZWNyZXQ6IGF3YWl0IHdyYXBTZWNyZXQoc2VjcmV0KSxcbiAgICAgICAgY3JlYXRlZEF0OiBleGlzdGluZz8uY3JlYXRlZEF0IHx8IG5vdyxcbiAgICAgICAgdXBkYXRlZEF0OiBub3csXG4gICAgICAgIHByb2ZpbGVTY29wZTogZXhpc3Rpbmc/LnByb2ZpbGVTY29wZSA/PyBudWxsLFxuICAgIH07XG4gICAgLy8gUmVjcmVhdGUgY2xlYXJzIGFueSB0b21ic3RvbmUgZm9yIHRoaXMgaWQgKGlzc3VlICMzKSBzbyB0aGUgZnJlc2hseSBzYXZlZFxuICAgIC8vIGtleSBpcyBubyBsb25nZXIgc3VwcHJlc3NlZCBmcm9tIHRoZSBzeW5jIHBheWxvYWQuXG4gICAgY29uc3QgZGVsZXRlZCA9IGF3YWl0IGdldERlbGV0ZWRLZXlzKCk7XG4gICAgaWYgKGRlbGV0ZWRbaWRdICE9IG51bGwpIHtcbiAgICAgICAgZGVsZXRlIGRlbGV0ZWRbaWRdO1xuICAgICAgICBhd2FpdCBzdG9yYWdlLnNldCh7IFtTVE9SQUdFX0tFWV06IHN0b3JlLCBbREVMRVRFRF9LRVldOiBkZWxldGVkIH0pO1xuICAgICAgICBzY2hlZHVsZVN5bmNQdXNoKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYXdhaXQgc2V0U3RvcmUoc3RvcmUpO1xuICAgIH1cbiAgICByZXR1cm4gZGVjcnlwdEtleShzdG9yZS5rZXlzW2lkXSk7XG59XG5cbi8qKlxuICogRGVsZXRlIGFuIEFQSSBrZXkgYnkgaWQgYW5kIHJlY29yZCBhIHRvbWJzdG9uZSAoaXNzdWUgIzMpIHNvIHRoZSBkZWxldGlvblxuICogcHJvcGFnYXRlcyB0aHJvdWdoIHN0b3JhZ2Uuc3luYyBhbmQgYSBzdGFsZSB3aG9sZS1vYmplY3Qgb3ZlcndyaXRlIGZyb21cbiAqIGFub3RoZXIgZGV2aWNlIGNhbm5vdCByZXN1cnJlY3QgaXQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWxldGVBcGlLZXkoaWQpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IGdldFN0b3JlKCk7XG4gICAgZGVsZXRlIHN0b3JlLmtleXNbaWRdO1xuICAgIGNvbnN0IGRlbGV0ZWQgPSBhd2FpdCBnZXREZWxldGVkS2V5cygpO1xuICAgIGRlbGV0ZWRbaWRdID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBbU1RPUkFHRV9LRVldOiBzdG9yZSwgW0RFTEVURURfS0VZXTogZGVsZXRlZCB9KTtcbiAgICBzY2hlZHVsZVN5bmNQdXNoKCk7XG59XG5cbi8qKlxuICogTGlzdCBhbGwgQVBJIGtleXMgc29ydGVkIGJ5IGxhYmVsIChjYXNlLWluc2Vuc2l0aXZlKS5cbiAqIEByZXR1cm5zIHtQcm9taXNlPEFycmF5Pn1cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxpc3RBcGlLZXlzKCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0U3RvcmUoKTtcbiAgICBjb25zdCBkZWNyeXB0ZWQgPSBbXTtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBPYmplY3QudmFsdWVzKHN0b3JlLmtleXMpKSB7XG4gICAgICAgIGRlY3J5cHRlZC5wdXNoKGF3YWl0IGRlY3J5cHRLZXkoa2V5KSk7XG4gICAgfVxuICAgIHJldHVybiBkZWNyeXB0ZWQuc29ydCgoYSwgYikgPT5cbiAgICAgICAgYS5sYWJlbC50b0xvd2VyQ2FzZSgpLmxvY2FsZUNvbXBhcmUoYi5sYWJlbC50b0xvd2VyQ2FzZSgpKSxcbiAgICApO1xufVxuXG4vKipcbiAqIFNldCB0aGUgcmVsYXkgc3luYyB0b2dnbGUuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZXRTeW5jRW5hYmxlZChlbmFibGVkKSB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBnZXRTdG9yZSgpO1xuICAgIHN0b3JlLnN5bmNFbmFibGVkID0gZW5hYmxlZDtcbiAgICBhd2FpdCBzZXRTdG9yZShzdG9yZSk7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgcmVsYXkgc3luYyBpcyBlbmFibGVkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaXNTeW5jRW5hYmxlZCgpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IGdldFN0b3JlKCk7XG4gICAgcmV0dXJuIHN0b3JlLnN5bmNFbmFibGVkO1xufVxuXG4vKipcbiAqIFVwZGF0ZSBzeW5jIHN0YXRlIGFmdGVyIGEgcmVsYXkgb3BlcmF0aW9uLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdXBkYXRlU3RvcmVTeW5jU3RhdGUoc3luY1N0YXR1cywgZXZlbnRJZCA9IG51bGwsIHJlbGF5Q3JlYXRlZEF0ID0gbnVsbCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgZ2V0U3RvcmUoKTtcbiAgICBzdG9yZS5zeW5jU3RhdHVzID0gc3luY1N0YXR1cztcbiAgICBpZiAoZXZlbnRJZCAhPT0gbnVsbCkgc3RvcmUuZXZlbnRJZCA9IGV2ZW50SWQ7XG4gICAgaWYgKHJlbGF5Q3JlYXRlZEF0ICE9PSBudWxsKSBzdG9yZS5yZWxheUNyZWF0ZWRBdCA9IHJlbGF5Q3JlYXRlZEF0O1xuICAgIGF3YWl0IHNldFN0b3JlKHN0b3JlKTtcbn1cblxuLyoqXG4gKiBFeHBvcnQgdGhlIGtleXMgb2JqZWN0IChmb3IgZW5jcnlwdGVkIGJhY2t1cCkuXG4gKlxuICogQSBrZXkgdGhpcyBkZXZpY2UgY2Fubm90IGRlY3J5cHQgaXMgTkVWRVIgZXhwb3J0ZWQgd2l0aCBhbiBlbXB0eS9udWxsIHNlY3JldFxuICogXHUyMDE0IGEgYmxhbmsgd291bGQgb3ZlcndyaXRlIHRoZSByZWNvdmVyYWJsZSBjaXBoZXJ0ZXh0IHRoZSBuZXh0IHRpbWUgdGhlIGJhY2t1cFxuICogaXMgaW1wb3J0ZWQuIEl0IGlzIGV4cG9ydGVkIGFzIHRoZSBPUklHSU5BTCBDSVBIRVJURVhULFxuICogdW50b3VjaGVkOiB0aGF0IHByZXNlcnZlcyBzdHJpY3RseSBtb3JlIHVzZXIgZGF0YSB0aGFuIG9taXR0aW5nIGl0ICh0aGUgdmFsdWVcbiAqIGlzIHN0aWxsIHJlY292ZXJhYmxlIG9uIGEgZGV2aWNlIHRoYXQgaG9sZHMgdGhlIHdyYXBwaW5nIGtleSwgb3Igb25jZSB0aGUga2V5XG4gKiBpcyByZXN0b3JlZCksIGFuZCBpbXBvcnRTdG9yZSgpIGFscmVhZHkgcGFzc2VzIGNpcGhlcnRleHQgc3RyYWlnaHQgdGhyb3VnaFxuICogaW5zdGVhZCBvZiByZS13cmFwcGluZyBpdCwgc28gdGhlIHJvdW5kIHRyaXAgaXMgbG9zc2xlc3MuIFRoZSBpZHMgYXJlIGFsc29cbiAqIHJlcG9ydGVkIHNvIHRoZSBjYWxsZXIgY2FuIHRlbGwgdGhlIHVzZXIgd2hpY2gga2V5cyBjYW1lIHRocm91Z2ggdW5vcGVuZWQuXG4gKlxuICogQHJldHVybnMge1Byb21pc2U8e2tleXM6IE9iamVjdCwgdW5kZWNyeXB0YWJsZTogc3RyaW5nW119Pn0gTWFwIG9mIGlkIC0+IGtleVxuICogICAgICAgICAgZGF0YSwgcGx1cyB0aGUgbGFiZWxzL2lkcyB0aGF0IHdlcmUgZXhwb3J0ZWQgc3RpbGwtZW5jcnlwdGVkLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhwb3J0U3RvcmUoKSB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBnZXRTdG9yZSgpO1xuICAgIGNvbnN0IGtleXMgPSB7fTtcbiAgICBjb25zdCB1bmRlY3J5cHRhYmxlID0gW107XG4gICAgZm9yIChjb25zdCBbaWQsIGtleV0gb2YgT2JqZWN0LmVudHJpZXMoc3RvcmUua2V5cykpIHtcbiAgICAgICAgY29uc3QgZGVjcnlwdGVkID0gYXdhaXQgZGVjcnlwdEtleShrZXkpO1xuICAgICAgICBpZiAoZGVjcnlwdGVkPy51bmRlY3J5cHRhYmxlKSB7XG4gICAgICAgICAgICBrZXlzW2lkXSA9IHsgLi4ua2V5IH07ICAgICAgICAgICAgLy8gY2lwaGVydGV4dCBjYXJyaWVkIHRocm91Z2ggYXMtaXNcbiAgICAgICAgICAgIHVuZGVjcnlwdGFibGUucHVzaChrZXkubGFiZWwgfHwgaWQpO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAga2V5c1tpZF0gPSBkZWNyeXB0ZWQ7XG4gICAgfVxuICAgIHJldHVybiB7IGtleXMsIHVuZGVjcnlwdGFibGUgfTtcbn1cblxuLyoqXG4gKiBJbXBvcnQga2V5cyBpbnRvIHRoZSBzdG9yZSAobWVyZ2UgXHUyMDE0IGV4aXN0aW5nIGtleXMgd2l0aCBzYW1lIGlkIGFyZSBvdmVyd3JpdHRlbikuXG4gKiBJbmNvbWluZyBzZWNyZXRzIGFyZSBwbGFpbnRleHQgKGZyb20gYSBkZWNyeXB0ZWQgYmFja3VwIG9yIGEgcmVsYXkgZmV0Y2gpIGFuZFxuICogYXJlIHJlLXdyYXBwZWQgZm9yIHRoZSBhdC1yZXN0IHRpZXIgdGhpcyBjb250ZXh0IGlzIGluIFx1MjAxNCB0aGUgZGV2aWNlIGtleSwgb3JcbiAqIHRoZSBwYXNzd29yZCBzZXNzaW9uIGtleSB3aGVuIG9uZSBpcyBsaXZlIFx1MjAxNCBiZWZvcmUgc3RvcmFnZS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBrZXlzIC0gTWFwIG9mIGlkIC0+IHsgaWQsIGxhYmVsLCBzZWNyZXQsIGNyZWF0ZWRBdCwgdXBkYXRlZEF0IH1cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGltcG9ydFN0b3JlKGtleXMpIHtcbiAgICBjb25zdCBzdG9yZSA9IGF3YWl0IGdldFN0b3JlKCk7XG4gICAgZm9yIChjb25zdCBbaWQsIGtleV0gb2YgT2JqZWN0LmVudHJpZXMoa2V5cykpIHtcbiAgICAgICAgY29uc3Qgc2VjcmV0ID0gaXNDaXBoZXJ0ZXh0KGtleS5zZWNyZXQpID8ga2V5LnNlY3JldCA6IGF3YWl0IHdyYXBTZWNyZXQoa2V5LnNlY3JldCk7XG4gICAgICAgIHN0b3JlLmtleXNbaWRdID0geyAuLi5rZXksIHNlY3JldCB9O1xuICAgIH1cbiAgICBhd2FpdCBzZXRTdG9yZShzdG9yZSk7XG59XG4iLCAiLyoqXG4gKiBTeW5jIE1hbmFnZXIgXHUyMDE0IFBsYXRmb3JtIHN5bmMgdmlhIHN0b3JhZ2Uuc3luYyAoQ2hyb21lIFx1MjE5MiBHb29nbGUsIFNhZmFyaSBcdTIxOTIgaUNsb3VkKVxuICpcbiAqIEFyY2hpdGVjdHVyZTpcbiAqICAgV3JpdGU6IGFwcCBcdTIxOTIgc3RvcmFnZS5sb2NhbCBcdTIxOTIgc2NoZWR1bGVTeW5jUHVzaCgpIFx1MjE5MiBzdG9yYWdlLnN5bmNcbiAqICAgUmVhZDogIHB1bGxGcm9tU3luYygpIG9uIHN0YXJ0dXAgXHUyMTkyIG1lcmdlIGludG8gc3RvcmFnZS5sb2NhbFxuICogICBMaXN0ZW46IHN0b3JhZ2Uub25DaGFuZ2VkKFwic3luY1wiKSBcdTIxOTIgbWVyZ2UgcmVtb3RlIGNoYW5nZXMgaW50byBsb2NhbFxuICpcbiAqIHN0b3JhZ2UubG9jYWwgcmVtYWlucyB0aGUgc291cmNlIG9mIHRydXRoLiBzdG9yYWdlLnN5bmMgaXMgYSBiZXN0LWVmZm9ydCBtaXJyb3IuXG4gKi9cblxuaW1wb3J0IHsgYXBpIH0gZnJvbSAnLi9icm93c2VyLXBvbHlmaWxsJztcbmltcG9ydCB7IGlzQ2lwaGVydGV4dCwgaXNQYXNzd29yZEJsb2IgfSBmcm9tICcuL3NlY3JldC12YXVsdCc7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gQ29uc3RhbnRzXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmNvbnN0IFNZTkNfUVVPVEEgPSAxMDJfNDAwOyAgICAgICAvLyAxMDAgS0IgdG90YWxcbmNvbnN0IE1BWF9JVEVNID0gOF8xOTI7ICAgICAgICAgICAvLyA4IEtCIHBlciBpdGVtXG5jb25zdCBNQVhfSVRFTVMgPSA1MTI7XG5jb25zdCBDSFVOS19QUkVGSVggPSAnX2NodW5rOic7XG5jb25zdCBTWU5DX01FVEFfS0VZID0gJ19zeW5jX21ldGEnO1xuY29uc3QgTE9DQUxfRU5BQkxFRF9LRVkgPSAncGxhdGZvcm1TeW5jRW5hYmxlZCc7XG5cbi8vIEtleXMgdGhhdCBzaG91bGQgbmV2ZXIgYmUgc3luY2VkXG5jb25zdCBFWENMVURFRF9LRVlTID0gW1xuICAgICdidW5rZXJTZXNzaW9ucycsXG4gICAgJ2lnbm9yZUluc3RhbGxIb29rJyxcbiAgICAncGFzc3dvcmRIYXNoJyxcbiAgICAncGFzc3dvcmRTYWx0Jyxcbl07XG5cbi8vIFByaW9yaXR5IHRpZXJzIGZvciBidWRnZXQgYWxsb2NhdGlvblxuY29uc3QgUFJJT1JJVFkgPSB7XG4gICAgLy8gVG9tYnN0b25lcyAoZGVsZXRpb24gcmVjb3JkcykgZ2V0IHRoZSBndWFyYW50ZWVkIHRvcCBzbG90OiBhIGRlbGV0aW9uIG11c3RcbiAgICAvLyBuZXZlciBsb3NlIGl0cyBidWRnZXQgcmFjZSB0byBidWxreSB2YXVsdCBjb250ZW50LCBvciB0aGUgZGVsZXRlZCBpdGVtXG4gICAgLy8gcmVzdXJyZWN0cyBvbiB0aGUgbmV4dCBkZXZpY2UgdGhhdCBzdGlsbCBoYXMgYSBzdGFsZSBjb3B5IChpc3N1ZSAjMykuXG4gICAgUDBfVE9NQlNUT05FUzogMCxcbiAgICBQMV9QUk9GSUxFUzogMSxcbiAgICBQMl9TRVRUSU5HUzogMixcbiAgICBQM19BUElLRVlTOiAzLFxuICAgIFA0X1ZBVUxUOiA0LFxufTtcblxuLy8gV2FybmluZyB0aHJlc2hvbGRzIGZvciByZXRhaW5lZCBkZWxldGlvbiBoaXN0b3J5ICh0b21ic3RvbmVzIGFyZSBrZXB0XG4vLyBmb3JldmVyIHNvIGFuIG9mZmxpbmUgZGV2aWNlIHRoYXQgbmV2ZXIgbGVhcm5lZCBhYm91dCBhIGRlbGV0aW9uIGNhbm5vdFxuLy8gcmVzdXJyZWN0IHRoZSBpdGVtIFx1MjAxNCB0aGUgY291bnQgb25seSBncm93cywgc28gbnVkZ2UgdGhlIHVzZXIgdG8gdHJpbSBpdCkuXG5jb25zdCBUT01CU1RPTkVfV0FSTl9HRU5UTEUgPSA4O1xuY29uc3QgVE9NQlNUT05FX1dBUk5fU1RST05HID0gMTY7XG5cbmNvbnN0IHN0b3JhZ2UgPSBhcGkuc3RvcmFnZS5sb2NhbDtcbmxldCBwdXNoVGltZXIgPSBudWxsO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIENodW5raW5nIGhlbHBlcnNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIFNwbGl0IGEgSlNPTi1zZXJpYWxpc2VkIHZhbHVlIGludG8gPD04S0IgY2h1bmtzLlxuICogUmV0dXJucyBhbiBhcnJheSBvZiB7IGtleSwgdmFsdWUgfSBwYWlycyByZWFkeSBmb3Igc3RvcmFnZS5zeW5jLnNldCgpLlxuICovXG5mdW5jdGlvbiBjaHVua1ZhbHVlKGtleSwganNvblN0cmluZykge1xuICAgIGNvbnN0IGNodW5rcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwganNvblN0cmluZy5sZW5ndGg7IGkgKz0gTUFYX0lURU0gLSAxMDApIHtcbiAgICAgICAgLy8gUmVzZXJ2ZSB+MTAwIGJ5dGVzIGZvciB0aGUga2V5IG92ZXJoZWFkIGluIHRoZSBzdG9yZWQgaXRlbVxuICAgICAgICBjaHVua3MucHVzaChqc29uU3RyaW5nLnNsaWNlKGksIGkgKyBNQVhfSVRFTSAtIDEwMCkpO1xuICAgIH1cbiAgICBpZiAoY2h1bmtzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAvLyBGaXRzIGluIGEgc2luZ2xlIGl0ZW0gXHUyMDE0IHN0b3JlIGRpcmVjdGx5XG4gICAgICAgIHJldHVybiBbeyBrZXksIHZhbHVlOiBqc29uU3RyaW5nIH1dO1xuICAgIH1cbiAgICAvLyBNdWx0aXBsZSBjaHVua3NcbiAgICBjb25zdCBlbnRyaWVzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaHVua3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZW50cmllcy5wdXNoKHsga2V5OiBgJHtDSFVOS19QUkVGSVh9JHtrZXl9OiR7aX1gLCB2YWx1ZTogY2h1bmtzW2ldIH0pO1xuICAgIH1cbiAgICAvLyBTdG9yZSBhIG1ldGFkYXRhIGVudHJ5IHNvIHdlIGtub3cgaG93IG1hbnkgY2h1bmtzIHRoZXJlIGFyZVxuICAgIGVudHJpZXMucHVzaCh7IGtleSwgdmFsdWU6IEpTT04uc3RyaW5naWZ5KHsgX19jaHVua2VkOiB0cnVlLCBjb3VudDogY2h1bmtzLmxlbmd0aCB9KSB9KTtcbiAgICByZXR1cm4gZW50cmllcztcbn1cblxuLyoqXG4gKiBSZWFzc2VtYmxlIGNodW5rZWQgZGF0YSBmcm9tIGEgc3luYyBkYXRhIG9iamVjdC5cbiAqIFJldHVybnMgdGhlIHBhcnNlZCBKU09OIHZhbHVlLCBvciBudWxsIG9uIGVycm9yLlxuICovXG5mdW5jdGlvbiByZWFzc2VtYmxlRnJvbVN5bmNEYXRhKGtleSwgc3luY0RhdGEpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBtZXRhID0gdHlwZW9mIHN5bmNEYXRhW2tleV0gPT09ICdzdHJpbmcnID8gSlNPTi5wYXJzZShzeW5jRGF0YVtrZXldKSA6IHN5bmNEYXRhW2tleV07XG4gICAgICAgIGlmICghbWV0YSB8fCAhbWV0YS5fX2NodW5rZWQpIHtcbiAgICAgICAgICAgIC8vIE5vdCBjaHVua2VkIFx1MjAxNCBwYXJzZSBkaXJlY3RseVxuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBzeW5jRGF0YVtrZXldID09PSAnc3RyaW5nJyA/IEpTT04ucGFyc2Uoc3luY0RhdGFba2V5XSkgOiBzeW5jRGF0YVtrZXldO1xuICAgICAgICB9XG4gICAgICAgIGxldCBjb21iaW5lZCA9ICcnO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1ldGEuY291bnQ7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgY2h1bmtLZXkgPSBgJHtDSFVOS19QUkVGSVh9JHtrZXl9OiR7aX1gO1xuICAgICAgICAgICAgaWYgKHN5bmNEYXRhW2NodW5rS2V5XSA9PSBudWxsKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIGNvbWJpbmVkICs9IHN5bmNEYXRhW2NodW5rS2V5XTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShjb21iaW5lZCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBWZXJzaW9uIGNvbXBhcmlzb25cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIENvbXBhcmUgdHdvIGRvdHRlZCB2ZXJzaW9uIHN0cmluZ3MgbnVtZXJpY2FsbHkuXG4gKiBSZXR1cm5zIDEgaWYgYSA+IGIsIC0xIGlmIGEgPCBiLCAwIGlmIGVxdWFsLiBNaXNzaW5nIC8gbm9uLW51bWVyaWNcbiAqIGNvbXBvbmVudHMgYXJlIHRyZWF0ZWQgYXMgMCBzbyAnMS4xMC4wJyBjb3JyZWN0bHkgc29ydHMgYWJvdmUgJzEuOS4wJ1xuICogKGEgcGxhaW4gc3RyaW5nIGNvbXBhcmUgd291bGQgcHV0ICcxLjkuMCcgZmlyc3QpLlxuICovXG5mdW5jdGlvbiBjb21wYXJlU2VtdmVyKGEsIGIpIHtcbiAgICBjb25zdCBwYSA9IFN0cmluZyhhKS5zcGxpdCgnLicpO1xuICAgIGNvbnN0IHBiID0gU3RyaW5nKGIpLnNwbGl0KCcuJyk7XG4gICAgY29uc3QgbGVuID0gTWF0aC5tYXgocGEubGVuZ3RoLCBwYi5sZW5ndGgpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgY29uc3QgeCA9IHBhcnNlSW50KHBhW2ldLCAxMCkgfHwgMDtcbiAgICAgICAgY29uc3QgeSA9IHBhcnNlSW50KHBiW2ldLCAxMCkgfHwgMDtcbiAgICAgICAgaWYgKHggPiB5KSByZXR1cm4gMTtcbiAgICAgICAgaWYgKHggPCB5KSByZXR1cm4gLTE7XG4gICAgfVxuICAgIHJldHVybiAwO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEJ1aWxkIHN5bmMgcGF5bG9hZFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogUmVhZCBhbGwgbG9jYWwgZGF0YSBhbmQgYnVpbGQgYSBwcmlvcml0aXNlZCBsaXN0IG9mIGVudHJpZXMgdG8gc3luYy5cbiAqIFJldHVybnMgeyBlbnRyaWVzOiBbeyBrZXksIGpzb25TdHJpbmcsIHByaW9yaXR5LCBzaXplIH1dLCB0b3RhbFNpemUgfVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYnVpbGRTeW5jUGF5bG9hZCgpIHtcbiAgICBjb25zdCBhbGwgPSBhd2FpdCBzdG9yYWdlLmdldChudWxsKTtcbiAgICBjb25zdCBlbnRyaWVzID0gW107XG5cbiAgICAvLyBUMC01OiBhIHNlY3JldCBpcyBvbmx5IGV2ZXIgZW1pdHRlZCB0byBzdG9yYWdlLnN5bmMgKEdvb2dsZS9pQ2xvdWQpIGlmIGl0XG4gICAgLy8gaXMgYWxyZWFkeSBhbiBlbmNyeXB0ZWQgYmxvYi4gQW55IHZhbHVlIHRoYXQgaXMgTk9UIGNpcGhlcnRleHQgaXMgcmVmdXNlZFxuICAgIC8vIChkcm9wcGVkKSBzbyBwbGFpbnRleHQgcHJpdmF0ZSBrZXlzIC8gQVBJIHNlY3JldHMgLyBub3RlcyBjYW4gbmV2ZXIgbGVhdmVcbiAgICAvLyB0aGUgZGV2aWNlLiBgJydgIChlbXB0eSAvIGJ1bmtlcikgaXMgYWxsb3dlZCB0aHJvdWdoIGFzIG5vbi1zZWNyZXQuXG4gICAgY29uc3Qgc2VjcmV0T2sgPSB2ID0+ICF2IHx8IGlzQ2lwaGVydGV4dCh2KTtcblxuICAgIC8vIFRvbWJzdG9uZXMgKGlzc3VlICMzKS4gQSBkb2Mva2V5IGlzIHN1cHByZXNzZWQgZnJvbSB0aGUgcGF5bG9hZCB3aGVuIGFcbiAgICAvLyB0b21ic3RvbmUgZGF0ZWQgYXQtb3ItYWZ0ZXIgaXRzIHVwZGF0ZWRBdCBleGlzdHMsIHNvIGEgc3RhbGUgbG9jYWwgY29weVxuICAgIC8vIGNhbm5vdCByZS1wdXNoIGEgZGVsZXRlZCBpdGVtIGJhY2sgaW50byB0aGUgbWlycm9yLlxuICAgIGNvbnN0IGRlbGV0ZWREb2NzID0gKGFsbC5kZWxldGVkRG9jcyAmJiB0eXBlb2YgYWxsLmRlbGV0ZWREb2NzID09PSAnb2JqZWN0JykgPyBhbGwuZGVsZXRlZERvY3MgOiB7fTtcbiAgICBjb25zdCBkZWxldGVkS2V5cyA9IChhbGwuZGVsZXRlZEtleXMgJiYgdHlwZW9mIGFsbC5kZWxldGVkS2V5cyA9PT0gJ29iamVjdCcpID8gYWxsLmRlbGV0ZWRLZXlzIDoge307XG4gICAgY29uc3QgZGVsZXRlZFByb2ZpbGVzID0gKGFsbC5kZWxldGVkUHJvZmlsZXMgJiYgdHlwZW9mIGFsbC5kZWxldGVkUHJvZmlsZXMgPT09ICdvYmplY3QnKSA/IGFsbC5kZWxldGVkUHJvZmlsZXMgOiB7fTtcblxuICAgIC8vIEEgcHJvZmlsZSdzIHN0YWJsZSBpZGVudGl0eSBmb3IgdG9tYnN0b25lIC8gcmVjZW5jeSBrZXlpbmc6IGl0cyBwdWJrZXksXG4gICAgLy8gZWxzZSAoZm9yIGEgYnVua2VyKSBpdHMgcmVtb3RlIHB1YmtleS4gTWF0Y2hlcyBtZXJnZUludG9Mb2NhbCdzIGlkZW50aXR5T2YuXG4gICAgY29uc3QgaWRlbnRpdHlPZiA9IChwKSA9PiAocCAmJiAocC5wdWJLZXkgfHwgcC5yZW1vdGVQdWJrZXkpKSB8fCBudWxsO1xuXG4gICAgLy8gUDA6IFRvbWJzdG9uZXMgXHUyMDE0IHRoZSBndWFyYW50ZWVkIHNsb3QgKGVtaXR0ZWQgYmVmb3JlIGFueXRoaW5nIGVsc2UpLlxuICAgIGlmIChPYmplY3Qua2V5cyhkZWxldGVkRG9jcykubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoZGVsZXRlZERvY3MpO1xuICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6ICdkZWxldGVkRG9jcycsIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QMF9UT01CU1RPTkVTLCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICB9XG4gICAgaWYgKE9iamVjdC5rZXlzKGRlbGV0ZWRLZXlzKS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShkZWxldGVkS2V5cyk7XG4gICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogJ2RlbGV0ZWRLZXlzJywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAwX1RPTUJTVE9ORVMsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgIH1cbiAgICBpZiAoT2JqZWN0LmtleXMoZGVsZXRlZFByb2ZpbGVzKS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGpzb24gPSBKU09OLnN0cmluZ2lmeShkZWxldGVkUHJvZmlsZXMpO1xuICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6ICdkZWxldGVkUHJvZmlsZXMnLCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDBfVE9NQlNUT05FUywgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgfVxuXG4gICAgLy8gUDE6IFByb2ZpbGVzIChzdHJpcCBgaG9zdHNgIHRvIHNhdmUgc3BhY2UpICsgcHJvZmlsZUluZGV4XG4gICAgaWYgKGFsbC5wcm9maWxlcykge1xuICAgICAgICBjb25zdCBjbGVhblByb2ZpbGVzID0gYWxsLnByb2ZpbGVzXG4gICAgICAgICAgICAuZmlsdGVyKHAgPT4ge1xuICAgICAgICAgICAgICAgIC8vIFN1cHByZXNzIGEgcHJvZmlsZSBhIHRvbWJzdG9uZSBoYXMgc3VwZXJzZWRlZCAoZGVsZXRlZEF0ID49IHVwZGF0ZWRBdCksXG4gICAgICAgICAgICAgICAgLy8gc28gYSBzdGFsZSBsb2NhbCBjb3B5IGNhbm5vdCByZS1wdXNoIGEgZGVsZXRlZCBpZGVudGl0eS5cbiAgICAgICAgICAgICAgICBjb25zdCBpZCA9IGlkZW50aXR5T2YocCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuICEoaWQgIT0gbnVsbCAmJiBkZWxldGVkUHJvZmlsZXNbaWRdICE9IG51bGwgJiYgZGVsZXRlZFByb2ZpbGVzW2lkXSA+PSAocC51cGRhdGVkQXQgfHwgMCkpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5tYXAocCA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgeyBob3N0cywgLi4ucmVzdCB9ID0gcDtcbiAgICAgICAgICAgICAgICBpZiAocmVzdC5wcml2S2V5ICYmICFzZWNyZXRPayhyZXN0LnByaXZLZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybignW1N5bmNNYW5hZ2VyXSBSZWZ1c2luZyB0byBzeW5jIHBsYWludGV4dCBwcml2S2V5IFx1MjAxNCBkcm9wcGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIHJlc3QucHJpdktleSA9ICcnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoY2xlYW5Qcm9maWxlcyk7XG4gICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogJ3Byb2ZpbGVzJywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAxX1BST0ZJTEVTLCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICB9XG4gICAgaWYgKGFsbC5wcm9maWxlSW5kZXggIT0gbnVsbCkge1xuICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoYWxsLnByb2ZpbGVJbmRleCk7XG4gICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogJ3Byb2ZpbGVJbmRleCcsIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QMV9QUk9GSUxFUywgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgfVxuICAgIC8vIE5PVEU6IGBpc0VuY3J5cHRlZGAgKHRoZSBtYXN0ZXItcGFzc3dvcmQgbG9jayBmbGFnKSBpcyBkZWxpYmVyYXRlbHkgTk9UXG4gICAgLy8gc3luY2VkLiBJdCBpcyBhIHBlci1kZXZpY2UgZmFjdCBcdTIwMTQgYSBkZXZpY2UgaG9sZHMgdGhlIHBhc3N3b3JkIHZlcmlmaWVyIG9yXG4gICAgLy8gaXQgZG9lcyBub3QgXHUyMDE0IGFuZCBtaXJyb3JpbmcgaXQgb25jZSBsYXRjaGVkIGEgcGFzc3dvcmRsZXNzIGRldmljZSBpbnRvIGFcbiAgICAvLyBkZWFkLWVuZCBsb2NrIHNjcmVlbiBpdCBoYWQgbm8gcGFzc3dvcmQgZm9yLiBTZWUgc2VsZkhlYWxFbmNyeXB0aW9uRmxhZygpLlxuXG4gICAgLy8gUDI6IFNldHRpbmdzXG4gICAgY29uc3Qgc2V0dGluZ3NLZXlzID0gWydhdXRvTG9ja01pbnV0ZXMnLCAndmVyc2lvbicsICdwcm90b2NvbF9oYW5kbGVyJywgTE9DQUxfRU5BQkxFRF9LRVldO1xuICAgIGZvciAoY29uc3QgayBvZiBzZXR0aW5nc0tleXMpIHtcbiAgICAgICAgaWYgKGFsbFtrXSAhPSBudWxsKSB7XG4gICAgICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoYWxsW2tdKTtcbiAgICAgICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogaywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAyX1NFVFRJTkdTLCBzaXplOiBqc29uLmxlbmd0aCB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBGZWF0dXJlIGZsYWdzXG4gICAgZm9yIChjb25zdCBrIG9mIE9iamVjdC5rZXlzKGFsbCkpIHtcbiAgICAgICAgaWYgKGsuc3RhcnRzV2l0aCgnZmVhdHVyZTonKSkge1xuICAgICAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KGFsbFtrXSk7XG4gICAgICAgICAgICBlbnRyaWVzLnB1c2goeyBrZXk6IGssIGpzb25TdHJpbmc6IGpzb24sIHByaW9yaXR5OiBQUklPUklUWS5QMl9TRVRUSU5HUywgc2l6ZToganNvbi5sZW5ndGggfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBQMzogQVBJIGtleSB2YXVsdCBcdTIwMTQgb25seSBzeW5jIGtleXMgd2hvc2Ugc2VjcmV0IGlzIGNpcGhlcnRleHQgKFQwLTUpXG4gICAgaWYgKGFsbC5hcGlLZXlWYXVsdCAmJiBhbGwuYXBpS2V5VmF1bHQua2V5cykge1xuICAgICAgICBjb25zdCBzYWZlS2V5cyA9IHt9O1xuICAgICAgICBmb3IgKGNvbnN0IFtpZCwga2V5XSBvZiBPYmplY3QuZW50cmllcyhhbGwuYXBpS2V5VmF1bHQua2V5cykpIHtcbiAgICAgICAgICAgIC8vIFN1cHByZXNzIGEga2V5IGEgdG9tYnN0b25lIGhhcyBzdXBlcnNlZGVkIChkZWxldGVkQXQgPj0gdXBkYXRlZEF0KS5cbiAgICAgICAgICAgIGlmIChkZWxldGVkS2V5c1tpZF0gIT0gbnVsbCAmJiBkZWxldGVkS2V5c1tpZF0gPj0gKGtleS51cGRhdGVkQXQgfHwgMCkpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzZWNyZXRPayhrZXkuc2VjcmV0KSkge1xuICAgICAgICAgICAgICAgIHNhZmVLZXlzW2lkXSA9IGtleTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdbU3luY01hbmFnZXJdIFJlZnVzaW5nIHRvIHN5bmMgcGxhaW50ZXh0IEFQSSBzZWNyZXQgXHUyMDE0IGRyb3BwZWQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzYWZlVmF1bHQgPSB7IC4uLmFsbC5hcGlLZXlWYXVsdCwga2V5czogc2FmZUtleXMgfTtcbiAgICAgICAgY29uc3QganNvbiA9IEpTT04uc3RyaW5naWZ5KHNhZmVWYXVsdCk7XG4gICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogJ2FwaUtleVZhdWx0JywganNvblN0cmluZzoganNvbiwgcHJpb3JpdHk6IFBSSU9SSVRZLlAzX0FQSUtFWVMsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgIH1cblxuICAgIC8vIFA0OiBWYXVsdCBkb2NzIChpbmRpdmlkdWFsbHksIG5ld2VzdCBmaXJzdCkgXHUyMDE0IG9ubHkgaWYgY29udGVudCBpcyBjaXBoZXJ0ZXh0XG4gICAgaWYgKGFsbC52YXVsdERvY3MgJiYgdHlwZW9mIGFsbC52YXVsdERvY3MgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGNvbnN0IGRvY3MgPSBPYmplY3QudmFsdWVzKGFsbC52YXVsdERvY3MpLnNvcnQoKGEsIGIpID0+IChiLnVwZGF0ZWRBdCB8fCAwKSAtIChhLnVwZGF0ZWRBdCB8fCAwKSk7XG4gICAgICAgIGZvciAoY29uc3QgZG9jIG9mIGRvY3MpIHtcbiAgICAgICAgICAgIC8vIFN1cHByZXNzIGEgZG9jIGEgdG9tYnN0b25lIGhhcyBzdXBlcnNlZGVkIChkZWxldGVkQXQgPj0gdXBkYXRlZEF0KS5cbiAgICAgICAgICAgIGlmIChkZWxldGVkRG9jc1tkb2MucGF0aF0gIT0gbnVsbCAmJiBkZWxldGVkRG9jc1tkb2MucGF0aF0gPj0gKGRvYy51cGRhdGVkQXQgfHwgMCkpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghc2VjcmV0T2soZG9jLmNvbnRlbnQpKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdbU3luY01hbmFnZXJdIFJlZnVzaW5nIHRvIHN5bmMgcGxhaW50ZXh0IHZhdWx0IGNvbnRlbnQgXHUyMDE0IGRyb3BwZWQnKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGRvY0tleSA9IGB2YXVsdERvYzoke2RvYy5wYXRofWA7XG4gICAgICAgICAgICBjb25zdCBqc29uID0gSlNPTi5zdHJpbmdpZnkoZG9jKTtcbiAgICAgICAgICAgIGVudHJpZXMucHVzaCh7IGtleTogZG9jS2V5LCBqc29uU3RyaW5nOiBqc29uLCBwcmlvcml0eTogUFJJT1JJVFkuUDRfVkFVTFQsIHNpemU6IGpzb24ubGVuZ3RoIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGVudHJpZXM7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gUHVzaCB0byBzeW5jXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBXcml0ZSBhIHByaW9yaXRpc2VkLCBwcmUtY2h1bmtlZCBwYXlsb2FkIHRvIHN0b3JhZ2Uuc3luYywgcmV0cnlpbmcgb24gYW5cbiAqIG92ZXItcXVvdGEgcmVqZWN0aW9uIGJ5IGRyb3BwaW5nIHRoZSBsb3dlc3QtcHJpb3JpdHkgdGllciBzdGlsbCBwcmVzZW50IGFuZFxuICogdHJ5aW5nIGFnYWluLiBQMCAodG9tYnN0b25lcykgYW5kIFAxIChwcm9maWxlcykgYXJlIE5FVkVSIGRyb3BwZWQgXHUyMDE0IGEgZnVsbFxuICogYmF0Y2ggZmFpbHVyZSB3b3VsZCBzdHJhbmQgYSBkZWxldGlvbiBvciBhIGtleSwgc28gdGhlIGltcG9ydGFudCB0aWVycyBzeW5jXG4gKiBldmVuIHdoZW4gdGhlIGJ1bGt5IG9uZXMgY2Fubm90LlxuICpcbiAqIEBwYXJhbSB7eyBwcmlvcml0eTogbnVtYmVyLCBjaHVua3M6IHtrZXk6c3RyaW5nLCB2YWx1ZTpzdHJpbmd9W10gfVtdfSBpbmNsdWRlZFxuICogQHJldHVybnMge1Byb21pc2U8bnVtYmVyPn0gbnVtYmVyIG9mIGRhdGEga2V5cyBhY3R1YWxseSB3cml0dGVuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIHNldFN5bmNSZXNwZWN0aW5nUXVvdGEoaW5jbHVkZWQpIHtcbiAgICBsZXQgdGllcnMgPSBpbmNsdWRlZC5zbGljZSgpO1xuICAgIC8vIEd1YXJkIGFnYWluc3QgYW4gdW5ib3VuZGVkIGxvb3A6IGF0IG1vc3Qgb25lIHJldHJ5IHBlciBkaXN0aW5jdCBwcmlvcml0eS5cbiAgICBmb3IgKGxldCBhdHRlbXB0ID0gMDsgOyBhdHRlbXB0KyspIHtcbiAgICAgICAgY29uc3Qgc3luY1BheWxvYWQgPSB7fTtcbiAgICAgICAgY29uc3QgYWxsU3luY0tleXMgPSBbXTtcbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIHRpZXJzKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGMgb2YgaXRlbS5jaHVua3MpIHtcbiAgICAgICAgICAgICAgICBzeW5jUGF5bG9hZFtjLmtleV0gPSBjLnZhbHVlO1xuICAgICAgICAgICAgICAgIGFsbFN5bmNLZXlzLnB1c2goYy5rZXkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHN5bmNQYXlsb2FkW1NZTkNfTUVUQV9LRVldID0gSlNPTi5zdHJpbmdpZnkoeyBsYXN0V3JpdHRlbkF0OiBEYXRlLm5vdygpLCBrZXlzOiBhbGxTeW5jS2V5cyB9KTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgYXBpLnN0b3JhZ2Uuc3luYy5zZXQoc3luY1BheWxvYWQpO1xuXG4gICAgICAgICAgICAvLyBDbGVhbiBvcnBoYW5lZCBjaHVua3M6IHJlbW92ZSBhbnkgZXhpc3Rpbmcgc3luYyBrZXkgbm90IGluIG91ciBwYXlsb2FkLlxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCBleGlzdGluZyA9IGF3YWl0IGFwaS5zdG9yYWdlLnN5bmMuZ2V0KG51bGwpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG9ycGhhbktleXMgPSBPYmplY3Qua2V5cyhleGlzdGluZykuZmlsdGVyKGsgPT5cbiAgICAgICAgICAgICAgICAgICAgayAhPT0gU1lOQ19NRVRBX0tFWSAmJiAhYWxsU3luY0tleXMuaW5jbHVkZXMoaylcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGlmIChvcnBoYW5LZXlzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgYXBpLnN0b3JhZ2Uuc3luYy5yZW1vdmUob3JwaGFuS2V5cyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgICAgLy8gTm9uLWNyaXRpY2FsIGNsZWFudXBcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhbGxTeW5jS2V5cy5sZW5ndGg7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIC8vIE92ZXIgcXVvdGEgKG9yIE1BWF9JVEVNUykgXHUyMDE0IGRyb3AgdGhlIGxvd2VzdC1wcmlvcml0eSB0aWVyIHN0aWxsXG4gICAgICAgICAgICAvLyBwcmVzZW50IGFuZCByZXRyeS4gTmV2ZXIgZHJvcCBQMC9QMS5cbiAgICAgICAgICAgIGNvbnN0IG1heFByaW9yaXR5ID0gdGllcnMucmVkdWNlKChtLCB0KSA9PiBNYXRoLm1heChtLCB0LnByaW9yaXR5KSwgLTEpO1xuICAgICAgICAgICAgaWYgKG1heFByaW9yaXR5IDw9IFBSSU9SSVRZLlAxX1BST0ZJTEVTKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgZTsgLy8gbm90aGluZyBkcm9wcGFibGUgbGVmdDsgUDAvUDEgbXVzdCBzdXJ2aXZlIG9yIGZhaWwgbG91ZGx5XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBiZWZvcmUgPSB0aWVycy5sZW5ndGg7XG4gICAgICAgICAgICB0aWVycyA9IHRpZXJzLmZpbHRlcih0ID0+IHQucHJpb3JpdHkgPCBtYXhQcmlvcml0eSk7XG4gICAgICAgICAgICBpZiAodGllcnMubGVuZ3RoID09PSBiZWZvcmUpIHRocm93IGU7IC8vIG5vIHByb2dyZXNzIFx1MjAxNCBiYWlsXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYFtTeW5jTWFuYWdlcl0gc3luYy5zZXQgb3ZlciBxdW90YSBcdTIwMTQgZHJvcHBlZCBwcmlvcml0eSAke21heFByaW9yaXR5fSB0aWVyLCByZXRyeWluZ2ApO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHVzaFRvU3luYygpIHtcbiAgICBpZiAoIWFwaS5zdG9yYWdlLnN5bmMpIHJldHVybjtcblxuICAgIGNvbnN0IGVuYWJsZWQgPSBhd2FpdCBpc1N5bmNFbmFibGVkKCk7XG4gICAgaWYgKCFlbmFibGVkKSByZXR1cm47XG5cbiAgICB0cnkge1xuICAgICAgICAvLyBQdWxsLW1lcmdlIEJFRk9SRSBidWlsZGluZzogb3JwaGFuLWNsZWFudXAgYmVsb3cgd2lwZXMgYW55IG1pcnJvciBrZXlcbiAgICAgICAgLy8gYWJzZW50IGZyb20gdGhpcyBkZXZpY2UncyBwYXlsb2FkLCBzbyB3ZSBtdXN0IGZpcnN0IGFic29yYiByZW1vdGVcbiAgICAgICAgLy8gc3RhdGUgKGVzcGVjaWFsbHkgcmVtb3RlIHRvbWJzdG9uZXMsIHdoaWNoIHRoZW4gc3VwcHJlc3MgdGhlIG1hdGNoaW5nXG4gICAgICAgIC8vIGRvY3Mva2V5cyBmcm9tIHRoZSBwYXlsb2FkIHdlIGFyZSBhYm91dCB0byBidWlsZCkuIFdpdGhvdXQgdGhpcyBhXG4gICAgICAgIC8vIGRldmljZSB0aGF0IG5ldmVyIGxlYXJuZWQgb2YgYSBkZWxldGlvbiB3b3VsZCByZS1wdXNoIHRoZSBpdGVtLlxuICAgICAgICBjb25zdCByZW1vdGUgPSBhd2FpdCBwdWxsRnJvbVN5bmMoKTtcbiAgICAgICAgaWYgKHJlbW90ZSkgYXdhaXQgbWVyZ2VJbnRvTG9jYWwocmVtb3RlKTtcblxuICAgICAgICBjb25zdCBlbnRyaWVzID0gYXdhaXQgYnVpbGRTeW5jUGF5bG9hZCgpO1xuXG4gICAgICAgIC8vIFNvcnQgYnkgcHJpb3JpdHkgKGFzY2VuZGluZyA9IG1vc3QgaW1wb3J0YW50IGZpcnN0KVxuICAgICAgICBlbnRyaWVzLnNvcnQoKGEsIGIpID0+IGEucHJpb3JpdHkgLSBiLnByaW9yaXR5KTtcblxuICAgICAgICAvLyBCdWlsZCB0aGUgaW5jbHVkZWQgc2V0IHJlc3BlY3RpbmcgdGhlIGluLWNvZGUgYnl0ZS9pdGVtIGJ1ZGdldC5cbiAgICAgICAgbGV0IHVzZWRCeXRlcyA9IDA7XG4gICAgICAgIGxldCB1c2VkSXRlbXMgPSAwO1xuICAgICAgICBjb25zdCBpbmNsdWRlZCA9IFtdO1xuICAgICAgICBsZXQgYnVkZ2V0RXhoYXVzdGVkID0gZmFsc2U7XG5cbiAgICAgICAgZm9yIChjb25zdCBlbnRyeSBvZiBlbnRyaWVzKSB7XG4gICAgICAgICAgICBpZiAoYnVkZ2V0RXhoYXVzdGVkKSBicmVhaztcblxuICAgICAgICAgICAgY29uc3QgY2h1bmtzID0gY2h1bmtWYWx1ZShlbnRyeS5rZXksIGVudHJ5Lmpzb25TdHJpbmcpO1xuICAgICAgICAgICAgbGV0IGVudHJ5U2l6ZSA9IDA7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGMgb2YgY2h1bmtzKSB7XG4gICAgICAgICAgICAgICAgZW50cnlTaXplICs9IGMua2V5Lmxlbmd0aCArICh0eXBlb2YgYy52YWx1ZSA9PT0gJ3N0cmluZycgPyBjLnZhbHVlLmxlbmd0aCA6IEpTT04uc3RyaW5naWZ5KGMudmFsdWUpLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh1c2VkQnl0ZXMgKyBlbnRyeVNpemUgPiBTWU5DX1FVT1RBIC0gNTAwIHx8IHVzZWRJdGVtcyArIGNodW5rcy5sZW5ndGggPiBNQVhfSVRFTVMgLSA1KSB7XG4gICAgICAgICAgICAgICAgaWYgKGVudHJ5LnByaW9yaXR5IDw9IFBSSU9SSVRZLlAzX0FQSUtFWVMpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQ3JpdGljYWwgZGF0YSAoaW5jbC4gUDAgdG9tYnN0b25lcykgXHUyMDE0IGluY2x1ZGUgYW55d2F5OyB0aGVcbiAgICAgICAgICAgICAgICAgICAgLy8gcnVudGltZSBxdW90YSBmYWxsYmFjayB3aWxsIHNoZWQgYnVsa3kgdGllcnMgaWYgdGhlIEFQSSByZWplY3RzLlxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybihgW1N5bmNNYW5hZ2VyXSBCdWRnZXQgZXhoYXVzdGVkIGF0IHByaW9yaXR5ICR7ZW50cnkucHJpb3JpdHl9LCBza2lwcGluZyByZW1haW5pbmcgZW50cmllc2ApO1xuICAgICAgICAgICAgICAgICAgICBidWRnZXRFeGhhdXN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGluY2x1ZGVkLnB1c2goeyBwcmlvcml0eTogZW50cnkucHJpb3JpdHksIGNodW5rcyB9KTtcbiAgICAgICAgICAgIHVzZWRCeXRlcyArPSBlbnRyeVNpemU7XG4gICAgICAgICAgICB1c2VkSXRlbXMgKz0gY2h1bmtzLmxlbmd0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHdyaXR0ZW4gPSBhd2FpdCBzZXRTeW5jUmVzcGVjdGluZ1F1b3RhKGluY2x1ZGVkKTtcbiAgICAgICAgY29uc29sZS5sb2coYFtTeW5jTWFuYWdlcl0gUHVzaGVkICR7d3JpdHRlbn0gZW50cmllcyAoJHt1c2VkQnl0ZXN9IGJ5dGVzKSB0byBzeW5jIHN0b3JhZ2VgKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tTeW5jTWFuYWdlcl0gcHVzaFRvU3luYyBlcnJvcjonLCBlKTtcbiAgICAgICAgLy8gTG9jYWwgc3RvcmFnZSBpcyB1bmFmZmVjdGVkIFx1MjAxNCBncmFjZWZ1bCBkZWdyYWRhdGlvblxuICAgIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBQdWxsIGZyb20gc3luY1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogUmVhZCBhbGwgZGF0YSBmcm9tIHN5bmMgc3RvcmFnZSBhbmQgcmV0dXJuIGFzIGEgcGxhaW4gb2JqZWN0IHdpdGhcbiAqIHJlYXNzZW1ibGVkIGNodW5rZWQgdmFsdWVzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHVsbEZyb21TeW5jKCkge1xuICAgIGlmICghYXBpLnN0b3JhZ2Uuc3luYykgcmV0dXJuIG51bGw7XG5cbiAgICB0cnkge1xuICAgICAgICBjb25zdCByYXcgPSBhd2FpdCBhcGkuc3RvcmFnZS5zeW5jLmdldChudWxsKTtcbiAgICAgICAgaWYgKCFyYXcgfHwgT2JqZWN0LmtleXMocmF3KS5sZW5ndGggPT09IDApIHJldHVybiBudWxsO1xuXG4gICAgICAgIGNvbnN0IG1ldGFTdHIgPSByYXdbU1lOQ19NRVRBX0tFWV07XG4gICAgICAgIGlmICghbWV0YVN0cikgcmV0dXJuIG51bGw7XG5cbiAgICAgICAgbGV0IG1ldGE7XG4gICAgICAgIHRyeSB7IG1ldGEgPSBKU09OLnBhcnNlKG1ldGFTdHIpOyB9IGNhdGNoIHsgcmV0dXJuIG51bGw7IH1cblxuICAgICAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICAgICAgLy8gQ29sbGVjdCB0aGUgbm9uLWNodW5rLCBub24tbWV0YSBrZXlzXG4gICAgICAgIGNvbnN0IGRhdGFLZXlzID0gbWV0YS5rZXlzLmZpbHRlcihrID0+ICFrLnN0YXJ0c1dpdGgoQ0hVTktfUFJFRklYKSAmJiBrICE9PSBTWU5DX01FVEFfS0VZKTtcblxuICAgICAgICBmb3IgKGNvbnN0IGtleSBvZiBkYXRhS2V5cykge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSByZWFzc2VtYmxlRnJvbVN5bmNEYXRhKGtleSwgcmF3KTtcbiAgICAgICAgICAgIGlmICh2YWx1ZSAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJlc3VsdC5fc3luY01ldGEgPSBtZXRhO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW1N5bmNNYW5hZ2VyXSBwdWxsRnJvbVN5bmMgZXJyb3I6JywgZSk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBNZXJnZSBsb2dpY1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogTWVyZ2Ugc3luYyBkYXRhIGludG8gbG9jYWwgc3RvcmFnZSB3aXRoIGNvbmZsaWN0IHJlc29sdXRpb24uXG4gKlxuICogQ09ORElUSU9OIDMgKGlzc3VlICMzIGxvb3AgaW52YXJpYW50KTogZXZlcnkgd3JpdGUgaGVyZSBnb2VzIHRocm91Z2ggdGhlIHJhd1xuICogbW9kdWxlLWxldmVsIGBzdG9yYWdlYCAoPSBhcGkuc3RvcmFnZS5sb2NhbCkgdmlhIGEgc2luZ2xlIGBzdG9yYWdlLnNldGAuIEl0XG4gKiBNVVNUIE5PVCBjYWxsIHRoZSBzdG9yZS1sYXllciBoZWxwZXJzIChkZWxldGVEb2N1bWVudExvY2FsIC8gc2F2ZURvY3VtZW50TG9jYWxcbiAqIC8gZGVsZXRlQXBpS2V5IC8gc2F2ZUFwaUtleSksIGJlY2F1c2UgdGhvc2UgY2FsbCBzY2hlZHVsZVN5bmNQdXNoKCkgXHUyMDE0IGEgbWVyZ2VcbiAqIHRoYXQgc2NoZWR1bGVkIGEgcHVzaCB3b3VsZCB0dXJuIGV2ZXJ5IGluY29taW5nIHN5bmMgaW50byBhbiBvdXRnb2luZyBvbmUgYW5kXG4gKiBsb29wLiBBIHJlZ3Jlc3Npb24gdGVzdCBhc3NlcnRzIG1lcmdlSW50b0xvY2FsIG5ldmVyIHNjaGVkdWxlcyBhIHB1c2guXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBtZXJnZUludG9Mb2NhbChzeW5jRGF0YSkge1xuICAgIGlmICghc3luY0RhdGEpIHJldHVybjtcblxuICAgIGNvbnN0IGxvY2FsID0gYXdhaXQgc3RvcmFnZS5nZXQobnVsbCk7XG4gICAgY29uc3QgdXBkYXRlcyA9IHt9O1xuICAgIGxldCBjaGFuZ2VkID0gZmFsc2U7XG5cbiAgICAvLyBEZXRlY3QgZnJlc2ggaW5zdGFsbDogbm8gcHJvZmlsZXMsIG9yIGEgc2luZ2xlIHVudG91Y2hlZCBkZWZhdWx0IHByb2ZpbGUuXG4gICAgLy8gKERlZmF1bHQga2V5cyBhcmUgbm93IHdyYXBwZWQgYXQgcmVzdCwgc28gYHByaXZLZXlgIGlzIHRydXRoeSBldmVuIG9uIGFcbiAgICAvLyBmcmVzaCBpbnN0YWxsIFx1MjAxNCBkZXRlY3QgdGhlIHVudG91Y2hlZCBkZWZhdWx0IGJ5IGl0cyBuYW1lICsgYWJzZW5jZSBvZiBhbnlcbiAgICAvLyBwZXItc2l0ZSBncmFudHMgaW5zdGVhZC4pXG4gICAgLy9cbiAgICAvLyBDMTogYSBsb25lIHByb2ZpbGUgaXMgb25seSBcInVudG91Y2hlZC9mcmVzaFwiIHdoZW4gaXQgY2FycmllcyBubyBpZGVudGl0eS5cbiAgICAvLyBBIGxvbmUgQlVOS0VSIHByb2ZpbGUgaGFzIHByaXZLZXk6JycgYnV0IElTIGEgcmVhbCBpZGVudGl0eSAodHlwZS9idW5rZXJVcmxcbiAgICAvLyAvcmVtb3RlUHVia2V5KSwgYW5kIG11c3Qgbm90IGJlIHRyZWF0ZWQgYXMgZnJlc2ggYW5kIHdpcGVkIGJ5IGEgc3luYyBwdWxsLlxuICAgIGNvbnN0IGhhc0lkZW50aXR5ID0gKHApID0+ICEhKHAgJiYgKFxuICAgICAgICBwLnByaXZLZXkgfHwgcC5wdWJLZXkgfHwgcC50eXBlID09PSAnYnVua2VyJyB8fCBwLmJ1bmtlclVybCB8fCBwLnJlbW90ZVB1YmtleVxuICAgICkpO1xuICAgIGNvbnN0IGxvbmUgPSBsb2NhbC5wcm9maWxlcyAmJiBsb2NhbC5wcm9maWxlcy5sZW5ndGggPT09IDEgPyBsb2NhbC5wcm9maWxlc1swXSA6IG51bGw7XG4gICAgY29uc3QgaXNGcmVzaCA9ICFsb2NhbC5wcm9maWxlcyB8fFxuICAgICAgICBsb2NhbC5wcm9maWxlcy5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgKGxvbmUgJiYgIWxvbmUucHJpdktleSAmJiAhaGFzSWRlbnRpdHkobG9uZSkpIHx8XG4gICAgICAgIChsb25lICYmIGxvbmUubmFtZSA9PT0gJ0RlZmF1bHQgTm9zdHIgUHJvZmlsZScgJiZcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGxvbmUuaG9zdHMgfHwge30pLmxlbmd0aCA9PT0gMCk7XG5cbiAgICAvLyBTdGFibGUgaWRlbnRpdHkgZm9yIHByb2ZpbGUgbWF0Y2hpbmcgLyB0b21ic3RvbmVzOiBwdWJLZXksIGVsc2UgdGhlXG4gICAgLy8gYnVua2VyJ3MgcmVtb3RlUHVia2V5LiBNYXRjaGVzIGJ1aWxkU3luY1BheWxvYWQncyBpZGVudGl0eU9mLlxuICAgIGNvbnN0IGlkZW50aXR5T2YgPSAocCkgPT4gKHAgJiYgKHAucHViS2V5IHx8IHAucmVtb3RlUHVia2V5KSkgfHwgbnVsbDtcblxuICAgIC8vIENhcHR1cmUgdGhlIEFDVElWRSBpZGVudGl0eSBCRUZPUkUgYW55IHJlb3JkZXJpbmcvcmVtb3ZhbCBzbyB0aGUgYWN0aXZlXG4gICAgLy8gaW5kZXggY2FuIGZvbGxvdyB0aGF0IGlkZW50aXR5IHRocm91Z2ggdGhlIG1lcmdlIChhIGtleSBtYW5hZ2VyIG11c3Qgbm90XG4gICAgLy8gc2lsZW50bHkgc3dpdGNoIHdoaWNoIGlkZW50aXR5IGlzIGFjdGl2ZSBqdXN0IGJlY2F1c2UgYSBwcm9maWxlIG9yZGVyZWRcbiAgICAvLyBiZWZvcmUgaXQgd2FzIHJlbW92ZWQgb24gYW5vdGhlciBkZXZpY2UpLlxuICAgIGNvbnN0IGxvY2FsQWN0aXZlSW5kZXggPSAobG9jYWwucHJvZmlsZUluZGV4ICE9IG51bGwpID8gbG9jYWwucHJvZmlsZUluZGV4IDogMDtcbiAgICBjb25zdCBhY3RpdmVJZCA9IChsb2NhbC5wcm9maWxlcyAmJiBsb2NhbC5wcm9maWxlc1tsb2NhbEFjdGl2ZUluZGV4XSlcbiAgICAgICAgPyBpZGVudGl0eU9mKGxvY2FsLnByb2ZpbGVzW2xvY2FsQWN0aXZlSW5kZXhdKVxuICAgICAgICA6IG51bGw7XG5cbiAgICAvLyAtLS0gUHJvZmlsZSB0b21ic3RvbmVzIChpc3N1ZSAjMykgXHUyMDE0IHVuaW9uIGxvY2FsICsgcmVtb3RlLCBtYXggcGVyIGlkZW50aXR5IC0tLVxuICAgIGNvbnN0IGRlbGV0ZWRQcm9maWxlcyA9IHsgLi4uKGxvY2FsLmRlbGV0ZWRQcm9maWxlcyAmJiB0eXBlb2YgbG9jYWwuZGVsZXRlZFByb2ZpbGVzID09PSAnb2JqZWN0JyA/IGxvY2FsLmRlbGV0ZWRQcm9maWxlcyA6IHt9KSB9O1xuICAgIGlmIChzeW5jRGF0YS5kZWxldGVkUHJvZmlsZXMgJiYgdHlwZW9mIHN5bmNEYXRhLmRlbGV0ZWRQcm9maWxlcyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgZm9yIChjb25zdCBbaWQsIHRzXSBvZiBPYmplY3QuZW50cmllcyhzeW5jRGF0YS5kZWxldGVkUHJvZmlsZXMpKSB7XG4gICAgICAgICAgICBpZiAoZGVsZXRlZFByb2ZpbGVzW2lkXSA9PSBudWxsIHx8IHRzID4gZGVsZXRlZFByb2ZpbGVzW2lkXSkgZGVsZXRlZFByb2ZpbGVzW2lkXSA9IHRzO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gLS0tIFByb2ZpbGVzIChQMSkgXHUyMDE0IHB1YmtleS1rZXllZCBtZXJnZSArIHRvbWJzdG9uZSByZW1vdmFsIC0tLVxuICAgIC8vIE1hdGNoIGJ5IHN0YWJsZSBpZGVudGl0eSByYXRoZXIgdGhhbiBhcnJheSBpbmRleCwgc28gYSByZW9yZGVyZWQgb3IgcGFydGlhbFxuICAgIC8vIHN5bmMgcGF5bG9hZCBjYW5ub3Qgb3ZlcndyaXRlIG9uZSBpZGVudGl0eSdzIGtleSBtYXRlcmlhbCB3aXRoIGFub3RoZXIncy5cbiAgICBsZXQgbWVyZ2VkUHJvZmlsZXMgPSBsb2NhbC5wcm9maWxlcyA/IFsuLi5sb2NhbC5wcm9maWxlc10gOiBudWxsO1xuICAgIGxldCBwcm9maWxlc0NoYW5nZWQgPSBmYWxzZTtcbiAgICBpZiAoc3luY0RhdGEucHJvZmlsZXMpIHtcbiAgICAgICAgaWYgKGlzRnJlc2gpIHtcbiAgICAgICAgICAgIC8vIEZyZXNoIGluc3RhbGwgXHUyMDE0IGFkb3B0IHN5bmMgcHJvZmlsZXMgZW50aXJlbHlcbiAgICAgICAgICAgIG1lcmdlZFByb2ZpbGVzID0gc3luY0RhdGEucHJvZmlsZXMuc2xpY2UoKTtcbiAgICAgICAgICAgIHByb2ZpbGVzQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSBpZiAobG9jYWwucHJvZmlsZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IGluZGV4QnlJZGVudGl0eSA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgIG1lcmdlZFByb2ZpbGVzLmZvckVhY2goKHAsIGkpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBpZCA9IGlkZW50aXR5T2YocCk7XG4gICAgICAgICAgICAgICAgaWYgKGlkICYmICFpbmRleEJ5SWRlbnRpdHkuaGFzKGlkKSkgaW5kZXhCeUlkZW50aXR5LnNldChpZCwgaSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgc3luY1Byb2ZpbGUgb2Ygc3luY0RhdGEucHJvZmlsZXMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpZCA9IGlkZW50aXR5T2Yoc3luY1Byb2ZpbGUpO1xuICAgICAgICAgICAgICAgIGlmIChpZCAmJiBpbmRleEJ5SWRlbnRpdHkuaGFzKGlkKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpID0gaW5kZXhCeUlkZW50aXR5LmdldChpZCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxvY2FsUHJvZmlsZSA9IG1lcmdlZFByb2ZpbGVzW2ldO1xuICAgICAgICAgICAgICAgICAgICBpZiAoKHN5bmNQcm9maWxlLnVwZGF0ZWRBdCB8fCAwKSA+IChsb2NhbFByb2ZpbGUudXBkYXRlZEF0IHx8IDApKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBTeW5jIGlzIG5ld2VyIFx1MjAxNCBhZG9wdCBpdCBidXQgcHJlc2VydmUgbG9jYWwgcGVyLXNpdGUgaG9zdHNcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lcmdlZFByb2ZpbGVzW2ldID0geyAuLi5zeW5jUHJvZmlsZSwgaG9zdHM6IGxvY2FsUHJvZmlsZS5ob3N0cyB8fCB7fSB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvZmlsZXNDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQSBnZW51aW5lbHkgbmV3IGlkZW50aXR5IG5vdCBwcmVzZW50IGxvY2FsbHkgXHUyMDE0IGFwcGVuZCBpdC5cbiAgICAgICAgICAgICAgICAgICAgaW5kZXhCeUlkZW50aXR5LnNldChpZCwgbWVyZ2VkUHJvZmlsZXMubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgbWVyZ2VkUHJvZmlsZXMucHVzaChzeW5jUHJvZmlsZSk7XG4gICAgICAgICAgICAgICAgICAgIHByb2ZpbGVzQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIEEga2V5bGVzcyByZW1vdGUgcHJvZmlsZSBjYW5ub3QgYmUgcmVjb25jaWxlZCB0byBhIGxvY2FsIG9uZVxuICAgICAgICAgICAgICAgIC8vIHNhZmVseSAobm8gaWRlbnRpdHkgdG8gbWF0Y2ggb24pLCBzbyBpdCBpcyBza2lwcGVkLlxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gQXBwbHkgcHJvZmlsZSB0b21ic3RvbmVzOiByZW1vdmUgYW55IG1lcmdlZCBwcm9maWxlIHdob3NlIGlkZW50aXR5IGhhc1xuICAgIC8vICh1cGRhdGVkQXQgPD0gZGVsZXRlZEF0KSBcdTIwMTQgZGVsZXRpb24gd2lucyB0aWVzLCBjb25zaXN0ZW50IHdpdGggZG9jcy9rZXlzLlxuICAgIC8vIEEgcmVjcmVhdGVkIHByb2ZpbGUgKHVwZGF0ZWRBdCA+IGRlbGV0ZWRBdCkgc3Vydml2ZXMuIE5ldmVyIHBydW5lIHRvbWJzdG9uZXMuXG4gICAgaWYgKG1lcmdlZFByb2ZpbGVzICYmIE9iamVjdC5rZXlzKGRlbGV0ZWRQcm9maWxlcykubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBrZXB0ID0gbWVyZ2VkUHJvZmlsZXMuZmlsdGVyKHAgPT4ge1xuICAgICAgICAgICAgY29uc3QgaWQgPSBpZGVudGl0eU9mKHApO1xuICAgICAgICAgICAgY29uc3QgdHMgPSBpZCAhPSBudWxsID8gZGVsZXRlZFByb2ZpbGVzW2lkXSA6IG51bGw7XG4gICAgICAgICAgICByZXR1cm4gISh0cyAhPSBudWxsICYmIChwLnVwZGF0ZWRBdCB8fCAwKSA8PSB0cyk7XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBTYWZldHk6IG5ldmVyIGxldCBhIHN5bmMgbWVyZ2UgbGVhdmUgWkVSTyBwcm9maWxlcyAodGhhdCB3b3VsZCBvcnBoYW5cbiAgICAgICAgLy8gdGhlIGFjdGl2ZSBpbmRleCBhbmQgYnJpY2sgdGhlIFVJKS4gSWYgcmVtb3ZhbCB3b3VsZCBlbXB0eSB0aGUgbGlzdCxcbiAgICAgICAgLy8ga2VlcCB0aGUgcHJvZmlsZXMgYXMtaXMgXHUyMDE0IHRoZSBsb2NhbCB1c2VyIGNhbiBzdGlsbCBkZWxldGUgZGVsaWJlcmF0ZWx5LlxuICAgICAgICAvLyBEZWxpYmVyYXRlIHRyYWRlLW9mZjogY3Jvc3MtZGV2aWNlIGRlbGV0aW9uIGRvZXMgTk9UIGNvbnZlcmdlIG9uIGFcbiAgICAgICAgLy8gZGV2aWNlIHdoZXJlIGFwcGx5aW5nIGl0IHdvdWxkIGxlYXZlIHplcm8gcHJvZmlsZXM7IHRoZSBwcm9maWxlIHN0YXlzXG4gICAgICAgIC8vIHRvbWJzdG9uZS1zdXBwcmVzc2VkIG9uIGVtaXQsIHNvIGl0IGRvZXMgbm90IHJlLXByb3BhZ2F0ZSB0byBvdGhlcnMuXG4gICAgICAgIGlmIChrZXB0Lmxlbmd0aCAhPT0gbWVyZ2VkUHJvZmlsZXMubGVuZ3RoICYmIGtlcHQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgbWVyZ2VkUHJvZmlsZXMgPSBrZXB0O1xuICAgICAgICAgICAgcHJvZmlsZXNDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwcm9maWxlc0NoYW5nZWQgJiYgbWVyZ2VkUHJvZmlsZXMpIHtcbiAgICAgICAgdXBkYXRlcy5wcm9maWxlcyA9IG1lcmdlZFByb2ZpbGVzO1xuICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyAtLS0gUHJvZmlsZSBpbmRleCAoUDEpIFx1MjAxNCBGT0xMT1cgVEhFIEFDVElWRSBJREVOVElUWSBhY3Jvc3MgdGhlIG1lcmdlIC0tLVxuICAgIC8vIFRoZSBhY3RpdmUgaW5kZXggdHJhY2tzIHRoZSBhY3RpdmUgaWRlbnRpdHksIG5vdCBhIHJhdyBzbG90OiBpZiBhIHByb2ZpbGVcbiAgICAvLyBvcmRlcmVkIGJlZm9yZSB0aGUgYWN0aXZlIG9uZSBpcyByZW1vdmVkIG9uIGFub3RoZXIgZGV2aWNlLCB0aGUgaW5kZXhcbiAgICAvLyBzaGlmdHMgc28gdGhlIFNBTUUgaWRlbnRpdHkgc3RheXMgYWN0aXZlLiBUaGUgaW5kZXggb25seSBtb3ZlcyB0byBhXG4gICAgLy8gZGlmZmVyZW50IGlkZW50aXR5IHdoZW4gdGhlIGFjdGl2ZSBvbmUgaXMgaXRzZWxmIGdvbmUgKHRvbWJzdG9uZWQpLCBvciBvbiBhXG4gICAgLy8gZnJlc2ggYWRvcHQgXHUyMDE0IHRoZW4gaXQgZmFsbHMgYmFjayB0byB0aGUgc2FmZSBjbGFtcC4gc2Vzc2lvbktleXMgKGluZGV4LWtleWVkLFxuICAgIC8vIGluIHRoZSBiYWNrZ3JvdW5kKSBtYXkgbWlzYWxpZ24gYWZ0ZXIgYSBtZXJnZS1zaWRlIHJlbW92YWwsIGJ1dCB0aGVcbiAgICAvLyBnZXRQbGFpbnRleHRQcml2S2V5IGd1YXJkIGZhaWxzIENMT1NFRCBcdTIwMTQgaXQgdmVyaWZpZXMgdGhlIGNhY2hlZCBrZXkgZGVyaXZlc1xuICAgIC8vIHRoZSBwcm9maWxlJ3MgcHViS2V5IGFuZCByZWZ1c2VzIG9uIG1pc21hdGNoLCBuZXZlciBzaWduaW5nIHdpdGggdGhlIHdyb25nXG4gICAgLy8gaWRlbnRpdHkuIFwiUmVmdXNlIHVudGlsIHJlLXVubG9ja1wiIGlzIHRoZSBhY2NlcHRlZCBzYWZlIGJlaGF2aW91ciBoZXJlLlxuICAgIGlmIChtZXJnZWRQcm9maWxlcyAmJiBtZXJnZWRQcm9maWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGxldCBkZXNpcmVkSW5kZXg7XG4gICAgICAgIGlmIChzeW5jRGF0YS5wcm9maWxlcyAmJiBpc0ZyZXNoKSB7XG4gICAgICAgICAgICAvLyBGcmVzaCBhZG9wdCBcdTIwMTQgdGFrZSBzeW5jJ3MgYWN0aXZlIGluZGV4LCBjbGFtcGVkIGludG8gcmFuZ2UuXG4gICAgICAgICAgICBjb25zdCBiYXNlID0gc3luY0RhdGEucHJvZmlsZUluZGV4ICE9IG51bGwgPyBzeW5jRGF0YS5wcm9maWxlSW5kZXggOiAwO1xuICAgICAgICAgICAgZGVzaXJlZEluZGV4ID0gTWF0aC5taW4oTWF0aC5tYXgoYmFzZSwgMCksIG1lcmdlZFByb2ZpbGVzLmxlbmd0aCAtIDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZm9sbG93ZWQgPSBhY3RpdmVJZCAhPSBudWxsXG4gICAgICAgICAgICAgICAgPyBtZXJnZWRQcm9maWxlcy5maW5kSW5kZXgocCA9PiBpZGVudGl0eU9mKHApID09PSBhY3RpdmVJZClcbiAgICAgICAgICAgICAgICA6IC0xO1xuICAgICAgICAgICAgZGVzaXJlZEluZGV4ID0gZm9sbG93ZWQgPj0gMFxuICAgICAgICAgICAgICAgID8gZm9sbG93ZWRcbiAgICAgICAgICAgICAgICA6IE1hdGgubWluKE1hdGgubWF4KGxvY2FsQWN0aXZlSW5kZXgsIDApLCBtZXJnZWRQcm9maWxlcy5sZW5ndGggLSAxKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGVzaXJlZEluZGV4ICE9PSBsb2NhbC5wcm9maWxlSW5kZXgpIHtcbiAgICAgICAgICAgIHVwZGF0ZXMucHJvZmlsZUluZGV4ID0gZGVzaXJlZEluZGV4O1xuICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAtLS0gRW5jcnlwdGlvbiBzdGF0ZSAoUDEpIC0tLVxuICAgIC8vIEEyOiBgaXNFbmNyeXB0ZWRgIGlzIE5PVCBtZXJnZWQuIFRoZSBtYXN0ZXItcGFzc3dvcmQgbG9jayBpcyBhIHBlci1kZXZpY2VcbiAgICAvLyBmYWN0IHByb3ZlbiBieSB0aGUgbG9jYWwgdmVyaWZpZXI7IG1pcnJvcmluZyBpdCBvbmNlIGxhdGNoZWQgYSBwYXNzd29yZGxlc3NcbiAgICAvLyBkZXZpY2UgaW50byBhIGxvY2sgc2NyZWVuIGl0IGhhZCBubyBwYXNzd29yZCBmb3IuIFNlZSBzZWxmSGVhbEVuY3J5cHRpb25GbGFnKCkuXG5cbiAgICAvLyAtLS0gU2V0dGluZ3MgKFAyKSBcdTIwMTQgbGFzdC13cml0ZS13aW5zIC0tLVxuICAgIGNvbnN0IHNldHRpbmdzS2V5cyA9IFsnYXV0b0xvY2tNaW51dGVzJywgJ3ZlcnNpb24nLCAncHJvdG9jb2xfaGFuZGxlcicsIExPQ0FMX0VOQUJMRURfS0VZXTtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBzZXR0aW5nc0tleXMpIHtcbiAgICAgICAgaWYgKHN5bmNEYXRhW2tleV0gIT0gbnVsbCAmJiBzeW5jRGF0YVtrZXldICE9PSBsb2NhbFtrZXldKSB7XG4gICAgICAgICAgICAvLyBGb3IgdmVyc2lvbiwgb25seSBhY2NlcHQgYSBudW1lcmljYWxseS1oaWdoZXIgb25lICgnMS4xMC4wJyA+ICcxLjkuMCcpLlxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ3ZlcnNpb24nICYmIGxvY2FsLnZlcnNpb24gJiYgY29tcGFyZVNlbXZlcihzeW5jRGF0YS52ZXJzaW9uLCBsb2NhbC52ZXJzaW9uKSA8PSAwKSBjb250aW51ZTtcbiAgICAgICAgICAgIHVwZGF0ZXNba2V5XSA9IHN5bmNEYXRhW2tleV07XG4gICAgICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBGZWF0dXJlIGZsYWdzXG4gICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoc3luY0RhdGEpKSB7XG4gICAgICAgIGlmIChrZXkuc3RhcnRzV2l0aCgnZmVhdHVyZTonKSAmJiBzeW5jRGF0YVtrZXldICE9PSBsb2NhbFtrZXldKSB7XG4gICAgICAgICAgICB1cGRhdGVzW2tleV0gPSBzeW5jRGF0YVtrZXldO1xuICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAtLS0gVG9tYnN0b25lcyAoaXNzdWUgIzMpIFx1MjAxNCB1bmlvbiBsb2NhbCArIHJlbW90ZSwgbWF4IGRlbGV0ZWRBdCBwZXIga2V5IC0tLVxuICAgIGNvbnN0IGRlbGV0ZWREb2NzID0geyAuLi4obG9jYWwuZGVsZXRlZERvY3MgJiYgdHlwZW9mIGxvY2FsLmRlbGV0ZWREb2NzID09PSAnb2JqZWN0JyA/IGxvY2FsLmRlbGV0ZWREb2NzIDoge30pIH07XG4gICAgaWYgKHN5bmNEYXRhLmRlbGV0ZWREb2NzICYmIHR5cGVvZiBzeW5jRGF0YS5kZWxldGVkRG9jcyA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgZm9yIChjb25zdCBbcGF0aCwgdHNdIG9mIE9iamVjdC5lbnRyaWVzKHN5bmNEYXRhLmRlbGV0ZWREb2NzKSkge1xuICAgICAgICAgICAgaWYgKGRlbGV0ZWREb2NzW3BhdGhdID09IG51bGwgfHwgdHMgPiBkZWxldGVkRG9jc1twYXRoXSkgZGVsZXRlZERvY3NbcGF0aF0gPSB0cztcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCBkZWxldGVkS2V5cyA9IHsgLi4uKGxvY2FsLmRlbGV0ZWRLZXlzICYmIHR5cGVvZiBsb2NhbC5kZWxldGVkS2V5cyA9PT0gJ29iamVjdCcgPyBsb2NhbC5kZWxldGVkS2V5cyA6IHt9KSB9O1xuICAgIGlmIChzeW5jRGF0YS5kZWxldGVkS2V5cyAmJiB0eXBlb2Ygc3luY0RhdGEuZGVsZXRlZEtleXMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIGZvciAoY29uc3QgW2lkLCB0c10gb2YgT2JqZWN0LmVudHJpZXMoc3luY0RhdGEuZGVsZXRlZEtleXMpKSB7XG4gICAgICAgICAgICBpZiAoZGVsZXRlZEtleXNbaWRdID09IG51bGwgfHwgdHMgPiBkZWxldGVkS2V5c1tpZF0pIGRlbGV0ZWRLZXlzW2lkXSA9IHRzO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gLS0tIEFQSSBLZXkgVmF1bHQgKFAzKSAtLS1cbiAgICAvLyBCdWlsZCB0aGUgbWVyZ2VkIGtleSBzZXQsIGZvbGQgaW4gYW55IHJlbW90ZSBrZXlzLCB0aGVuIGFwcGx5IGtleVxuICAgIC8vIHRvbWJzdG9uZXMuIFJ1bnMgZXZlbiB3aGVuIHRoZSBwdWxsIGNhcnJpZXMgTk8gYXBpS2V5VmF1bHQsIHNvIGFcbiAgICAvLyBkZWxldGUtb25seSBwdWxsIGNhbiBzdGlsbCByZW1vdmUgYSBsb2NhbGx5LWhlbGQga2V5LlxuICAgIHtcbiAgICAgICAgbGV0IGJhc2VWYXVsdCA9IGxvY2FsLmFwaUtleVZhdWx0IHx8IG51bGw7XG4gICAgICAgIGxldCBtZXJnZWRLZXlzID0geyAuLi4oKGxvY2FsLmFwaUtleVZhdWx0ICYmIGxvY2FsLmFwaUtleVZhdWx0LmtleXMpIHx8IHt9KSB9O1xuICAgICAgICBsZXQgYXBpQ2hhbmdlZCA9IGZhbHNlO1xuICAgICAgICBpZiAoKCFsb2NhbC5hcGlLZXlWYXVsdCB8fCBpc0ZyZXNoKSAmJiBzeW5jRGF0YS5hcGlLZXlWYXVsdCkge1xuICAgICAgICAgICAgYmFzZVZhdWx0ID0gc3luY0RhdGEuYXBpS2V5VmF1bHQ7XG4gICAgICAgICAgICBtZXJnZWRLZXlzID0geyAuLi4oc3luY0RhdGEuYXBpS2V5VmF1bHQua2V5cyB8fCB7fSkgfTtcbiAgICAgICAgICAgIGFwaUNoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKHN5bmNEYXRhLmFwaUtleVZhdWx0KSB7XG4gICAgICAgICAgICBjb25zdCBzeW5jS2V5cyA9IHN5bmNEYXRhLmFwaUtleVZhdWx0LmtleXMgfHwge307XG4gICAgICAgICAgICBmb3IgKGNvbnN0IFtpZCwgc3luY0tleV0gb2YgT2JqZWN0LmVudHJpZXMoc3luY0tleXMpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbG9jYWxLZXkgPSBtZXJnZWRLZXlzW2lkXTtcbiAgICAgICAgICAgICAgICBpZiAoIWxvY2FsS2V5IHx8IChzeW5jS2V5LnVwZGF0ZWRBdCB8fCAwKSA+IChsb2NhbEtleS51cGRhdGVkQXQgfHwgMCkpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVyZ2VkS2V5c1tpZF0gPSBzeW5jS2V5O1xuICAgICAgICAgICAgICAgICAgICBhcGlDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gQXBwbHkgdG9tYnN0b25lcy4gRGVsZXRpb24gd2lucyB0aWVzIChgPD1gKSwgY29uc2lzdGVudCB3aXRoIHRoZVxuICAgICAgICAvLyBlbWl0LXNpZGUgc3VwcHJlc3Npb24gKGBkZWxldGVkQXQgPj0gdXBkYXRlZEF0YCk6IGEga2V5IHdob3NlXG4gICAgICAgIC8vIHVwZGF0ZWRBdCBlcXVhbHMgdGhlIHRvbWJzdG9uZSB3YXMgZGVsZXRlZCBpbiB0aGF0IHNhbWUgc2Vjb25kLCBzbyBpdFxuICAgICAgICAvLyBtdXN0IE5PVCBiZSByZS1hZGRlZCBmcm9tIHRoZSBtaXJyb3Igb24gdGhlIGRlbGV0aW5nIGRldmljZS4gVGhlXG4gICAgICAgIC8vIHRvbWJzdG9uZSBpcyBORVZFUiBwcnVuZWQgaGVyZSBcdTIwMTQgcHJ1bmluZyBpdCB3b3VsZCBsZXQgdGhlIHZlcnkgY29weSBpdFxuICAgICAgICAvLyBqdXN0IHJlbW92ZWQgcmVzdXJyZWN0IG9uIHRoZSBuZXh0IG1lcmdlLiBUb21ic3RvbmVzIGFyZSBjbGVhcmVkIG9ubHlcbiAgICAgICAgLy8gYXQgdGhlIHNvdXJjZSAoc2F2ZUFwaUtleSBvbiBzYW1lLWRldmljZSByZWNyZWF0ZSkgb3IgYnkgdGhlIHVzZXIuXG4gICAgICAgIGZvciAoY29uc3QgaWQgb2YgT2JqZWN0LmtleXMobWVyZ2VkS2V5cykpIHtcbiAgICAgICAgICAgIGNvbnN0IHRzID0gZGVsZXRlZEtleXNbaWRdO1xuICAgICAgICAgICAgaWYgKHRzICE9IG51bGwgJiYgKG1lcmdlZEtleXNbaWRdLnVwZGF0ZWRBdCB8fCAwKSA8PSB0cykge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBtZXJnZWRLZXlzW2lkXTtcbiAgICAgICAgICAgICAgICBhcGlDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoYXBpQ2hhbmdlZCAmJiBiYXNlVmF1bHQpIHtcbiAgICAgICAgICAgIHVwZGF0ZXMuYXBpS2V5VmF1bHQgPSB7IC4uLmJhc2VWYXVsdCwga2V5czogbWVyZ2VkS2V5cyB9O1xuICAgICAgICAgICAgY2hhbmdlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyAtLS0gVmF1bHQgZG9jcyAoUDQpIC0tLVxuICAgIGNvbnN0IG1lcmdlZERvY3MgPSB7IC4uLihsb2NhbC52YXVsdERvY3MgfHwge30pIH07XG4gICAgbGV0IGRvY3NDaGFuZ2VkID0gZmFsc2U7XG4gICAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXMoc3luY0RhdGEpKSB7XG4gICAgICAgIGlmICgha2V5LnN0YXJ0c1dpdGgoJ3ZhdWx0RG9jOicpKSBjb250aW51ZTtcbiAgICAgICAgY29uc3QgZG9jID0gc3luY0RhdGFba2V5XTtcbiAgICAgICAgaWYgKCFkb2MgfHwgIWRvYy5wYXRoKSBjb250aW51ZTtcbiAgICAgICAgY29uc3QgbG9jYWxEb2MgPSBtZXJnZWREb2NzW2RvYy5wYXRoXTtcbiAgICAgICAgaWYgKCFsb2NhbERvYyB8fCAoZG9jLnVwZGF0ZWRBdCB8fCAwKSA+IChsb2NhbERvYy51cGRhdGVkQXQgfHwgMCkpIHtcbiAgICAgICAgICAgIG1lcmdlZERvY3NbZG9jLnBhdGhdID0gZG9jO1xuICAgICAgICAgICAgZG9jc0NoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIEFwcGx5IGRvYyB0b21ic3RvbmVzLiBEZWxldGlvbiB3aW5zIHRpZXMgKGA8PWApLCBhbmQgdG9tYnN0b25lcyBhcmUgTkVWRVJcbiAgICAvLyBwcnVuZWQgaGVyZSBcdTIwMTQgc2FtZSByYXRpb25hbGUgYXMgdGhlIEFQSSBrZXlzIGFib3ZlLlxuICAgIGZvciAoY29uc3QgcGF0aCBvZiBPYmplY3Qua2V5cyhtZXJnZWREb2NzKSkge1xuICAgICAgICBjb25zdCB0cyA9IGRlbGV0ZWREb2NzW3BhdGhdO1xuICAgICAgICBpZiAodHMgIT0gbnVsbCAmJiAobWVyZ2VkRG9jc1twYXRoXS51cGRhdGVkQXQgfHwgMCkgPD0gdHMpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBtZXJnZWREb2NzW3BhdGhdO1xuICAgICAgICAgICAgZG9jc0NoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChkb2NzQ2hhbmdlZCkge1xuICAgICAgICB1cGRhdGVzLnZhdWx0RG9jcyA9IG1lcmdlZERvY3M7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIFBlcnNpc3QgdGhlIHRvbWJzdG9uZSBzZXRzLiBUaGVzZSBhcmUgYSBQVVJFIFVOSU9OIChtYXggZGVsZXRlZEF0IHBlclxuICAgIC8vIGtleSkgXHUyMDE0IHRoZSBtZXJnZSBuZXZlciByZW1vdmVzIGEgdG9tYnN0b25lLCBzbyB0aGV5IGFyZSByZXRhaW5lZCBmb3JldmVyXG4gICAgLy8gYW5kIGFuIG9mZmxpbmUgZGV2aWNlIGNhbm5vdCByZXN1cnJlY3QgYSBkZWxldGlvbi4gVGhleSBhcmUgY2xlYXJlZCBvbmx5XG4gICAgLy8gYXQgdGhlIHNvdXJjZSAoc2F2ZURvY3VtZW50TG9jYWwvc2F2ZUFwaUtleSBvbiBzYW1lLWRldmljZSByZWNyZWF0ZSkgb3IgYnlcbiAgICAvLyB0aGUgdXNlciB2aWEgY2xlYXJEZWxldGlvbkhpc3RvcnkuXG4gICAgLy9cbiAgICAvLyBSZXNpZHVhbCAoYWNjZXB0ZWQsIGRvY3VtZW50ZWQpOiBwdXJlIGNyb3NzLWRldmljZSBjbG9jayBza2V3IFx1MjAxNCBhIGxpdmVcbiAgICAvLyBjb3B5IHdob3NlIHVwZGF0ZWRBdCBpcyBnZW51aW5lbHkgTkVXRVIgdGhhbiB0aGUgZGVsZXRlJ3MgdGltZXN0YW1wIFx1MjAxNCB3aW5zXG4gICAgLy8gdW5kZXIgdGhlIGA8PWAgcnVsZSBhbmQgaXMga2VwdC4gVGhhdCBpcyBhbiBpbmhlcmVudCBsYXN0LXdyaXRlLXdpbnMgbGltaXRcbiAgICAvLyB0aGF0IHRvbWJzdG9uZXMgZG8gbm90IHJlc29sdmU7IFwiZml4aW5nXCIgaXQgYnkgcHJ1bmluZyB3b3VsZCByZWludHJvZHVjZVxuICAgIC8vIHRoZSBzYW1lLXNlY29uZCByZXN1cnJlY3Rpb24gYnVnLCBzbyBpdCBpcyBsZWZ0IGFzLWlzLlxuICAgIGlmIChKU09OLnN0cmluZ2lmeShkZWxldGVkRG9jcykgIT09IEpTT04uc3RyaW5naWZ5KGxvY2FsLmRlbGV0ZWREb2NzIHx8IHt9KSkge1xuICAgICAgICB1cGRhdGVzLmRlbGV0ZWREb2NzID0gZGVsZXRlZERvY3M7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIH1cbiAgICBpZiAoSlNPTi5zdHJpbmdpZnkoZGVsZXRlZEtleXMpICE9PSBKU09OLnN0cmluZ2lmeShsb2NhbC5kZWxldGVkS2V5cyB8fCB7fSkpIHtcbiAgICAgICAgdXBkYXRlcy5kZWxldGVkS2V5cyA9IGRlbGV0ZWRLZXlzO1xuICAgICAgICBjaGFuZ2VkID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKEpTT04uc3RyaW5naWZ5KGRlbGV0ZWRQcm9maWxlcykgIT09IEpTT04uc3RyaW5naWZ5KGxvY2FsLmRlbGV0ZWRQcm9maWxlcyB8fCB7fSkpIHtcbiAgICAgICAgdXBkYXRlcy5kZWxldGVkUHJvZmlsZXMgPSBkZWxldGVkUHJvZmlsZXM7XG4gICAgICAgIGNoYW5nZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChjaGFuZ2VkKSB7XG4gICAgICAgIC8vIFJhdyBsb2NhbCB3cml0ZSBPTkxZIFx1MjAxNCBuZXZlciBzY2hlZHVsZVN5bmNQdXNoIChsb29wIGludmFyaWFudCkuXG4gICAgICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHVwZGF0ZXMpO1xuICAgICAgICBjb25zb2xlLmxvZygnW1N5bmNNYW5hZ2VyXSBNZXJnZWQgc3luYyBkYXRhIGludG8gbG9jYWw6JywgT2JqZWN0LmtleXModXBkYXRlcykpO1xuICAgIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBEZWJvdW5jZWQgcHVzaFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogU2NoZWR1bGUgYSBzeW5jIHB1c2ggd2l0aCBhIDItc2Vjb25kIGRlYm91bmNlLlxuICogRXhwb3J0ZWQgZm9yIHVzZSBieSBzdG9yZXMgYW5kIHRoZSBzdG9yYWdlIGludGVyY2VwdG9yLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2NoZWR1bGVTeW5jUHVzaCgpIHtcbiAgICBpZiAoIWFwaS5zdG9yYWdlLnN5bmMpIHJldHVybjtcbiAgICBpZiAocHVzaFRpbWVyKSBjbGVhclRpbWVvdXQocHVzaFRpbWVyKTtcbiAgICBwdXNoVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcHVzaFRpbWVyID0gbnVsbDtcbiAgICAgICAgcHVzaFRvU3luYygpO1xuICAgIH0sIDIwMDApO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIERlbGV0aW9uLWhpc3RvcnkgKHRvbWJzdG9uZSkgcmV0ZW50aW9uIGhlbHBlcnNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIFRvdGFsIG51bWJlciBvZiByZXRhaW5lZCBkZWxldGlvbiByZWNvcmRzIChkb2NzICsga2V5cykuIEdyb3dzIG92ZXIgdGhlIGxpZmVcbiAqIG9mIHRoZSBpbnN0YWxsIGJlY2F1c2UgdG9tYnN0b25lcyBhcmUga2VwdCBmb3JldmVyIChhbiBvZmZsaW5lIGRldmljZSB0aGF0XG4gKiBuZXZlciBsZWFybmVkIG9mIGEgZGVsZXRpb24gbXVzdCBub3QgYmUgYWJsZSB0byByZXN1cnJlY3QgdGhlIGl0ZW0pLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0VG9tYnN0b25lQ291bnQoKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHN0b3JhZ2UuZ2V0KHsgZGVsZXRlZERvY3M6IHt9LCBkZWxldGVkS2V5czoge30sIGRlbGV0ZWRQcm9maWxlczoge30gfSk7XG4gICAgY29uc3QgZG9jcyA9IGRhdGEuZGVsZXRlZERvY3MgJiYgdHlwZW9mIGRhdGEuZGVsZXRlZERvY3MgPT09ICdvYmplY3QnID8gZGF0YS5kZWxldGVkRG9jcyA6IHt9O1xuICAgIGNvbnN0IGtleXMgPSBkYXRhLmRlbGV0ZWRLZXlzICYmIHR5cGVvZiBkYXRhLmRlbGV0ZWRLZXlzID09PSAnb2JqZWN0JyA/IGRhdGEuZGVsZXRlZEtleXMgOiB7fTtcbiAgICBjb25zdCBwcm9maWxlcyA9IGRhdGEuZGVsZXRlZFByb2ZpbGVzICYmIHR5cGVvZiBkYXRhLmRlbGV0ZWRQcm9maWxlcyA9PT0gJ29iamVjdCcgPyBkYXRhLmRlbGV0ZWRQcm9maWxlcyA6IHt9O1xuICAgIHJldHVybiBPYmplY3Qua2V5cyhkb2NzKS5sZW5ndGggKyBPYmplY3Qua2V5cyhrZXlzKS5sZW5ndGggKyBPYmplY3Qua2V5cyhwcm9maWxlcykubGVuZ3RoO1xufVxuXG4vKipcbiAqIFdhcm5pbmcgbGV2ZWwgZm9yIGEgZ2l2ZW4gcmV0YWluZWQtZGVsZXRpb24gY291bnQ6XG4gKiAgIDAgPSBmaW5lLCAxID0gZ2VudGxlIG51ZGdlICg+PSA4KSwgMiA9IHN0cm9uZ2VyIHdhcm5pbmcgKD49IDE2KS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvbWJzdG9uZVdhcm5pbmdMZXZlbChjb3VudCkge1xuICAgIGlmIChjb3VudCA+PSBUT01CU1RPTkVfV0FSTl9TVFJPTkcpIHJldHVybiAyO1xuICAgIGlmIChjb3VudCA+PSBUT01CU1RPTkVfV0FSTl9HRU5UTEUpIHJldHVybiAxO1xuICAgIHJldHVybiAwO1xufVxuXG4vKipcbiAqIENsZWFyIGFsbCByZXRhaW5lZCBkZWxldGlvbiBoaXN0b3J5LiBJbmZvcm1lZC11c2VyIGNob2ljZTogYSBkZXZpY2UgdGhhdCBoYXNcbiAqIGJlZW4gb2ZmbGluZSBzaW5jZSBiZWZvcmUgb25lIG9mIHRoZXNlIGRlbGV0aW9ucyBjYW4sIG9uIGl0cyBuZXh0IHN5bmMsXG4gKiByZS1hZGQgdGhlIGl0ZW0gXHUyMDE0IGJlY2F1c2UgdGhlIHJlY29yZCB0aGF0IHRvbGQgZXZlcnlvbmUgaXQgd2FzIGRlbGV0ZWQgaXNcbiAqIG5vdyBnb25lLiBTY2hlZHVsZXMgYSBwdXNoIHNvIHRoZSBjbGVhcmVkIHN0YXRlIHByb3BhZ2F0ZXMgdG8gdGhlIG1pcnJvci5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFyRGVsZXRpb25IaXN0b3J5KCkge1xuICAgIGF3YWl0IHN0b3JhZ2Uuc2V0KHsgZGVsZXRlZERvY3M6IHt9LCBkZWxldGVkS2V5czoge30sIGRlbGV0ZWRQcm9maWxlczoge30gfSk7XG4gICAgc2NoZWR1bGVTeW5jUHVzaCgpO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEVuY3J5cHRpb24tZmxhZyBzZWxmLWhlYWwgKEEyKVxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogQ2xlYXIgYSBib2d1cyBgaXNFbmNyeXB0ZWQ9dHJ1ZWAgd2hlbiB0aGlzIGRldmljZSBob2xkcyBubyBldmlkZW5jZSBvZiByZWFsXG4gKiBwYXNzd29yZCBwcm90ZWN0aW9uIFx1MjAxNCBubyBwYXNzd29yZCB2ZXJpZmllciAocGFzc3dvcmRIYXNoKSBBTkQgbm8gcHJvZmlsZSBrZXlcbiAqIHRoYXQgaXMgYSBQQVNTV09SRCBibG9iLlxuICpcbiAqIEdhdGluZyBkZXRhaWwgKGNyaXRpY2FsKTogZXZpZGVuY2UgaXMgYSBQQVNTV09SRCBibG9iIChpc1Bhc3N3b3JkQmxvYiksIE5PVCBhXG4gKiBkZXZpY2Uta2V5IGJsb2IuIFNpbmNlIHYxLjcuMCBldmVyeSBrZXkgaXMgd3JhcHBlZCBhdCByZXN0IGV2ZW4gZm9yIHRoZVxuICogcGFzc3dvcmRsZXNzIExldmVsLTAgdXNlciwgc28gYSBub3JtYWwgcGFzc3dvcmRsZXNzIGluc3RhbGwgaXMgZnVsbCBvZlxuICogZGV2aWNlLWtleSBjaXBoZXJ0ZXh0OyBrZXlpbmcgb2ZmIHRoYXQgd291bGQgd3JvbmdseSBrZWVwIHRoZSBmbGFnIGxhdGNoZWQuXG4gKiBPbmx5IGEgcGFzc3dvcmQtZGVyaXZlZCBibG9iIChvciB0aGUgdmVyaWZpZXIpIHByb3ZlcyBhIG1hc3RlciBwYXNzd29yZC5cbiAqXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPn0gdHJ1ZSBpZiBhIGJvZ3VzIGZsYWcgd2FzIGNsZWFyZWQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZWxmSGVhbEVuY3J5cHRpb25GbGFnKCkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCBzdG9yYWdlLmdldCh7IGlzRW5jcnlwdGVkOiBmYWxzZSwgcGFzc3dvcmRIYXNoOiBudWxsLCBwcm9maWxlczogW10gfSk7XG4gICAgaWYgKCFkYXRhLmlzRW5jcnlwdGVkKSByZXR1cm4gZmFsc2U7ICAgLy8gbm90aGluZyBsYXRjaGVkIFx1MjAxNCBub3RoaW5nIHRvIGhlYWxcbiAgICBpZiAoZGF0YS5wYXNzd29yZEhhc2gpIHJldHVybiBmYWxzZTsgICAvLyByZWFsIHZlcmlmaWVyIHByZXNlbnQgXHUyMDE0IGtlZXAgdGhlIGZsYWdcblxuICAgIGNvbnN0IGhhc1Bhc3N3b3JkQmxvYiA9IEFycmF5LmlzQXJyYXkoZGF0YS5wcm9maWxlcykgJiZcbiAgICAgICAgZGF0YS5wcm9maWxlcy5zb21lKHAgPT4gcCAmJiBpc1Bhc3N3b3JkQmxvYihwLnByaXZLZXkpKTtcbiAgICBpZiAoaGFzUGFzc3dvcmRCbG9iKSByZXR1cm4gZmFsc2U7ICAgICAvLyBwYXNzd29yZC1lbmNyeXB0ZWQga2V5IG1hdGVyaWFsIFx1MjAxNCBrZWVwXG5cbiAgICAvLyBGbGFnIGlzIGJvZ3VzIChlLmcuIG1pcnJvcmVkIGluIGZyb20gYW5vdGhlciBkZXZpY2UgdGhhdCBESUQgaGF2ZSBhXG4gICAgLy8gcGFzc3dvcmQpLiBDbGVhciBpdCBzbyB0aGlzIGRldmljZSBpcyBub3Qgc3RyYW5kZWQgYXQgYSBkZWFkLWVuZCB1bmxvY2suXG4gICAgYXdhaXQgc3RvcmFnZS5zZXQoeyBpc0VuY3J5cHRlZDogZmFsc2UgfSk7XG4gICAgY29uc29sZS5sb2coJ1tTeW5jTWFuYWdlcl0gQ2xlYXJlZCBib2d1cyBpc0VuY3J5cHRlZCBmbGFnIChubyBwYXNzd29yZCB2ZXJpZmllci9ibG9iKScpO1xuICAgIHJldHVybiB0cnVlO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIEVuYWJsZSAvIGRpc2FibGVcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaXNTeW5jRW5hYmxlZCgpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgc3RvcmFnZS5nZXQoeyBbTE9DQUxfRU5BQkxFRF9LRVldOiB0cnVlIH0pO1xuICAgIHJldHVybiBkYXRhW0xPQ0FMX0VOQUJMRURfS0VZXTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNldFN5bmNFbmFibGVkKGVuYWJsZWQpIHtcbiAgICBhd2FpdCBzdG9yYWdlLnNldCh7IFtMT0NBTF9FTkFCTEVEX0tFWV06IGVuYWJsZWQgfSk7XG4gICAgaWYgKGVuYWJsZWQpIHtcbiAgICAgICAgc2NoZWR1bGVTeW5jUHVzaCgpO1xuICAgIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBJbml0aWFsaXNhdGlvblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogQ2FsbGVkIG9uY2Ugb24gc3RhcnR1cCAoZnJvbSBiYWNrZ3JvdW5kLmpzKS5cbiAqIFB1bGxzIGZyb20gc3luYywgbWVyZ2VzLCB0aGVuIGxpc3RlbnMgZm9yIHJlbW90ZSBjaGFuZ2VzLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW5pdFN5bmMoKSB7XG4gICAgLy8gU2VsZi1oZWFsIGEgYm9ndXMgZW5jcnlwdGlvbiBmbGFnIGZpcnN0IFx1MjAxNCB0aGlzIG11c3QgcnVuIGV2ZW4gd2hlbiBzeW5jIGlzXG4gICAgLy8gdW5hdmFpbGFibGUgb3IgZGlzYWJsZWQsIGJlY2F1c2UgdGhlIGJhZCBzdGF0ZSBpdCBmaXhlcyBtYXkgaGF2ZSBiZWVuIGxlZnRcbiAgICAvLyBiZWhpbmQgYnkgYW4gZWFybGllciAobm93LXJlbW92ZWQpIGlzRW5jcnlwdGVkLXN5bmNpbmcgYnVpbGQuXG4gICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgc2VsZkhlYWxFbmNyeXB0aW9uRmxhZygpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignW1N5bmNNYW5hZ2VyXSBzZWxmSGVhbEVuY3J5cHRpb25GbGFnIGZhaWxlZDonLCBlKTtcbiAgICB9XG5cbiAgICBpZiAoIWFwaS5zdG9yYWdlLnN5bmMpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1tTeW5jTWFuYWdlcl0gc3RvcmFnZS5zeW5jIG5vdCBhdmFpbGFibGUgXHUyMDE0IHNraXBwaW5nJyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBlbmFibGVkID0gYXdhaXQgaXNTeW5jRW5hYmxlZCgpO1xuICAgIGlmICghZW5hYmxlZCkge1xuICAgICAgICBjb25zb2xlLmxvZygnW1N5bmNNYW5hZ2VyXSBQbGF0Zm9ybSBzeW5jIGRpc2FibGVkJyk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBQdWxsICsgbWVyZ2VcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBzeW5jRGF0YSA9IGF3YWl0IHB1bGxGcm9tU3luYygpO1xuICAgICAgICBpZiAoc3luY0RhdGEpIHtcbiAgICAgICAgICAgIGF3YWl0IG1lcmdlSW50b0xvY2FsKHN5bmNEYXRhKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdbU3luY01hbmFnZXJdIEluaXRpYWwgcHVsbCttZXJnZSBjb21wbGV0ZScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tTeW5jTWFuYWdlcl0gTm8gc3luYyBkYXRhIGZvdW5kIFx1MjAxNCBmcmVzaCBzeW5jJyk7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tTeW5jTWFuYWdlcl0gSW5pdGlhbCBwdWxsIGZhaWxlZDonLCBlKTtcbiAgICB9XG5cbiAgICAvLyBMaXN0ZW4gZm9yIHJlbW90ZSBjaGFuZ2VzXG4gICAgaWYgKGFwaS5zdG9yYWdlLm9uQ2hhbmdlZCkge1xuICAgICAgICBhcGkuc3RvcmFnZS5vbkNoYW5nZWQuYWRkTGlzdGVuZXIoKGNoYW5nZXMsIGFyZWFOYW1lKSA9PiB7XG4gICAgICAgICAgICBpZiAoYXJlYU5hbWUgIT09ICdzeW5jJykgcmV0dXJuO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1tTeW5jTWFuYWdlcl0gUmVtb3RlIHN5bmMgY2hhbmdlIGRldGVjdGVkJyk7XG4gICAgICAgICAgICAvLyBSZS1wdWxsIGFuZCBtZXJnZSB0aGUgZnVsbCBzeW5jIGRhdGEgdG8gaGFuZGxlIGNodW5rZWQgdmFsdWVzIGNvcnJlY3RseVxuICAgICAgICAgICAgcHVsbEZyb21TeW5jKCkudGhlbihzeW5jRGF0YSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHN5bmNEYXRhKSBtZXJnZUludG9Mb2NhbChzeW5jRGF0YSk7XG4gICAgICAgICAgICB9KS5jYXRjaChlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdbU3luY01hbmFnZXJdIFJlbW90ZSBtZXJnZSBlcnJvcjonLCBlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBEbyBhbiBpbml0aWFsIHB1c2ggc28gbG9jYWwgZGF0YSBpcyBtaXJyb3JlZFxuICAgIHNjaGVkdWxlU3luY1B1c2goKTtcbn1cbiIsICIvKipcbiAqIFNlY3JldCBWYXVsdCBcdTIwMTQgYXQtcmVzdCBlbmNyeXB0aW9uIGZvciBwcml2YXRlIGtleXMgYW5kIGFwcGxpY2F0aW9uIHNlY3JldHMuXG4gKlxuICogVGhyZWF0IG1vZGVsIChUMC00KTogcmF3IHNlY3JldCBieXRlcyBtdXN0IG5ldmVyIHNpdCBpbiBicm93c2VyIHN0b3JhZ2UgaW5cbiAqIGNsZWFydGV4dCwgZXZlbiBmb3IgdGhlIERFRkFVTFQgcGFzc3dvcmRsZXNzIHVzZXIuIFRoaXMgbW9kdWxlIHByb3ZpZGVzIHR3b1xuICogd3JhcHBpbmcgc3RyYXRlZ2llcyBiZWhpbmQgb25lIGB3cmFwU2VjcmV0YCAvIGB1bndyYXBTZWNyZXRgIGludGVyZmFjZTpcbiAqXG4gKiAgIDEuIERFVklDRSBLRVkgKGRlZmF1bHQsIG5vIG1hc3RlciBwYXNzd29yZCkgXHUyMDE0IGEgbm9uLWV4dHJhY3RhYmxlIEFFUy0yNTYtR0NNXG4gKiAgICAgIENyeXB0b0tleS4gVGhyZWUgcGVyc2lzdGVuY2Ugc3RyYXRlZ2llcyBleGlzdCwgYW5kIGVhY2ggaXMgVkVSSUZJRURcbiAqICAgICAgKHJlYWQgYmFjayBhbmQgcm91bmQtdHJpcHBlZCB0aHJvdWdoIGVuY3J5cHQvZGVjcnlwdCkgYmVmb3JlIGl0IGlzXG4gKiAgICAgIHRydXN0ZWQ6XG4gKlxuICogICAgICAgIGEuIGBpZGJgICAgIFx1MjAxNCBhIENyeXB0b0tleSAqaGFuZGxlKiBpbiBJbmRleGVkREIuIE9ubHkgZXZlciBBRE9QVEVELFxuICogICAgICAgICAgICAgICAgICAgICAgbmV2ZXIgbWludGVkOiB3ZSB0cnVzdCBgaWRiYCBleGNsdXNpdmVseSB3aGVuIGRiLmdldCgpXG4gKiAgICAgICAgICAgICAgICAgICAgICBoYW5kcyBiYWNrIGEgUFJFLUVYSVNUSU5HIGtleSB0aGF0IHJvdW5kLXRyaXBzLCBiZWNhdXNlXG4gKiAgICAgICAgICAgICAgICAgICAgICB0aGF0IFx1MjAxNCBhbmQgb25seSB0aGF0IFx1MjAxNCBwcm92ZXMgdGhlIGhhbmRsZSBzdXJ2aXZlZCBhXG4gKiAgICAgICAgICAgICAgICAgICAgICBwcmV2aW91cyBjb250ZXh0LiBBIHNhbWUtY29udGV4dCBwdXRcdTIxOTJnZXQgcHJvYmUgY2Fubm90XG4gKiAgICAgICAgICAgICAgICAgICAgICBwcm92ZSBjcm9zcy1jb250ZXh0IHBlcnNpc3RlbmNlLiBLZWVwaW5nIHRoZSBhZG9wdCBwYXRoXG4gKiAgICAgICAgICAgICAgICAgICAgICBwcmVzZXJ2ZXMgZXZlcnkgQ2hyb21lL0ZpcmVmb3ggdmF1bHQgd3JpdHRlbiBiZWZvcmVcbiAqICAgICAgICAgICAgICAgICAgICAgIDEuOC4xLCB3aG9zZSBibG9icyBsaXZlIHVuZGVyIHRoaXMga2V5LlxuICogICAgICAgICAgICAgICAgICAgICAgKipORVZFUiB1c2VkIGFzIHRoZSB3cmFwcGluZyBrZXkgb24gU2FmYXJpLioqIE9uIFdlYktpdFxuICogICAgICAgICAgICAgICAgICAgICAgdGhlIHR3byBzdG9yYWdlIGFyZWFzIGRvIG5vdCBzaGFyZSBhIGxpZmV0aW1lIHRoZSB3YXlcbiAqICAgICAgICAgICAgICAgICAgICAgIHRoZXkgZG8gb24gQ2hyb21pdW0vR2Vja28sIHNvIGFuIGFkb3B0ZWQgSW5kZXhlZERCIGtleVxuICogICAgICAgICAgICAgICAgICAgICAgaXMgbm90IGEgc2FmZSB3cmFwcGluZyBrZXkgdGhlcmUuIFNhZmFyaSB0aGVyZWZvcmUgYWx3YXlzXG4gKiAgICAgICAgICAgICAgICAgICAgICB3cml0ZXMgdW5kZXIgYHNlZWRgIChidW5kbGUtc2NvcGVkIGBzdG9yYWdlLmxvY2FsYCk7XG4gKiAgICAgICAgICAgICAgICAgICAgICBhZG9wdGVkIElEQiBrZXlzIGFyZSBkZWNyeXB0LW9ubHkgbGVnYWN5IG9uIFNhZmFyaSwgYW5kXG4gKiAgICAgICAgICAgICAgICAgICAgICB0aGUgYXQtcmVzdCBtaWdyYXRpb24gcmUtd3JhcHMgRVZFUlkgZGV2aWNlIGJsb2IgdGhlXG4gKiAgICAgICAgICAgICAgICAgICAgICBleHRlbnNpb24gc3RvcmVzIFx1MjAxNCBwcm9maWxlIHByaXZhdGUga2V5cywgQVBJLWtleVxuICogICAgICAgICAgICAgICAgICAgICAgc2VjcmV0cywgdmF1bHQtbm90ZSBib2RpZXMsIGFuZCBOSVAtNDYgYnVua2VyIHNlc3Npb25cbiAqICAgICAgICAgICAgICAgICAgICAgIHNlY3JldHMgLyBzZXNzaW9uIHByaXZhdGUga2V5cyBcdTIwMTQgbm90IGp1c3QgcHJvZmlsZSBrZXlzLlxuICogICAgICAgICAgICAgICAgICAgICAgKFBlci1lbmdpbmUgc3RvcmFnZS1zY29waW5nIHJhdGlvbmFsZTogUFJJVkFURSBiaXpkb2NzXG4gKiAgICAgICAgICAgICAgICAgICAgICBgYXJjaGl0ZWN0dXJlL2RldmljZS1rZXktc3RyYXRlZ3kubWRgLilcbiAqICAgICAgICBiLiBgc2VlZGAgICBcdTIwMTQgMzIgcmFuZG9tIGJ5dGVzIGluIGBicm93c2VyLnN0b3JhZ2UubG9jYWxgIHVuZGVyXG4gKiAgICAgICAgICAgICAgICAgICAgICBgZGV2aWNlS2V5U2VlZGAsIGltcG9ydGVkIGFzIGEgbm9uLWV4dHJhY3RhYmxlIEFFUy1HQ01cbiAqICAgICAgICAgICAgICAgICAgICAgIGtleSBhdCBsb2FkLiBUaGlzIGlzIHdoZXJlIEVWRVJZIG5ldyBkZXZpY2Uga2V5IGxhbmRzLFxuICogICAgICAgICAgICAgICAgICAgICAgb24gZXZlcnkgcGxhdGZvcm06IHdoZW4gbm8gcHJlLWV4aXN0aW5nIElEQiBrZXkgaXNcbiAqICAgICAgICAgICAgICAgICAgICAgIGZvdW5kIHdlIGRvIG5vdCBtaW50IG9uZSwgd2Ugc2VlZC4gQ2hyb21lL0ZpcmVmb3ggZnJlc2hcbiAqICAgICAgICAgICAgICAgICAgICAgIGluc3RhbGxzIHRoZXJlZm9yZSB1c2UgYHNlZWRgIHRvbyBcdTIwMTQgb25lIGNvZGUgcGF0aCwgYW5kXG4gKiAgICAgICAgICAgICAgICAgICAgICB0aGUgb25seSBvbmUgd2hvc2UgcGVyc2lzdGVuY2Ugd2UgY2FuIGFjdHVhbGx5IHZlcmlmeS5cbiAqICAgICAgICBjLiBgbWVtb3J5YCBcdTIwMTQgbGFzdCByZXNvcnQgKHVuaXQgdGVzdHMsIHNhbmRib3hlZCBjb250ZXh0cykuIFNlY3JldHNcbiAqICAgICAgICAgICAgICAgICAgICAgIHdyYXBwZWQgaGVyZSBkbyBub3Qgc3Vydml2ZSBhIHJlbG9hZC5cbiAqXG4gKiAgICAgIFRoZSByZXNvbHZlZCBzdHJhdGVneSBpcyBTVElDS1k6IGl0IGlzIHJlY29yZGVkIGluIHN0b3JhZ2UubG9jYWwgdW5kZXJcbiAqICAgICAgYGRldmljZUtleVN0cmF0ZWd5YCBhbmQgaG9ub3VyZWQgb24gbGF0ZXIgbG9hZHMsIHNvIGEgY29udGV4dCBjYW5ub3RcbiAqICAgICAgc2lsZW50bHkgZmxpcCBzdHJhdGVnaWVzIGFuZCBvcnBoYW4gdGhlIGJsb2JzIHdyaXR0ZW4gdW5kZXIgdGhlIG9sZFxuICogICAgICBvbmUuIERlY3J5cHRpb24gaXMgc3ltbWV0cmljIHJlZ2FyZGxlc3M6IGBkZWNyeXB0V2l0aERldmljZUtleWAgdHJpZXNcbiAqICAgICAgdGhlIGN1cnJlbnQga2V5LCB0aGVuIGV2ZXJ5IG90aGVyIGtleSB0aGlzIGluc3RhbGwgY291bGQgZXZlciBoYXZlIGhhZFxuICogICAgICAobGVnYWN5IElEQiBoYW5kbGUsIGV4aXN0aW5nIHNlZWQpLCBhbmQgY2FsbGVycyB1c2luZ1xuICogICAgICBgZGVjcnlwdERldmljZUJsb2JGb3JSZXdyYXBgIHJlLXdyYXAgdW5kZXIgdGhlIGN1cnJlbnQgc3RyYXRlZ3kuXG4gKlxuICogICAgICBUaHJlYXQgbW9kZWwsIGhvbmVzdGx5IHN0YXRlZDogdGhlIHBhc3N3b3JkbGVzcyBkZXZpY2UgdGllciBpcyBhdC1yZXN0XG4gKiAgICAgIHByb3RlY3Rpb24gYWdhaW5zdCBjYXN1YWwgaW5zcGVjdGlvbiBvZiBleHRlbnNpb24gc3RvcmFnZSwgTk9UIGEgZGVmZW5jZVxuICogICAgICBhZ2FpbnN0IGNvZGUgYWxyZWFkeSBleGVjdXRpbmcgaW4gdGhpcyBleHRlbnNpb24ncyBjb250ZXh0LiBUaGVcbiAqICAgICAgc3Ryb25nZXN0IHRpZXIgYXZhaWxhYmxlIHRvZGF5IGlzIGEgKiptYXN0ZXIgcGFzc3dvcmQqKiAoYmVsb3cpLCB3aGljaFxuICogICAgICBkZXJpdmVzIHRoZSB3cmFwcGluZyBrZXkgZnJvbSBhIHNlY3JldCB0aGF0IGlzIG5ldmVyIHN0b3JlZC4gVXNlcnNcbiAqICAgICAgaG9sZGluZyBoaWdoLXZhbHVlIGtleXMgc2hvdWxkIHNldCBvbmUuIEEgaGFyZHdhcmUtYmFja2VkIGRldmljZSBrZXkgaXNcbiAqICAgICAgZnV0dXJlIHdvcmsuIChUaWVyIHRyYWRlb2ZmcyBpbiBmdWxsOiBQUklWQVRFIGJpemRvY3NcbiAqICAgICAgYGFyY2hpdGVjdHVyZS9kZXZpY2Uta2V5LXN0cmF0ZWd5Lm1kYC4pXG4gKlxuICogICAyLiBTRVNTSU9OIEtFWSAobWFzdGVyIHBhc3N3b3JkIHNldCArIHVubG9ja2VkKSBcdTIwMTQgdGhlIEFFUy0yNTYtR0NNIGtleVxuICogICAgICBkZXJpdmVkIGZyb20gdGhlIHBhc3N3b3JkIChzZWUgY3J5cHRvLmpzKS4gU2V0IGJ5IHRoZSBiYWNrZ3JvdW5kIHdvcmtlclxuICogICAgICBvbiB1bmxvY2sgdmlhIGBzZXRTZXNzaW9uS2V5YCwgY2xlYXJlZCBvbiBsb2NrIHZpYSBgY2xlYXJTZXNzaW9uYC5cbiAqXG4gKiBCbG9iIGZvcm1hdHMgKGJvdGggYXJlIHNlbGYtZGVzY3JpYmluZyBKU09OIHN0cmluZ3MpOlxuICogICBwYXNzd29yZCBibG9iIDogeyBzYWx0LCBpdiwgY2lwaGVydGV4dCB9XG4gKiAgIGRldmljZSAgYmxvYiA6IHsgdjoxLCBrOlwiZGV2aWNlXCIsIGl2LCBjaXBoZXJ0ZXh0IH1cbiAqXG4gKiBgdW53cmFwU2VjcmV0YCByZWZ1c2VzIHRvIGRlY3J5cHQgd2hlbiB0aGUgc2Vzc2lvbiBoYXMgYmVlbiBleHBsaWNpdGx5IGxvY2tlZFxuICogKEY1L0Y2KSBzbyBhIGxvY2tlZCBwYWdlIGNhbm5vdCByZWFkIHNlY3JldHMuXG4gKi9cblxuaW1wb3J0IHsgZW5jcnlwdFdpdGhLZXksIGRlY3J5cHRXaXRoS2V5IH0gZnJvbSAnLi9jcnlwdG8nO1xuXG5jb25zdCBJVl9CWVRFUyA9IDEyO1xuY29uc3QgREVWSUNFX0RCID0gJ25vc3Rya2V5LXNlY3JldC12YXVsdCc7XG5jb25zdCBERVZJQ0VfU1RPUkUgPSAna2V5cyc7XG5jb25zdCBERVZJQ0VfS0VZX0lEID0gJ2RldmljZS13cmFwLWtleS12MSc7XG4vLyBzdG9yYWdlLmxvY2FsIGtleSBob2xkaW5nIHRoZSBiYXNlNjQgcmF3IHNlZWQgZm9yIHRoZSBgc2VlZGAgc3RyYXRlZ3kuXG5jb25zdCBERVZJQ0VfU0VFRF9LRVkgPSAnZGV2aWNlS2V5U2VlZCc7XG5jb25zdCBERVZJQ0VfU0VFRF9CWVRFUyA9IDMyO1xuLy8gc3RvcmFnZS5sb2NhbCBrZXkgaG9sZGluZyB0aGUgU1RJQ0tZIHJlc29sdmVkIHN0cmF0ZWd5ICgnaWRiJyB8ICdzZWVkJykuXG5jb25zdCBERVZJQ0VfU1RSQVRFR1lfS0VZID0gJ2RldmljZUtleVN0cmF0ZWd5JztcblxuLy8gLS0tIEJhc2U2NCBoZWxwZXJzIChrZXB0IGxvY2FsIHNvIHRoaXMgbW9kdWxlIGhhcyBubyBjcm9zcy1kZXBzKSAtLS0tLS0tLS0tLS1cbmZ1bmN0aW9uIGFiVG9CYXNlNjQoYnVmZmVyKSB7XG4gICAgY29uc3QgYnl0ZXMgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuICAgIGxldCBiaW5hcnkgPSAnJztcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSsrKSBiaW5hcnkgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSk7XG4gICAgcmV0dXJuIGJ0b2EoYmluYXJ5KTtcbn1cbmZ1bmN0aW9uIGJhc2U2NFRvQWIoYjY0KSB7XG4gICAgY29uc3QgYmluYXJ5ID0gYXRvYihiNjQpO1xuICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYmluYXJ5Lmxlbmd0aCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiaW5hcnkubGVuZ3RoOyBpKyspIGJ5dGVzW2ldID0gYmluYXJ5LmNoYXJDb2RlQXQoaSk7XG4gICAgcmV0dXJuIGJ5dGVzLmJ1ZmZlcjtcbn1cblxuLy8gLS0tIFNlc3Npb24gKHBhc3N3b3JkLWRlcml2ZWQpIGtleSBzdGF0ZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmxldCBfc2Vzc2lvbktleSA9IG51bGw7ICAgLy8gQ3J5cHRvS2V5IHwgbnVsbFxubGV0IF9zZXNzaW9uU2FsdCA9IG51bGw7ICAvLyBVaW50OEFycmF5IHwgbnVsbFxuLy8gX3VubG9ja2VkOiBudWxsID0gcGFzc3dvcmRsZXNzIC8gbm90IGFwcGxpY2FibGUgKG5ldmVyIGxvY2tlZCksXG4vLyAgICAgICAgICAgIHRydWUgPSB1bmxvY2tlZCwgZmFsc2UgPSBsb2NrZWQgKHJlZnVzZSBzZWNyZXQgcmVhZHMpLlxubGV0IF91bmxvY2tlZCA9IG51bGw7XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRTZXNzaW9uS2V5KGNyeXB0b0tleSwgc2FsdCkge1xuICAgIF9zZXNzaW9uS2V5ID0gY3J5cHRvS2V5O1xuICAgIF9zZXNzaW9uU2FsdCA9IHNhbHQ7XG4gICAgX3VubG9ja2VkID0gdHJ1ZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsZWFyU2Vzc2lvbigpIHtcbiAgICBfc2Vzc2lvbktleSA9IG51bGw7XG4gICAgX3Nlc3Npb25TYWx0ID0gbnVsbDtcbiAgICBfdW5sb2NrZWQgPSBmYWxzZTtcbn1cblxuLyoqIEV4cGxpY2l0bHkgbWFyayB0aGUgc2Vzc2lvbiB1bmxvY2tlZC9sb2NrZWQgd2l0aG91dCBwcm92aWRpbmcgYSBrZXkuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0VW5sb2NrZWQodikge1xuICAgIF91bmxvY2tlZCA9IHYgPT09IG51bGwgPyBudWxsIDogISF2O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzU2Vzc2lvbktleSgpIHtcbiAgICByZXR1cm4gISFfc2Vzc2lvbktleTtcbn1cblxuLy8gLS0tIERldmljZSBrZXkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmxldCBfZGV2aWNlS2V5UHJvbWlzZSA9IG51bGw7XG5sZXQgX2RldmljZVN0cmF0ZWd5ID0gbnVsbDsgICAvLyAnaWRiJyB8ICdzZWVkJyB8ICdtZW1vcnknIFx1MjAxNCBzZXQgb25jZSByZXNvbHZlZFxubGV0IF9tZW1vcnlEZXZpY2VLZXkgPSBudWxsOyAgLy8gbGFzdC1yZXNvcnQga2V5IGZvciBjb250ZXh0cyB0aGF0IHBlcnNpc3Qgbm90aGluZ1xubGV0IF9sZWdhY3lJZGJLZXlQcm9taXNlID0gbnVsbDsgLy8gcmVhZC1vbmx5IGhhbmRsZSBvbiB0aGUgcHJlLTEuOC4xIElEQiBrZXlcbmxldCBfZXhpc3RpbmdTZWVkS2V5UHJvbWlzZSA9IG51bGw7IC8vIHJlYWQtb25seSBoYW5kbGUgb24gYW4gZXhpc3Rpbmcgc2VlZCBrZXlcblxuYXN5bmMgZnVuY3Rpb24gZ2VuZXJhdGVEZXZpY2VLZXkoKSB7XG4gICAgcmV0dXJuIGNyeXB0by5zdWJ0bGUuZ2VuZXJhdGVLZXkoXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBsZW5ndGg6IDI1NiB9LFxuICAgICAgICBmYWxzZSwgLy8gTk9OLWV4dHJhY3RhYmxlOiByYXcgYnl0ZXMgY2FuIG5ldmVyIGJlIHJlYWQgYmFjayBvdXRcbiAgICAgICAgWydlbmNyeXB0JywgJ2RlY3J5cHQnXSxcbiAgICApO1xufVxuXG5mdW5jdGlvbiBpbmRleGVkRGJBdmFpbGFibGUoKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBpbmRleGVkREIgIT09ICd1bmRlZmluZWQnICYmIGluZGV4ZWREQiAhPT0gbnVsbDtcbn1cblxuLyoqXG4gKiBQcm92ZSBhIGNhbmRpZGF0ZSBrZXkgaXMgYWN0dWFsbHkgdXNhYmxlIGJlZm9yZSB3ZSB0cnVzdCBhIHN0cmF0ZWd5IHdpdGggYVxuICogdXNlcidzIG9ubHkgY29weSBvZiBhIHByaXZhdGUga2V5LiBBIHJlYWQtYmFjayBoYW5kbGUgdGhhdCBzdHJ1Y3R1cmVkLWNsb25lXG4gKiBtYW5nbGVkIChvciBhIHNlZWQgdGhhdCBjYW1lIGJhY2sgdHJ1bmNhdGVkKSBmYWlscyBoZXJlIGluc3RlYWQgb2Ygc2lsZW50bHlcbiAqIHByb2R1Y2luZyB1bmRlY3J5cHRhYmxlIGJsb2JzLlxuICovXG5hc3luYyBmdW5jdGlvbiBrZXlSb3VuZFRyaXBzKGtleSkge1xuICAgIGlmICgha2V5KSByZXR1cm4gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgaXYgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KElWX0JZVEVTKSk7XG4gICAgICAgIGNvbnN0IHByb2JlID0gbmV3IFRleHRFbmNvZGVyKCkuZW5jb2RlKCdub3N0cmtleS1kZXZpY2UtcHJvYmUnKTtcbiAgICAgICAgY29uc3QgY3QgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmVuY3J5cHQoeyBuYW1lOiAnQUVTLUdDTScsIGl2IH0sIGtleSwgcHJvYmUpO1xuICAgICAgICBjb25zdCBwdCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGVjcnlwdCh7IG5hbWU6ICdBRVMtR0NNJywgaXYgfSwga2V5LCBjdCk7XG4gICAgICAgIHJldHVybiBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUocHQpID09PSAnbm9zdHJrZXktZGV2aWNlLXByb2JlJztcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gb3BlbkRldmljZURiKCkge1xuICAgIC8vIExhenkgaW1wb3J0IHNvIHRoZSBtb2R1bGUgd29ya3MgaW4gY29udGV4dHMvdGVzdHMgd2l0aG91dCBpZGIgYnVuZGxlZC5cbiAgICBjb25zdCB7IG9wZW5EQiB9ID0gYXdhaXQgaW1wb3J0KCdpZGInKTtcbiAgICByZXR1cm4gb3BlbkRCKERFVklDRV9EQiwgMSwge1xuICAgICAgICB1cGdyYWRlKGQpIHtcbiAgICAgICAgICAgIGlmICghZC5vYmplY3RTdG9yZU5hbWVzLmNvbnRhaW5zKERFVklDRV9TVE9SRSkpIHtcbiAgICAgICAgICAgICAgICBkLmNyZWF0ZU9iamVjdFN0b3JlKERFVklDRV9TVE9SRSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgfSk7XG59XG5cbi8qKlxuICogU3RyYXRlZ3kgKGEpOiBBRE9QVCBhIHByZS1leGlzdGluZyBub24tZXh0cmFjdGFibGUgQ3J5cHRvS2V5IGhhbmRsZSBmcm9tXG4gKiBJbmRleGVkREIuIE5ldmVyIG1pbnRzIG9uZS5cbiAqXG4gKiBBIGtleSB0aGF0IGRiLmdldCgpIGhhbmRzIGJhY2sgaXMgYSBrZXkgc29tZSBFQVJMSUVSIGNvbnRleHQgd3JvdGUsIHNvIGl0IGlzXG4gKiBwcm9vZiBvZiBjcm9zcy1jb250ZXh0IHBlcnNpc3RlbmNlIFx1MjAxNCB0aGUgb25lIHRoaW5nIGEgc2FtZS1jb250ZXh0XG4gKiBwdXRcdTIxOTJnZXRcdTIxOTJyb3VuZC10cmlwIHByb2JlIGNhbiBuZXZlciBlc3RhYmxpc2guIGlPUyBTYWZhcmkncyBJbmRleGVkREIgaXNcbiAqIGZ1bmN0aW9uYWwgYnV0IGVwaGVtZXJhbCBmb3IgdGhlIGV4dGVuc2lvbiBiYWNrZ3JvdW5kOiBpdCB3b3VsZCBoYXZlIHBhc3NlZFxuICogdGhlIHByb2JlIGFuZCB0aGVuIGxvc3QgdGhlIHVzZXIncyBvbmx5IGNvcHkgb2YgYSBwcml2YXRlIGtleS4gU286IG5vXG4gKiBwcmUtZXhpc3Rpbmcga2V5IG1lYW5zIG5vIGBpZGJgLCBhbmQgdGhlIGNhbGxlciBzZWVkcyBpbnN0ZWFkLlxuICpcbiAqIFJldHVybnMgbnVsbCAobmV2ZXIgdGhyb3dzKSB3aGVuIG5vdGhpbmcgdXNhYmxlIGlzIHRoZXJlLlxuICovXG5hc3luYyBmdW5jdGlvbiB0cnlJZGJEZXZpY2VLZXkoKSB7XG4gICAgaWYgKCFpbmRleGVkRGJBdmFpbGFibGUoKSkgcmV0dXJuIG51bGw7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZGIgPSBhd2FpdCBvcGVuRGV2aWNlRGIoKTtcbiAgICAgICAgY29uc3QgZXhpc3RpbmcgPSBhd2FpdCBkYi5nZXQoREVWSUNFX1NUT1JFLCBERVZJQ0VfS0VZX0lEKTtcbiAgICAgICAgaWYgKCFleGlzdGluZykgcmV0dXJuIG51bGw7IC8vIGVtcHR5IHN0b3JlIFx1MjE5MiBzZWVkLCBkbyBOT1QgbWludCBoZXJlXG4gICAgICAgIHJldHVybiAoYXdhaXQga2V5Um91bmRUcmlwcyhleGlzdGluZykpID8gZXhpc3RpbmcgOiBudWxsO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG59XG5cbi8qKlxuICogVGhlIHN0b3JhZ2UgYXJlYSBiYWNraW5nIHRoZSBgc2VlZGAgc3RyYXRlZ3kuIEltcG9ydGVkIGxhemlseSBiZWNhdXNlXG4gKiBicm93c2VyLXBvbHlmaWxsIHRocm93cyBhdCBtb2R1bGUgbG9hZCB3aGVuIG5vIGV4dGVuc2lvbiBuYW1lc3BhY2UgZXhpc3RzLlxuICovXG5hc3luYyBmdW5jdGlvbiBzZWVkU3RvcmFnZSgpIHtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCB7IGFwaSB9ID0gYXdhaXQgaW1wb3J0KCcuL2Jyb3dzZXItcG9seWZpbGwnKTtcbiAgICAgICAgcmV0dXJuIGFwaT8uc3RvcmFnZT8ubG9jYWwgfHwgbnVsbDtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG4vKiogU2lnbmFsIDI6IGEgV2ViS2l0IHVzZXIgYWdlbnQgd2l0aCBubyBDaHJvbWl1bSBtYXJrZXIgb24gaXQuICovXG5mdW5jdGlvbiBsb29rc0xpa2VXZWJLaXRPbmx5VWEoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgdWEgPSAodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudCkgfHwgJyc7XG4gICAgICAgIHJldHVybiAvU2FmYXJpfEFwcGxlV2ViS2l0Ly50ZXN0KHVhKSAmJiAhL0Nocm9tKGV8aXVtKXxFZGdcXC98T1BSXFwvLy50ZXN0KHVhKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cblxuLyoqXG4gKiBUcnVlIG9uIFNhZmFyaSAoaU9TICsgbWFjT1MpLCB3aGVyZSBJbmRleGVkREIgbXVzdCBORVZFUiBob2xkIHRoZSB3cmFwcGluZ1xuICoga2V5IFx1MjAxNCBzZWUgdGhlIG1vZHVsZSBoZWFkZXIncyBzdG9yYWdlLXNjb3BlIG5vdGUuXG4gKlxuICogRGV0ZWN0aW9uIGlzIG11bHRpLXNpZ25hbCBhbmQgQklBU0VEIFRPV0FSRCBTQUZBUkksIGJlY2F1c2UgdGhlIHR3byBlcnJvcnNcbiAqIGFyZSBub3Qgc3ltbWV0cmljOiBzZWVkaW5nIGEgQ2hyb21lIHZhdWx0IGNvc3RzIG5vdGhpbmcgKHNlZWQgaXMgYWxyZWFkeSB0aGVcbiAqIHN0cmF0ZWd5IGV2ZXJ5IGZyZXNoIGluc3RhbGwgbGFuZHMgb24pLCB3aGlsZSBhZG9wdGluZyBhbiBJREIga2V5IG9uIFNhZmFyaVxuICogaXMgdW5zYWZlLiBTbyBvbmx5IGEgUE9TSVRJVkVMWSBpZGVudGlmaWVkIENocm9tZS9GaXJlZm94IG9yaWdpbiBtYXkgYWRvcHQgYW5cbiAqIEluZGV4ZWREQiBrZXkgXHUyMDE0IGEgZ2V0VVJMIHRoYXQgaXMgbWlzc2luZywgdGhyb3dzLCByZXR1cm5zIGEgbm9uLXN0cmluZyxcbiAqIHJldHVybnMgJycgb3IgcmV0dXJucyBhIHNjaGVtZSB3ZSBkbyBub3QgcmVjb2duaXNlIGFsbCByZXNvbHZlIHRvIFNhZmFyaS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gaXNTYWZhcmlFbmdpbmUoKSB7XG4gICAgbGV0IG9yaWdpbiA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgeyBhcGkgfSA9IGF3YWl0IGltcG9ydCgnLi9icm93c2VyLXBvbHlmaWxsJyk7XG4gICAgICAgIGNvbnN0IHVybCA9IGFwaT8ucnVudGltZT8uZ2V0VVJMPy4oJycpO1xuICAgICAgICBvcmlnaW4gPSB0eXBlb2YgdXJsID09PSAnc3RyaW5nJyA/IHVybCA6IG51bGw7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIG9yaWdpbiA9IG51bGw7XG4gICAgfVxuICAgIC8vIFNpZ25hbCAxOiBhIHBvc2l0aXZlbHkgaWRlbnRpZmllZCBTYWZhcmkgb3JpZ2luLlxuICAgIGlmIChvcmlnaW4gJiYgb3JpZ2luLnN0YXJ0c1dpdGgoJ3NhZmFyaS13ZWItZXh0ZW5zaW9uOi8vJykpIHJldHVybiB0cnVlO1xuICAgIC8vIFNpZ25hbCAyOiBhIFdlYktpdC1vbmx5IFVBIG91dHJhbmtzIHRoZSBvcmlnaW4gXHUyMDE0IGEgU2FmYXJpIGJ1aWxkIHRoYXRcbiAgICAvLyByZXBvcnRlZCBhbiB1bmV4cGVjdGVkIG9yaWdpbiBzdGlsbCBtdXN0IG5vdCB0b3VjaCBJbmRleGVkREIuXG4gICAgaWYgKGxvb2tzTGlrZVdlYktpdE9ubHlVYSgpKSByZXR1cm4gdHJ1ZTtcbiAgICAvLyBTaWduYWwgMzogb25seSB0aGVzZSB0d28gb3JpZ2lucyBlYXJuIHRoZSBJREIgYWRvcHQgcGF0aC5cbiAgICBpZiAob3JpZ2luICYmIChvcmlnaW4uc3RhcnRzV2l0aCgnY2hyb21lLWV4dGVuc2lvbjovLycpIHx8IG9yaWdpbi5zdGFydHNXaXRoKCdtb3otZXh0ZW5zaW9uOi8vJykpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7IC8vIGFtYmlndW91cyBcdTIxOTIgc2VlZFxufVxuXG4vKiogSW1wb3J0IHJhdyBzZWVkIGJ5dGVzIChiYXNlNjQpIGFzIGEgbm9uLWV4dHJhY3RhYmxlIEFFUy1HQ00ga2V5LiAqL1xuYXN5bmMgZnVuY3Rpb24gaW1wb3J0U2VlZEtleShzZWVkQjY0KSB7XG4gICAgcmV0dXJuIGNyeXB0by5zdWJ0bGUuaW1wb3J0S2V5KFxuICAgICAgICAncmF3JywgYmFzZTY0VG9BYihzZWVkQjY0KSwgeyBuYW1lOiAnQUVTLUdDTScgfSxcbiAgICAgICAgZmFsc2UsIC8vIE5PTi1leHRyYWN0YWJsZSBvbmNlIGltcG9ydGVkXG4gICAgICAgIFsnZW5jcnlwdCcsICdkZWNyeXB0J10sXG4gICAgKTtcbn1cblxuLyoqIFJlYWQgdGhlIHN0aWNreSBzdHJhdGVneSByZWNvcmRlZCBieSBhIHByZXZpb3VzIHJlc29sdXRpb24gKG51bGwgaWYgbm9uZSkuICovXG5hc3luYyBmdW5jdGlvbiByZWFkU3RpY2t5U3RyYXRlZ3koKSB7XG4gICAgY29uc3Qgc3RvcmUgPSBhd2FpdCBzZWVkU3RvcmFnZSgpO1xuICAgIGlmICghc3RvcmUpIHJldHVybiBudWxsO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGdvdCA9IGF3YWl0IHN0b3JlLmdldCh7IFtERVZJQ0VfU1RSQVRFR1lfS0VZXTogbnVsbCB9KTtcbiAgICAgICAgY29uc3QgcyA9IGdvdD8uW0RFVklDRV9TVFJBVEVHWV9LRVldO1xuICAgICAgICByZXR1cm4gKHMgPT09ICdpZGInIHx8IHMgPT09ICdzZWVkJykgPyBzIDogbnVsbDtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXG4vKiogUmVjb3JkIHRoZSByZXNvbHZlZCBzdHJhdGVneSBzbyBsYXRlciBsb2FkcyBjYW5ub3Qgc2lsZW50bHkgZmxpcCBpdC4gKi9cbmFzeW5jIGZ1bmN0aW9uIHdyaXRlU3RpY2t5U3RyYXRlZ3koc3RyYXRlZ3kpIHtcbiAgICBpZiAoc3RyYXRlZ3kgIT09ICdpZGInICYmIHN0cmF0ZWd5ICE9PSAnc2VlZCcpIHJldHVybjsgLy8gJ21lbW9yeScgcGVyc2lzdHMgbm90aGluZ1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgc2VlZFN0b3JhZ2UoKTtcbiAgICBpZiAoIXN0b3JlKSByZXR1cm47XG4gICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgc3RvcmUuc2V0KHsgW0RFVklDRV9TVFJBVEVHWV9LRVldOiBzdHJhdGVneSB9KTtcbiAgICB9IGNhdGNoIHsgLyogYmVzdCBlZmZvcnQgXHUyMDE0IHRoZSBzdHJhdGVneSBzdGlsbCByZXNvbHZlcyB0aGUgc2FtZSB3YXkgKi8gfVxufVxuXG4vKiogU3RyYXRlZ3kgKGIpOiBhIHJhdyByYW5kb20gc2VlZCBpbiBzdG9yYWdlLmxvY2FsLCBpbXBvcnRlZCBub24tZXh0cmFjdGFibGUuICovXG5hc3luYyBmdW5jdGlvbiB0cnlTZWVkRGV2aWNlS2V5KCkge1xuICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgc2VlZFN0b3JhZ2UoKTtcbiAgICBpZiAoIXN0b3JlKSByZXR1cm4gbnVsbDtcbiAgICB0cnkge1xuICAgICAgICBjb25zdCBnb3QgPSBhd2FpdCBzdG9yZS5nZXQoeyBbREVWSUNFX1NFRURfS0VZXTogbnVsbCB9KTtcbiAgICAgICAgbGV0IHNlZWQgPSBnb3Q/LltERVZJQ0VfU0VFRF9LRVldO1xuICAgICAgICBpZiAoIXNlZWQpIHtcbiAgICAgICAgICAgIHNlZWQgPSBhYlRvQmFzZTY0KGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoREVWSUNFX1NFRURfQllURVMpKS5idWZmZXIpO1xuICAgICAgICAgICAgYXdhaXQgc3RvcmUuc2V0KHsgW0RFVklDRV9TRUVEX0tFWV06IHNlZWQgfSk7XG4gICAgICAgICAgICAvLyBWRVJJRlkgcGVyc2lzdGVuY2UgYmVmb3JlIGFueXRoaW5nIGlzIHdyYXBwZWQgdW5kZXIgaXQuXG4gICAgICAgICAgICBjb25zdCBjaGVjayA9IGF3YWl0IHN0b3JlLmdldCh7IFtERVZJQ0VfU0VFRF9LRVldOiBudWxsIH0pO1xuICAgICAgICAgICAgY29uc3QgcGVyc2lzdGVkID0gY2hlY2s/LltERVZJQ0VfU0VFRF9LRVldO1xuICAgICAgICAgICAgaWYgKHBlcnNpc3RlZCAhPT0gc2VlZCkge1xuICAgICAgICAgICAgICAgIC8vIEFub3RoZXIgY29udGV4dCAocG9wdXAgdnMgYmFja2dyb3VuZCBvbiBhIGZpcnN0IHJ1bikgbWludGVkXG4gICAgICAgICAgICAgICAgLy8gYW5kIHdyb3RlIGl0cyBvd24gc2VlZCBiZXR3ZWVuIG91ciBzZXQoKSBhbmQgdGhpcyByZWFkLiBBRE9QVFxuICAgICAgICAgICAgICAgIC8vIFRIRSBXSU5ORVI6IGFueSBzZWVkIGFjdHVhbGx5IGluIHN0b3JhZ2UgaXMgZXhhY3RseSBhcyBnb29kIGFzXG4gICAgICAgICAgICAgICAgLy8gb3VycywgYW5kIGl0IGlzIHRoZSBvbmUgdGhlIG90aGVyIGNvbnRleHQgaXMgYWxyZWFkeSB3cmFwcGluZ1xuICAgICAgICAgICAgICAgIC8vIHVuZGVyLiBSZXR1cm5pbmcgbnVsbCBoZXJlIHdvdWxkIGRyb3AgdGhlIGNhbGxlciB0aHJvdWdoIHRvXG4gICAgICAgICAgICAgICAgLy8gdGhlIG1lbW9yeSBrZXksIHdob3NlIGJsb2JzIGRpZSB3aXRoIHRoaXMgY29udGV4dCBcdTIwMTQgdGhlIHZlcnlcbiAgICAgICAgICAgICAgICAvLyBsb3NzIHRoaXMgc3RyYXRlZ3kgZXhpc3RzIHRvIHByZXZlbnQuIE9ubHkgYSBnZW51aW5lbHkgYWJzZW50XG4gICAgICAgICAgICAgICAgLy8gb3IgdW51c2FibGUgdmFsdWUgaXMgYSBmYWlsdXJlLlxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcGVyc2lzdGVkICE9PSAnc3RyaW5nJyB8fCBwZXJzaXN0ZWQubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICBzZWVkID0gcGVyc2lzdGVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGtleSA9IGF3YWl0IGltcG9ydFNlZWRLZXkoc2VlZCk7XG4gICAgICAgIHJldHVybiAoYXdhaXQga2V5Um91bmRUcmlwcyhrZXkpKSA/IGtleSA6IG51bGw7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cblxuLyoqXG4gKiBHZXQgKGNyZWF0aW5nIG9uIGZpcnN0IHVzZSkgdGhlIGRldmljZSB3cmFwIGtleS5cbiAqXG4gKiBSZXNvbHV0aW9uIG9yZGVyLCBvbmNlOiBob25vdXIgdGhlIHN0aWNreSBzdHJhdGVneSB0aGlzIGluc3RhbGwgYWxyZWFkeVxuICogcmVjb3JkZWQ7IG90aGVyd2lzZSBBRE9QVCBhIHByZS1leGlzdGluZyBJbmRleGVkREIga2V5IGlmIG9uZSBpcyB0aGVyZSwgYW5kXG4gKiBmYWlsaW5nIHRoYXQgc2VlZC4gV2hhdGV2ZXIgcmVzb2x2ZXMgaXMgd3JpdHRlbiBiYWNrIGFzIHRoZSBzdGlja3kgc3RyYXRlZ3kuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXREZXZpY2VLZXkoKSB7XG4gICAgaWYgKF9kZXZpY2VLZXlQcm9taXNlKSByZXR1cm4gX2RldmljZUtleVByb21pc2U7XG4gICAgX2RldmljZUtleVByb21pc2UgPSAoYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCBzdGlja3kgPSBhd2FpdCByZWFkU3RpY2t5U3RyYXRlZ3koKTtcblxuICAgICAgICAvLyBBIHZhdWx0IGFscmVhZHkgb24gYHNlZWRgIG5ldmVyIHJlLXByb2JlcyBJbmRleGVkREI6IGl0cyBibG9icyBhcmVcbiAgICAgICAgLy8gdW5kZXIgdGhlIHNlZWQga2V5LCBhbmQgYWRvcHRpbmcgYSBzdHJheSBJREIgaGFuZGxlIHdvdWxkIG9ycGhhbiB0aGVtLlxuICAgICAgICAvLyBPbiBTYWZhcmkgd2UgbmV2ZXIgV1JJVEUgdW5kZXIgYW4gSURCIGtleSBhdCBhbGwgKHNlZSBoZWFkZXIpOiBpdHNcbiAgICAgICAgLy8gcGVyLWVuZ2luZSBzdG9yYWdlIHNjb3BpbmcgbWFrZXMgYW4gYWRvcHRlZCBJREIgaGFuZGxlIHVuc2FmZSBhcyBhXG4gICAgICAgIC8vIHdyYXBwaW5nIGtleS4gRXhpc3RpbmcgSURCIGJsb2JzIHN0YXkgcmVhZGFibGUgdGhyb3VnaCB0aGUgZGVjcnlwdFxuICAgICAgICAvLyBmYWxsYmFjayBhbmQgYXJlIHJlLXdyYXBwZWQgdW5kZXIgdGhlIHNlZWQgYnkgdGhlIGF0LXJlc3QgbWlncmF0aW9uLlxuICAgICAgICBpZiAoc3RpY2t5ICE9PSAnc2VlZCcgJiYgIShhd2FpdCBpc1NhZmFyaUVuZ2luZSgpKSkge1xuICAgICAgICAgICAgY29uc3QgaWRiS2V5ID0gYXdhaXQgdHJ5SWRiRGV2aWNlS2V5KCk7XG4gICAgICAgICAgICBpZiAoaWRiS2V5KSB7XG4gICAgICAgICAgICAgICAgX2RldmljZVN0cmF0ZWd5ID0gJ2lkYic7XG4gICAgICAgICAgICAgICAgYXdhaXQgd3JpdGVTdGlja3lTdHJhdGVneSgnaWRiJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGlkYktleTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNlZWRLZXkgPSBhd2FpdCB0cnlTZWVkRGV2aWNlS2V5KCk7XG4gICAgICAgIGlmIChzZWVkS2V5KSB7XG4gICAgICAgICAgICBfZGV2aWNlU3RyYXRlZ3kgPSAnc2VlZCc7XG4gICAgICAgICAgICAvLyBBbHNvIGNvdmVycyB0aGUgZGVncmFkZSBjYXNlOiBzdGlja3kgd2FzICdpZGInIGJ1dCB0aGUgaGFuZGxlIGlzXG4gICAgICAgICAgICAvLyBnb25lLiBPbGQgYmxvYnMgc3RheSByZWFkYWJsZSB0aHJvdWdoIHRoZSBkZWNyeXB0IGZhbGxiYWNrIGJlbG93LlxuICAgICAgICAgICAgYXdhaXQgd3JpdGVTdGlja3lTdHJhdGVneSgnc2VlZCcpO1xuICAgICAgICAgICAgcmV0dXJuIHNlZWRLZXk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOb3RoaW5nIHBlcnNpc3RzIGhlcmUuIEJldHRlciB0aGFuIHJlZnVzaW5nIHRvIGVuY3J5cHQsIGJ1dCBibG9ic1xuICAgICAgICAvLyB3cml0dGVuIHVuZGVyIHRoaXMga2V5IGRpZSB3aXRoIHRoZSBjb250ZXh0IFx1MjAxNCBzZWUgbW9kdWxlIGhlYWRlci5cbiAgICAgICAgaWYgKCFfbWVtb3J5RGV2aWNlS2V5KSBfbWVtb3J5RGV2aWNlS2V5ID0gYXdhaXQgZ2VuZXJhdGVEZXZpY2VLZXkoKTtcbiAgICAgICAgX2RldmljZVN0cmF0ZWd5ID0gJ21lbW9yeSc7XG4gICAgICAgIHJldHVybiBfbWVtb3J5RGV2aWNlS2V5O1xuICAgIH0pKCk7XG4gICAgcmV0dXJuIF9kZXZpY2VLZXlQcm9taXNlO1xufVxuXG4vKiogV2hpY2ggcGVyc2lzdGVuY2Ugc3RyYXRlZ3kgdGhlIGRldmljZSBrZXkgcmVzb2x2ZWQgdG8gKG51bGwgdW50aWwgcmVzb2x2ZWQpLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldERldmljZUtleVN0cmF0ZWd5KCkge1xuICAgIHJldHVybiBfZGV2aWNlU3RyYXRlZ3k7XG59XG5cbi8qKlxuICogRHJvcCBldmVyeSBtZW1vaXNlZCBkZXZpY2Uta2V5IGhhbmRsZS4gTVVTVCBiZSBjYWxsZWQgaW1tZWRpYXRlbHkgYWZ0ZXIgYW55XG4gKiBgc3RvcmFnZS5jbGVhcigpYDogdGhlIHNlZWQgKGFuZCB0aGUgc3RpY2t5IHN0cmF0ZWd5KSBhcmUgZ29uZSBmcm9tIHN0b3JhZ2UsXG4gKiBzbyBhIGNhY2hlZCBwcm9taXNlIHdvdWxkIGtlZXAgaGFuZGluZyBvdXQgYSBrZXkgd2hvc2UgYmFja2luZyBtYXRlcmlhbCBub1xuICogbG9uZ2VyIGV4aXN0cyBcdTIwMTQgdGhlIG5leHQgZ2V0RGV2aWNlS2V5KCkgd291bGQgd3JhcCBzZWNyZXRzIHVuZGVyIGEga2V5IHRoYXRcbiAqIGRpZXMgd2l0aCB0aGlzIGNvbnRleHQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNldERldmljZUtleSgpIHtcbiAgICBfZGV2aWNlS2V5UHJvbWlzZSA9IG51bGw7XG4gICAgX2RldmljZVN0cmF0ZWd5ID0gbnVsbDtcbiAgICBfbWVtb3J5RGV2aWNlS2V5ID0gbnVsbDtcbiAgICBfbGVnYWN5SWRiS2V5UHJvbWlzZSA9IG51bGw7XG4gICAgX2V4aXN0aW5nU2VlZEtleVByb21pc2UgPSBudWxsO1xufVxuXG4vKipcbiAqIFJlYWQtb25seSBhY2Nlc3MgdG8gYSBwcmUtZXhpc3RpbmcgSW5kZXhlZERCIGRldmljZSBrZXksIHVzZWQgb25seSBhcyBhXG4gKiBkZWNyeXB0IGZhbGxiYWNrIGZvciBibG9icyB3cml0dGVuIGJlZm9yZSB0aGlzIGNvbnRleHQgY2hhbmdlZCBzdHJhdGVneS5cbiAqIE5ldmVyIGNyZWF0ZXMgb25lLlxuICovXG5hc3luYyBmdW5jdGlvbiBnZXRMZWdhY3lJZGJLZXkoKSB7XG4gICAgaWYgKF9sZWdhY3lJZGJLZXlQcm9taXNlKSByZXR1cm4gX2xlZ2FjeUlkYktleVByb21pc2U7XG4gICAgX2xlZ2FjeUlkYktleVByb21pc2UgPSAoYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoIWluZGV4ZWREYkF2YWlsYWJsZSgpKSByZXR1cm4gbnVsbDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGRiID0gYXdhaXQgb3BlbkRldmljZURiKCk7XG4gICAgICAgICAgICBjb25zdCBrZXkgPSBhd2FpdCBkYi5nZXQoREVWSUNFX1NUT1JFLCBERVZJQ0VfS0VZX0lEKTtcbiAgICAgICAgICAgIHJldHVybiAoYXdhaXQga2V5Um91bmRUcmlwcyhrZXkpKSA/IGtleSA6IG51bGw7XG4gICAgICAgIH0gY2F0Y2gge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICB9KSgpO1xuICAgIHJldHVybiBfbGVnYWN5SWRiS2V5UHJvbWlzZTtcbn1cblxuLyoqXG4gKiBSZWFkLW9ubHkgYWNjZXNzIHRvIHRoZSBrZXkgYW4gRVhJU1RJTkcgYGRldmljZUtleVNlZWRgIGltcG9ydHMgdG8sIHVzZWQgb25seVxuICogYXMgYSBkZWNyeXB0IGZhbGxiYWNrLiBOZXZlciBtaW50cyBhIHNlZWQgKHRoYXQgaXMgdHJ5U2VlZERldmljZUtleSdzIGpvYikuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGdldEV4aXN0aW5nU2VlZEtleSgpIHtcbiAgICBpZiAoX2V4aXN0aW5nU2VlZEtleVByb21pc2UpIHJldHVybiBfZXhpc3RpbmdTZWVkS2V5UHJvbWlzZTtcbiAgICBfZXhpc3RpbmdTZWVkS2V5UHJvbWlzZSA9IChhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHN0b3JlID0gYXdhaXQgc2VlZFN0b3JhZ2UoKTtcbiAgICAgICAgaWYgKCFzdG9yZSkgcmV0dXJuIG51bGw7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBnb3QgPSBhd2FpdCBzdG9yZS5nZXQoeyBbREVWSUNFX1NFRURfS0VZXTogbnVsbCB9KTtcbiAgICAgICAgICAgIGNvbnN0IHNlZWQgPSBnb3Q/LltERVZJQ0VfU0VFRF9LRVldO1xuICAgICAgICAgICAgaWYgKCFzZWVkKSByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIGNvbnN0IGtleSA9IGF3YWl0IGltcG9ydFNlZWRLZXkoc2VlZCk7XG4gICAgICAgICAgICByZXR1cm4gKGF3YWl0IGtleVJvdW5kVHJpcHMoa2V5KSkgPyBrZXkgOiBudWxsO1xuICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfSkoKTtcbiAgICByZXR1cm4gX2V4aXN0aW5nU2VlZEtleVByb21pc2U7XG59XG5cbi8qKlxuICogRXZlcnkgT1RIRVIga2V5IHRoaXMgaW5zdGFsbCBjb3VsZCBoYXZlIHdyYXBwZWQgYSBkZXZpY2UgYmxvYiB1bmRlciwgaW5cbiAqIHByZWZlcmVuY2Ugb3JkZXIuIFN0cmF0ZWd5IGZsaXBzIChpZGJcdTIxOTJzZWVkIG9uIGRlZ3JhZGUsIHNlZWRcdTIxOTJpZGIgb24gYW5cbiAqIGFkb3B0ZWQgaGFuZGxlKSBtdXN0IG5ldmVyIG9ycGhhbiBhIGJsb2IsIHNvIHRoZSBmYWxsYmFjayBpcyBzeW1tZXRyaWM6IGFcbiAqIHNlZWQgYmxvYiBzdGF5cyByZWFkYWJsZSB3aGlsZSB0aGUgc3RyYXRlZ3kgaXMgJ2lkYicgYW5kIHZpY2UgdmVyc2EuXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGZhbGxiYWNrRGV2aWNlS2V5cygpIHtcbiAgICBjb25zdCBrZXlzID0gW107XG4gICAgaWYgKF9kZXZpY2VTdHJhdGVneSAhPT0gJ2lkYicpIHtcbiAgICAgICAgY29uc3QgbGVnYWN5ID0gYXdhaXQgZ2V0TGVnYWN5SWRiS2V5KCk7XG4gICAgICAgIGlmIChsZWdhY3kpIGtleXMucHVzaChsZWdhY3kpO1xuICAgIH1cbiAgICBpZiAoX2RldmljZVN0cmF0ZWd5ICE9PSAnc2VlZCcpIHtcbiAgICAgICAgY29uc3Qgc2VlZEtleSA9IGF3YWl0IGdldEV4aXN0aW5nU2VlZEtleSgpO1xuICAgICAgICBpZiAoc2VlZEtleSkga2V5cy5wdXNoKHNlZWRLZXkpO1xuICAgIH1cbiAgICByZXR1cm4ga2V5cztcbn1cblxuLyoqXG4gKiBEZWNyeXB0IGEgZGV2aWNlIGJsb2Igd2l0aCB0aGUgY3VycmVudCBrZXksIGZhbGxpbmcgYmFjayB0byBldmVyeSBvdGhlciBrZXlcbiAqIHRoaXMgaW5zdGFsbCBoYXMgZXZlciBoYWQuIFJldHVybnMgdGhlIHBsYWludGV4dCBwbHVzIHdoZXRoZXIgYSBmYWxsYmFjayBrZXlcbiAqIHdhcyBuZWVkZWQgKGkuZS4gdGhlIGJsb2IgaXMgc3RhbGUgYW5kIHdvcnRoIHJlLXdyYXBwaW5nKS5cbiAqL1xuYXN5bmMgZnVuY3Rpb24gZGVjcnlwdERldmljZUJsb2JBbnlLZXkoaXYsIGNpcGhlcnRleHQpIHtcbiAgICBjb25zdCBrZXkgPSBhd2FpdCBnZXREZXZpY2VLZXkoKTtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4geyBwbGFpbnRleHQ6IGF3YWl0IGRlY3J5cHREZXZpY2VCbG9iV2l0aChrZXksIGl2LCBjaXBoZXJ0ZXh0KSwgc3RhbGU6IGZhbHNlIH07XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBmb3IgKGNvbnN0IGZhbGxiYWNrIG9mIGF3YWl0IGZhbGxiYWNrRGV2aWNlS2V5cygpKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHBsYWludGV4dDogYXdhaXQgZGVjcnlwdERldmljZUJsb2JXaXRoKGZhbGxiYWNrLCBpdiwgY2lwaGVydGV4dCksXG4gICAgICAgICAgICAgICAgICAgIHN0YWxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9IGNhdGNoIHsgLyogdHJ5IHRoZSBuZXh0IG9uZSAqLyB9XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgZTsgLy8gcmVwb3J0IHRoZSBDVVJSRU5UIGtleSdzIGZhaWx1cmUsIG5vdCB0aGUgbGFzdCBmYWxsYmFjaydzXG4gICAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZW5jcnlwdFdpdGhEZXZpY2VLZXkocGxhaW50ZXh0KSB7XG4gICAgY29uc3Qga2V5ID0gYXdhaXQgZ2V0RGV2aWNlS2V5KCk7XG4gICAgY29uc3QgaXYgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KElWX0JZVEVTKSk7XG4gICAgY29uc3QgZW5jID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgY29uc3QgY2lwaGVydGV4dCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZW5jcnlwdChcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2IH0sIGtleSwgZW5jLmVuY29kZShwbGFpbnRleHQpLFxuICAgICk7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgdjogMSxcbiAgICAgICAgazogJ2RldmljZScsXG4gICAgICAgIGl2OiBhYlRvQmFzZTY0KGl2KSxcbiAgICAgICAgY2lwaGVydGV4dDogYWJUb0Jhc2U2NChjaXBoZXJ0ZXh0KSxcbiAgICB9KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZGVjcnlwdERldmljZUJsb2JXaXRoKGtleSwgaXYsIGNpcGhlcnRleHQpIHtcbiAgICBjb25zdCBwbGFpbkJ1ZiA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGVjcnlwdChcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2OiBuZXcgVWludDhBcnJheShiYXNlNjRUb0FiKGl2KSkgfSxcbiAgICAgICAga2V5LFxuICAgICAgICBiYXNlNjRUb0FiKGNpcGhlcnRleHQpLFxuICAgICk7XG4gICAgcmV0dXJuIG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShwbGFpbkJ1Zik7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWNyeXB0V2l0aERldmljZUtleShlbmNyeXB0ZWREYXRhKSB7XG4gICAgY29uc3QgeyBpdiwgY2lwaGVydGV4dCB9ID0gSlNPTi5wYXJzZShlbmNyeXB0ZWREYXRhKTtcbiAgICAvLyBHQ00gYXV0aGVudGljYXRpb24gY2FuIGZhaWwgd2l0aCB0aGUgQ1VSUkVOVCBzdHJhdGVneSdzIGtleSBiZWNhdXNlIHRoZVxuICAgIC8vIGJsb2IgcHJlZGF0ZXMgYSBzdHJhdGVneSBjaGFuZ2UgKGEgQ2hyb21lL0ZpcmVmb3ggdmF1bHQgd2hvc2UgSURCIGhhbmRsZVxuICAgIC8vIGlzIHN0aWxsIHJlYWRhYmxlIHdoaWxlIHRoaXMgY29udGV4dCBzZXR0bGVkIG9uIHRoZSBzZWVkLCBvciB0aGUgcmV2ZXJzZSkuXG4gICAgLy8gVHJ5IGV2ZXJ5IGtleSB0aGlzIGluc3RhbGwgaGFzIGV2ZXIgaGFkIGJlZm9yZSBkZWNsYXJpbmcgdGhlIHNlY3JldCBsb3N0LlxuICAgIGNvbnN0IHsgcGxhaW50ZXh0IH0gPSBhd2FpdCBkZWNyeXB0RGV2aWNlQmxvYkFueUtleShpdiwgY2lwaGVydGV4dCk7XG4gICAgcmV0dXJuIHBsYWludGV4dDtcbn1cblxuLyoqXG4gKiBEZWNyeXB0IGEgZGV2aWNlIGJsb2IgYW5kLCB3aGVuIGl0IGNvdWxkIG9ubHkgYmUgcmVhZCB2aWEgYSBmYWxsYmFjayBrZXlcbiAqIChsZWdhY3kgSW5kZXhlZERCIGhhbmRsZSwgb3IgYW4gZXhpc3Rpbmcgc2VlZCB3aGlsZSB0aGUgc3RyYXRlZ3kgaXMgJ2lkYicpLFxuICogaGFuZCBiYWNrIGEgcmVwbGFjZW1lbnQgYmxvYiB3cmFwcGVkIHVuZGVyIHRoZSBDVVJSRU5UIHN0cmF0ZWd5IHNvIHRoZSBjYWxsZXJcbiAqIGNhbiBwZXJzaXN0IHRoZSB1cGdyYWRlIG9wcG9ydHVuaXN0aWNhbGx5LlxuICogYHJld3JhcHBlZGAgaXMgbnVsbCB3aGVuIHRoZSBibG9iIGlzIGFscmVhZHkgY3VycmVudC5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlY3J5cHREZXZpY2VCbG9iRm9yUmV3cmFwKGVuY3J5cHRlZERhdGEpIHtcbiAgICBjb25zdCB7IGl2LCBjaXBoZXJ0ZXh0IH0gPSBKU09OLnBhcnNlKGVuY3J5cHRlZERhdGEpO1xuICAgIGNvbnN0IHsgcGxhaW50ZXh0LCBzdGFsZSB9ID0gYXdhaXQgZGVjcnlwdERldmljZUJsb2JBbnlLZXkoaXYsIGNpcGhlcnRleHQpO1xuICAgIHJldHVybiB7XG4gICAgICAgIHBsYWludGV4dCxcbiAgICAgICAgcmV3cmFwcGVkOiBzdGFsZSA/IGF3YWl0IGVuY3J5cHRXaXRoRGV2aWNlS2V5KHBsYWludGV4dCkgOiBudWxsLFxuICAgIH07XG59XG5cbi8vIC0tLSBCbG9iIGNsYXNzaWZpY2F0aW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5leHBvcnQgZnVuY3Rpb24gaXNQYXNzd29yZEJsb2IodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykgcmV0dXJuIGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHAgPSBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuICEhKHAgJiYgcC5zYWx0ICYmIHAuaXYgJiYgcC5jaXBoZXJ0ZXh0ICYmIHAuayAhPT0gJ2RldmljZScpO1xuICAgIH0gY2F0Y2ggeyByZXR1cm4gZmFsc2U7IH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRGV2aWNlS2V5QmxvYih2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcCA9IEpTT04ucGFyc2UodmFsdWUpO1xuICAgICAgICByZXR1cm4gISEocCAmJiBwLmsgPT09ICdkZXZpY2UnICYmIHAuaXYgJiYgcC5jaXBoZXJ0ZXh0KTtcbiAgICB9IGNhdGNoIHsgcmV0dXJuIGZhbHNlOyB9XG59XG5cbi8qKiBUcnVlIGlmIHRoZSB2YWx1ZSBpcyBhbHJlYWR5IGNpcGhlcnRleHQgKGVpdGhlciB3cmFwcGluZykuICovXG5leHBvcnQgZnVuY3Rpb24gaXNDaXBoZXJ0ZXh0KHZhbHVlKSB7XG4gICAgcmV0dXJuIGlzUGFzc3dvcmRCbG9iKHZhbHVlKSB8fCBpc0RldmljZUtleUJsb2IodmFsdWUpO1xufVxuXG4vLyAtLS0gVW5pZmllZCB3cmFwIC8gdW53cmFwIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIEVuY3J5cHQgYSBzZWNyZXQgZm9yIGF0LXJlc3Qgc3RvcmFnZS4gUHJlZmVycyB0aGUgcGFzc3dvcmQtZGVyaXZlZCBzZXNzaW9uXG4gKiBrZXkgd2hlbiBvbmUgaXMgYXZhaWxhYmxlIGluIHRoaXMgY29udGV4dCAoYmFja2dyb3VuZCwgdW5sb2NrZWQpOyBvdGhlcndpc2VcbiAqIGZhbGxzIGJhY2sgdG8gdGhlIGFsd2F5cy1hdmFpbGFibGUgZGV2aWNlIGtleS4gTmV2ZXIgcmV0dXJucyBwbGFpbnRleHQuXG4gKlxuICogVGhlIHRpZXIgaXMgdGhlcmVmb3JlIEFNQklFTlQgXHUyMDE0IGl0IGlzIHdoYXRldmVyIGBzZXRTZXNzaW9uS2V5YCAvIGBjbGVhclNlc3Npb25gXG4gKiBsYXN0IGRpZCBpbiB0aGlzIG1vZHVsZSwgd2hpY2ggbWF5IGhhdmUgYmVlbiBkb25lIGJ5IGEgZGlmZmVyZW50IGZpbGUuIE9ubHlcbiAqIGNhbGwgdGhpcyB3aGVyZSBlaXRoZXIgdGllciBpcyBnZW51aW5lbHkgYWNjZXB0YWJsZSAoYSB2YWx1ZSB0aGF0XG4gKiBgdW53cmFwU2VjcmV0YCBjYW4gb3BlbiB1bmRlciBib3RoKS4gQSBjYWxsZXIgdGhhdCBuZWVkcyBhIFNQRUNJRklDIHRpZXIgbXVzdFxuICogbmFtZSBpdDogYGVuY3J5cHRXaXRoRGV2aWNlS2V5YCBvciBgZW5jcnlwdFdpdGhLZXlgLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gd3JhcFNlY3JldChwbGFpbnRleHQpIHtcbiAgICBpZiAodHlwZW9mIHBsYWludGV4dCAhPT0gJ3N0cmluZycgfHwgcGxhaW50ZXh0Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIHBsYWludGV4dDtcbiAgICBpZiAoaXNDaXBoZXJ0ZXh0KHBsYWludGV4dCkpIHJldHVybiBwbGFpbnRleHQ7IC8vIGFscmVhZHkgd3JhcHBlZCBcdTIwMTQgZG9uJ3QgZG91YmxlLXdyYXBcbiAgICBpZiAoX3Nlc3Npb25LZXkpIHtcbiAgICAgICAgcmV0dXJuIGVuY3J5cHRXaXRoS2V5KHBsYWludGV4dCwgX3Nlc3Npb25LZXksIF9zZXNzaW9uU2FsdCk7XG4gICAgfVxuICAgIHJldHVybiBlbmNyeXB0V2l0aERldmljZUtleShwbGFpbnRleHQpO1xufVxuXG4vKipcbiAqIERlY3J5cHQgYW4gYXQtcmVzdCBzZWNyZXQuIFJlZnVzZXMgd2hlbiB0aGUgc2Vzc2lvbiBpcyBleHBsaWNpdGx5IGxvY2tlZC5cbiAqIExlZ2FjeSBwbGFpbnRleHQgdmFsdWVzIGFyZSByZXR1cm5lZCB1bmNoYW5nZWQgKHRyYW5zaXRpb25hbCBcdTIwMTQgY2FsbGVycyBzaG91bGRcbiAqIHJlLXdyYXAgb24gbmV4dCB3cml0ZTsgc2VlIG1pZ3JhdGlvbiBwYXRocykuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB1bndyYXBTZWNyZXQodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJyB8fCB2YWx1ZS5sZW5ndGggPT09IDApIHJldHVybiB2YWx1ZTtcbiAgICBpZiAoIWlzQ2lwaGVydGV4dCh2YWx1ZSkpIHJldHVybiB2YWx1ZTsgLy8gbGVnYWN5IHBsYWludGV4dCBwYXNzdGhyb3VnaFxuICAgIGlmIChfdW5sb2NrZWQgPT09IGZhbHNlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbG9ja2VkOiBzZXNzaW9uIGlzIGxvY2tlZCBcdTIwMTQgY2Fubm90IHJlYWQgc2VjcmV0Jyk7XG4gICAgfVxuICAgIGlmIChpc0RldmljZUtleUJsb2IodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBkZWNyeXB0V2l0aERldmljZUtleSh2YWx1ZSk7XG4gICAgfVxuICAgIC8vIHBhc3N3b3JkIGJsb2JcbiAgICBpZiAoIV9zZXNzaW9uS2V5KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignbG9ja2VkOiBubyBzZXNzaW9uIGtleSBhdmFpbGFibGUgdG8gZGVjcnlwdCBzZWNyZXQnKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlY3J5cHRXaXRoS2V5KHZhbHVlLCBfc2Vzc2lvbktleSk7XG59XG4iLCAiLyoqXG4gKiBFbmNyeXB0aW9uIHV0aWxpdGllcyBmb3IgTm9zdHJLZXkgbWFzdGVyIHBhc3N3b3JkIGZlYXR1cmUuXG4gKlxuICogVXNlcyBXZWIgQ3J5cHRvIEFQSSAoY3J5cHRvLnN1YnRsZSkgZXhjbHVzaXZlbHkgXHUyMDE0IG5vIGV4dGVybmFsIGxpYnJhcmllcy5cbiAqIC0gUEJLREYyIHdpdGggNjAwLDAwMCBpdGVyYXRpb25zIChPV0FTUCAyMDIzIHJlY29tbWVuZGF0aW9uKVxuICogLSBBRVMtMjU2LUdDTSBmb3IgYXV0aGVudGljYXRlZCBlbmNyeXB0aW9uXG4gKiAtIFJhbmRvbSBzYWx0ICgxNiBieXRlcykgYW5kIElWICgxMiBieXRlcykgcGVyIG9wZXJhdGlvblxuICogLSBBbGwgYmluYXJ5IGRhdGEgZW5jb2RlZCBhcyBiYXNlNjQgZm9yIEpTT04gc3RvcmFnZSBjb21wYXRpYmlsaXR5XG4gKi9cblxuY29uc3QgUEJLREYyX0lURVJBVElPTlMgPSA2MDBfMDAwO1xuY29uc3QgU0FMVF9CWVRFUyA9IDE2O1xuY29uc3QgSVZfQllURVMgPSAxMjtcblxuLy8gLS0tIEJhc2U2NCBoZWxwZXJzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5mdW5jdGlvbiBhcnJheUJ1ZmZlclRvQmFzZTY0KGJ1ZmZlcikge1xuICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKTtcbiAgICBsZXQgYmluYXJ5ID0gJyc7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBiaW5hcnkgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSk7XG4gICAgfVxuICAgIHJldHVybiBidG9hKGJpbmFyeSk7XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFRvQXJyYXlCdWZmZXIoYmFzZTY0KSB7XG4gICAgY29uc3QgYmluYXJ5ID0gYXRvYihiYXNlNjQpO1xuICAgIGNvbnN0IGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYmluYXJ5Lmxlbmd0aCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiaW5hcnkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYnl0ZXNbaV0gPSBiaW5hcnkuY2hhckNvZGVBdChpKTtcbiAgICB9XG4gICAgcmV0dXJuIGJ5dGVzLmJ1ZmZlcjtcbn1cblxuLy8gLS0tIEtleSBkZXJpdmF0aW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIERlcml2ZSBhbiBBRVMtMjU2LUdDTSBDcnlwdG9LZXkgZnJvbSBhIHBhc3N3b3JkIGFuZCBzYWx0IHVzaW5nIFBCS0RGMi5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgLSBUaGUgbWFzdGVyIHBhc3N3b3JkXG4gKiBAcGFyYW0ge0FycmF5QnVmZmVyfFVpbnQ4QXJyYXl9IHNhbHQgLSAxNi1ieXRlIHNhbHRcbiAqIEBwYXJhbSB7e2V4dHJhY3RhYmxlPzogYm9vbGVhbn19IFtvcHRpb25zXSAtIGBleHRyYWN0YWJsZTogdHJ1ZWAgYWxsb3dzIHRoZVxuICogICAgICAgIHJhdyBieXRlcyB0byBiZSBleHBvcnRlZCBvbmNlIChzZWUgZXhwb3J0S2V5QmFzZTY0KS4gVXNlZCBieSB0aGVcbiAqICAgICAgICBiYWNrZ3JvdW5kIHdvcmtlciBzbyBhbiB1bmxvY2tlZCBzZXNzaW9uIGNhbiBiZSBwYXJrZWQgaW5cbiAqICAgICAgICBzdG9yYWdlLnNlc3Npb24gYW5kIGZ1bGx5IHJlc3RvcmVkIGFmdGVyIGFuIE1WMyBldmljdGlvbi4gRGVmYXVsdFxuICogICAgICAgIGZhbHNlOiB0aGUga2V5IGlzIG9wYXF1ZSBhbmQgY2Fubm90IGxlYXZlIHRoZSBjcnlwdG8gc3Vic3lzdGVtLlxuICogQHJldHVybnMge1Byb21pc2U8Q3J5cHRvS2V5Pn0gQUVTLTI1Ni1HQ00ga2V5XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZXJpdmVLZXkocGFzc3dvcmQsIHNhbHQsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IGVuYyA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgIGNvbnN0IGtleU1hdGVyaWFsID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5pbXBvcnRLZXkoXG4gICAgICAgICdyYXcnLFxuICAgICAgICBlbmMuZW5jb2RlKHBhc3N3b3JkKSxcbiAgICAgICAgJ1BCS0RGMicsXG4gICAgICAgIGZhbHNlLFxuICAgICAgICBbJ2Rlcml2ZUtleSddXG4gICAgKTtcblxuICAgIHJldHVybiBjcnlwdG8uc3VidGxlLmRlcml2ZUtleShcbiAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogJ1BCS0RGMicsXG4gICAgICAgICAgICBzYWx0OiBzYWx0IGluc3RhbmNlb2YgVWludDhBcnJheSA/IHNhbHQgOiBuZXcgVWludDhBcnJheShzYWx0KSxcbiAgICAgICAgICAgIGl0ZXJhdGlvbnM6IFBCS0RGMl9JVEVSQVRJT05TLFxuICAgICAgICAgICAgaGFzaDogJ1NIQS0yNTYnLFxuICAgICAgICB9LFxuICAgICAgICBrZXlNYXRlcmlhbCxcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGxlbmd0aDogMjU2IH0sXG4gICAgICAgICEhb3B0aW9ucy5leHRyYWN0YWJsZSxcbiAgICAgICAgWydlbmNyeXB0JywgJ2RlY3J5cHQnXVxuICAgICk7XG59XG5cbi8qKlxuICogRXhwb3J0IGFuIGV4dHJhY3RhYmxlIEFFUyBrZXkncyByYXcgYnl0ZXMgYXMgYmFzZTY0LlxuICogT25seSBldmVyIGNhbGxlZCBvbiBhIGtleSBkZXJpdmVkIHdpdGggYHsgZXh0cmFjdGFibGU6IHRydWUgfWAuXG4gKlxuICogQHBhcmFtIHtDcnlwdG9LZXl9IGtleVxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gYmFzZTY0IHJhdyBrZXkgYnl0ZXNcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4cG9ydEtleUJhc2U2NChrZXkpIHtcbiAgICByZXR1cm4gYXJyYXlCdWZmZXJUb0Jhc2U2NChhd2FpdCBjcnlwdG8uc3VidGxlLmV4cG9ydEtleSgncmF3Jywga2V5KSk7XG59XG5cbi8qKlxuICogSW1wb3J0IGJhc2U2NCByYXcgYnl0ZXMgYmFjayBpbnRvIGEgTk9OLWV4dHJhY3RhYmxlIEFFUy0yNTYtR0NNIGtleS5cbiAqIFRoZSBjb3VudGVycGFydCBvZiBleHBvcnRLZXlCYXNlNjQ6IHdoYXRldmVyIHdlbnQgb3V0IGV4dHJhY3RhYmxlIGNvbWVzIGJhY2tcbiAqIG9wYXF1ZSwgc28gYSByZXN0b3JlZCBzZXNzaW9uIGtleSBjYW5ub3QgYmUgcmUtZXhwb3J0ZWQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2U2NCAtIHJhdyBrZXkgYnl0ZXNcbiAqIEByZXR1cm5zIHtQcm9taXNlPENyeXB0b0tleT59XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbXBvcnRLZXlCYXNlNjQoYmFzZTY0KSB7XG4gICAgcmV0dXJuIGNyeXB0by5zdWJ0bGUuaW1wb3J0S2V5KFxuICAgICAgICAncmF3JyxcbiAgICAgICAgYmFzZTY0VG9BcnJheUJ1ZmZlcihiYXNlNjQpLFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJyB9LFxuICAgICAgICBmYWxzZSxcbiAgICAgICAgWydlbmNyeXB0JywgJ2RlY3J5cHQnXVxuICAgICk7XG59XG5cbi8qKiBiYXNlNjQgXHUyMTk0IGJ5dGVzLCBleHBvcnRlZCBzbyBjYWxsZXJzIGNhbiByb3VuZC10cmlwIGEgc2FsdCB0aHJvdWdoIEpTT04uICovXG5leHBvcnQgZnVuY3Rpb24gYnl0ZXNUb0Jhc2U2NChieXRlcykge1xuICAgIC8vIGBuZXcgVWludDhBcnJheSh2aWV3KWAgaW5zaWRlIHRoZSBoZWxwZXIgY29waWVzIHRoZSBWSUVXLCBzbyBhIHNhbHQgdGhhdFxuICAgIC8vIGlzIGEgd2luZG93IGludG8gYSBsYXJnZXIgYnVmZmVyIHN0aWxsIGVuY29kZXMgY29ycmVjdGx5LlxuICAgIHJldHVybiBhcnJheUJ1ZmZlclRvQmFzZTY0KGJ5dGVzKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJhc2U2NFRvQnl0ZXMoYmFzZTY0KSB7XG4gICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoYmFzZTY0KSk7XG59XG5cbi8vIC0tLSBFbmNyeXB0IHdpdGggcHJlLWRlcml2ZWQga2V5IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuLyoqXG4gKiBFbmNyeXB0IGEgcGxhaW50ZXh0IHN0cmluZyB1c2luZyBhIHByZS1kZXJpdmVkIENyeXB0b0tleSBhbmQgaXRzIHNhbHQuXG4gKlxuICogVGhpcyBhdm9pZHMgaG9sZGluZyB0aGUgcmF3IHBhc3N3b3JkIGluIG1lbW9yeSBcdTIwMTQgdGhlIGNhbGxlciBkZXJpdmVzIHRoZVxuICoga2V5IG9uY2UgKHZpYSBkZXJpdmVLZXkpIGFuZCByZXVzZXMgaXQgZm9yIHRoZSBzZXNzaW9uLiAgVGhlIG91dHB1dFxuICogZm9ybWF0IGlzIGlkZW50aWNhbCB0byBlbmNyeXB0KCksIHNvIGRlY3J5cHQoKSBjYW4gc3RpbGwgYmUgdXNlZCB3aXRoXG4gKiB0aGUgb3JpZ2luYWwgcGFzc3dvcmQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHBsYWludGV4dCAgICAgICAgICAtIFRoZSBkYXRhIHRvIGVuY3J5cHRcbiAqIEBwYXJhbSB7Q3J5cHRvS2V5fSBrZXkgICAgICAgICAgICAgLSBBRVMtMjU2LUdDTSBrZXkgZnJvbSBkZXJpdmVLZXkoKVxuICogQHBhcmFtIHtVaW50OEFycmF5fSBzYWx0ICAgICAgICAgICAtIFRoZSBzYWx0IHRoYXQgd2FzIHVzZWQgdG8gZGVyaXZlIGBrZXlgXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxzdHJpbmc+fSBKU09OIHN0cmluZzogeyBzYWx0LCBpdiwgY2lwaGVydGV4dCB9IChhbGwgYmFzZTY0KVxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZW5jcnlwdFdpdGhLZXkocGxhaW50ZXh0LCBrZXksIHNhbHQpIHtcbiAgICBjb25zdCBpdiA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoSVZfQllURVMpKTtcbiAgICBjb25zdCBlbmMgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgICBjb25zdCBjaXBoZXJ0ZXh0ID0gYXdhaXQgY3J5cHRvLnN1YnRsZS5lbmNyeXB0KFxuICAgICAgICB7IG5hbWU6ICdBRVMtR0NNJywgaXYgfSxcbiAgICAgICAga2V5LFxuICAgICAgICBlbmMuZW5jb2RlKHBsYWludGV4dClcbiAgICApO1xuXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgc2FsdDogYXJyYXlCdWZmZXJUb0Jhc2U2NChzYWx0KSxcbiAgICAgICAgaXY6IGFycmF5QnVmZmVyVG9CYXNlNjQoaXYpLFxuICAgICAgICBjaXBoZXJ0ZXh0OiBhcnJheUJ1ZmZlclRvQmFzZTY0KGNpcGhlcnRleHQpLFxuICAgIH0pO1xufVxuXG4vLyAtLS0gRW5jcnlwdCAvIERlY3J5cHQgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8qKlxuICogRW5jcnlwdCBhIHBsYWludGV4dCBzdHJpbmcgd2l0aCBhIHBhc3N3b3JkLlxuICpcbiAqIEdlbmVyYXRlcyBhIHJhbmRvbSBzYWx0ICgxNiBieXRlcykgYW5kIElWICgxMiBieXRlcyksIGRlcml2ZXMgYW5cbiAqIEFFUy0yNTYtR0NNIGtleSB2aWEgUEJLREYyLCBhbmQgcmV0dXJucyBhIEpTT04gc3RyaW5nIGNvbnRhaW5pbmdcbiAqIGJhc2U2NC1lbmNvZGVkIHNhbHQsIGl2LCBhbmQgY2lwaGVydGV4dC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGxhaW50ZXh0IC0gVGhlIGRhdGEgdG8gZW5jcnlwdCAoZS5nLiBoZXggcHJpdmF0ZSBrZXkpXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgIC0gVGhlIG1hc3RlciBwYXNzd29yZFxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gSlNPTiBzdHJpbmc6IHsgc2FsdCwgaXYsIGNpcGhlcnRleHQgfSAoYWxsIGJhc2U2NClcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVuY3J5cHQocGxhaW50ZXh0LCBwYXNzd29yZCkge1xuICAgIGNvbnN0IHNhbHQgPSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKG5ldyBVaW50OEFycmF5KFNBTFRfQllURVMpKTtcbiAgICBjb25zdCBpdiA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoSVZfQllURVMpKTtcbiAgICBjb25zdCBrZXkgPSBhd2FpdCBkZXJpdmVLZXkocGFzc3dvcmQsIHNhbHQpO1xuXG4gICAgY29uc3QgZW5jID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgY29uc3QgY2lwaGVydGV4dCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZW5jcnlwdChcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2IH0sXG4gICAgICAgIGtleSxcbiAgICAgICAgZW5jLmVuY29kZShwbGFpbnRleHQpXG4gICAgKTtcblxuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIHNhbHQ6IGFycmF5QnVmZmVyVG9CYXNlNjQoc2FsdCksXG4gICAgICAgIGl2OiBhcnJheUJ1ZmZlclRvQmFzZTY0KGl2KSxcbiAgICAgICAgY2lwaGVydGV4dDogYXJyYXlCdWZmZXJUb0Jhc2U2NChjaXBoZXJ0ZXh0KSxcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBEZWNyeXB0IGRhdGEgdXNpbmcgYSBwcmUtZGVyaXZlZCBDcnlwdG9LZXkgKGlnbm9yZXMgdGhlIHNhbHQgZW1iZWRkZWQgaW4gdGhlXG4gKiBibG9iIFx1MjAxNCB0aGUgY2FsbGVyIG11c3Qgc3VwcGx5IGEga2V5IHRoYXQgbWF0Y2hlcyBob3cgdGhlIGJsb2Igd2FzIGVuY3J5cHRlZCkuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGVuY3J5cHRlZERhdGEgLSBKU09OIHN0cmluZyBmcm9tIGVuY3J5cHQoKS9lbmNyeXB0V2l0aEtleSgpXG4gKiBAcGFyYW0ge0NyeXB0b0tleX0ga2V5ICAgICAgICAtIEFFUy0yNTYtR0NNIGtleVxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gVGhlIG9yaWdpbmFsIHBsYWludGV4dFxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVjcnlwdFdpdGhLZXkoZW5jcnlwdGVkRGF0YSwga2V5KSB7XG4gICAgY29uc3QgeyBpdiwgY2lwaGVydGV4dCB9ID0gSlNPTi5wYXJzZShlbmNyeXB0ZWREYXRhKTtcbiAgICBjb25zdCBpdkJ1ZiA9IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoaXYpKTtcbiAgICBjb25zdCBjdEJ1ZiA9IGJhc2U2NFRvQXJyYXlCdWZmZXIoY2lwaGVydGV4dCk7XG4gICAgY29uc3QgcGxhaW5CdWYgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRlY3J5cHQoXG4gICAgICAgIHsgbmFtZTogJ0FFUy1HQ00nLCBpdjogaXZCdWYgfSxcbiAgICAgICAga2V5LFxuICAgICAgICBjdEJ1ZlxuICAgICk7XG4gICAgcmV0dXJuIG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShwbGFpbkJ1Zik7XG59XG5cbi8qKlxuICogRGVjcnlwdCBkYXRhIHRoYXQgd2FzIGVuY3J5cHRlZCB3aXRoIGBlbmNyeXB0KClgLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBlbmNyeXB0ZWREYXRhIC0gSlNPTiBzdHJpbmcgZnJvbSBlbmNyeXB0KClcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd29yZCAgICAgIC0gVGhlIG1hc3RlciBwYXNzd29yZFxuICogQHJldHVybnMge1Byb21pc2U8c3RyaW5nPn0gVGhlIG9yaWdpbmFsIHBsYWludGV4dFxuICogQHRocm93cyB7RXJyb3J9IElmIHRoZSBwYXNzd29yZCBpcyB3cm9uZyBvciBkYXRhIGlzIHRhbXBlcmVkIHdpdGhcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlY3J5cHQoZW5jcnlwdGVkRGF0YSwgcGFzc3dvcmQpIHtcbiAgICBjb25zdCB7IHNhbHQsIGl2LCBjaXBoZXJ0ZXh0IH0gPSBKU09OLnBhcnNlKGVuY3J5cHRlZERhdGEpO1xuXG4gICAgY29uc3Qgc2FsdEJ1ZiA9IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoc2FsdCkpO1xuICAgIGNvbnN0IGl2QnVmID0gbmV3IFVpbnQ4QXJyYXkoYmFzZTY0VG9BcnJheUJ1ZmZlcihpdikpO1xuICAgIGNvbnN0IGN0QnVmID0gYmFzZTY0VG9BcnJheUJ1ZmZlcihjaXBoZXJ0ZXh0KTtcblxuICAgIGNvbnN0IGtleSA9IGF3YWl0IGRlcml2ZUtleShwYXNzd29yZCwgc2FsdEJ1Zik7XG5cbiAgICBjb25zdCBwbGFpbkJ1ZiA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuZGVjcnlwdChcbiAgICAgICAgeyBuYW1lOiAnQUVTLUdDTScsIGl2OiBpdkJ1ZiB9LFxuICAgICAgICBrZXksXG4gICAgICAgIGN0QnVmXG4gICAgKTtcblxuICAgIGNvbnN0IGRlYyA9IG5ldyBUZXh0RGVjb2RlcigpO1xuICAgIHJldHVybiBkZWMuZGVjb2RlKHBsYWluQnVmKTtcbn1cblxuLy8gLS0tIFBhc3N3b3JkIGhhc2hpbmcgKGZvciB2ZXJpZmljYXRpb24pIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKipcbiAqIEhhc2ggYSBwYXNzd29yZCB3aXRoIFBCS0RGMiBmb3IgdmVyaWZpY2F0aW9uIHB1cnBvc2VzLlxuICpcbiAqIFRoaXMgcHJvZHVjZXMgYSBzZXBhcmF0ZSBoYXNoIChub3QgdGhlIGVuY3J5cHRpb24ga2V5KSB0aGF0IGNhbiBiZSBzdG9yZWRcbiAqIHRvIHZlcmlmeSB0aGUgcGFzc3dvcmQgd2l0aG91dCBuZWVkaW5nIHRvIGF0dGVtcHQgZGVjcnlwdGlvbi5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGFzc3dvcmQgLSBUaGUgbWFzdGVyIHBhc3N3b3JkXG4gKiBAcGFyYW0ge1VpbnQ4QXJyYXl9IFtzYWx0XSAtIE9wdGlvbmFsIHNhbHQ7IGdlbmVyYXRlZCBpZiBvbWl0dGVkXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx7IGhhc2g6IHN0cmluZywgc2FsdDogc3RyaW5nIH0+fSBiYXNlNjQtZW5jb2RlZCBoYXNoIGFuZCBzYWx0XG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYXNoUGFzc3dvcmQocGFzc3dvcmQsIHNhbHQpIHtcbiAgICBpZiAoIXNhbHQpIHtcbiAgICAgICAgc2FsdCA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQ4QXJyYXkoU0FMVF9CWVRFUykpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHNhbHQgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHNhbHQgPSBuZXcgVWludDhBcnJheShiYXNlNjRUb0FycmF5QnVmZmVyKHNhbHQpKTtcbiAgICB9XG5cbiAgICBjb25zdCBlbmMgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgICBjb25zdCBrZXlNYXRlcmlhbCA9IGF3YWl0IGNyeXB0by5zdWJ0bGUuaW1wb3J0S2V5KFxuICAgICAgICAncmF3JyxcbiAgICAgICAgZW5jLmVuY29kZShwYXNzd29yZCksXG4gICAgICAgICdQQktERjInLFxuICAgICAgICBmYWxzZSxcbiAgICAgICAgWydkZXJpdmVCaXRzJ11cbiAgICApO1xuXG4gICAgY29uc3QgaGFzaEJpdHMgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRlcml2ZUJpdHMoXG4gICAgICAgIHtcbiAgICAgICAgICAgIG5hbWU6ICdQQktERjInLFxuICAgICAgICAgICAgc2FsdCxcbiAgICAgICAgICAgIGl0ZXJhdGlvbnM6IFBCS0RGMl9JVEVSQVRJT05TLFxuICAgICAgICAgICAgaGFzaDogJ1NIQS0yNTYnLFxuICAgICAgICB9LFxuICAgICAgICBrZXlNYXRlcmlhbCxcbiAgICAgICAgMjU2XG4gICAgKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGhhc2g6IGFycmF5QnVmZmVyVG9CYXNlNjQoaGFzaEJpdHMpLFxuICAgICAgICBzYWx0OiBhcnJheUJ1ZmZlclRvQmFzZTY0KHNhbHQpLFxuICAgIH07XG59XG5cbi8qKlxuICogVmVyaWZ5IGEgcGFzc3dvcmQgYWdhaW5zdCBhIHN0b3JlZCBoYXNoLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXNzd29yZCAgIC0gVGhlIHBhc3N3b3JkIHRvIHZlcmlmeVxuICogQHBhcmFtIHtzdHJpbmd9IHN0b3JlZEhhc2ggLSBiYXNlNjQtZW5jb2RlZCBoYXNoIGZyb20gaGFzaFBhc3N3b3JkKClcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdG9yZWRTYWx0IC0gYmFzZTY0LWVuY29kZWQgc2FsdCBmcm9tIGhhc2hQYXNzd29yZCgpXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxib29sZWFuPn0gVHJ1ZSBpZiB0aGUgcGFzc3dvcmQgbWF0Y2hlc1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdmVyaWZ5UGFzc3dvcmQocGFzc3dvcmQsIHN0b3JlZEhhc2gsIHN0b3JlZFNhbHQpIHtcbiAgICBjb25zdCB7IGhhc2ggfSA9IGF3YWl0IGhhc2hQYXNzd29yZChwYXNzd29yZCwgc3RvcmVkU2FsdCk7XG4gICAgcmV0dXJuIGNvbnN0YW50VGltZUVxdWFsQmFzZTY0KGhhc2gsIHN0b3JlZEhhc2gpO1xufVxuXG4vKipcbiAqIENvbnN0YW50LXRpbWUgY29tcGFyaXNvbiBvZiB0d28gYmFzZTY0LWVuY29kZWQgYnl0ZSBzdHJpbmdzLlxuICpcbiAqIERlY29kZXMgYm90aCB0byByYXcgYnl0ZXMgYW5kIGNvbXBhcmVzIHdpdGggYW4gYWNjdW11bGF0b3Igc28gdGhlIHJ1bm5pbmdcbiAqIHRpbWUgZG9lcyBub3QgZGVwZW5kIG9uIHdoZXJlIHRoZSBmaXJzdCBtaXNtYXRjaCBvY2N1cnMgXHUyMDE0IHRoaXMgYXZvaWRzIHRoZVxuICogdGltaW5nIHNpZGUtY2hhbm5lbCBvZiBhIHBsYWluIGA9PT1gIHN0cmluZyBjb21wYXJlIChUaWVyLTMgY3J5cHRvLmpzOjIxMykuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb25zdGFudFRpbWVFcXVhbEJhc2U2NChhLCBiKSB7XG4gICAgbGV0IGJhLCBiYjtcbiAgICB0cnkge1xuICAgICAgICBiYSA9IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoYSkpO1xuICAgICAgICBiYiA9IG5ldyBVaW50OEFycmF5KGJhc2U2NFRvQXJyYXlCdWZmZXIoYikpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIC8vIENvbXBhcmUgdGhlIG1heCBsZW5ndGggc28gbGVuZ3RoIGRpZmZlcmVuY2VzIGRvbid0IHNob3J0LWNpcmN1aXQgZWFybHkuXG4gICAgY29uc3QgbGVuID0gTWF0aC5tYXgoYmEubGVuZ3RoLCBiYi5sZW5ndGgpO1xuICAgIGxldCBkaWZmID0gYmEubGVuZ3RoIF4gYmIubGVuZ3RoO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgZGlmZiB8PSAoYmFbaV0gfHwgMCkgXiAoYmJbaV0gfHwgMCk7XG4gICAgfVxuICAgIHJldHVybiBkaWZmID09PSAwO1xufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTs7O0FDQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQW1DQSxXQUFTLFVBQVUsU0FBUyxRQUFRO0FBQ2hDLFdBQU8sSUFBSSxTQUFTO0FBSWhCLFVBQUk7QUFDQSxjQUFNLFNBQVMsT0FBTyxNQUFNLFNBQVMsSUFBSTtBQUN6QyxZQUFJLFVBQVUsT0FBTyxPQUFPLFNBQVMsWUFBWTtBQUM3QyxpQkFBTztBQUFBLFFBQ1g7QUFBQSxNQUNKLFNBQVMsR0FBRztBQUFBLE1BRVo7QUFFQSxhQUFPLElBQUksUUFBUSxDQUFDLFNBQVMsV0FBVztBQUNwQyxlQUFPLE1BQU0sU0FBUztBQUFBLFVBQ2xCLEdBQUc7QUFBQSxVQUNILElBQUksV0FBVztBQUNYLGdCQUFJLFNBQVMsV0FBVyxTQUFTLFFBQVEsV0FBVztBQUNoRCxxQkFBTyxJQUFJLE1BQU0sU0FBUyxRQUFRLFVBQVUsT0FBTyxDQUFD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LE9BQU87QUFDM0IsYUFBTztBQUFBLElBQ1gsQ0FBQztBQUFBLEVBQ0w7QUFFQSxXQUFTLFNBQVMsTUFBTSxNQUFNLEVBQUUsT0FBTyxTQUFTLE9BQU8sR0FBRztBQUN0RCxRQUFJLEtBQU0sTUFBSyxNQUFNLFVBQVU7QUFDL0IsUUFBSSxLQUFNLE1BQUssTUFBTSxVQUFVO0FBQy9CLFVBQU0sSUFBSSxFQUFFLFlBQVk7QUFBRyxRQUFJLEtBQUssTUFBTyxHQUFFLGNBQWM7QUFDM0QsVUFBTSxJQUFJLEVBQUUsY0FBYztBQUFHLFFBQUksS0FBSyxRQUFTLEdBQUUsY0FBYztBQUMvRCxVQUFNLElBQUksRUFBRSxtQkFBbUI7QUFBRyxRQUFJLEtBQUssT0FBUSxHQUFFLGNBQWM7QUFDbkUsT0FBRyxpQkFBaUIsU0FBUyxNQUFNO0FBQy9CLFlBQU0sTUFBTSxJQUFJLFFBQVEsT0FBTyx3QkFBd0I7QUFDdkQsYUFBTyxLQUFLLEtBQUssa0JBQWtCO0FBQUEsSUFDdkMsQ0FBQztBQUFBLEVBQ0w7QUFFQSxpQkFBZSxPQUFPO0FBRWxCLFVBQU0sY0FBYyxNQUFNLElBQUksUUFBUSxZQUFZLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDekUsVUFBTSxTQUFTLE1BQU0sSUFBSSxRQUFRLFlBQVksRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUNqRSxVQUFNLE9BQU8sRUFBRSxtQkFBbUI7QUFDbEMsVUFBTSxPQUFPLEVBQUUsb0JBQW9CO0FBRW5DLFFBQUksQ0FBQyxhQUFhO0FBR2Qsa0JBQVksSUFBSTtBQUNoQixlQUFTLE1BQU0sTUFBTSxDQUFDLENBQUM7QUFDdkI7QUFBQSxJQUNKO0FBRUEsUUFBSSxRQUFRO0FBRVIsa0JBQVksS0FBSztBQUNqQixlQUFTLE1BQU0sTUFBTTtBQUFBLFFBQ2pCLE9BQU87QUFBQSxRQUNQLFNBQVM7QUFBQSxRQUNULFFBQVE7QUFBQSxNQUNaLENBQUM7QUFDRDtBQUFBLElBQ0o7QUFFQSxnQkFBWSxJQUFJO0FBQ2hCLFFBQUksS0FBTSxNQUFLLE1BQU0sVUFBVTtBQUMvQixRQUFJLEtBQU0sTUFBSyxNQUFNLFVBQVU7QUFFL0IsVUFBTSxTQUFTLE1BQU0sSUFBSSxRQUFRLFlBQVksRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ3hFLFVBQU0sWUFBWSxVQUFVLEVBQUUsTUFBTSxDQUFDLEdBQUcsT0FBTyxDQUFDLEVBQUU7QUFDbEQsVUFBTSxjQUFjLE1BQU1DLGVBQWM7QUFDeEMsVUFBTSxPQUFPLE1BQU0sWUFBWTtBQUUvQixlQUFXO0FBQ1gsV0FBTztBQUVQLFFBQUksTUFBTSxlQUFlLFVBQVUsR0FBRztBQUNsQyxZQUFNLFFBQVE7QUFBQSxJQUNsQjtBQUFBLEVBQ0o7QUFFQSxXQUFTLGlCQUFpQixvQkFBb0IsSUFBSTsiLAogICJuYW1lcyI6IFsidGFyZ2V0IiwgIklWX0JZVEVTIiwgIklWX0JZVEVTIiwgIm9wZW5EQiIsICJhcGkiLCAiSVZfQllURVMiLCAic3RvcmFnZSIsICJzdG9yYWdlIiwgImlzU3luY0VuYWJsZWQiLCAiaXNTeW5jRW5hYmxlZCJdCn0K
