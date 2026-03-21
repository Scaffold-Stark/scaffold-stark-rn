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
});
