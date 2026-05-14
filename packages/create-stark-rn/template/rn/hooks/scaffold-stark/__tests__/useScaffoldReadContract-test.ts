import * as core from "@starknet-start/react";
import { renderHook } from "@testing-library/react-native";

jest.mock("@/utils/scaffold-stark/contract", () => ({
  contracts: {
    devnet: {
      TestContract: { address: "0xabc", abi: [] as any, classHash: "0x1" },
    },
  },
}));

jest.mock("../useDeployedContractInfo", () => ({
  useDeployedContractInfo: () => ({
    data: { address: "0xabc", abi: [] },
  }),
}));

jest.mock("@starknet-start/react", () => {
  return {
    useReadContract: jest.fn(() => ({ data: "ok", isLoading: false })),
  };
});

describe("useScaffoldReadContract", () => {
  it("passes resolved address/abi and args to useReadContract", () => {
    const { useScaffoldReadContract } = require("../useScaffoldReadContract");

    renderHook(() =>
      useScaffoldReadContract({
        contractName: "TestContract" as any,
        functionName: "balance_of" as any,
        args: ["0x1"],
      }),
    );

    expect((core as any).useReadContract).toHaveBeenCalledWith(
      expect.objectContaining({
        address: "0xabc",
        abi: [],
        functionName: "balance_of",
        args: ["0x1"],
        watch: true,
      }),
    );
  });
});
