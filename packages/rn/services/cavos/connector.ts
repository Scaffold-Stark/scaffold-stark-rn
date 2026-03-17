import aegisConfig from "@/configs/aegisConfig";
import { AegisSDK } from "@cavos/aegis";
import { Permission } from "@starknet-io/types-js";
import { Chain, sepolia, mainnet, devnet } from "@starknet-start/chains";
import { starknetChainId } from "@starknet-start/react";
import type { WalletWithStarknetFeatures } from "@starknet-io/get-starknet-wallet-standard/features";
import * as SecureStore from "expo-secure-store";
import { Account, CallData, RpcProvider } from "starknet";

export const cavosWalletId = "cavos-wallet";
export const cavosWalletName = "Cavos Wallet";

const cavosWalletIcon =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTIiIGZpbGw9IiM2MzY2RjEiLz48L3N2Zz4=" as const;

function chainToWalletStandardChain(chain: Chain): `${string}:${string}` {
  if (chain.id === mainnet.id) return "starknet:mainnet";
  if (chain.id === sepolia.id) return "starknet:sepolia";
  return "starknet:devnet";
}

/**
 * Cavos wallet connector implementing the Wallet Standard interface.
 * Routes transaction execution through the Aegis SDK while conforming
 * to the WalletWithStarknetFeatures interface expected by @starknet-start/react.
 */
export class CavosWallet implements WalletWithStarknetFeatures {
  readonly version = "1.0.0" as const;
  readonly name = cavosWalletName;
  readonly icon = cavosWalletIcon;
  readonly instanceId = Math.random().toString(36).slice(2);

  private _chain: Chain;
  private _aegisAccount: AegisSDK | null = null;
  private _connected = false;
  private _listeners: Record<string, Function[]> = {};

  constructor(chain: Chain = sepolia) {
    this._chain = chain;
  }

  get chains(): readonly `${string}:${string}`[] {
    return [chainToWalletStandardChain(this._chain)];
  }

  get accounts() {
    if (!this._connected || !this._aegisAccount?.address) return [];
    return [
      {
        address: this._aegisAccount.address,
        publicKey: new Uint8Array(),
        chains: [chainToWalletStandardChain(this._chain)] as `${string}:${string}`[],
        features: [] as never[],
      },
    ];
  }

  get features(): WalletWithStarknetFeatures["features"] {
    return {
      "standard:connect": {
        version: "1.0.0" as const,
        connect: this._connect.bind(this),
      },
      "standard:disconnect": {
        version: "1.0.0" as const,
        disconnect: this._disconnect.bind(this),
      },
      "standard:events": {
        version: "1.0.0" as const,
        on: this._on.bind(this),
      },
      "starknet:walletApi": {
        id: cavosWalletId,
        version: "1.0.0" as const,
        request: this._request.bind(this),
        walletVersion: "1.0.0",
      },
    };
  }

  private async _getSdk(): Promise<AegisSDK> {
    if (this._aegisAccount) return this._aegisAccount;
    this._aegisAccount = new AegisSDK(aegisConfig);
    return this._aegisAccount;
  }

  private async _deployWithTimeout(sdk: AegisSDK, ms = 90000): Promise<string> {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Cavos deploy timeout")), ms),
    );
    const deploy = (async () => {
      const privateKey = await sdk.deployAccount();
      try {
        await sdk.connectAccount(privateKey);
      } catch (_e) {}
      return privateKey;
    })();
    return await Promise.race([deploy, timeout]);
  }

  private _connect = async ({ silent = false } = {}) => {
    if (!this._aegisAccount?.address) {
      try {
        const sdk = await this._getSdk();
        const savedKey = await SecureStore.getItemAsync("cavos_wallet_key");
        if (savedKey) {
          await sdk.connectAccount(savedKey);
          this._aegisAccount = sdk;
        } else {
          const privateKey = await this._deployWithTimeout(sdk, 90000);
          await SecureStore.setItemAsync("cavos_wallet_key", privateKey);
          this._aegisAccount = sdk;
        }
      } catch (e) {
        console.error("[CavosWallet] connect() error:", e);
        throw e;
      }
    }

    if (!this._aegisAccount?.address) {
      throw new Error("Failed to connect Cavos wallet");
    }

    this._connected = true;
    this._emit("change", { accounts: this.accounts });
    return { accounts: this.accounts };
  };

  private _disconnect = async () => {
    try {
      if (this._aegisAccount) {
        this._aegisAccount.disconnect();
      }
    } finally {
      this._aegisAccount = null;
      this._connected = false;
    }
    this._emit("change", { accounts: [] });
  };

  private _on = (event: string, listener: Function) => {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(listener);
    return () => this._off(event, listener);
  };

  private _off(event: string, listener: Function) {
    const listeners = this._listeners[event];
    if (!listeners) return;
    this._listeners[event] = listeners.filter((l) => l !== listener);
  }

  private _emit(event: string, ...args: any[]) {
    const listeners = this._listeners[event];
    if (!listeners) return;
    for (const listener of listeners) listener.apply(null, args);
  }

  private _request = async (call: { type: string; params?: any }): Promise<any> => {
    const { type, params } = call;

    switch (type) {
      case "wallet_requestChainId":
        return `0x${this._chain.id.toString(16)}`;

      case "wallet_getPermissions":
        return this._connected ? [Permission.ACCOUNTS] : [];

      case "wallet_requestAccounts":
        return this._aegisAccount?.address ? [this._aegisAccount.address] : [];

      case "wallet_addStarknetChain":
        return true;

      case "wallet_watchAsset":
        return true;

      case "wallet_switchStarknetChain": {
        if (!params) throw new Error("Params are missing");
        return true;
      }

      case "wallet_addInvokeTransaction": {
        if (!params) throw new Error("Params are missing");
        if (!this._aegisAccount) throw new Error("Aegis account not connected");

        const { calls } = params;
        const compiledCalls = calls.map((element: any) => ({
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
          return { transaction_hash: result.transactionHash };
        } catch (e) {
          console.error("[CavosWallet] transaction failed:", e);
          throw e;
        }
      }

      case "wallet_signTypedData": {
        throw new Error("CavosWallet does not support signTypedData");
      }

      default:
        throw new Error(`Unknown request type: ${type}`);
    }
  };
}
