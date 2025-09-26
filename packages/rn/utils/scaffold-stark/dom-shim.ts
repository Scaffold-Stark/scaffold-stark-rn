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
    const makeClassList = () => {
      const set = new Set<string>();
      return {
        add: (...names: string[]) => names.forEach((n) => set.add(n)),
        remove: (...names: string[]) => names.forEach((n) => set.delete(n)),
        contains: (name: string) => set.has(name),
        toggle: (name: string) =>
          set.has(name) ? (set.delete(name), false) : (set.add(name), true),
      } as any;
    };

    const makeElement = (tag?: string) => {
      const el: any = {
        nodeName: (tag || "").toUpperCase(),
        style: {},
        className: "",
        classList: makeClassList(),
        setAttribute: noop,
        getAttribute: (_name: string) => null,
        getContext: () => null,
        appendChild: (_child: any) => _child,
        removeChild: (_child: any) => _child,
        addEventListener: add,
        removeEventListener: remove,
        textContent: "",
      };
      if (tag === "iframe") {
        const tokenSet = new Set<string>();
        el.sandbox = {
          add: (...names: string[]) => names.forEach((n) => tokenSet.add(n)),
          remove: (...names: string[]) =>
            names.forEach((n) => tokenSet.delete(n)),
          contains: (name: string) => tokenSet.has(name),
          toString: () => Array.from(tokenSet).join(" "),
        };
        el.contentWindow = {};
        el.contentDocument = {};
        el.allow = "";
      }
      if (tag === "style") {
        el.sheet = {
          insertRule: noop,
          deleteRule: noop,
        };
      }
      return el;
    };

    const bodyEl: any = {
      style: {},
      classList: makeClassList(),
      appendChild: (_c: any) => _c,
      removeChild: (_c: any) => _c,
    };
    const docEl: any = {
      style: {},
      classList: makeClassList(),
      appendChild: (_c: any) => _c,
      removeChild: (_c: any) => _c,
    };

    g.document = {
      body: bodyEl,
      documentElement: docEl,
      head: { appendChild: (_c: any) => _c, removeChild: (_c: any) => _c },
      createElement: (tag?: string) => makeElement(tag),
      createTextNode: (_text?: string) => ({ textContent: _text || "" }),
      getElementById: (_id: string) => null,
      querySelector: (_sel: string) => null,
      querySelectorAll: (_sel: string) => [] as any[],
      addEventListener: add,
      removeEventListener: remove,
    } as any;

    if (!g.getComputedStyle) {
      g.getComputedStyle = () => ({});
    }

    if (!g.navigator) {
      g.navigator = { userAgent: "ReactNative" } as any;
    }
  }
}
