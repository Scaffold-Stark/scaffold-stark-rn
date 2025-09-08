import { BurnerConnector } from "@scaffold-stark/stark-burner";
import { devnet } from "@starknet-react/chains";
import { StarknetConfig, publicProvider, voyager } from "@starknet-react/core";

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  return (
    <StarknetConfig
      chains={[devnet]}
      provider={publicProvider()}
      connectors={[new BurnerConnector()]}
      explorer={voyager}
    >
      {children}
    </StarknetConfig>
  );
}
