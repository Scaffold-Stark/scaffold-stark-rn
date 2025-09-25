import { supportedChains } from "@/constants/supportedChains";
import scaffoldConfig from "@/scaffold.config";
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

  return connectors.sort(() => Math.random() - 0.5);
}

export const appChains = targetNetworks;
