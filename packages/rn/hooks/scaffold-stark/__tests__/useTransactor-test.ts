import { act, renderHook } from "@testing-library/react-native";

jest.mock("@/services/utils/scaffold-stark/toast", () => ({
  appToast: {
    showPersistentInfo: jest.fn(),
    showWaiting: jest.fn(),
    showError: jest.fn(),
    showSuccess: jest.fn(),
    hide: jest.fn(),
  },
}));

jest.mock("@/services/utils/scaffold-stark/network", () => ({
  getBlockExplorerTxLink: (_net: string, hash: string) =>
    `https://explorer/tx/${hash}`,
}));

jest.mock("@starknet-react/core", () => ({
  useAccount: () => ({
    account: {
      execute: jest.fn(async () => ({ transaction_hash: "0xhash" })),
      getChainId: jest.fn(async () => 1),
      estimateInvokeFee: jest.fn(async () => ({ overall_fee: "0x10" })),
    },
  }),
  useSendTransaction: () => ({ sendAsync: jest.fn(async () => "0xhash") }),
  useTransactionReceipt: () => ({ data: {}, status: "success" }),
}));

jest.mock("../useTargetNetwork", () => ({
  useTargetNetwork: () => ({ targetNetwork: { id: 1, network: "devnet" } }),
}));

describe("useTransactor", () => {
  it("sends transaction and manages state/toasts", async () => {
    const { useTransactor } = require("../useTransactor");
    const { result } = renderHook(() => useTransactor());
    await act(async () => {
      const hash = await result.current.writeTransaction([
        { to: "0xabc" },
      ] as any);
      expect(hash).toBe("0xhash");
    });
  });
});
