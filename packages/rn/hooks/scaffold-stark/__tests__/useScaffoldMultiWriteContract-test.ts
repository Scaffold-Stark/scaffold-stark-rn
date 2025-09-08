import { act, renderHook } from "@testing-library/react-native";
import {
  createContractCall,
  useScaffoldMultiWriteContract,
} from "../useScaffoldMultiWriteContract";

jest.mock("@/services/utils/scaffold-stark/contract", () => ({
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

jest.mock("../useTransactor", () => ({
  useTransactor: jest.fn().mockReturnValue({
    writeTransaction: jest.fn().mockResolvedValue("mock-tx-hash"),
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
    (useTransactor as jest.Mock).mockReturnValue({
      writeTransaction: jest.fn().mockResolvedValue("mock-tx-hash"),
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

    const transactor = useTransactor();
    expect(transactor.writeTransaction).not.toHaveBeenCalled();
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
});
