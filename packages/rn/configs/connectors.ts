import { supportedChains } from "@/constants/supportedChains";
import scaffoldConfig from "@/scaffold.config";
import { CavosConnector } from "@/services/cavos/connector";
import { getTargetNetworks } from "@/utils/scaffold-stark/network";
import { BurnerConnector } from "@scaffold-stark/stark-burner";
import { InjectedConnector } from "@starknet-react/core";

const targetNetworks = getTargetNetworks();

export const connectors = getConnectors();

function getConnectors() {
  const { targetNetworks } = scaffoldConfig;

  const cavosConnector = new CavosConnector(targetNetworks[0]);

  const connectors: InjectedConnector[] = [cavosConnector];

  const isDevnet = targetNetworks.some(
    (network) => (network.network as string) === "devnet",
  );
  if (isDevnet) {
    const burnerConnector = new BurnerConnector();
    burnerConnector.chain = supportedChains.devnet;
    connectors.push(burnerConnector);
  }

  return connectors;
}

export const appChains = targetNetworks;
