import scaffoldConfig from "@/scaffold.config";
import { useEffect, useState } from "react";
import { Provider, RpcProvider } from "starknet";

export const useProvider = () => {
  const [provider, setProvider] = useState<Provider | null>(null);

  useEffect(() => {
    setProvider(
      new RpcProvider({
        nodeUrl: scaffoldConfig.targetNetworks[0].rpcUrls.public.http[0],
      }),
    );
  }, []);

  return { provider };
};
