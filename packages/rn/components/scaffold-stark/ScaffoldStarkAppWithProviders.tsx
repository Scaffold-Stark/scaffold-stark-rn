import { appChains, connectors } from "@/configs/connectors";
import provider from "@/configs/provider";
import { StarknetConfig, voyager } from "@starknet-react/core";
import { ThemeProvider } from "./ThemeProvider";

export function ScaffoldStarkAppWithProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <StarknetConfig
        chains={appChains}
        provider={provider}
        connectors={connectors}
        explorer={voyager}
      >
        {children}
      </StarknetConfig>
    </ThemeProvider>
  );
}
