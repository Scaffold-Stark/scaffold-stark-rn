import aegisConfig from "@/configs/aegisConfig";
import { AegisSDK } from "@cavos/aegis";
import {
  RequestFnCall,
  RpcMessage,
  RpcTypeToMessageMap,
} from "@starknet-io/types-js";
import { Chain, sepolia } from "@starknet-react/chains";
import { InjectedConnector, starknetChainId } from "@starknet-react/core";
import * as SecureStore from "expo-secure-store";
import { Account, AccountInterface, CallData, RpcProvider } from "starknet";

type ConnectorData = {
  account: string;
  chainId: bigint;
};

type ConnectorIcons = {
  light: string;
  dark: string;
};

export const cavosWalletId = "cavos-wallet";
export const cavosWalletName = "Cavos Wallet";

const cavosWalletIcon = "https://docs.cavos.xyz/cavos-icon.png";

export class CavosConnector extends InjectedConnector {
  chain: Chain;
  private _aegisAccount: AegisSDK | null = null;

  constructor(chain: Chain = sepolia) {
    super({
      options: {
        id: cavosWalletId,
        name: cavosWalletName,
        icon: { dark: cavosWalletIcon, light: cavosWalletIcon },
      },
    });
    this.chain = chain;
  }

  setAegisAccount(aegisAccount: AegisSDK) {
    this._aegisAccount = aegisAccount;
  }

  private async getSdk(): Promise<AegisSDK> {
    if (this._aegisAccount) return this._aegisAccount;
    this._aegisAccount = new AegisSDK(aegisConfig);
    return this._aegisAccount;
  }

  private async deployWithTimeout(sdk: AegisSDK, ms = 90000): Promise<string> {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Cavos deploy timeout")), ms),
    );
    const deploy = (async () => {
      const privateKey = await sdk.deployAccount();
      try {
        await sdk.connectAccount(privateKey);
      } catch (e) {}
      return privateKey;
    })();
    return await Promise.race([deploy, timeout]);
  }

  get id(): string {
    return cavosWalletId;
  }

  get name(): string {
    return cavosWalletName;
  }

  get icon(): ConnectorIcons {
    return {
      dark: cavosWalletIcon,
      light: cavosWalletIcon,
    };
  }

  async account(): Promise<AccountInterface> {
    if (!this._aegisAccount || !this._aegisAccount.address) {
      throw new Error("Aegis account not connected");
    }

    // Create a proxy Account that wraps the Aegis SDK
    return new Account({
      provider: new RpcProvider({
        nodeUrl: this.chain.rpcUrls.public.http[0],
        chainId: starknetChainId(this.chain.id),
      }),
      address: this._aegisAccount.address,
      // Use a dummy signer - Aegis handles signing internally
      signer: {
        getPubKey: async () => "0x0",
        signTransaction: async () => ["0x0", "0x0"],
      } as any,
    });
  }

  available(): boolean {
    return true;
  }

  async ready(): Promise<boolean> {
    return this._aegisAccount !== null && !!this._aegisAccount.address;
  }

  chainId(): Promise<bigint> {
    return Promise.resolve(this.chain.id);
  }

  async request<T extends RpcMessage["type"]>(
    call: RequestFnCall<T>,
  ): Promise<RpcTypeToMessageMap[T]["result"]> {
    if (!this._aegisAccount) {
      throw new Error("Aegis account not connected");
    }

    if (call.params && "calls" in call.params) {
      const compiledCalls = call.params.calls.map((element: any) => ({
        contractAddress: element.contract_address || element.contractAddress,
        entrypoint: element.entry_point || element.entrypoint,
        calldata: Array.isArray(element.calldata)
          ? element.calldata
          : CallData.compile(element.calldata),
      }));

      try {
        let result: any;
        if (compiledCalls.length === 1) {
          const c = compiledCalls[0];
          result = await this._aegisAccount.execute(
            c.contractAddress,
            c.entrypoint,
            c.calldata,
          );
        } else {
          result = await this._aegisAccount.executeBatch(compiledCalls);
        }
        // Adapt Aegis result to expected RPC shape
        return { transaction_hash: result.transactionHash } as any;
      } catch (e) {
        console.error("Cavos transaction failed:", e);
        throw e;
      }
    }

    return await super.request(call);
  }

  async connect(): Promise<ConnectorData> {
    if (!this._aegisAccount || !this._aegisAccount.address) {
      try {
        const sdk = await this.getSdk();
        const savedKey = await SecureStore.getItemAsync("cavos_wallet_key");
        if (savedKey) {
          await sdk.connectAccount(savedKey);
          this._aegisAccount = sdk;
        } else {
          const privateKey = await this.deployWithTimeout(sdk, 90000);
          await SecureStore.setItemAsync("cavos_wallet_key", privateKey);
          this._aegisAccount = sdk;
        }
      } catch (e) {
        console.error("[CavosConnector] connect() error:", e);
        throw e;
      }
    }

    if (!this._aegisAccount?.address) {
      console.error(
        "[CavosConnector] connect() failed: aegisAccount has no address",
      );
      throw new Error("Failed to connect Cavos wallet");
    }

    return {
      account: this._aegisAccount.address,
      chainId: this.chain.id,
    };
  }

  disconnect(): Promise<void> {
    try {
      if (this._aegisAccount) {
        this._aegisAccount.disconnect();
      }
    } finally {
      this._aegisAccount = null;
    }
    return Promise.resolve();
  }
}
