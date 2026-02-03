import { renderHook, act } from "@testing-library/react-native";

const mockSetTargetNetwork = jest.fn();
const mockRequest = jest.fn();

// Mock starknet-react/core
jest.mock("@starknet-react/core", () => ({
  useAccount: jest.fn(() => ({
    connector: {
      request: mockRequest,
    },
  })),
}));

// Mock global state store
jest.mock("@/stores/store", () => ({
  useGlobalState: jest.fn((selector) =>
    selector({
      setTargetNetwork: mockSetTargetNetwork,
    }),
  ),
}));

// Mock scaffold config
jest.mock("@/scaffold.config", () => ({
  __esModule: true,
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
    jest.resetModules();
  });

  it("returns switchNetwork function", () => {
    const { useSwitchNetwork } = require("../useSwitchNetwork");
    const { result } = renderHook(() => useSwitchNetwork());
    expect(typeof result.current.switchNetwork).toBe("function");
  });

  it("returns switchToNetwork function", () => {
    const { useSwitchNetwork } = require("../useSwitchNetwork");
    const { result } = renderHook(() => useSwitchNetwork());
    expect(typeof result.current.switchToNetwork).toBe("function");
  });

  it("returns available networks from config", () => {
    const { useSwitchNetwork } = require("../useSwitchNetwork");
    const { result } = renderHook(() => useSwitchNetwork());
    expect(result.current.availableNetworks).toBeDefined();
    expect(Array.isArray(result.current.availableNetworks)).toBe(true);
    expect(result.current.availableNetworks.length).toBe(3);
  });

  it("switchNetwork updates global state for matching network", async () => {
    const { useSwitchNetwork } = require("../useSwitchNetwork");
    const { result } = renderHook(() => useSwitchNetwork());

    await act(async () => {
      await result.current.switchNetwork("sepolia");
    });

    expect(mockSetTargetNetwork).toHaveBeenCalledWith(
      expect.objectContaining({ network: "sepolia" }),
    );
  });

  it("switchToNetwork updates state immediately", () => {
    const { useSwitchNetwork } = require("../useSwitchNetwork");
    const { result } = renderHook(() => useSwitchNetwork());

    act(() => {
      result.current.switchToNetwork({ id: 2, network: "sepolia" } as any);
    });

    expect(mockSetTargetNetwork).toHaveBeenCalledWith(
      expect.objectContaining({ network: "sepolia" }),
    );
  });

  it("does not throw when switching to unknown network", async () => {
    const { useSwitchNetwork } = require("../useSwitchNetwork");
    const { result } = renderHook(() => useSwitchNetwork());

    await expect(
      act(async () => {
        await result.current.switchNetwork("unknown");
      }),
    ).resolves.not.toThrow();
  });

  it("calls wallet request when connector available", async () => {
    const { useSwitchNetwork } = require("../useSwitchNetwork");
    const { result } = renderHook(() => useSwitchNetwork());

    await act(async () => {
      await result.current.switchNetwork("mainnet");
    });

    expect(mockRequest).toHaveBeenCalledWith({
      type: "wallet_switchStarknetChain",
      params: {
        chainId: "SN_MAIN",
      },
    });
  });
});
