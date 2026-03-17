import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTargetNetwork } from "./useTargetNetwork";
import { useDeployedContractInfo } from "./useDeployedContractInfo";
import { Abi } from "abi-wan-kanabi/kanabi";
import { ExtractAbiEventNames } from "abi-wan-kanabi/kanabi";
import { RpcProvider, WebSocketChannel } from "starknet";
import type { SubscribeEventsParams } from "starknet";
import {
  ContractAbi,
  ContractName,
  UseScaffoldWebSocketEventsConfig,
} from "@/utils/scaffold-stark/contract";
import { getSharedWebSocketChannel } from "@/services/web3/websocket";
import {
  enrichLog,
  resolveEventAbi,
  parseLogsArgs,
  buildEventKeys,
  parseEventData,
} from "@/utils/scaffold-stark/events";

/**
 * Subscribes to contract events via WebSocket for real-time updates.
 * This hook connects to the Starknet node via WebSocket and listens for
 * specific contract events, providing parsed event data.
 *
 * @param config - Configuration object for the hook
 * @param config.contractName - The deployed contract name to watch for events
 * @param config.eventName - The name of the event to watch (must exist in contract ABI)
 * @param config.fromBlock - Optional block number to start listening from
 * @param config.filters - Optional filters for event keys
 * @param config.enrich - Whether to enrich events with block/tx data (default: true)
 * @param config.enabled - Whether the subscription is enabled (default: true)
 * @param config.onEvent - Optional callback when an event is received
 * @returns {Object} An object containing:
 *   - isConnected: boolean - Whether the WebSocket is connected
 *   - isLoading: boolean - Whether the connection/data is loading
 *   - error: Error | null - Any error that occurred
 *   - events: any[] - Array of parsed events (newest first)
 */
export const useScaffoldWebSocketEvents = <
  TContractName extends ContractName,
  TEventName extends ExtractAbiEventNames<ContractAbi<TContractName>>,
>({
  contractName,
  eventName,
  fromBlock,
  filters,
  enrich = true,
  enabled = true,
  onEvent,
}: UseScaffoldWebSocketEventsConfig<TContractName, TEventName>) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const subscriptionRef = useRef<any>(null);
  const { targetNetwork } = useTargetNetwork();
  const { data: deployedContractData, isLoading: deployedContractLoading } =
    useDeployedContractInfo(contractName);

  const httpClient = useMemo(() => {
    return new RpcProvider({ nodeUrl: targetNetwork.rpcUrls.public.http[0] });
  }, [targetNetwork.rpcUrls.public.http]);

  const eventAbi = useMemo(() => {
    return resolveEventAbi<TContractName, TEventName>(
      deployedContractData?.abi as Abi,
      eventName as string,
    );
  }, [deployedContractData, deployedContractLoading, eventName]);

  const start = useCallback(async () => {
    if (!enabled || deployedContractLoading) {
      return;
    }
    if (!deployedContractData || !eventAbi) {
      return;
    }

    setIsLoading(true);
    try {
      const channel: WebSocketChannel | null =
        await getSharedWebSocketChannel(targetNetwork);
      if (!channel) {
        throw new Error("WebSocket channel unavailable");
      }

      console.log(
        "[useScaffoldWebSocketEvents] WebSocket channel connected successfully",
      );

      const keys = buildEventKeys(
        eventName as string,
        filters as any,
        eventAbi as any,
        deployedContractData.abi as any,
        16,
      );

      const params: SubscribeEventsParams = {
        fromAddress: deployedContractData.address,
        keys,
        blockIdentifier:
          typeof fromBlock !== "undefined" ? Number(fromBlock) : undefined,
      };
      const sub = await channel.subscribeEvents(params);
      subscriptionRef.current = sub;
      setIsConnected(true);

      sub.on(async (evt: any) => {
        console.log(
          "[useScaffoldWebSocketEvents] New event received via WebSocket:",
          evt,
        );
        const base = { event: eventAbi, log: evt } as any;
        if (!enrich) {
          setEvents((prev) => [base, ...prev]);
          onEvent?.(base);
          return;
        }
        // Optionally enrich via HTTP for details
        const { block, transaction, receipt } = await enrichLog(
          httpClient,
          evt,
          {
            block: true,
            transaction: true,
            receipt: true,
          },
        );
        const enriched = { ...base, block, transaction, receipt };
        setEvents((prev) => [enriched, ...prev]);
        onEvent?.(enriched);
      });
    } catch (e: any) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setIsLoading(false);
    }
  }, [
    enabled,
    deployedContractData?.address,
    eventAbi,
    filters,
    fromBlock,
    targetNetwork,
    enrich,
    httpClient,
    onEvent,
    deployedContractLoading,
    deployedContractData,
    eventName,
  ]);

  useEffect(() => {
    start();
    return () => {
      const s = subscriptionRef.current;
      if (s) {
        try {
          s.unsubscribe();
        } catch {
          // Ignore cleanup errors
        }
        subscriptionRef.current = null;
      }
      setIsConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    contractName,
    eventName,
    enabled,
    deployedContractData,
    eventAbi,
    deployedContractLoading,
  ]);

  const parsedEvents = useMemo(() => {
    if (!deployedContractData || !eventAbi) return [];
    return events.map((e) => {
      const args = parseLogsArgs(
        deployedContractData.abi as Abi,
        (eventAbi as any).name,
        [e.log],
      );
      const { event: rawEvent, ...rest } = e;
      return {
        type: (rawEvent as any).members,
        args,
        parsedArgs: parseEventData(args, (rawEvent as any).members),
        ...rest,
      };
    });
  }, [events, deployedContractData, eventAbi]);

  return {
    isConnected,
    isLoading: isLoading || deployedContractLoading,
    error,
    events: parsedEvents,
  };
};
