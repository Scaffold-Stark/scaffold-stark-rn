import { act, renderHook } from "@testing-library/react-native";
import {
  createContractCall,
  useScaffoldMultiWriteContract,
} from "../useScaffoldMultiWriteContract";

jest.mock("@/utils/scaffold-stark/contract", () => ({
  contracts: {
    testNetwork: {
      Strk: {
        address: "0x12345",
        abi: [{ type: "function", name: "transfer", inputs: [], outputs: [] }],
      },
    },
  },
  ContractName: {},
}));

jest.mock("../useTargetNetwork", () => ({
  useTargetNetwork: jest.fn(),
}));

jest.mock("@starknet-react/core", () => ({
  useSendTransaction: jest.fn(),
  useNetwork: jest.fn(() => ({ chain: { id: 1 } })),
}));

jest.mock("starknet", () => ({
  Contract: jest.fn().mockImplementation(() => ({
    populate: jest.fn().mockReturnValue({
      contractAddress: "0x123",
      entrypoint: "transfer",
      calldata: ["0x1234", "1000"],
    }),
  })),
  RpcProvider: jest.fn(),
}));

const mockWriteTransaction = jest.fn().mockResolvedValue("mock-tx-hash");

jest.mock("../useTransactor", () => ({
  useTransactor: jest.fn().mockReturnValue({
    writeTransaction: mockWriteTransaction,
    sendTransactionInstance: { sendAsync: jest.fn(), status: "idle" },
    transactionReceiptInstance: { data: null, status: "idle" },
  }),
}));

describe("useScaffoldMultiWriteContract Hook", () => {
  const mockSendTransaction = jest.fn();
  const { useNetwork, useSendTransaction } = jest.requireMock(
    "@starknet-react/core",
  );
  const { useTargetNetwork } = jest.requireMock("../useTargetNetwork");
  const { useTransactor } = jest.requireMock("../useTransactor");

  beforeEach(() => {
    jest.clearAllMocks();

    useTargetNetwork.mockReturnValue({
      targetNetwork: { network: "testNetwork", id: 1 },
    });
    useNetwork.mockReturnValue({ chain: { id: 1 } });
    useSendTransaction.mockReturnValue({
      sendAsync: mockSendTransaction,
      status: "idle",
    });
    mockWriteTransaction.mockResolvedValue("mock-tx-hash");
    (useTransactor as jest.Mock).mockReturnValue({
      writeTransaction: mockWriteTransaction,
      sendTransactionInstance: { sendAsync: jest.fn(), status: "idle" },
      transactionReceiptInstance: { data: null, status: "idle" },
    });
  });

  it("should correctly parse contract calls", () => {
    const { result } = renderHook(() =>
      useScaffoldMultiWriteContract({
        calls: [
          { contractName: "Strk", functionName: "transfer", args: ["arg1", 1] },
        ],
      }),
    );

    expect(result.current.sendAsync).toBeInstanceOf(Function);
    expect(mockSendTransaction).not.toHaveBeenCalled();
  });

  it("should return early when wallet is not connected", async () => {
    useNetwork.mockReturnValueOnce({ chain: null });

    const { result } = renderHook(() =>
      useScaffoldMultiWriteContract({
        calls: [
          { contractName: "Strk", functionName: "transfer", args: ["arg1", 1] },
        ],
      }),
    );

    await act(async () => {
      await result.current.sendAsync();
    });

    expect(mockWriteTransaction).not.toHaveBeenCalled();
  });

  it("should return early when on wrong network", async () => {
    useTargetNetwork.mockReturnValue({
      targetNetwork: { network: "testNetwork", id: 2 },
    });

    const { result } = renderHook(() =>
      useScaffoldMultiWriteContract({
        calls: [
          { contractName: "Strk", functionName: "transfer", args: ["arg1", 1] },
        ],
      }),
    );

    await act(async () => {
      await result.current.sendAsync();
    });

    expect(mockWriteTransaction).not.toHaveBeenCalled();
  });

  it("should send batch transaction with parsed calls", async () => {
    const { result } = renderHook(() =>
      useScaffoldMultiWriteContract({
        calls: [
          { contractName: "Strk", functionName: "transfer", args: ["arg1", 1] },
        ],
      }),
    );

    await act(async () => {
      await result.current.sendAsync();
    });

    expect(mockWriteTransaction).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          contractAddress: "0x123",
          entrypoint: "transfer",
        }),
      ]),
    );
  });

  it("should handle raw Call objects", async () => {
    const rawCall = {
      contractAddress: "0xraw",
      entrypoint: "raw_fn",
      calldata: ["1", "2"],
    };

    const { result } = renderHook(() =>
      useScaffoldMultiWriteContract({
        calls: [rawCall as any],
      }),
    );

    await act(async () => {
      await result.current.sendAsync();
    });

    expect(mockWriteTransaction).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          contractAddress: "0xraw",
          entrypoint: "raw_fn",
        }),
      ]),
    );
  });

  it("should handle empty calls array", async () => {
    const { result } = renderHook(() =>
      useScaffoldMultiWriteContract({
        calls: [],
      }),
    );

    await act(async () => {
      await result.current.sendAsync();
    });

    expect(mockWriteTransaction).toHaveBeenCalledWith([]);
  });

  it("should handle undefined calls", async () => {
    const { result } = renderHook(() =>
      useScaffoldMultiWriteContract({
        calls: undefined as any,
      }),
    );

    await act(async () => {
      await result.current.sendAsync();
    });

    expect(mockWriteTransaction).toHaveBeenCalledWith([]);
  });

  it("should re-throw transaction errors", async () => {
    mockWriteTransaction.mockRejectedValue(new Error("tx failed"));

    const { result } = renderHook(() =>
      useScaffoldMultiWriteContract({
        calls: [
          { contractName: "Strk", functionName: "transfer", args: ["arg1", 1] },
        ],
      }),
    );

    await act(async () => {
      await expect(result.current.sendAsync()).rejects.toThrow("tx failed");
    });
  });

  it("spreads sendTransactionInstance properties", () => {
    (useTransactor as jest.Mock).mockReturnValue({
      writeTransaction: mockWriteTransaction,
      sendTransactionInstance: {
        sendAsync: jest.fn(),
        status: "loading",
        data: "0xdata",
      },
      transactionReceiptInstance: { data: null, status: "idle" },
    });

    const { result } = renderHook(() =>
      useScaffoldMultiWriteContract({
        calls: [],
      }),
    );

    expect(result.current.status).toBe("loading");
    expect(result.current.data).toBe("0xdata");
  });
});

describe("createContractCall Function", () => {
  it("should create a contract call object", () => {
    const contractCall = createContractCall(
      "Strk" as any,
      "transfer" as unknown as never,
      ["arg1", 1] as unknown as never,
    );
    expect(contractCall).toEqual({
      contractName: "Strk",
      functionName: "transfer",
      args: ["arg1", 1],
    });
  });

  it("should handle empty args", () => {
    const contractCall = createContractCall(
      "Strk" as any,
      "get_balance" as unknown as never,
      [] as unknown as never,
    );
    expect(contractCall.args).toEqual([]);
  });
});
