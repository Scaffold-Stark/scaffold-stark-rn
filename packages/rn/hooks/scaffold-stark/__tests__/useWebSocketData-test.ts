import { renderHook, act } from "@testing-library/react-native";
import { useWebSocketData } from "../useWebSocketData";

// Mock useTargetNetwork
jest.mock("../useTargetNetwork", () => ({
  useTargetNetwork: jest.fn(() => ({
    targetNetwork: {
      id: 1,
      network: "devnet",
      rpcUrls: { public: { http: ["http://localhost:5050/rpc"] } },
    },
  })),
}));

// Mock websocket service - return null to avoid async issues
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

  it("isLoading is false when disabled", () => {
    const { result } = renderHook(() =>
      useWebSocketData({
        topic: "newHeads",
        enabled: false,
      }),
    );

    expect(result.current.isLoading).toBe(false);
  });

  it("error is null initially", () => {
    const { result } = renderHook(() =>
      useWebSocketData({
        topic: "newHeads",
        enabled: false,
      }),
    );

    expect(result.current.error).toBeNull();
  });

  it("supports different topics", () => {
    const topics: Array<"newHeads" | "newTransactionReceipts"> = [
      "newHeads",
      "newTransactionReceipts",
    ];

    topics.forEach((topic) => {
      const { result } = renderHook(() =>
        useWebSocketData({
          topic,
          enabled: false,
        }),
      );

      expect(result.current.status).toBe("idle");
    });
  });
});
