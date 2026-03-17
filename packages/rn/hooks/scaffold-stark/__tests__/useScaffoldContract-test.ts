import { renderHook, waitFor } from "@testing-library/react-native";
import { useScaffoldContract } from "../useScaffoldContract";

const mockContract = {
  address: "0x123",
  abi: [{ type: "function", name: "test" }],
};

const mockConnect = jest.fn();
const mockCall = jest.fn(async () => "result");
const mockAccount = { address: "0xacc" };

jest.mock("../useDeployedContractInfo", () => ({
  useDeployedContractInfo: jest.fn(() => ({
    data: mockContract,
    isLoading: false,
  })),
}));

jest.mock("@starknet-react/core", () => ({
  useProvider: jest.fn(() => ({ provider: { callContract: jest.fn() } })),
  useAccount: jest.fn(() => ({ account: null })),
}));

jest.mock("starknet", () => ({
  Contract: jest.fn().mockImplementation((_abi, _address, _provider) => ({
    abi: _abi,
    address: _address,
    provider: _provider,
    connect: mockConnect,
    call: mockCall,
  })),
  Abi: {},
}));

describe("useScaffoldContract", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  it("connects account to contract when account is available", async () => {
    const { useAccount } = require("@starknet-react/core");
    useAccount.mockReturnValue({ account: mockAccount });

    const { result } = renderHook(() =>
      // @ts-ignore
      useScaffoldContract({ contractName: "YourContract" }),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockConnect).toHaveBeenCalledWith(mockAccount);
  });

  it("does not connect account when account is null", async () => {
    const { useAccount } = require("@starknet-react/core");
    useAccount.mockReturnValue({ account: null });

    const { result } = renderHook(() =>
      // @ts-ignore
      useScaffoldContract({ contractName: "YourContract" }),
    );

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });
    expect(mockConnect).not.toHaveBeenCalled();
  });

  it("wraps call method with fallback parseResponse handling", async () => {
    const originalCall = jest.fn();
    // First call (with parseResponse: false) throws, second succeeds
    originalCall
      .mockRejectedValueOnce(new Error("parse error"))
      .mockResolvedValueOnce("fallback_result");

    const starknet = require("starknet");
    starknet.Contract.mockImplementation(() => ({
      connect: jest.fn(),
      call: originalCall,
    }));

    const { result } = renderHook(() =>
      // @ts-ignore
      useScaffoldContract({ contractName: "YourContract" }),
    );

    await waitFor(() => expect(result.current.data).toBeDefined());

    // The wrapped call method should try with parseResponse: false first,
    // and when that throws, fall back to calling without it
    const contractInstance = result.current.data;
    expect(contractInstance).toBeDefined();
    const callResult = await contractInstance!.call("some_method");
    expect(callResult).toBe("fallback_result");
    expect(originalCall).toHaveBeenCalledTimes(2);
    // First call should include { parseResponse: false }
    expect(originalCall.mock.calls[0]).toEqual(
      expect.arrayContaining([
        "some_method",
        expect.objectContaining({ parseResponse: false }),
      ]),
    );
    // Second (fallback) call should not include parseResponse
    expect(originalCall.mock.calls[1][0]).toBe("some_method");
  });
});
