import { useAccount } from "@starknet-react/core";
import { useGlobalState } from "@/stores/store";
import scaffoldConfig from "@/scaffold.config";
import { ChainWithAttributes } from "@/utils/scaffold-stark/network";

/**
 * Gets the chain ID string for a given network name.
 */
const getChainId = (network: string): string => {
  return `SN_${network === "mainnet" ? "MAIN" : network.toUpperCase()}`;
};

/**
 * Provides a function to switch the connected network.
 * This hook returns a function that can be used to request the connected wallet
 * to switch to a different Starknet network.
 *
 * Note: Network switching support depends on the wallet implementation.
 * Some wallets may not support programmatic network switching.
 *
 * @returns {Object} An object containing:
 *   - switchNetwork: (network: string) => Promise<void> - Async function that takes a network name and attempts to switch
 *   - switchToNetwork: (network: ChainWithAttributes) => void - Function to switch to a specific network from config
 *   - availableNetworks: readonly Chain[] - List of available networks from scaffold config
 */
export const useSwitchNetwork = () => {
  const { connector } = useAccount();
  const setTargetNetwork = useGlobalState(
    ({ setTargetNetwork }) => setTargetNetwork,
  );

  const switchNetwork = async (network: string): Promise<void> => {
    try {
      // Attempt to use wallet's switch chain method if available
      if (connector && "request" in connector) {
        await (connector as any).request({
          type: "wallet_switchStarknetChain",
          params: {
            chainId: getChainId(network),
          },
        });
      }

      // Update local state to match the requested network
      const targetNetwork = scaffoldConfig.targetNetworks.find(
        (n) => n.network === network,
      );
      if (targetNetwork) {
        setTargetNetwork(targetNetwork);
      }
    } catch (error) {
      console.error("[useSwitchNetwork] Error switching network:", error);
      throw error;
    }
  };

  const switchToNetwork = (network: ChainWithAttributes): void => {
    setTargetNetwork(network);
    // Attempt wallet switch in background
    switchNetwork(network.network).catch(() => {
      // Silent fail - local state is already updated
    });
  };

  return {
    switchNetwork,
    switchToNetwork,
    availableNetworks: scaffoldConfig.targetNetworks,
  };
};
