import * as contractUtils from "@/services/utils/scaffold-stark/contract";
import { renderHook, waitFor } from "@testing-library/react-native";
import { useDeployedContractInfo } from "../useDeployedContractInfo";

jest.mock("@/services/utils/scaffold-stark/contract", () => {
  return {
    ContractCodeStatus: { LOADING: 0, DEPLOYED: 1, NOT_FOUND: 2 },
    contracts: {
      someNetwork: {
        YourContract: {
          address:
            "0x6e0d97cfd6ad07cea15de51b1761b70cc648948fd183ce03cac9e3a1f8c7f26",
          abi: [
            {
              type: "impl",
              name: "YourContractImpl",
              interface_name: "contracts::your_contract::IYourContract",
            },
          ] as any,
          classHash:
            "0x15981f4687739d007cf4d6ec112dc72f2e46026c1d1e031ec698fb282d43399",
        },
      },
    },
    ContractClassHashCache: class MockCache {
      static instance: any;
      static getInstance() {
        if (!this.instance) this.instance = new MockCache();
        return this.instance;
      }
      getClassHash = jest.fn(async (_provider: any, _addr: string) => {
        return "0xfeed";
      });
      clear() {}
    },
  } as any;
});

jest.mock("@starknet-react/core", () => ({
  useProvider: () => ({ provider: { getClassHashAt: jest.fn() } }),
}));

jest.mock("../useTargetNetwork", () => ({
  useTargetNetwork: jest.fn(() => ({
    targetNetwork: { id: 1, network: "someNetwork" },
  })),
}));

describe("useDeployedContractInfo", () => {
  it("resolves deployed contract when class hash exists", async () => {
    (contractUtils as any).ContractClassHashCache.getInstance().clear();
    (
      contractUtils as any
    ).ContractClassHashCache.getInstance().getClassHash.mockResolvedValueOnce(
      "0xfeed",
    );

    const { result } = renderHook(() =>
      // @ts-ignore
      useDeployedContractInfo("YourContract"),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.status).toBe(1);
    expect(result.current.data?.address).toBe(
      "0x6e0d97cfd6ad07cea15de51b1761b70cc648948fd183ce03cac9e3a1f8c7f26",
    );
    expect(result.current.raw?.classHash).toBe(
      "0x15981f4687739d007cf4d6ec112dc72f2e46026c1d1e031ec698fb282d43399",
    );
  });

  it("marks NOT_FOUND when class hash is undefined", async () => {
    (contractUtils as any).ContractClassHashCache.getInstance().clear();
    (
      contractUtils as any
    ).ContractClassHashCache.getInstance().getClassHash.mockResolvedValue(
      undefined,
    );
    const { result } = renderHook(() =>
      // @ts-ignore
      useDeployedContractInfo("YourContract"),
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.status).toBe(2);
    expect(result.current.data).toBeUndefined();
  });

  it("marks NOT_FOUND when contract is missing", async () => {
    const { result } = renderHook(() =>
      // @ts-ignore
      useDeployedContractInfo("DoesNotExist"),
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.status).toBe(2);
    expect(result.current.data).toBeUndefined();
  });
});
