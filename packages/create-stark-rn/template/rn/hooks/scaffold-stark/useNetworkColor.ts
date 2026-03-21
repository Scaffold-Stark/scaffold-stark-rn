import { useTargetNetwork } from "./useTargetNetwork";
import { useTheme } from "@/components/scaffold-stark/ThemeProvider";
import {
  ChainWithAttributes,
  NETWORKS_EXTRA_DATA,
} from "@/utils/scaffold-stark/network";

export const DEFAULT_NETWORK_COLOR: [string, string] = ["#666666", "#bbbbbb"];

/**
 * Gets the appropriate color for a network based on the current theme.
 *
 * @param network - The network to get the color for
 * @param isDarkMode - Whether dark mode is active
 * @returns The network color as a CSS color value
 */
export function getNetworkColor(
  network: ChainWithAttributes,
  isDarkMode: boolean,
): string {
  const networkData = NETWORKS_EXTRA_DATA[network.network];
  const colorConfig = networkData?.color ?? DEFAULT_NETWORK_COLOR;

  return Array.isArray(colorConfig)
    ? isDarkMode
      ? colorConfig[1]
      : colorConfig[0]
    : colorConfig;
}

/**
 * Gets the color of the target network based on the current theme.
 * This hook returns the appropriate color for the target network, taking into account
 * whether the current theme is light or dark mode.
 *
 * @returns {string} The network color as a CSS color value (hex, rgb, etc.)
 */
export const useNetworkColor = (): string => {
  const { isDark } = useTheme();
  const { targetNetwork } = useTargetNetwork();

  return getNetworkColor(targetNetwork, isDark);
};
