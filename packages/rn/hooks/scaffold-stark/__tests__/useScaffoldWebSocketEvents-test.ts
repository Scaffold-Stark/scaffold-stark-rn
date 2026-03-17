import { renderHook, waitFor, act } from "@testing-library/react-native";

// --- Mocks ---------------------------------------------------------------

const mockSubscribeEvents = jest.fn();
const mockUnsubscribe = jest.fn();
const mockOn = jest.fn();

jest.mock("../useTargetNetwork", () => ({
  useTargetNetwork: jest.fn(() => ({
    targetNetwork: {
      id: 1,
      network: "devnet",
      rpcUrls: { public: { http: ["http://127.0.0.1:5050/rpc"] } },
    },
  })),
}));

const mockEventAbi = {
  type: "event",
  name: "contracts::YourContract::Transfer",
  kind: "struct",
  members: [
    {
      name: "from",
      type: "core::starknet::contract_address::ContractAddress",
      kind: "key",
    },
  ],
};

const mockDeployedContract = {
  address: "0xcontract",
  abi: [mockEventAbi],
};

jest.mock("../useDeployedContractInfo", () => ({
  useDeployedContractInfo: jest.fn(() => ({
    data: mockDeployedContract,
    isLoading: false,
  })),
}));

jest.mock("starknet", () => ({
  RpcProvider: jest.fn(() => ({
    getBlockWithTxHashes: jest.fn(async () => ({ block_number: 100 })),
    getTransactionByHash: jest.fn(async () => ({ transaction_hash: "0x1" })),
    getTransactionReceipt: jest.fn(async () => ({ status: "ACCEPTED" })),
  })),
  WebSocketChannel: jest.fn(),
}));

const mockGetSharedWebSocketChannel = jest.fn();

jest.mock("@/services/web3/websocket", () => ({
  getSharedWebSocketChannel: (...args: any[]) =>
    mockGetSharedWebSocketChannel(...args),
}));

jest.mock("@/utils/scaffold-stark/contract", () => ({}));

jest.mock("@/utils/scaffold-stark/events", () => ({
  resolveEventAbi: jest.fn(() => mockEventAbi),
  enrichLog: jest.fn(async () => ({
    block: { block_number: 100 },
    transaction: { transaction_hash: "0x1" },
    receipt: { status: "ACCEPTED" },
  })),
  parseLogsArgs: jest.fn(() => ({
    from: BigInt("0x1"),
    to: BigInt("0x2"),
  })),
  buildEventKeys: jest.fn(() => [["0xselector"]]),
  parseEventData: jest.fn((args) => args),
}));

function createMockChannel() {
  const sub = {
    on: mockOn,
    unsubscribe: mockUnsubscribe,
  };
  mockSubscribeEvents.mockResolvedValue(sub);
  return { subscribeEvents: mockSubscribeEvents };
}

describe("useScaffoldWebSocketEvents", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOn.mockReset();
    mockSubscribeEvents.mockReset();
    mockUnsubscribe.mockReset();
    mockGetSharedWebSocketChannel.mockReset();
    // Ensure useDeployedContractInfo returns the default value for each test
    const { useDeployedContractInfo } = require("../useDeployedContractInfo");
    useDeployedContractInfo.mockReturnValue({
      data: mockDeployedContract,
      isLoading: false,
    });
  });

  it("returns initial state with empty events", () => {
    mockGetSharedWebSocketChannel.mockResolvedValue(null);

    const { useScaffoldWebSocketEvents } = require("../useScaffoldWebSocketEvents");

    const { result } = renderHook(() =>
      useScaffoldWebSocketEvents({
        contractName: "YourContract" as any,
        eventName: "Transfer" as any,
        enabled: false,
      }),
    );

    expect(result.current.events).toEqual([]);
    expect(result.current.isConnected).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("sets error when WebSocket channel is unavailable", async () => {
    mockGetSharedWebSocketChannel.mockResolvedValue(null);

    const { useScaffoldWebSocketEvents } = require("../useScaffoldWebSocketEvents");

    const { result } = renderHook(() =>
      useScaffoldWebSocketEvents({
        contractName: "YourContract" as any,
        eventName: "Transfer" as any,
        enabled: true,
      }),
    );

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toBe(
        "WebSocket channel unavailable",
      );
    });
  });

  it("subscribes to events when channel is available", async () => {
    const mockChannel = createMockChannel();
    mockGetSharedWebSocketChannel.mockResolvedValue(mockChannel);

    const { useScaffoldWebSocketEvents } = require("../useScaffoldWebSocketEvents");

    const { result } = renderHook(() =>
      useScaffoldWebSocketEvents({
        contractName: "YourContract" as any,
        eventName: "Transfer" as any,
        enabled: true,
      }),
    );

    await waitFor(() => {
      expect(mockSubscribeEvents).toHaveBeenCalled();
      expect(result.current.isConnected).toBe(true);
    });
  });

  it("passes fromAddress and keys to subscribeEvents", async () => {
    const mockChannel = createMockChannel();
    mockGetSharedWebSocketChannel.mockResolvedValue(mockChannel);

    const { useScaffoldWebSocketEvents } = require("../useScaffoldWebSocketEvents");

    renderHook(() =>
      useScaffoldWebSocketEvents({
        contractName: "YourContract" as any,
        eventName: "Transfer" as any,
        enabled: true,
      }),
    );

    await waitFor(() => {
      expect(mockSubscribeEvents).toHaveBeenCalledWith(
        expect.objectContaining({
          fromAddress: "0xcontract",
          keys: [["0xselector"]],
        }),
      );
    });
  });

  it("does not subscribe when enabled is false", async () => {
    const { useScaffoldWebSocketEvents } = require("../useScaffoldWebSocketEvents");

    renderHook(() =>
      useScaffoldWebSocketEvents({
        contractName: "YourContract" as any,
        eventName: "Transfer" as any,
        enabled: false,
      }),
    );

    await waitFor(() => {
      expect(mockSubscribeEvents).not.toHaveBeenCalled();
    });
  });

  it("does not subscribe when contract is still loading", async () => {
    const { useDeployedContractInfo } = require("../useDeployedContractInfo");
    useDeployedContractInfo.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const { useScaffoldWebSocketEvents } = require("../useScaffoldWebSocketEvents");

    renderHook(() =>
      useScaffoldWebSocketEvents({
        contractName: "YourContract" as any,
        eventName: "Transfer" as any,
        enabled: true,
      }),
    );

    await waitFor(() => {
      expect(mockSubscribeEvents).not.toHaveBeenCalled();
    });
  });

  it("unsubscribes on unmount", async () => {
    const mockChannel = createMockChannel();
    mockGetSharedWebSocketChannel.mockResolvedValue(mockChannel);

    const { useScaffoldWebSocketEvents } = require("../useScaffoldWebSocketEvents");

    const { unmount } = renderHook(() =>
      useScaffoldWebSocketEvents({
        contractName: "YourContract" as any,
        eventName: "Transfer" as any,
        enabled: true,
      }),
    );

    await waitFor(() => {
      expect(mockSubscribeEvents).toHaveBeenCalled();
    });

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it("calls onEvent callback when event is received without enrichment", async () => {
    const mockChannel = createMockChannel();
    mockGetSharedWebSocketChannel.mockResolvedValue(mockChannel);
    const onEvent = jest.fn();

    const { useScaffoldWebSocketEvents } = require("../useScaffoldWebSocketEvents");

    renderHook(() =>
      useScaffoldWebSocketEvents({
        contractName: "YourContract" as any,
        eventName: "Transfer" as any,
        enabled: true,
        enrich: false,
        onEvent,
      }),
    );

    await waitFor(() => {
      expect(mockOn).toHaveBeenCalled();
    });

    const onCallback = mockOn.mock.calls[0][0];
    await act(async () => {
      await onCallback({ keys: ["0x1"], data: ["0x2"] });
    });

    expect(onEvent).toHaveBeenCalled();
  });

  it("enriches events when enrich is true", async () => {
    const mockChannel = createMockChannel();
    mockGetSharedWebSocketChannel.mockResolvedValue(mockChannel);

    const { enrichLog } = require("@/utils/scaffold-stark/events");
    const { useScaffoldWebSocketEvents } = require("../useScaffoldWebSocketEvents");

    renderHook(() =>
      useScaffoldWebSocketEvents({
        contractName: "YourContract" as any,
        eventName: "Transfer" as any,
        enabled: true,
        enrich: true,
      }),
    );

    await waitFor(() => {
      expect(mockOn).toHaveBeenCalled();
    });

    const onCallback = mockOn.mock.calls[0][0];
    await act(async () => {
      await onCallback({ keys: ["0x1"], data: ["0x2"] });
    });

    expect(enrichLog).toHaveBeenCalled();
  });

  it("handles subscription error gracefully", async () => {
    mockGetSharedWebSocketChannel.mockRejectedValue(
      new Error("Connection refused"),
    );

    const { useScaffoldWebSocketEvents } = require("../useScaffoldWebSocketEvents");

    const { result } = renderHook(() =>
      useScaffoldWebSocketEvents({
        contractName: "YourContract" as any,
        eventName: "Transfer" as any,
        enabled: true,
      }),
    );

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
  });
});
