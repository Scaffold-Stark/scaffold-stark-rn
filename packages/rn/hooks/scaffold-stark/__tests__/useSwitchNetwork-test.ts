import { renderHook, act } from "@testing-library/react-native";
import { useSwitchNetwork } from "../useSwitchNetwork";

const mockSetTargetNetwork = jest.fn();

jest.mock("@starknet-react/core", () => ({
  useAccount: jest.fn(() => ({
    connector: {
      request: jest.fn(),
    },
  })),
}));

jest.mock("@/stores/store", () => ({
  useGlobalState: jest.fn((selector) =>
    selector({
      setTargetNetwork: mockSetTargetNetwork,
    }),
  ),
}));

jest.mock("@/scaffold.config", () => ({
  default: {
    targetNetworks: [
      { id: 1, network: "devnet" },
      { id: 2, network: "sepolia" },
      { id: 3, network: "mainnet" },
    ],
  },
}));

describe("useSwitchNetwork", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns switchNetwork function", () => {
    const { result } = renderHook(() => useSwitchNetwork());
    expect(typeof result.current.switchNetwork).toBe("function");
  });

  it("returns switchToNetwork function", () => {
    const { result } = renderHook(() => useSwitchNetwork());
    expect(typeof result.current.switchToNetwork).toBe("function");
  });

  it("returns available networks from config", () => {
    const { result } = renderHook(() => useSwitchNetwork());
    expect(result.current.availableNetworks).toHaveLength(3);
  });

  it("updates global state when switching network", async () => {
    const { result } = renderHook(() => useSwitchNetwork());

    await act(async () => {
      await result.current.switchNetwork("sepolia");
    });

    expect(mockSetTargetNetwork).toHaveBeenCalledWith(
      expect.objectContaining({ network: "sepolia" }),
    );
  });

  it("switchToNetwork updates state immediately", () => {
    const { result } = renderHook(() => useSwitchNetwork());

    act(() => {
      result.current.switchToNetwork({ id: 2, network: "sepolia" } as any);
    });

    expect(mockSetTargetNetwork).toHaveBeenCalledWith(
      expect.objectContaining({ network: "sepolia" }),
    );
  });
});
