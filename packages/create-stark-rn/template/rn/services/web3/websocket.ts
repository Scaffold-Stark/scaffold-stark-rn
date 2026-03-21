import { Chain } from "@starknet-react/chains";
import { WebSocketChannel } from "starknet";
import scaffoldConfig from "@/scaffold.config";

// Cache one channel per ws url
const urlToChannel: Record<string, WebSocketChannel> = {};

/**
 * Converts an HTTP URL to a WebSocket URL.
 */
const httpToWs = (httpUrl: string): string => {
  if (!httpUrl) return "";
  // Replace protocol with secure websocket
  const wsBase = httpUrl.replace(/^http/i, "ws");
  // If it already ends with "/ws", keep it
  if (wsBase.endsWith("/ws")) return wsBase;
  // For local devnet (127.0.0.1:5050), replace /rpc with /ws or append /ws
  if (wsBase.includes("127.0.0.1:5050") || wsBase.includes("localhost:5050")) {
    if (wsBase.includes("/rpc")) {
      return wsBase.replace("/rpc", "/ws");
    }
    return wsBase.endsWith("/") ? `${wsBase}ws` : `${wsBase}/ws`;
  }
  // For other providers, keep the same path as HTTP (no /ws suffix needed)
  return wsBase;
};

/**
 * Gets the WebSocket URL for a given chain.
 * In React Native, we don't have process.env for runtime config,
 * so we derive the WS URL from the HTTP RPC URL.
 */
export const getWsUrlForChain = (chain: Chain): string => {
  const network = chain.network;

  // Derive from configured HTTP rpcUrls
  switch (network) {
    case "devnet":
      return httpToWs(
        chain.rpcUrls.public.http[0] || "http://127.0.0.1:5050/rpc",
      );
    case "sepolia":
      return httpToWs(
        chain.rpcUrls.public.http[0] ||
          "https://starknet-sepolia.public.blastapi.io/rpc/v0_9",
      );
    case "mainnet":
      return httpToWs(
        chain.rpcUrls.public.http[0] ||
          "https://starknet-mainnet.public.blastapi.io/rpc/v0_9",
      );
    default:
      return httpToWs(chain.rpcUrls.public.http[0] || "");
  }
};

/**
 * Gets or creates a shared WebSocket channel for the given chain.
 * Returns null if the connection fails.
 */
export const getSharedWebSocketChannel = async (
  chain?: Chain,
): Promise<WebSocketChannel | null> => {
  const target = chain || scaffoldConfig.targetNetworks[0];
  const wsUrl = getWsUrlForChain(target);

  if (!wsUrl) {
    console.warn("[WebSocket] No WebSocket URL available for chain:", target.network);
    return null;
  }

  if (!urlToChannel[wsUrl]) {
    try {
      console.log("[WebSocket] Creating new channel for:", wsUrl);
      urlToChannel[wsUrl] = new WebSocketChannel({ nodeUrl: wsUrl });
      await urlToChannel[wsUrl].waitForConnection();
      console.log("[WebSocket] Connected successfully to:", wsUrl);
    } catch (e) {
      console.warn("[WebSocket] Connection failed:", e);
      // On failure, drop channel and return null to allow fallbacks
      delete urlToChannel[wsUrl];
      return null;
    }
  }

  return urlToChannel[wsUrl];
};

/**
 * Closes all active WebSocket channels.
 */
export const closeAllWebSocketChannels = async (): Promise<void> => {
  const entries = Object.entries(urlToChannel);
  await Promise.all(
    entries.map(async ([key, ch]) => {
      try {
        const anyCh = ch as any;
        if (typeof anyCh.disconnect === "function") {
          await anyCh.disconnect();
        }
      } catch {
        // Ignore errors during cleanup
      }
      delete urlToChannel[key];
    }),
  );
};

/**
 * Checks if WebSocket is available for the current network.
 */
export const isWebSocketAvailable = async (chain?: Chain): Promise<boolean> => {
  try {
    const channel = await getSharedWebSocketChannel(chain);
    return channel !== null;
  } catch {
    return false;
  }
};
