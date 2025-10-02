import scaffoldConfig from "@/scaffold.config";
import * as chains from "@starknet-react/chains";
import {
  jsonRpcProvider,
  publicProvider,
  starknetChainId,
} from "@starknet-react/core";

const containsDevnet = (networks: readonly chains.Chain[]) => {
  return (
    networks.filter((it) => it.network == chains.devnet.network).length > 0
  );
};

// Get the current target network (first one in the array)
const currentNetwork = scaffoldConfig.targetNetworks[0];
const currentNetworkName = currentNetwork.network;

export const getRpcUrl = (networkName: string): string => {
  const devnetRpcUrl = process.env.EXPO_PUBLIC_DEVNET_PROVIDER_URL;
  const sepoliaRpcUrl = process.env.EXPO_PUBLIC_SEPOLIA_PROVIDER_URL;
  const mainnetRpcUrl = process.env.EXPO_PUBLIC_MAINNET_PROVIDER_URL;

  let rpcUrl = "";

  switch (networkName) {
    case "devnet":
      rpcUrl = devnetRpcUrl || "http://127.0.0.1:5050";
      break;
    case "sepolia":
      rpcUrl =
        sepoliaRpcUrl ||
        "https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_9/_hKu4IgnPgrF8O82GLuYU";
      break;
    case "mainnet":
      rpcUrl =
        mainnetRpcUrl ||
        "https://starknet-mainnet.g.alchemy.com/starknet/version/rpc/v0_9/_hKu4IgnPgrF8O82GLuYU";
      break;
    default:
      rpcUrl = "http://127.0.0.1:5050";
      break;
  }

  return rpcUrl;
};

// Get RPC URL for the current network
const rpcUrl = getRpcUrl(currentNetworkName);

// Important: if the rpcUrl is empty (not configed in .env), we use the publicProvider
// which randomly choose a provider from the chain list of public providers.
// Some public provider might have strict rate limits.
if (rpcUrl === "") {
  console.warn(
    `No RPC Provider URL configured for ${currentNetworkName}. Using public provider.`,
  );
}

const provider =
  rpcUrl === "" || containsDevnet(scaffoldConfig.targetNetworks)
    ? publicProvider()
    : jsonRpcProvider({
        rpc: () => ({
          nodeUrl: rpcUrl,
          chainId: starknetChainId(currentNetwork.id),
        }),
      });

export default provider;
