import { appChains, connectors } from "@/configs/connectors";
import provider from "@/configs/provider";
import { StarknetConfig, voyager } from "@starknet-react/core";
import { ThemeProvider } from "./ThemeProvider";
import { AegisProvider } from "@cavos/aegis";
import aegisConfig from "@/configs/aegisConfig";

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
        <AegisProvider config={aegisConfig}>{children}</AegisProvider>
      </StarknetConfig>
    </ThemeProvider>
  );
}
