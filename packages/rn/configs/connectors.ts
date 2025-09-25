import { supportedChains } from "@/constants/supportedChains";
import scaffoldConfig from "@/scaffold.config";
import { getTargetNetworks } from "@/utils/scaffold-stark/network";
import ControllerConnector from "@cartridge/connector/controller";
import { BurnerConnector } from "@scaffold-stark/stark-burner";

// Provide no-op event listeners in RN where they may be missing
if (typeof window !== "undefined" && !(window as any).addEventListener) {
  (window as any).addEventListener = () => {};
  (window as any).removeEventListener = () => {};
}

const targetNetworks = getTargetNetworks();

export const connectors = getConnectors();

const cartridgeConnector = new ControllerConnector();

function getConnectors() {
  const { targetNetworks } = scaffoldConfig;

  const connectors: any[] = [cartridgeConnector];

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
