import { renderHook, waitFor } from "@testing-library/react-native";
import { useScaffoldContract } from "../useScaffoldContract";

const mockContract = {
  address: "0x123",
  abi: [{ type: "function", name: "test" }],
};

jest.mock("../useDeployedContractInfo", () => ({
  useDeployedContractInfo: jest.fn(() => ({
    data: mockContract,
    isLoading: false,
  })),
}));

jest.mock("@starknet-react/core", () => ({
  useProvider: () => ({ provider: { callContract: jest.fn() } }),
  useAccount: () => ({ account: null }),
}));

jest.mock("starknet", () => ({
  Contract: jest.fn().mockImplementation((abi, address, provider) => ({
    abi,
    address,
    provider,
    connect: jest.fn(),
    call: jest.fn(),
  })),
  Abi: {},
}));

describe("useScaffoldContract", () => {
  it("returns contract instance when deployed", async () => {
    const { result } = renderHook(() =>
      // @ts-ignore
      useScaffoldContract({ contractName: "YourContract" }),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBeDefined();
  });

  it("returns undefined when contract not deployed", async () => {
    const { useDeployedContractInfo } = require("../useDeployedContractInfo");
    useDeployedContractInfo.mockReturnValueOnce({
      data: undefined,
      isLoading: false,
    });

    const { result } = renderHook(() =>
      // @ts-ignore
      useScaffoldContract({ contractName: "NonExistent" }),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBeUndefined();
  });

  it("returns isLoading true while loading", () => {
    const { useDeployedContractInfo } = require("../useDeployedContractInfo");
    useDeployedContractInfo.mockReturnValueOnce({
      data: undefined,
      isLoading: true,
    });

    const { result } = renderHook(() =>
      // @ts-ignore
      useScaffoldContract({ contractName: "YourContract" }),
    );

    expect(result.current.isLoading).toBe(true);
  });
});
