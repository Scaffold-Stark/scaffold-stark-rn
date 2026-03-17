import { renderHook, waitFor } from "@testing-library/react-native";
import {
  fetchProfileFromApi,
  useScaffoldStarkProfile,
} from "../useScaffoldStarkProfile";

// Mock fetch
global.fetch = jest.fn();

// Mock scaffold config - default to sepolia (supported network)
jest.mock("@/scaffold.config", () => ({
  __esModule: true,
  default: {
    targetNetworks: [{ network: "sepolia" }],
  },
}));

jest.mock("@starknet-react/chains", () => ({
  devnet: { network: "devnet" },
  mainnet: { network: "mainnet" },
}));

describe("fetchProfileFromApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns profile data on successful fetch", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ domain: "test.stark" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ id: "123", domain: { domain: "test.stark" } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ image: "https://example.com/pic.png" }),
      });

    const result = await fetchProfileFromApi("0x123");

    expect(result).toEqual({
      name: "test.stark",
      profilePicture: "https://example.com/pic.png",
    });
  });

  it("returns empty profile when addr_to_domain fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      text: () => Promise.resolve("No data found"),
    });

    const result = await fetchProfileFromApi("0x123");

    expect(result).toEqual({ name: "", profilePicture: "" });
  });

  it("returns empty profile on network error", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network error"),
    );

    const result = await fetchProfileFromApi("0x123");

    expect(result).toEqual({ name: "", profilePicture: "" });
  });

  it("returns empty profile when domain_to_data fails", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ domain: "test.stark" }),
      })
      .mockResolvedValueOnce({
        ok: false,
        text: () => Promise.resolve("Domain not found"),
      });

    const result = await fetchProfileFromApi("0x123");

    expect(result).toEqual({ name: "", profilePicture: "" });
  });

  it("calls correct API endpoints", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ domain: "test.stark" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ id: "123", domain: { domain: "test.stark" } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ image: "pic.jpg" }),
      });

    await fetchProfileFromApi("0x123");

    expect(global.fetch).toHaveBeenCalledTimes(3);
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toContain(
      "addr_to_domain",
    );
    expect((global.fetch as jest.Mock).mock.calls[1][0]).toContain(
      "domain_to_data",
    );
    expect((global.fetch as jest.Mock).mock.calls[2][0]).toContain("uri");
  });

  it("uses sepolia API URL for sepolia network", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      text: () => Promise.resolve("No data found"),
    });

    await fetchProfileFromApi("0x123");

    expect((global.fetch as jest.Mock).mock.calls[0][0]).toContain(
      "sepolia.api.starknet.id",
    );
  });
});

describe("useScaffoldStarkProfile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns loading false and profile data after fetch", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ domain: "user.stark" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ id: "456", domain: { domain: "user.stark" } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ image: "https://img.com/user.png" }),
      });

    const { result } = renderHook(() =>
      useScaffoldStarkProfile("0xuser" as any),
    );

    // Should start loading
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual({
      name: "user.stark",
      profilePicture: "https://img.com/user.png",
    });
  });

  it("returns empty profile when address is undefined", async () => {
    const { result } = renderHook(() =>
      useScaffoldStarkProfile(undefined),
    );

    // Should immediately set empty profile (not loading)
    await waitFor(() => {
      expect(result.current.data).toEqual({
        name: "",
        profilePicture: "",
      });
    });
  });

  it("returns empty profile when API returns error", async () => {
    // fetchProfileFromApi catches errors internally and returns empty profile
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Unexpected error"),
    );

    const { result } = renderHook(() =>
      useScaffoldStarkProfile("0xuser" as any),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual({
      name: "",
      profilePicture: "",
    });
  });

  it("sets empty profile when address is not provided", async () => {
    const { result } = renderHook(() =>
      useScaffoldStarkProfile(undefined),
    );

    // When address is undefined, the hook skips fetch and sets empty profile
    await waitFor(() => {
      expect(result.current.data).toEqual({
        name: "",
        profilePicture: "",
      });
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
