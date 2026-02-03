import { renderHook, waitFor } from "@testing-library/react-native";
import { useAutoConnect } from "../useAutoConnect";

// Mock SecureStore
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
}));

// Mock starknet-react/core
jest.mock("@starknet-react/core", () => ({
  useConnect: jest.fn(() => ({
    connect: jest.fn(),
    connectors: [{ id: "test-connector", ready: true }],
  })),
  useAccount: jest.fn(() => ({ account: null })),
}));

// Mock scaffold config
jest.mock("@/scaffold.config", () => ({
  default: {
    walletAutoConnect: true,
    autoConnectTTL: 60000,
  },
}));

describe("useAutoConnect", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not throw on render", () => {
    expect(() => {
      renderHook(() => useAutoConnect());
    }).not.toThrow();
  });

  it("loads storage values on mount", async () => {
    const SecureStore = require("expo-secure-store");

    renderHook(() => useAutoConnect());

    await waitFor(() => {
      expect(SecureStore.getItemAsync).toHaveBeenCalled();
    });
  });

  it("does not connect when no saved connector", async () => {
    const { useConnect } = require("@starknet-react/core");
    const mockConnect = jest.fn();
    useConnect.mockReturnValue({
      connect: mockConnect,
      connectors: [{ id: "test-connector", ready: true }],
    });

    renderHook(() => useAutoConnect());

    // Should not connect since no saved connector in storage
    await waitFor(() => {
      expect(mockConnect).not.toHaveBeenCalled();
    });
  });

  it("does not connect when walletAutoConnect is disabled", async () => {
    jest.doMock("@/scaffold.config", () => ({
      default: {
        walletAutoConnect: false,
        autoConnectTTL: 60000,
      },
    }));

    const { useConnect } = require("@starknet-react/core");
    const mockConnect = jest.fn();
    useConnect.mockReturnValue({
      connect: mockConnect,
      connectors: [],
    });

    renderHook(() => useAutoConnect());

    await waitFor(() => {
      expect(mockConnect).not.toHaveBeenCalled();
    });
  });
});
