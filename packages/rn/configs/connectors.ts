import { supportedChains } from "@/constants/supportedChains";
import scaffoldConfig from "@/scaffold.config";
import { ReadyConnector } from "@/services/ready/ReadyConnector";
import { getTargetNetworks } from "@/utils/scaffold-stark/network";
import { BurnerConnector } from "@scaffold-stark/stark-burner";

const targetNetworks = getTargetNetworks();

export const connectors = getConnectors();

function getConnectors() {
  const { targetNetworks } = scaffoldConfig;

  const connectors: any[] = [];

  const isDevnet = targetNetworks.some(
    (network) => (network.network as string) === "devnet",
  );
  if (isDevnet) {
    const burnerConnector = new BurnerConnector();
    burnerConnector.chain = supportedChains.devnet;
    connectors.push(burnerConnector);
  }

  // Only register ReadyConnector if a WalletConnect project id is set and not on devnet
  const wcProjectId = process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID;
  if (wcProjectId && wcProjectId.length > 0 && !isDevnet) {
    const ready = new ReadyConnector({
      projectId: wcProjectId,
      metadata: {
        name: "Scaffold Stark RN",
        url: "https://walletconnect.com/",
        icons: ["https://avatars.githubusercontent.com/u/37784886"],
        description: "WalletConnect for Ready Mobile",
      },
      defaultChain: targetNetworks[0],
    });
    ready.setChain?.(targetNetworks[0]);
    connectors.push(ready);
  }

  return connectors.sort(() => Math.random() - 0.5);
}

export const appChains = targetNetworks;
