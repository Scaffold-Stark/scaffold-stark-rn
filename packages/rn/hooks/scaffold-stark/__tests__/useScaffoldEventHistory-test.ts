import { renderHook, waitFor } from "@testing-library/react-native";

// --- Mocks ---------------------------------------------------------------

const mockGetBlockLatestAccepted = jest.fn(async () => ({
  block_number: 100,
}));
const mockGetEvents = jest.fn(async () => ({
  events: [
    {
      block_hash: "0xblock1",
      transaction_hash: "0xtx1",
      keys: ["0xkey1"],
      data: ["0xdata1"],
    },
  ],
}));
const mockGetBlockWithTxHashes = jest.fn(async () => ({
  block_number: 100,
}));
const mockGetTransactionByHash = jest.fn(async () => ({
  transaction_hash: "0xtx1",
}));
const mockGetTransactionReceipt = jest.fn(async () => ({
  status: "ACCEPTED_ON_L2",
}));

jest.mock("starknet", () => ({
  RpcProvider: jest.fn(() => ({
    getBlockLatestAccepted: mockGetBlockLatestAccepted,
    getEvents: mockGetEvents,
    getBlockWithTxHashes: mockGetBlockWithTxHashes,
    getTransactionByHash: mockGetTransactionByHash,
    getTransactionReceipt: mockGetTransactionReceipt,
  })),
  CallData: {
    getAbiStruct: jest.fn(() => ({})),
    getAbiEnum: jest.fn(() => ({})),
  },
  createAbiParser: jest.fn(() => ({})),
  hash: {
    getSelectorFromName: jest.fn(() => "0xselector"),
  },
  events: {
    parseEvents: jest.fn(() => [
      {
        "contracts::YourContract::Transfer": {
          from: BigInt("0x1"),
          to: BigInt("0x2"),
          value: BigInt(1000),
        },
      },
    ]),
    getAbiEvents: jest.fn(() => ({})),
  },
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
    {
      name: "to",
      type: "core::starknet::contract_address::ContractAddress",
      kind: "key",
    },
    { name: "value", type: "core::integer::u256", kind: "data" },
  ],
};

const mockContractData = {
  address: "0xcontract",
  abi: [mockEventAbi],
};

const mockUseDeployedContractInfo = jest.fn(() => ({
  data: mockContractData,
  isLoading: false,
}));

jest.mock("../useDeployedContractInfo", () => ({
  useDeployedContractInfo: (...args: any[]) =>
    mockUseDeployedContractInfo(...args),
}));

jest.mock("@starknet-start/react", () => ({
  useProvider: () => ({ provider: {} }),
}));

jest.mock("../useTargetNetwork", () => ({
  useTargetNetwork: () => ({
    targetNetwork: {
      id: 1,
      network: "devnet",
      rpcUrls: { public: { http: ["http://127.0.0.1:5050/rpc"] } },
    },
  }),
}));

jest.mock("@starknet-start/chains", () => ({
  devnet: { id: 99, network: "devnet" },
}));

jest.mock("@/scaffold.config", () => ({
  __esModule: true,
  default: { pollingInterval: 30000 },
}));

jest.mock("@/utils/scaffold-stark/common", () => ({
  replacer: (_key: string, value: any) => value,
}));

jest.mock("@/utils/scaffold-stark/contract", () => ({
  ContractAbi: {},
  ContractName: {},
}));

jest.mock("@/utils/scaffold-stark/events", () => ({
  composeEventFilterKeys: jest.fn(() => []),
  parseEventData: jest.fn((args) => args),
}));

describe("useScaffoldEventHistory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseDeployedContractInfo.mockReturnValue({
      data: mockContractData,
      isLoading: false,
    });
    mockGetBlockLatestAccepted.mockResolvedValue({ block_number: 100 });
    mockGetEvents.mockResolvedValue({
      events: [
        {
          block_hash: "0xblock1",
          transaction_hash: "0xtx1",
          keys: ["0xkey1"],
          data: ["0xdata1"],
        },
      ],
    });
  });

  it("returns data, isLoading, and error properties", async () => {
    const { useScaffoldEventHistory } = require("../useScaffoldEventHistory");

    const { result } = renderHook(() =>
      useScaffoldEventHistory({
        contractName: "YourContract" as any,
        eventName: "Transfer" as any,
        fromBlock: BigInt(0),
      }),
    );

    expect(result.current).toHaveProperty("data");
    expect(result.current).toHaveProperty("isLoading");
    expect(result.current).toHaveProperty("error");
  });

  it("fetches events and calls getEvents", async () => {
    const { useScaffoldEventHistory } = require("../useScaffoldEventHistory");

    const { result } = renderHook(() =>
      useScaffoldEventHistory({
        contractName: "YourContract" as any,
        eventName: "Transfer" as any,
        fromBlock: BigInt(0),
      }),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockGetEvents).toHaveBeenCalled();
    expect(Array.isArray(result.current.data)).toBe(true);
  });

  it("does not fetch when enabled is false", async () => {
    const { useScaffoldEventHistory } = require("../useScaffoldEventHistory");

    const { result } = renderHook(() =>
      useScaffoldEventHistory({
        contractName: "YourContract" as any,
        eventName: "Transfer" as any,
        fromBlock: BigInt(0),
        enabled: false,
      }),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockGetEvents).not.toHaveBeenCalled();
  });

  it("handles errors during event fetching", async () => {
    mockGetBlockLatestAccepted.mockRejectedValue(new Error("RPC error"));

    const { useScaffoldEventHistory } = require("../useScaffoldEventHistory");

    const { result } = renderHook(() =>
      useScaffoldEventHistory({
        contractName: "YourContract" as any,
        eventName: "Transfer" as any,
        fromBlock: BigInt(0),
      }),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeDefined();
  });

  it("fetches block data when blockData flag is set", async () => {
    const { useScaffoldEventHistory } = require("../useScaffoldEventHistory");

    renderHook(() =>
      useScaffoldEventHistory({
        contractName: "YourContract" as any,
        eventName: "Transfer" as any,
        fromBlock: BigInt(0),
        blockData: true,
      }),
    );

    await waitFor(() => {
      expect(mockGetBlockWithTxHashes).toHaveBeenCalled();
    });
  });

  it("fetches transaction data when transactionData flag is set", async () => {
    const { useScaffoldEventHistory } = require("../useScaffoldEventHistory");

    renderHook(() =>
      useScaffoldEventHistory({
        contractName: "YourContract" as any,
        eventName: "Transfer" as any,
        fromBlock: BigInt(0),
        transactionData: true,
      }),
    );

    await waitFor(() => {
      expect(mockGetTransactionByHash).toHaveBeenCalled();
    });
  });

  it("fetches receipt data when receiptData flag is set", async () => {
    const { useScaffoldEventHistory } = require("../useScaffoldEventHistory");

    renderHook(() =>
      useScaffoldEventHistory({
        contractName: "YourContract" as any,
        eventName: "Transfer" as any,
        fromBlock: BigInt(0),
        receiptData: true,
      }),
    );

    await waitFor(() => {
      expect(mockGetTransactionReceipt).toHaveBeenCalled();
    });
  });

  it("does not fetch when contract is still loading", async () => {
    mockUseDeployedContractInfo.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const { useScaffoldEventHistory } = require("../useScaffoldEventHistory");

    const { result } = renderHook(() =>
      useScaffoldEventHistory({
        contractName: "YourContract" as any,
        eventName: "Transfer" as any,
        fromBlock: BigInt(0),
      }),
    );

    // Should still be in loading state
    expect(result.current.isLoading).toBe(true);
    expect(mockGetEvents).not.toHaveBeenCalled();
  });

  it("passes watch flag correctly to the hook", async () => {
    const { useScaffoldEventHistory } = require("../useScaffoldEventHistory");

    const { result } = renderHook(() =>
      useScaffoldEventHistory({
        contractName: "YourContract" as any,
        eventName: "Transfer" as any,
        fromBlock: BigInt(0),
        watch: true,
      }),
    );

    // When watch is true, the hook still performs the initial fetch
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockGetEvents).toHaveBeenCalled();
    expect(Array.isArray(result.current.data)).toBe(true);
  });
});
