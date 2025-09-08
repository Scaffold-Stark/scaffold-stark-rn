import { act, renderHook } from "@testing-library/react-native";
import { useScaffoldWriteContract } from "../useScaffoldWriteContract";

jest.mock("starknet", () => ({
  Contract: jest.fn().mockImplementation(() => ({
    populate: jest.fn().mockReturnValue({
      contractAddress: "0x123",
      entrypoint: "transfer",
      calldata: ["0x1234", "1000"],
    }),
  })),
}));

jest.mock("@starknet-react/core", () => ({
  useSendTransaction: jest.fn(),
  useNetwork: jest.fn(() => ({ chain: { id: 1 } })),
}));

jest.mock("../useDeployedContractInfo", () => ({
  useDeployedContractInfo: jest.fn(),
}));

jest.mock("../useTransactor", () => {
  const writeTransaction = jest.fn();
  return {
    useTransactor: () => ({
      writeTransaction,
      sendTransactionInstance: { sendAsync: jest.fn(), status: "idle" },
      transactionReceiptInstance: { data: null, status: "idle" },
    }),
    __mocks: { writeTransaction },
  };
});

jest.mock("../useTargetNetwork", () => ({
  useTargetNetwork: jest.fn(),
}));

describe("useScaffoldWriteContract", () => {
  const contractName = "Strk";
  const functionName = "transfer";
  const args: readonly [string, number] = ["0x1234", 1000];

  const { useDeployedContractInfo } = jest.requireMock(
    "../useDeployedContractInfo",
  );
  const { useSendTransaction } = jest.requireMock("@starknet-react/core");
  const { useTransactor, __mocks: transactorMocks } =
    jest.requireMock("../useTransactor");
  const { useTargetNetwork } = jest.requireMock("../useTargetNetwork");

  beforeEach(() => {
    jest.clearAllMocks();

    useSendTransaction.mockReturnValue({
      sendAsync: jest.fn(),
      status: "idle",
    });

    transactorMocks.writeTransaction.mockResolvedValue("mock-tx-hash");

    useTargetNetwork.mockReturnValue({
      targetNetwork: { id: 1, network: "testnet" },
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("should handle case where contract is not deployed", async () => {
    useDeployedContractInfo.mockReturnValue({ data: undefined });

    const { result } = renderHook(() =>
      useScaffoldWriteContract({
        contractName: contractName as any,
        functionName: functionName as any,
        args,
      } as any),
    );

    await act(async () => {
      await result.current.sendAsync();
    });

    expect(transactorMocks.writeTransaction).not.toHaveBeenCalled();
  });

  it("should handle case where user is on the wrong network", async () => {
    useDeployedContractInfo.mockReturnValue({
      data: { address: "0x123", abi: [{ name: "testFunction" }] },
    });

    useTargetNetwork.mockReturnValue({
      targetNetwork: { id: 2, network: "mainnet" },
    });

    const { result } = renderHook(() =>
      useScaffoldWriteContract({
        contractName: contractName as any,
        functionName: functionName as any,
        args,
      } as any),
    );

    await act(async () => {
      await result.current.sendAsync();
    });

    expect(transactorMocks.writeTransaction).not.toHaveBeenCalled();
  });

  it("should send transaction when contract is deployed and user is on correct network", async () => {
    useDeployedContractInfo.mockReturnValue({
      data: { address: "0x123", abi: [{ name: "testFunction" }] },
    });

    const { result } = renderHook(() =>
      useScaffoldWriteContract({
        contractName: contractName as any,
        functionName: functionName as any,
        args,
      } as any),
    );

    await act(async () => {
      await result.current.sendAsync();
    });

    expect(transactorMocks.writeTransaction).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          contractAddress: "0x123",
          entrypoint: functionName,
        }),
      ]),
    );
  });

  it("should call useDeployedContractInfo with the correct contract name", () => {
    renderHook(() =>
      useScaffoldWriteContract({
        contractName: contractName as any,
        functionName: functionName as any,
        args,
      } as any),
    );

    expect(useDeployedContractInfo).toHaveBeenCalledWith(contractName);
  });
});
