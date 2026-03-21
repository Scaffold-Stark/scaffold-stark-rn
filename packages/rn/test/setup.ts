/**
 * Jest test setup file.
 *
 * This file runs before each test suite and configures common polyfills
 * that are needed across tests.
 */

// Ensure TextEncoder/TextDecoder are available (Node 18+ has them but
// some jest-expo presets strip them).
if (typeof globalThis.TextEncoder === "undefined") {
  const { TextEncoder, TextDecoder } = require("util");
  globalThis.TextEncoder = TextEncoder;
  globalThis.TextDecoder = TextDecoder;
}
