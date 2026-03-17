import { useEffect, useRef, useState } from "react";
import { useConnect, useAccount } from "@starknet-start/react";
import * as SecureStore from "expo-secure-store";
import scaffoldConfig from "@/scaffold.config";

const LAST_CONNECTED_TIME_KEY = "scaffold_lastConnectedTime";
const LAST_USED_CONNECTOR_KEY = "scaffold_lastUsedConnector";
const WAS_DISCONNECTED_MANUALLY_KEY = "scaffold_wasDisconnectedManually";

type SavedConnector = {
  id: string;
  ix?: number;
};

/**
 * Retrieves a value from secure storage.
 */
const getStorageValue = async <T>(key: string): Promise<T | null> => {
  try {
    const value = await SecureStore.getItemAsync(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

/**
 * Saves a value to secure storage.
 */
export const setStorageValue = async <T>(key: string, value: T): Promise<void> => {
  try {
    await SecureStore.setItemAsync(key, JSON.stringify(value));
  } catch (error) {
    console.error("[useAutoConnect] Error saving to storage:", error);
  }
};

/**
 * Saves the last used connector information for auto-connect.
 */
export const saveLastUsedConnector = async (connectorId: string, ix?: number): Promise<void> => {
  await setStorageValue<SavedConnector>(LAST_USED_CONNECTOR_KEY, { id: connectorId, ix });
  await setStorageValue(LAST_CONNECTED_TIME_KEY, Date.now());
  await setStorageValue(WAS_DISCONNECTED_MANUALLY_KEY, false);
};

/**
 * Marks that the user manually disconnected.
 */
export const markManualDisconnect = async (): Promise<void> => {
  await setStorageValue(WAS_DISCONNECTED_MANUALLY_KEY, true);
};

/**
 * Auto-connects wallet if user has connected before and meets auto-connect criteria.
 * This hook automatically reconnects the user's wallet on app initialization if:
 * - Auto-connect is enabled in scaffold config
 * - User was not manually disconnected
 * - Time since last connection hasn't exceeded TTL
 * - The previously used connector is available and ready
 *
 * @returns {void} This hook doesn't return any value but performs auto-connection side effects
 */
export const useAutoConnect = (): void => {
  const [savedConnector, setSavedConnector] = useState<SavedConnector | null>(null);
  const [lastConnectionTime, setLastConnectionTime] = useState<number | null>(null);
  const [wasDisconnectedManually, setWasDisconnectedManually] = useState<boolean | null>(null);
  const [isStorageLoaded, setIsStorageLoaded] = useState(false);

  const { connect, connectors } = useConnect();
  const { account } = useAccount();

  const hasAutoConnected = useRef(false);

  // Load storage values on mount
  useEffect(() => {
    const loadStorage = async () => {
      const [connector, time, disconnected] = await Promise.all([
        getStorageValue<SavedConnector>(LAST_USED_CONNECTOR_KEY),
        getStorageValue<number>(LAST_CONNECTED_TIME_KEY),
        getStorageValue<boolean>(WAS_DISCONNECTED_MANUALLY_KEY),
      ]);

      setSavedConnector(connector);
      setLastConnectionTime(time);
      setWasDisconnectedManually(disconnected);
      setIsStorageLoaded(true);
    };

    loadStorage();
  }, []);

  useEffect(() => {
    if (!isStorageLoaded || hasAutoConnected.current) return;
    if (!scaffoldConfig.walletAutoConnect || wasDisconnectedManually) return;

    const now = Date.now();
    const ttlExpired =
      now - (lastConnectionTime || 0) > scaffoldConfig.autoConnectTTL;

    const connector = connectors.find(
      (c) => c.features["starknet:walletApi"].id === savedConnector?.id,
    );
    if (!connector) return;

    if (ttlExpired || account) return;

    hasAutoConnected.current = true;
    connect({ connector });
  }, [
    isStorageLoaded,
    connect,
    connectors,
    savedConnector,
    lastConnectionTime,
    account,
    wasDisconnectedManually,
  ]);
};
