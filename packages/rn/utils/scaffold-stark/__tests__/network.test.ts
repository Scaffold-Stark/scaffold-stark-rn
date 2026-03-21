import {
  chains,
  getBlockExplorerAddressLink,
  getBlockExplorerClasshashLink,
  getBlockExplorerLink,
  getBlockExplorerTxLink,
  getTargetNetworks,
  NETWORKS_EXTRA_DATA,
} from "@/utils/scaffold-stark/network";

describe("network utils", () => {
  test("getBlockExplorerTxLink returns empty for unknown network", () => {
    expect(getBlockExplorerTxLink("unknown", "0xabc")).toBe("");
  });

  test("getBlockExplorerTxLink returns url for known network", () => {
    const url = getBlockExplorerTxLink(chains.sepolia.network, "0xabc");
    expect(url).toContain("/tx/0xabc");
  });

  test("getBlockExplorerTxLink returns url for mainnet", () => {
    const url = getBlockExplorerTxLink(chains.mainnet.network, "0xdef");
    expect(url).toContain("/tx/0xdef");
  });

  test("getBlockExplorerTxLink returns url for devnet", () => {
    const url = getBlockExplorerTxLink(chains.devnet.network, "0x123");
    // devnet may not have explorers, should fallback to starkscan
    expect(url).toContain("/tx/0x123");
  });

  test("getBlockExplorerAddressLink returns url for non-devnet", () => {
    const url = getBlockExplorerAddressLink(chains.sepolia, "0xaddr");
    expect(url).toContain("0xaddr");
  });

  test("getBlockExplorerAddressLink returns local path for devnet", () => {
    const url = getBlockExplorerAddressLink(chains.devnet, "0xaddr");
    expect(url).toBe("/blockexplorer/address/0xaddr");
  });

  test("getBlockExplorerAddressLink returns starkscan fallback for mainnet", () => {
    const url = getBlockExplorerAddressLink(chains.mainnet, "0xaddr");
    expect(url).toContain("0xaddr");
    expect(url).toContain("/contract/");
  });

  test("getBlockExplorerClasshashLink returns url for non-devnet", () => {
    const url = getBlockExplorerClasshashLink(chains.sepolia, "0xclass");
    expect(url).toContain("0xclass");
  });

  test("getBlockExplorerClasshashLink returns local path for devnet", () => {
    const url = getBlockExplorerClasshashLink(chains.devnet, "0xclass");
    expect(url).toBe("/blockexplorer/class/0xclass");
  });

  test("getBlockExplorerClasshashLink returns starkscan fallback for mainnet", () => {
    const url = getBlockExplorerClasshashLink(chains.mainnet, "0xclass");
    expect(url).toContain("0xclass");
    expect(url).toContain("/class/");
  });

  test("getBlockExplorerLink returns expected base", () => {
    expect(getBlockExplorerLink(chains.mainnet)).toBe("https://voyager.online/");
    expect(getBlockExplorerLink(chains.sepolia)).toBe(
      "https://sepolia.voyager.online/",
    );
  });

  test("getBlockExplorerLink returns sepolia url for devnet", () => {
    expect(getBlockExplorerLink(chains.devnet)).toBe(
      "https://sepolia.starkscan.co/",
    );
  });

  test("getTargetNetworks returns array of networks", () => {
    const networks = getTargetNetworks();
    expect(Array.isArray(networks)).toBe(true);
    expect(networks.length).toBeGreaterThan(0);
    expect(networks[0]).toHaveProperty("network");
  });

  test("NETWORKS_EXTRA_DATA has entries for known chains", () => {
    expect(NETWORKS_EXTRA_DATA[chains.devnet.network]).toBeDefined();
    expect(NETWORKS_EXTRA_DATA[chains.mainnet.network]).toBeDefined();
    expect(NETWORKS_EXTRA_DATA[chains.sepolia.network]).toBeDefined();
  });

  test("NETWORKS_EXTRA_DATA color values are correct types", () => {
    expect(typeof NETWORKS_EXTRA_DATA[chains.devnet.network].color).toBe("string");
    expect(typeof NETWORKS_EXTRA_DATA[chains.mainnet.network].color).toBe("string");
    expect(Array.isArray(NETWORKS_EXTRA_DATA[chains.sepolia.network].color)).toBe(true);
  });
});
