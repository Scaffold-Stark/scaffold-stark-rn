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

const mockContractData = {
  address: "0xcontract",
  abi: [
    {
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
    },
  ],
};

jest.mock("../useDeployedContractInfo", () => ({
  useDeployedContractInfo: jest.fn(() => ({
    data: mockContractData,
    isLoading: false,
  })),
}));

jest.mock("@starknet-react/core", () => ({
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

jest.mock("@starknet-react/chains", () => ({
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
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns initial loading state", () => {
    const { useScaffoldEventHistory } = require("../useScaffoldEventHistory");

    const { result } = renderHook(() =>
      useScaffoldEventHistory({
        contractName: "YourContract" as any,
        eventName: "Transfer" as any,
        fromBlock: BigInt(0),
      }),
    );

    // Should have data array (possibly empty) and loading status
    expect(result.current).toHaveProperty("data");
    expect(result.current).toHaveProperty("isLoading");
    expect(result.current).toHaveProperty("error");
  });

  it("fetches events and returns parsed data", async () => {
    const { useScaffoldEventHistory } = require("../useScaffoldEventHistory");

    const { result } = renderHook(() =>
      useScaffoldEventHistory({
        contractName: "YourContract" as any,
        eventName: "Transfer" as any,
        fromBlock: BigInt(0),
      }),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // The hook should have called getEvents
    expect(mockGetEvents).toHaveBeenCalled();
    expect(result.current.data).toBeDefined();
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

  it("handles contract not deployed", async () => {
    const { useDeployedContractInfo } = require("../useDeployedContractInfo");
    useDeployedContractInfo.mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    const { useScaffoldEventHistory } = require("../useScaffoldEventHistory");

    // When abi is undefined, matchingAbiEvents will be undefined and the hook
    // won't throw because the filter produces undefined
    const { result } = renderHook(() =>
      useScaffoldEventHistory({
        contractName: "YourContract" as any,
        eventName: "Transfer" as any,
        fromBlock: BigInt(0),
      }),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it("includes block data when blockData flag is true", async () => {
    const { useDeployedContractInfo } = require("../useDeployedContractInfo");
    useDeployedContractInfo.mockReturnValue({
      data: mockContractData,
      isLoading: false,
    });

    const { useScaffoldEventHistory } = require("../useScaffoldEventHistory");

    const { result } = renderHook(() =>
      useScaffoldEventHistory({
        contractName: "YourContract" as any,
        eventName: "Transfer" as any,
        fromBlock: BigInt(0),
        blockData: true,
      }),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    // getBlockWithTxHashes should be called when blockData is true
    expect(mockGetBlockWithTxHashes).toHaveBeenCalled();
  });

  it("includes transaction data when transactionData flag is true", async () => {
    const { useDeployedContractInfo } = require("../useDeployedContractInfo");
    useDeployedContractInfo.mockReturnValue({
      data: mockContractData,
      isLoading: false,
    });

    const { useScaffoldEventHistory } = require("../useScaffoldEventHistory");

    const { result } = renderHook(() =>
      useScaffoldEventHistory({
        contractName: "YourContract" as any,
        eventName: "Transfer" as any,
        fromBlock: BigInt(0),
        transactionData: true,
      }),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockGetTransactionByHash).toHaveBeenCalled();
  });

  it("includes receipt data when receiptData flag is true", async () => {
    const { useDeployedContractInfo } = require("../useDeployedContractInfo");
    useDeployedContractInfo.mockReturnValue({
      data: mockContractData,
      isLoading: false,
    });

    const { useScaffoldEventHistory } = require("../useScaffoldEventHistory");

    const { result } = renderHook(() =>
      useScaffoldEventHistory({
        contractName: "YourContract" as any,
        eventName: "Transfer" as any,
        fromBlock: BigInt(0),
        receiptData: true,
      }),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockGetTransactionReceipt).toHaveBeenCalled();
  });

  it("handles errors during event fetching", async () => {
    mockGetBlockLatestAccepted.mockRejectedValueOnce(new Error("RPC error"));

    const { useDeployedContractInfo } = require("../useDeployedContractInfo");
    useDeployedContractInfo.mockReturnValue({
      data: mockContractData,
      isLoading: false,
    });

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

  it("returns empty data when no events match", async () => {
    mockGetEvents.mockResolvedValueOnce({ events: [] });

    const { useDeployedContractInfo } = require("../useDeployedContractInfo");
    useDeployedContractInfo.mockReturnValue({
      data: mockContractData,
      isLoading: false,
    });

    const starknet = require("starknet");
    starknet.events.parseEvents.mockReturnValueOnce([]);

    const { useScaffoldEventHistory } = require("../useScaffoldEventHistory");

    const { result } = renderHook(() =>
      useScaffoldEventHistory({
        contractName: "YourContract" as any,
        eventName: "Transfer" as any,
        fromBlock: BigInt(0),
      }),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBeDefined();
  });
});
