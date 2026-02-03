import { renderHook, waitFor } from "@testing-library/react-native";
import { useAutoConnect } from "../useAutoConnect";

const mockConnect = jest.fn();

jest.mock("@starknet-react/core", () => ({
  useConnect: () => ({
    connect: mockConnect,
    connectors: [{ id: "test-connector", ready: true }],
  }),
  useAccount: () => ({ account: null }),
}));

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

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

  it("does not connect when walletAutoConnect is false", async () => {
    jest.doMock("@/scaffold.config", () => ({
      default: {
        walletAutoConnect: false,
        autoConnectTTL: 60000,
      },
    }));

    renderHook(() => useAutoConnect());

    await waitFor(() => {
      expect(mockConnect).not.toHaveBeenCalled();
    });
  });

  it("loads storage values on mount", async () => {
    const SecureStore = require("expo-secure-store");
    SecureStore.getItemAsync.mockResolvedValue(null);

    renderHook(() => useAutoConnect());

    await waitFor(() => {
      expect(SecureStore.getItemAsync).toHaveBeenCalled();
    });
  });
});
