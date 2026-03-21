import { renderHook } from "@testing-library/react-native";

const mockUseReadContract = jest.fn();

jest.mock("../useDeployedContractInfo", () => ({
  useDeployedContractInfo: jest.fn(() => ({
    data: {
      address: "0xstrk",
      abi: [{ type: "function", name: "balance_of" }],
    },
  })),
}));

jest.mock("@starknet-react/core", () => ({
  useReadContract: (...args: any[]) => mockUseReadContract(...args),
}));

jest.mock("starknet", () => ({
  BlockNumber: {},
}));

jest.mock("@/utils/scaffold-stark/ethUnits", () => ({
  formatUnits: (value: bigint, decimals: number) => {
    return (Number(value) / 10 ** decimals).toString();
  },
}));

describe("useScaffoldStrkBalance", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseReadContract.mockReturnValue({
      data: BigInt(1000000000000000000),
      isLoading: false,
      error: null,
    });
  });

  it("returns formatted balance with symbol and decimals", () => {
    const useScaffoldStrkBalance =
      require("../useScaffoldStrkBalance").default;

    const { result } = renderHook(() =>
      useScaffoldStrkBalance({ address: "0x123" }),
    );

    expect(result.current.symbol).toBe("STRK");
    expect(result.current.decimals).toBe(18);
    expect(result.current.formatted).toBe("1");
    expect(result.current.value).toBe(BigInt(1000000000000000000));
  });

  it("passes address as balance_of arg to useReadContract", () => {
    const useScaffoldStrkBalance =
      require("../useScaffoldStrkBalance").default;

    renderHook(() => useScaffoldStrkBalance({ address: "0xuser" }));

    expect(mockUseReadContract).toHaveBeenCalledWith(
      expect.objectContaining({
        functionName: "balance_of",
        args: ["0xuser"],
        address: "0xstrk",
        watch: true,
        enabled: true,
      }),
    );
  });

  it("passes empty args when no address provided", () => {
    const useScaffoldStrkBalance =
      require("../useScaffoldStrkBalance").default;

    renderHook(() => useScaffoldStrkBalance({ address: undefined }));

    expect(mockUseReadContract).toHaveBeenCalledWith(
      expect.objectContaining({
        args: [],
      }),
    );
  });

  it("returns '0' formatted when data is null/undefined", () => {
    mockUseReadContract.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    const useScaffoldStrkBalance =
      require("../useScaffoldStrkBalance").default;

    const { result } = renderHook(() =>
      useScaffoldStrkBalance({ address: "0x123" }),
    );

    expect(result.current.formatted).toBe("0");
  });

  it("spreads remaining props from useReadContract", () => {
    mockUseReadContract.mockReturnValue({
      data: BigInt(0),
      isLoading: true,
      error: new Error("test error"),
      refetch: jest.fn(),
    });

    const useScaffoldStrkBalance =
      require("../useScaffoldStrkBalance").default;

    const { result } = renderHook(() =>
      useScaffoldStrkBalance({ address: "0x123" }),
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeDefined();
    expect(result.current.refetch).toBeInstanceOf(Function);
  });

  it("uses Strk contract from useDeployedContractInfo", () => {
    const { useDeployedContractInfo } = require("../useDeployedContractInfo");
    const useScaffoldStrkBalance =
      require("../useScaffoldStrkBalance").default;

    renderHook(() => useScaffoldStrkBalance({ address: "0x123" }));

    expect(useDeployedContractInfo).toHaveBeenCalledWith("Strk");
  });
});
