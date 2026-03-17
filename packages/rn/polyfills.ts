/**
 * Polyfills for browser APIs that @starknet-io/get-starknet-discovery
 * and @wallet-standard/base expect but don't exist in React Native.
 *
 * Must be imported before any starknet packages load.
 */

// Event class polyfill — used by @starknet-io/get-starknet-discovery's
// AppReadyEvent class which extends Event
if (typeof globalThis.Event === "undefined") {
  (globalThis as any).Event = class Event {
    type: string;
    bubbles: boolean;
    cancelable: boolean;
    composed: boolean;

    constructor(
      type: string,
      options?: { bubbles?: boolean; cancelable?: boolean; composed?: boolean },
    ) {
      this.type = type;
      this.bubbles = options?.bubbles ?? false;
      this.cancelable = options?.cancelable ?? false;
      this.composed = options?.composed ?? false;
    }

    preventDefault() {}
    stopPropagation() {}
    stopImmediatePropagation() {}
  };
}

// CustomEvent polyfill — used by wallet discovery for eip6963 events
if (typeof globalThis.CustomEvent === "undefined") {
  (globalThis as any).CustomEvent = class CustomEvent extends (globalThis as any).Event {
    detail: any;

    constructor(type: string, options?: { detail?: any; bubbles?: boolean; cancelable?: boolean }) {
      super(type, options);
      this.detail = options?.detail ?? null;
    }
  };
}
