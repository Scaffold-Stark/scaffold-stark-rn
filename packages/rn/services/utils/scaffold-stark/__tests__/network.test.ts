import {
  chains,
  getBlockExplorerAddressLink,
  getBlockExplorerClasshashLink,
  getBlockExplorerLink,
  getBlockExplorerTxLink,
} from "@/services/utils/scaffold-stark/network";

describe("network utils", () => {
  test("getBlockExplorerTxLink returns empty for unknown network", () => {
    expect(getBlockExplorerTxLink("unknown", "0xabc")).toBe("");
  });

  test("getBlockExplorerTxLink returns url for known network", () => {
    const url = getBlockExplorerTxLink(chains.sepolia.network, "0xabc");
    expect(url).toContain("/tx/0xabc");
  });

  test("getBlockExplorerAddressLink returns url for non-devnet", () => {
    const url = getBlockExplorerAddressLink(chains.sepolia, "0xaddr");
    expect(url).toContain("0xaddr");
  });

  test("getBlockExplorerClasshashLink returns url for non-devnet", () => {
    const url = getBlockExplorerClasshashLink(chains.sepolia, "0xclass");
    expect(url).toContain("0xclass");
  });

  test("getBlockExplorerLink returns expected base", () => {
    expect(getBlockExplorerLink(chains.mainnet)).toBe("https://starkscan.co/");
    expect(getBlockExplorerLink(chains.sepolia)).toBe(
      "https://sepolia.starkscan.co/",
    );
  });
});
