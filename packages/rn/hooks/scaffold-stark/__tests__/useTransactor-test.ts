import { act, renderHook } from "@testing-library/react-native";

const mockAppToast = {
  showPersistentInfo: jest.fn(),
  showWaiting: jest.fn(),
  showError: jest.fn(),
  showSuccess: jest.fn(),
  hide: jest.fn(),
};

jest.mock("@/utils/scaffold-stark/toast", () => ({
  appToast: mockAppToast,
}));

jest.mock("@/utils/scaffold-stark/network", () => ({
  getBlockExplorerTxLink: (_net: string, hash: string) =>
    `https://explorer/tx/${hash}`,
}));

const mockExecute = jest.fn(async () => ({ transaction_hash: "0xhash" }));
const mockEstimateInvokeFee = jest.fn(async () => ({ overall_fee: "0x10" }));
const mockGetChainId = jest.fn(async () => 1);
const mockSendAsync = jest.fn(async () => "0xhash");

jest.mock("@starknet-react/core", () => ({
  useAccount: jest.fn(() => ({
    account: {
      execute: mockExecute,
      getChainId: mockGetChainId,
      estimateInvokeFee: mockEstimateInvokeFee,
    },
  })),
  useSendTransaction: jest.fn(() => ({ sendAsync: mockSendAsync })),
  useTransactionReceipt: jest.fn(() => ({ data: {}, status: "pending" })),
}));

jest.mock("../useTargetNetwork", () => ({
  useTargetNetwork: () => ({ targetNetwork: { id: 1, network: "devnet" } }),
}));

describe("useTransactor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExecute.mockResolvedValue({ transaction_hash: "0xhash" });
    mockEstimateInvokeFee.mockResolvedValue({ overall_fee: "0x10" });
    mockSendAsync.mockResolvedValue("0xhash");
  });

  it("sends transaction via sendAsync (withSendTransaction=true)", async () => {
    const { useTransactor } = require("../useTransactor");
    const { result } = renderHook(() => useTransactor());

    await act(async () => {
      const hash = await result.current.writeTransaction(
        [{ to: "0xabc" }] as any,
        true,
      );
      expect(hash).toBe("0xhash");
    });

    expect(mockSendAsync).toHaveBeenCalled();
    expect(mockAppToast.showPersistentInfo).toHaveBeenCalledWith(
      "Awaiting user confirmation",
      undefined,
      expect.any(Object),
    );
  });

  it("sends transaction via account.execute (withSendTransaction=false)", async () => {
    const { useTransactor } = require("../useTransactor");
    const { result } = renderHook(() => useTransactor());

    await act(async () => {
      const hash = await result.current.writeTransaction(
        [{ to: "0xabc" }] as any,
        false,
      );
      expect(hash).toBe("0xhash");
    });

    expect(mockExecute).toHaveBeenCalled();
    expect(mockEstimateInvokeFee).toHaveBeenCalled();
  });

  it("falls back to default fee values when estimation fails", async () => {
    mockEstimateInvokeFee.mockRejectedValue(new Error("estimation failed"));

    const { useTransactor } = require("../useTransactor");
    const { result } = renderHook(() => useTransactor());

    await act(async () => {
      const hash = await result.current.writeTransaction(
        [{ to: "0xabc" }] as any,
        false,
      );
      expect(hash).toBe("0xhash");
    });

    // execute should be called once with fallback params after estimation failed
    expect(mockExecute).toHaveBeenCalledTimes(1);
    // Verify fallback params include resourceBounds for RPC 0.8 compatibility
    const callArgs = mockExecute.mock.calls[0];
    expect(callArgs[1]).toEqual(
      expect.objectContaining({
        maxFee: "0x1000000000",
        resourceBounds: expect.objectContaining({
          l1_gas: expect.objectContaining({ max_amount: 0x1000000n }),
          l2_gas: expect.objectContaining({ max_amount: 0x1000000n }),
        }),
      }),
    );
  });

  it("shows error toast when no wallet is connected", async () => {
    const { useAccount } = require("@starknet-react/core");
    useAccount.mockReturnValueOnce({ account: undefined });

    const { useTransactor } = require("../useTransactor");
    const { result } = renderHook(() => useTransactor());

    await act(async () => {
      const hash = await result.current.writeTransaction([
        { to: "0xabc" },
      ] as any);
      expect(hash).toBeUndefined();
    });

    expect(mockAppToast.showError).toHaveBeenCalledWith("Cannot access account");
  });

  it("throws error when tx is null", async () => {
    const { useTransactor } = require("../useTransactor");
    const { result } = renderHook(() => useTransactor());

    await act(async () => {
      await expect(
        result.current.writeTransaction(null as any),
      ).rejects.toThrow("Incorrect transaction passed to transactor");
    });

    expect(mockAppToast.showError).toHaveBeenCalled();
  });

  it("shows error toast and re-throws on transaction failure", async () => {
    mockSendAsync.mockRejectedValue(
      new Error('Contract execution error: "insufficient funds"}'),
    );

    const { useTransactor } = require("../useTransactor");
    const { result } = renderHook(() => useTransactor());

    await act(async () => {
      await expect(
        result.current.writeTransaction([{ to: "0xabc" }] as any, true),
      ).rejects.toThrow();
    });

    expect(mockAppToast.showError).toHaveBeenCalled();
  });

  it("handles sendAsync returning object with transaction_hash", async () => {
    mockSendAsync.mockResolvedValue({ transaction_hash: "0xobj_hash" });

    const { useTransactor } = require("../useTransactor");
    const { result } = renderHook(() => useTransactor());

    await act(async () => {
      const hash = await result.current.writeTransaction(
        [{ to: "0xabc" }] as any,
        true,
      );
      expect(hash).toBe("0xobj_hash");
    });
  });

  it("exposes transactionReceiptInstance and sendTransactionInstance", () => {
    const { useTransactor } = require("../useTransactor");
    const { result } = renderHook(() => useTransactor());

    expect(result.current.transactionReceiptInstance).toBeDefined();
    expect(result.current.sendTransactionInstance).toBeDefined();
  });

  it("shows waiting toast with block explorer URL after sending", async () => {
    const { useTransactor } = require("../useTransactor");
    const { result } = renderHook(() => useTransactor());

    await act(async () => {
      await result.current.writeTransaction([{ to: "0xabc" }] as any, true);
    });

    expect(mockAppToast.showWaiting).toHaveBeenCalledWith(
      "Waiting for transaction to complete",
      expect.stringContaining("https://explorer/tx/"),
    );
  });

  it("accepts an external walletClient", async () => {
    const externalAccount = {
      execute: jest.fn(async () => ({ transaction_hash: "0xext" })),
      getChainId: jest.fn(async () => 1),
      estimateInvokeFee: jest.fn(async () => ({ overall_fee: "0x1" })),
    };

    const { useTransactor } = require("../useTransactor");
    const { result } = renderHook(() => useTransactor(externalAccount as any));

    await act(async () => {
      const hash = await result.current.writeTransaction(
        [{ to: "0xabc" }] as any,
        false,
      );
      expect(hash).toBe("0xext");
    });

    expect(externalAccount.execute).toHaveBeenCalled();
  });
});
