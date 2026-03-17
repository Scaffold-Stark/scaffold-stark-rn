/**
 * Polyfills for browser APIs used by @starknet-io/get-starknet-discovery
 * and @wallet-standard/base that don't exist in React Native / Hermes.
 *
 * Must be imported before any starknet packages load.
 */

const g = globalThis as any;

// Event class polyfill.
// AppReadyEvent in get-starknet-discovery does `class AppReadyEvent extends Event`
// and overrides `get type()`. Hermes transpiles class fields as assignments in the
// constructor, so we must use Object.defineProperty for `type` to allow subclass
// getter overrides without "Cannot assign to property which has only a getter".
if (typeof g.Event === "undefined") {
  g.Event = function Event(
    this: any,
    type: string,
    opts?: { bubbles?: boolean; cancelable?: boolean; composed?: boolean },
  ) {
    Object.defineProperty(this, "type", {
      value: type,
      writable: true,
      configurable: true,
    });
    this.bubbles = opts?.bubbles ?? false;
    this.cancelable = opts?.cancelable ?? false;
    this.composed = opts?.composed ?? false;
  };
  g.Event.prototype.preventDefault = function () {};
  g.Event.prototype.stopPropagation = function () {};
  g.Event.prototype.stopImmediatePropagation = function () {};
}

// CustomEvent polyfill
if (typeof g.CustomEvent === "undefined") {
  g.CustomEvent = function CustomEvent(this: any, type: string, opts?: any) {
    g.Event.call(this, type, opts);
    this.detail = opts?.detail ?? null;
  };
  g.CustomEvent.prototype = Object.create(g.Event.prototype);
  g.CustomEvent.prototype.constructor = g.CustomEvent;
}

// window.addEventListener / removeEventListener / dispatchEvent polyfill.
// @starknet-io/get-starknet-discovery calls these during module init
// for wallet discovery. In React Native `window` exists but lacks
// DOM EventTarget methods.
if (typeof g.window !== "undefined" && typeof g.window.addEventListener !== "function") {
  const listeners: Record<string, Function[]> = {};

  g.window.addEventListener = (type: string, handler: Function) => {
    if (!listeners[type]) listeners[type] = [];
    listeners[type].push(handler);
  };

  g.window.removeEventListener = (type: string, handler: Function) => {
    if (!listeners[type]) return;
    listeners[type] = listeners[type].filter((h: Function) => h !== handler);
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
