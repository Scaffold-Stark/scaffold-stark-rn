import { useEffect, useMemo, useState } from "react";
import { useProvider } from "@starknet-react/core";
import { ExtractAbiEventNames } from "abi-wan-kanabi/kanabi";
import { Abi } from "abi-wan-kanabi/kanabi";
import { useTargetNetwork } from "./useTargetNetwork";
import { useScaffoldWebSocketEvents } from "./useScaffoldWebSocketEvents";
import { useDeployedContractInfo } from "./useDeployedContractInfo";
import {
  ContractAbi,
  ContractName,
  UseScaffoldWatchContractEventConfig,
} from "@/utils/scaffold-stark/contract";
import { resolveEventAbi } from "@/utils/scaffold-stark/events";
import scaffoldConfig from "@/scaffold.config";

/**
 * Watches for specific contract events and triggers a callback when events are detected.
 * This hook uses WebSocket for real-time event monitoring when available, with a polling
 * fallback when WebSocket is not available.
 *
 * @param config - Configuration object for the hook
 * @param config.contractName - The deployed contract name to watch for events
 * @param config.eventName - The name of the event to watch (must exist in contract ABI)
 * @param config.onLogs - Callback function to execute when events are detected
 * @returns {Object} An object containing:
 *   - isLoading: boolean - Boolean indicating if the hook is currently loading
 *   - error: Error | null - Any error encountered during event watching
 * @see {@link https://scaffoldstark.com/docs/hooks/useScaffoldWatchContractEvent}
 */
export const useScaffoldWatchContractEvent = <
  TContractName extends ContractName,
  TEventName extends ExtractAbiEventNames<ContractAbi<TContractName>>,
>({
  contractName,
  eventName,
  onLogs,
}: UseScaffoldWatchContractEventConfig<TContractName, TEventName>) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();
  const { provider } = useProvider();
  const { targetNetwork } = useTargetNetwork();

  // Validate event existence in ABI
  const { data: deployedContractData, isLoading: deployedContractLoading } =
    useDeployedContractInfo(contractName);

  const eventAbi = useMemo(() => {
    return resolveEventAbi(
      deployedContractData?.abi as Abi,
      eventName as unknown as string,
    );
  }, [deployedContractData, deployedContractLoading, eventName]);

  // Throw error if event not found in ABI (keeps parity with web SDK)
  if (!deployedContractLoading && deployedContractData && !eventAbi) {
    throw new Error(`Event ${eventName as string} not found in contract ABI`);
  }

  useEffect(() => {
    if (!deployedContractLoading && !deployedContractData) {
      setError(new Error("Contract not found"));
    } else if (!deployedContractLoading) {
      setError(undefined);
    }
  }, [deployedContractLoading, deployedContractData]);

  // Use WebSocket events hook
  const {
    events = [],
    isLoading: wsLoading,
    error: wsError,
  } = useScaffoldWebSocketEvents({
    contractName,
    eventName: eventName,
    enrich: true,
    enabled: true,
  });

  // Call onLogs when new events arrive
  useEffect(() => {
    if (events && events.length > 0) {
      onLogs(events[0]);
    }
  }, [events, onLogs]);

  // Sync loading and error states from WebSocket hook
  useEffect(() => {
    setIsLoading(wsLoading);
    if (wsError) setError(wsError);
  }, [wsLoading, wsError]);

  // Polling fallback when WebSocket is not available
  useEffect(() => {
    if (!wsError) return;

    let stopped = false;
    const tick = async () => {
      try {
        setIsLoading(true);
        // Touch provider to maintain dependency
        void provider;
      } catch (e: any) {
        setError(e instanceof Error ? e : new Error(String(e)));
      } finally {
        if (!stopped) setIsLoading(false);
      }
    };

    const id = setInterval(
      tick,
      targetNetwork ? scaffoldConfig.pollingInterval : 4000,
    );

    return () => {
      stopped = true;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wsError, provider, targetNetwork]);

  return { isLoading, error };
};
