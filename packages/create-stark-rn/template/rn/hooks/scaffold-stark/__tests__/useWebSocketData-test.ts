import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useWebSocketData } from "../useWebSocketData";

const mockSubscribeNewHeads = jest.fn();
const mockSubscribeNewTransactionReceipts = jest.fn();
const mockSubscribeTransactionStatus = jest.fn();
const mockUnsubscribe = jest.fn();
const mockOn = jest.fn();

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

// Mock websocket service
jest.mock("@/services/web3/websocket", () => ({
  getSharedWebSocketChannel: jest.fn(),
}));

describe("useWebSocketData", () => {
  const { getSharedWebSocketChannel } = require("@/services/web3/websocket");

  beforeEach(() => {
    jest.clearAllMocks();
    mockOn.mockReset();

    mockSubscribeNewHeads.mockResolvedValue({
      on: mockOn,
      unsubscribe: mockUnsubscribe,
    });
    mockSubscribeNewTransactionReceipts.mockResolvedValue({
      on: mockOn,
      unsubscribe: mockUnsubscribe,
    });
    mockSubscribeTransactionStatus.mockResolvedValue({
      on: mockOn,
      unsubscribe: mockUnsubscribe,
    });
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

  it("sets error status when WebSocket channel is unavailable", async () => {
    getSharedWebSocketChannel.mockResolvedValue(null);

    const { result } = renderHook(() =>
      useWebSocketData({
        topic: "newHeads",
        enabled: true,
      }),
    );

    await waitFor(() => {
      expect(result.current.status).toBe("error");
      expect(result.current.error?.message).toBe(
        "WebSocket channel unavailable",
      );
    });
  });

  it("subscribes to newHeads topic", async () => {
    const mockChannel = {
      subscribeNewHeads: mockSubscribeNewHeads,
      subscribeNewTransactionReceipts: mockSubscribeNewTransactionReceipts,
      subscribeTransactionStatus: mockSubscribeTransactionStatus,
    };
    getSharedWebSocketChannel.mockResolvedValue(mockChannel);

    const { result } = renderHook(() =>
      useWebSocketData({
        topic: "newHeads",
        enabled: true,
      }),
    );

    await waitFor(() => {
      expect(mockSubscribeNewHeads).toHaveBeenCalled();
    });

    // Subscription was established; the status will transition to "connected"
    // after a 150ms anti-flicker delay handled internally by the hook.
    expect(["connecting", "connected"]).toContain(result.current.status);
  });

  it("subscribes to newTransactionReceipts topic", async () => {
    const mockChannel = {
      subscribeNewHeads: mockSubscribeNewHeads,
      subscribeNewTransactionReceipts: mockSubscribeNewTransactionReceipts,
      subscribeTransactionStatus: mockSubscribeTransactionStatus,
    };
    getSharedWebSocketChannel.mockResolvedValue(mockChannel);

    renderHook(() =>
      useWebSocketData({
        topic: "newTransactionReceipts",
        enabled: true,
      }),
    );

    await waitFor(() => {
      expect(mockSubscribeNewTransactionReceipts).toHaveBeenCalled();
    });
  });

  it("subscribes to transactionStatus topic", async () => {
    const mockChannel = {
      subscribeNewHeads: mockSubscribeNewHeads,
      subscribeNewTransactionReceipts: mockSubscribeNewTransactionReceipts,
      subscribeTransactionStatus: mockSubscribeTransactionStatus,
    };
    getSharedWebSocketChannel.mockResolvedValue(mockChannel);

    renderHook(() =>
      useWebSocketData({
        topic: "transactionStatus",
        params: { transaction_hash: "0xtx" } as any,
        enabled: true,
      }),
    );

    await waitFor(() => {
      expect(mockSubscribeTransactionStatus).toHaveBeenCalled();
    });
  });

  it("collects received messages in data array (newest first)", async () => {
    const mockChannel = {
      subscribeNewHeads: mockSubscribeNewHeads,
      subscribeNewTransactionReceipts: mockSubscribeNewTransactionReceipts,
      subscribeTransactionStatus: mockSubscribeTransactionStatus,
    };
    getSharedWebSocketChannel.mockResolvedValue(mockChannel);

    const onMessage = jest.fn();

    const { result } = renderHook(() =>
      useWebSocketData({
        topic: "newHeads",
        enabled: true,
        onMessage,
      }),
    );

    await waitFor(() => {
      expect(mockOn).toHaveBeenCalled();
    });

    const onCallback = mockOn.mock.calls[0][0];

    await act(async () => {
      onCallback({ block_number: 1 });
    });
    await act(async () => {
      onCallback({ block_number: 2 });
    });

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data[0]).toEqual({ block_number: 2 });
    expect(result.current.data[1]).toEqual({ block_number: 1 });
    expect(onMessage).toHaveBeenCalledTimes(2);
  });

  it("cleans up subscription on unmount", async () => {
    const mockChannel = {
      subscribeNewHeads: mockSubscribeNewHeads,
    };
    getSharedWebSocketChannel.mockResolvedValue(mockChannel);

    const { unmount } = renderHook(() =>
      useWebSocketData({
        topic: "newHeads",
        enabled: true,
      }),
    );

    await waitFor(() => {
      expect(mockSubscribeNewHeads).toHaveBeenCalled();
    });

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it("handles connection error gracefully", async () => {
    getSharedWebSocketChannel.mockRejectedValue(
      new Error("Connection refused"),
    );

    const { result } = renderHook(() =>
      useWebSocketData({
        topic: "newHeads",
        enabled: true,
      }),
    );

    await waitFor(() => {
      expect(result.current.status).toBe("error");
      expect(result.current.error).toBeDefined();
    });
  });

  it("does not subscribe when enabled is false", async () => {
    const mockChannel = {
      subscribeNewHeads: mockSubscribeNewHeads,
    };
    getSharedWebSocketChannel.mockResolvedValue(mockChannel);

    renderHook(() =>
      useWebSocketData({
        topic: "newHeads",
        enabled: false,
      }),
    );

    await waitFor(() => {
      expect(mockSubscribeNewHeads).not.toHaveBeenCalled();
    });
  });
});
