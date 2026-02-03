import { renderHook, waitFor } from "@testing-library/react-native";
import { fetchProfileFromApi } from "../useScaffoldStarkProfile";

// Mock fetch
global.fetch = jest.fn();

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

  it("returns empty profile on error", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      text: () => Promise.resolve("No data found"),
    });

    const result = await fetchProfileFromApi("0x123");

    expect(result).toEqual({ name: "", profilePicture: "" });
  });
});
