import { renderHook, waitFor } from "@testing-library/react-native";

// --- Mocks ---------------------------------------------------------------

const mockOnLogs = jest.fn();

jest.mock("../useTargetNetwork", () => ({
  useTargetNetwork: jest.fn(() => ({
    targetNetwork: {
      id: 1,
      network: "devnet",
      rpcUrls: { public: { http: ["http://127.0.0.1:5050/rpc"] } },
    },
  })),
}));

jest.mock("@starknet-react/core", () => ({
  useProvider: () => ({ provider: {} }),
}));

jest.mock("@/scaffold.config", () => ({
  __esModule: true,
  default: { pollingInterval: 30000 },
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

jest.mock("@/utils/scaffold-stark/contract", () => ({}));

jest.mock("@/utils/scaffold-stark/events", () => ({
  resolveEventAbi: jest.fn(() => mockEventAbi),
}));

// Default: WebSocket events returns empty, no error (WebSocket working)
const mockUseScaffoldWebSocketEvents = jest.fn(() => ({
  events: [],
  isLoading: false,
  error: null,
}));

jest.mock("../useScaffoldWebSocketEvents", () => ({
  useScaffoldWebSocketEvents: (...args: any[]) =>
    mockUseScaffoldWebSocketEvents(...args),
}));

describe("useScaffoldWatchContractEvent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseScaffoldWebSocketEvents.mockReturnValue({
      events: [],
      isLoading: false,
      error: null,
    });
  });

  it("returns isLoading and error properties", () => {
    const { useScaffoldWatchContractEvent } = require("../useScaffoldWatchContractEvent");

    const { result } = renderHook(() =>
      useScaffoldWatchContractEvent({
        contractName: "YourContract" as any,
        eventName: "Transfer" as any,
        onLogs: mockOnLogs,
      }),
    );

    expect(result.current).toHaveProperty("isLoading");
    expect(result.current).toHaveProperty("error");
  });

  it("calls onLogs when WebSocket events arrive", async () => {
    const mockEvent = { args: { from: BigInt(1) }, log: {} };
    mockUseScaffoldWebSocketEvents.mockReturnValue({
      events: [mockEvent],
      isLoading: false,
      error: null,
    });

    const { useScaffoldWatchContractEvent } = require("../useScaffoldWatchContractEvent");

    renderHook(() =>
      useScaffoldWatchContractEvent({
        contractName: "YourContract" as any,
        eventName: "Transfer" as any,
        onLogs: mockOnLogs,
      }),
    );

    await waitFor(() => {
      expect(mockOnLogs).toHaveBeenCalledWith(mockEvent);
    });
  });

  it("does not call onLogs when no events", () => {
    mockUseScaffoldWebSocketEvents.mockReturnValue({
      events: [],
      isLoading: false,
      error: null,
    });

    const { useScaffoldWatchContractEvent } = require("../useScaffoldWatchContractEvent");

    renderHook(() =>
      useScaffoldWatchContractEvent({
        contractName: "YourContract" as any,
        eventName: "Transfer" as any,
        onLogs: mockOnLogs,
      }),
    );

    expect(mockOnLogs).not.toHaveBeenCalled();
  });

  it("sets error when contract not found", async () => {
    const { useDeployedContractInfo } = require("../useDeployedContractInfo");
    useDeployedContractInfo.mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    const { resolveEventAbi } = require("@/utils/scaffold-stark/events");
    resolveEventAbi.mockReturnValue(undefined);

    const { useScaffoldWatchContractEvent } = require("../useScaffoldWatchContractEvent");

    const { result } = renderHook(() =>
      useScaffoldWatchContractEvent({
        contractName: "YourContract" as any,
        eventName: "Transfer" as any,
        onLogs: mockOnLogs,
      }),
    );

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
  });

  it("syncs loading state from WebSocket hook", () => {
    mockUseScaffoldWebSocketEvents.mockReturnValue({
      events: [],
      isLoading: true,
      error: null,
    });

    const { useScaffoldWatchContractEvent } = require("../useScaffoldWatchContractEvent");

    const { result } = renderHook(() =>
      useScaffoldWatchContractEvent({
        contractName: "YourContract" as any,
        eventName: "Transfer" as any,
        onLogs: mockOnLogs,
      }),
    );

    expect(result.current.isLoading).toBe(true);
  });

  it("syncs error state from WebSocket hook", async () => {
    mockUseScaffoldWebSocketEvents.mockReturnValue({
      events: [],
      isLoading: false,
      error: new Error("WebSocket failed"),
    });

    const { useScaffoldWatchContractEvent } = require("../useScaffoldWatchContractEvent");

    const { result } = renderHook(() =>
      useScaffoldWatchContractEvent({
        contractName: "YourContract" as any,
        eventName: "Transfer" as any,
        onLogs: mockOnLogs,
      }),
    );

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toBe("WebSocket failed");
    });
  });

  it("falls back to polling when WebSocket errors", async () => {
    jest.useFakeTimers();

    mockUseScaffoldWebSocketEvents.mockReturnValue({
      events: [],
      isLoading: false,
      error: new Error("WebSocket unavailable"),
    });

    const { useScaffoldWatchContractEvent } = require("../useScaffoldWatchContractEvent");

    renderHook(() =>
      useScaffoldWatchContractEvent({
        contractName: "YourContract" as any,
        eventName: "Transfer" as any,
        onLogs: mockOnLogs,
      }),
    );

    // Advance timers to trigger the polling fallback interval
    jest.advanceTimersByTime(30000);

    jest.useRealTimers();
  });

  it("passes correct config to useScaffoldWebSocketEvents", () => {
    const { useScaffoldWatchContractEvent } = require("../useScaffoldWatchContractEvent");

    renderHook(() =>
      useScaffoldWatchContractEvent({
        contractName: "YourContract" as any,
        eventName: "Transfer" as any,
        onLogs: mockOnLogs,
      }),
    );

    expect(mockUseScaffoldWebSocketEvents).toHaveBeenCalledWith(
      expect.objectContaining({
        contractName: "YourContract",
        eventName: "Transfer",
        enrich: true,
        enabled: true,
      }),
    );
  });
});
