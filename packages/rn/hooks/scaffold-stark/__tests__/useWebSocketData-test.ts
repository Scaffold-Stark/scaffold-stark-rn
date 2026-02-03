import { renderHook } from "@testing-library/react-native";
import { useWebSocketData } from "../useWebSocketData";

jest.mock("../useTargetNetwork", () => ({
  useTargetNetwork: jest.fn(() => ({
    targetNetwork: {
      id: 1,
      network: "devnet",
      rpcUrls: { public: { http: ["http://localhost:5050/rpc"] } },
    },
  })),
}));

jest.mock("@/services/web3/websocket", () => ({
  getSharedWebSocketChannel: jest.fn(() => Promise.resolve(null)),
}));

describe("useWebSocketData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("starts with idle status when disabled", () => {
    const { result } = renderHook(() =>
      useWebSocketData({
        topic: "newHeads",
        enabled: false,
      }),
    );

    expect(result.current.status).toBe("idle");
    expect(result.current.isConnected).toBe(false);
  });

  it("returns empty data array initially", () => {
    const { result } = renderHook(() =>
      useWebSocketData({
        topic: "newHeads",
        enabled: false,
      }),
    );

    expect(result.current.data).toEqual([]);
  });

  it("starts connecting when enabled", () => {
    const { result } = renderHook(() =>
      useWebSocketData({
        topic: "newHeads",
        enabled: true,
      }),
    );

    // Should be connecting or error (since mock returns null)
    expect(["connecting", "error"]).toContain(result.current.status);
  });
});
