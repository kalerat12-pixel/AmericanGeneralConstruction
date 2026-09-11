/**
 * Minimal external store over localStorage, shaped for useSyncExternalStore.
 *
 * Why not useState + useEffect: reading storage in an effect means a synchronous
 * setState on mount, which cascades renders (and React's lint rule rightly flags
 * it). useSyncExternalStore is built for exactly this — a server snapshot for
 * SSR, a client snapshot after hydration, and no effect at all.
 *
 * It also gets cross-tab sync for free: add something to your cart in one tab
 * and the other tab's header count updates.
 */

export interface BrowserStore<T> {
  subscribe: (onChange: () => void) => () => void;
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  set: (next: T) => void;
  update: (fn: (current: T) => T) => void;
}

export function createLocalStorageStore<T>(
  key: string,
  emptyValue: T,
  parse: (raw: unknown) => T,
): BrowserStore<T> {
  const listeners = new Set<() => void>();

  // getSnapshot must return a stable reference between calls or React will
  // re-render forever, so the parsed value is cached against its raw string.
  let cachedRaw: string | null = null;
  let cachedValue: T = emptyValue;
  let primed = false;

  function readRaw(): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      // Private mode, blocked storage — behave as if it were empty.
      return null;
    }
  }

  function getSnapshot(): T {
    const raw = readRaw();
    if (primed && raw === cachedRaw) return cachedValue;

    cachedRaw = raw;
    primed = true;

    if (raw === null) {
      cachedValue = emptyValue;
      return cachedValue;
    }

    try {
      cachedValue = parse(JSON.parse(raw));
    } catch {
      cachedValue = emptyValue;
    }
    return cachedValue;
  }

  function emit() {
    for (const listener of listeners) listener();
  }

  function onStorageEvent(event: StorageEvent) {
    if (event.key === key || event.key === null) emit();
  }

  function subscribe(onChange: () => void): () => void {
    if (listeners.size === 0 && typeof window !== "undefined") {
      window.addEventListener("storage", onStorageEvent);
    }
    listeners.add(onChange);

    return () => {
      listeners.delete(onChange);
      if (listeners.size === 0 && typeof window !== "undefined") {
        window.removeEventListener("storage", onStorageEvent);
      }
    };
  }

  function set(next: T) {
    const raw = JSON.stringify(next);
    cachedRaw = raw;
    cachedValue = next;
    primed = true;
    try {
      window.localStorage.setItem(key, raw);
    } catch {
      // Storage unavailable: the value still lives in the cache for this
      // session, so the UI stays correct until the tab closes.
    }
    emit();
  }

  function update(fn: (current: T) => T) {
    set(fn(getSnapshot()));
  }

  return { subscribe, getSnapshot, getServerSnapshot: () => emptyValue, set, update };
}

/**
 * `false` while server-rendering and during hydration, `true` afterwards —
 * without an effect. Lets a component hold back browser-only content until the
 * client snapshot is authoritative.
 */
const noopSubscribe = () => () => {};
export const hydratedStore = {
  subscribe: noopSubscribe,
  getSnapshot: () => true,
  getServerSnapshot: () => false,
};
