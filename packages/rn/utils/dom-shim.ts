import { Platform } from "react-native";

if (Platform.OS !== "web") {
  const g: any = globalThis as any;

  g.window = g.window || g;

  const ignoredEvents = new Set([
    "message",
    "resize",
    "DOMContentLoaded",
    "visibilitychange",
  ]);

  const noop = () => {};

  const add = (type: string, _listener: any) => {
    if (ignoredEvents.has(type)) return;
  };

  const remove = (_type: string, _listener: any) => {};

  if (!g.window.addEventListener) g.window.addEventListener = add;
  if (!g.window.removeEventListener) g.window.removeEventListener = remove;
  if (!g.window.dispatchEvent) g.window.dispatchEvent = () => false;

  // CustomEvent polyfill
  if (typeof g.CustomEvent === "undefined") {
    g.CustomEvent = function (type: string, params?: { detail?: any }) {
      return { type, detail: params?.detail };
    } as any;
  }

  if (!g.MutationObserver) {
    g.MutationObserver = class {
      observe() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    };
  }

  if (!g.document) {
    g.document = {
      body: { appendChild: noop, removeChild: noop },
      createElement: () => ({}),
      addEventListener: add,
      removeEventListener: remove,
    };
  }
}
