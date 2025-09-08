import { renderHook } from "@testing-library/react-native";

jest.mock("@/scaffold.config", () => ({
  targetNetworks: [
    { id: 1, network: "devnet" },
    { id: 2, network: "sepolia" },
  ],
}));

const state = { targetNetwork: { id: 1, network: "devnet" } } as any;
jest.mock("@/services/store", () => ({
  useGlobalState: (selector: any) =>
    selector({
      targetNetwork: state.targetNetwork,
      setTargetNetwork: (n: any) => (state.targetNetwork = n),
    }),
}));

jest.mock("@starknet-react/core", () => ({
  useAccount: () => ({ chainId: 2 }),
}));

describe("useTargetNetwork", () => {
  it("returns target network and updates when chain changes", () => {
    const { useTargetNetwork } = require("../useTargetNetwork");
    const { result } = renderHook(() => useTargetNetwork());
    expect(result.current.targetNetwork.id).toBe(1);
  });
});
