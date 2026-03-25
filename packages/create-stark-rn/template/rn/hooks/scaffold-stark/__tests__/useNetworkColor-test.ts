import { renderHook } from "@testing-library/react-native";
import { useNetworkColor, getNetworkColor } from "../useNetworkColor";

jest.mock("../useTargetNetwork", () => ({
  useTargetNetwork: jest.fn(() => ({
    targetNetwork: { id: 1, network: "sepolia" },
  })),
}));

jest.mock("@/components/scaffold-stark/ThemeProvider", () => ({
  useTheme: jest.fn(() => ({ isDark: false })),
}));

jest.mock("@/utils/scaffold-stark/network", () => ({
  NETWORKS_EXTRA_DATA: {
    devnet: { color: "#b8af0c" },
    mainnet: { color: "#ff8b9e" },
    sepolia: { color: ["#5f4bb6", "#87ff65"] },
  },
}));

describe("getNetworkColor", () => {
  it("returns single color when color is a string", () => {
    const network = { network: "devnet" } as any;
    expect(getNetworkColor(network, false)).toBe("#b8af0c");
    expect(getNetworkColor(network, true)).toBe("#b8af0c");
  });

  it("returns light color when not dark mode", () => {
    const network = { network: "sepolia" } as any;
    expect(getNetworkColor(network, false)).toBe("#5f4bb6");
  });

  it("returns dark color when dark mode", () => {
    const network = { network: "sepolia" } as any;
    expect(getNetworkColor(network, true)).toBe("#87ff65");
  });

  it("returns default color for unknown network", () => {
    const network = { network: "unknown" } as any;
    expect(getNetworkColor(network, false)).toBe("#666666");
    expect(getNetworkColor(network, true)).toBe("#bbbbbb");
  });
});

describe("useNetworkColor", () => {
  it("returns network color for current theme", () => {
    const { result } = renderHook(() => useNetworkColor());
    expect(result.current).toBe("#5f4bb6");
  });

  it("returns dark color when in dark mode", () => {
    const { useTheme } = require("@/components/scaffold-stark/ThemeProvider");
    useTheme.mockReturnValueOnce({ isDark: true });

    const { result } = renderHook(() => useNetworkColor());
    expect(result.current).toBe("#87ff65");
  });
});
