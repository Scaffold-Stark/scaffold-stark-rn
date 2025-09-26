import type {
  RequestFnCall,
  RpcMessage,
  RpcTypeToMessageMap,
} from "@starknet-io/types-js";
import type { Chain } from "@starknet-react/chains";
import { devnet, mainnet, sepolia } from "@starknet-react/chains";
import { InjectedConnector, starknetChainId } from "@starknet-react/core";
import UniversalProvider from "@walletconnect/universal-provider";
import { Linking } from "react-native";
import type { AccountInterface } from "starknet";
import { Account, RpcProvider } from "starknet";
// WalletConnect metadata type is loosely specified; align with readme shape
type WCMetadata = {
  name: string;
  description?: string;
  url?: string;
  icons?: string[];
};

// Minimal Ready deep-link icon (placeholder). Replace with proper assets if available.
const readyIcon =
  "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMzIgMzIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNiIgZmlsbD0iI0ZGMzgwMCIvPjxwYXRoIGQ9Ik0xMCAyM2w2LTQgNiA0LTYgNCIgZmlsbD0iI0ZGRiIvPjwvc3ZnPg==";

export type ReadyConnectorOptions = {
  projectId: string;
  metadata?: WCMetadata;
  relayUrl?: string;
  defaultChain?: Chain;
};

export class ReadyConnector extends InjectedConnector {
  private provider?: UniversalProvider;
  chain: Chain;

  constructor(private readonly options: ReadyConnectorOptions) {
    super({
      options: {
        id: "ready-mobile",
        name: "Ready Mobile",
        icon: { dark: readyIcon, light: readyIcon },
      },
    });
    this.chain = options.defaultChain ?? mainnet;
  }

  get id() {
    return super.id;
  }

  get name() {
    return super.name;
  }

  get icon() {
    return { dark: readyIcon, light: readyIcon };
  }

  available(): boolean {
    return true;
  }

  async chainId(): Promise<bigint> {
    return this.chain.id;
  }

  async ready(): Promise<boolean> {
    const account = await this.account();
    return account.address !== "";
  }

  async account(): Promise<AccountInterface> {
    const provider = new RpcProvider({
      nodeUrl: this.chain.rpcUrls.public.http[0],
      chainId: starknetChainId(this.chain.id),
    });

    // With WalletConnect v2, the account address is resolved from the session.
    const address = await this.getActiveAddress();
    if (!address) {
      return new Account({ provider, address: "0x0", signer: "0x0" });
    }
    return new Account({ provider, address, signer: "0x0" });
  }

  async connect() {
    const wc = await this.ensureProvider();

    // Prefer provider.connect (WC v2) with optionalNamespaces; fallback to client.connect
    let uri: string | undefined;
    let approval: () => Promise<any>;
    if (typeof (wc as any).connect === "function") {
      const res = await (wc as any).connect({
        optionalNamespaces: {
          starknet: {
            chains: [this.namespaceChainId()],
            methods: [
              "starknet_account",
              "starknet_requestAddInvokeTransaction",
              "starknet_signTypedData",
            ],
            events: ["accountsChanged", "chainChanged"],
          },
        },
      });
      uri = (res as any)?.uri;
      approval = (res as any).approval;
    } else {
      const res = await (wc as any).client.connect({
        optionalNamespaces: {
          starknet: {
            chains: [this.namespaceChainId()],
            methods: [
              "starknet_account",
              "starknet_requestAddInvokeTransaction",
              "starknet_signTypedData",
            ],
            events: ["accountsChanged", "chainChanged"],
          },
        },
      });
      uri = (res as any)?.uri;
      approval = (res as any).approval;
    }

    if (uri) {
      try {
        const encoded = encodeURIComponent(uri);
        const opened = await this.tryOpenAnyWallet(encoded);
        if (!opened) {
          console.warn(
            "[ReadyConnector] connect(): no wallet scheme available to open.",
          );
        }
      } catch (_) {
        console.warn(
          "[ReadyConnector] connect(): failed to open deep link; please open wallet manually",
        );
      }
    }

    const session = await approval();
    const address = this.extractFirstAccount(session);

    return { account: address ?? "0x0", chainId: this.chain.id } as any;
  }

  async disconnect(): Promise<void> {
    if (!this.provider) return;
    try {
      await this.provider.disconnect();
    } finally {
      this.provider = undefined;
    }
  }

  async request<T extends RpcMessage["type"]>(
    call: RequestFnCall<T>,
  ): Promise<RpcTypeToMessageMap[T]["result"]> {
    // Forward all requests through WalletConnect client
    const wc = await this.ensureProvider();
    const session = wc.session ? Object.values(wc.session)[0] : null;
    const topic = (session as any)?.topic;
    if (!topic) throw new Error("No active WalletConnect session");
    // @ts-ignore - runtime mapping
    return wc.client.request({
      topic,
      chainId: this.namespaceChainId(),
      request: call as any,
    });
  }

  setChain(chain: Chain) {
    this.chain = chain;
  }

  private namespaceChainId() {
    if (this.chain.id === devnet.id) return "starknet:SN_MAIN"; // placeholder; devnet not supported by WC
    if (this.chain.id === sepolia.id) return "starknet:SNSEPOLIA";
    return "starknet:SNMAIN";
  }

  private async ensureProvider() {
    if (this.provider) return this.provider;
    try {
      const provider = await UniversalProvider.init({
        projectId: this.options.projectId,
        metadata: this.options.metadata as any,
        relayUrl: this.options.relayUrl ?? "wss://relay.walletconnect.com",
      });

      try {
        // Listen for display_uri to proactively open Ready
        // @ts-ignore
        provider.on("display_uri", async (uri: string) => {
          try {
            const encoded = encodeURIComponent(uri);
            const opened = await this.tryOpenAnyWallet(encoded);
            if (!opened) {
              console.warn("[ReadyConnector] no wallet scheme could be opened");
            }
          } catch (err) {
            console.error("[ReadyConnector] display_uri open error", err);
          }
        });
      } catch (err) {
        console.warn(
          "[ReadyConnector] failed to attach display_uri listener",
          err,
        );
      }

      this.provider = provider;
      return provider;
    } catch (err) {
      console.error("[ReadyConnector] ensureProvider(): init failed", err);
      throw err;
    }
  }

  private async tryOpenAnyWallet(encodedUri: string): Promise<boolean> {
    const schemes = ["ready", "argent", "argentx", "argentmobile", "wc"];
    for (const scheme of schemes) {
      const deeplink = `${scheme}://wc?uri=${encodedUri}`;
      try {
        const canOpen = await Linking.canOpenURL(deeplink);
        if (canOpen) {
          await Linking.openURL(deeplink);
          return true;
        }
      } catch (e) {
        console.warn(`[ReadyConnector] open failed for ${scheme}`, e);
      }
    }
    return false;
  }

  private async getActiveAddress(): Promise<string | undefined> {
    if (!this.provider) return undefined;
    const sessions = Object.values((this.provider as any).session || {});
    if (sessions.length === 0) return undefined;
    const accounts: string[] | undefined = (sessions[0] as any)?.namespaces
      ?.starknet?.accounts;
    return accounts && accounts.length > 0
      ? accounts[0].split(":")[2]
      : undefined;
  }

  private extractFirstAccount(session: any): string | undefined {
    const accounts: string[] | undefined =
      session?.namespaces?.starknet?.accounts;
    return accounts && accounts.length > 0
      ? accounts[0].split(":")[2]
      : undefined;
  }
}

export default ReadyConnector;
