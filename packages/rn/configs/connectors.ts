import scaffoldConfig from "@/scaffold.config";
import { CavosWallet } from "@/services/cavos/connector";
import { getTargetNetworks } from "@/utils/scaffold-stark/network";
import { createBurnerWallet } from "@scaffold-stark/stark-burner";
import type { WalletWithStarknetFeatures } from "@starknet-io/get-starknet-wallet-standard/features";

const targetNetworks = getTargetNetworks();

export const connectors = getConnectors();

function getConnectors(): WalletWithStarknetFeatures[] {
  const { targetNetworks } = scaffoldConfig;

  const cavosWallet = new CavosWallet(targetNetworks[0]);

  const wallets: WalletWithStarknetFeatures[] = [cavosWallet];

  const isDevnet = targetNetworks.some(
    (network) => (network.network as string) === "devnet",
  );
  if (isDevnet) {
    wallets.push(createBurnerWallet(targetNetworks[0]));
  }

  return wallets;
}

export const appChains = targetNetworks;
