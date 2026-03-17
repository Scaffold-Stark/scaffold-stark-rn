/**
 * Polyfills for browser APIs that @starknet-io/get-starknet-discovery
 * and @wallet-standard/base expect but don't exist in React Native.
 *
 * Must be imported before any starknet packages load.
 */

const g = globalThis as any;

// Event class polyfill
if (typeof g.Event === "undefined") {
  g.Event = class Event {
    type: string;
    bubbles: boolean;
    cancelable: boolean;
    composed: boolean;
    constructor(
      type: string,
      opts?: { bubbles?: boolean; cancelable?: boolean; composed?: boolean },
    ) {
      this.type = type;
      this.bubbles = opts?.bubbles ?? false;
      this.cancelable = opts?.cancelable ?? false;
      this.composed = opts?.composed ?? false;
    }
    preventDefault() {}
    stopPropagation() {}
    stopImmediatePropagation() {}
  };
}

// CustomEvent polyfill
if (typeof g.CustomEvent === "undefined") {
  g.CustomEvent = class CustomEvent extends g.Event {
    detail: any;
    constructor(type: string, opts?: any) {
      super(type, opts);
      this.detail = opts?.detail ?? null;
    }
  };
}

// window.addEventListener / removeEventListener / dispatchEvent polyfill.
// @starknet-io/get-starknet-discovery calls these during module init
// to register wallet discovery listeners. In React Native `window` exists
// (as an alias for `global`) but lacks DOM EventTarget methods.
if (typeof g.window !== "undefined" && typeof g.window.addEventListener !== "function") {
  const listeners: Record<string, Function[]> = {};

  g.window.addEventListener = (type: string, handler: Function) => {
    if (!listeners[type]) listeners[type] = [];
    listeners[type].push(handler);
  };

  g.window.removeEventListener = (type: string, handler: Function) => {
    if (!listeners[type]) return;
    listeners[type] = listeners[type].filter((h) => h !== handler);
  };

  g.window.dispatchEvent = (event: any) => {
    const handlers = listeners[event?.type];
    if (handlers) {
      for (const h of handlers) {
        try { h(event); } catch (_e) {}
      }
    }
    return true;
  };
}
