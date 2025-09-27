import "@walletconnect/react-native-compat";
import { SessionTypes } from "@walletconnect/types";
import UniversalProvider from "@walletconnect/universal-provider";
import { StatusBar } from "expo-status-bar";
import "fast-text-encoding";
import React, { useEffect, useState } from "react";
import {
  Button,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import "react-native-get-random-values";

const initializeProvider = async () => {
  try {
    console.log("Initializing provider...");

    const projectId = process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID;

    const metadata = {
      name: "Wallet connect Test",
      description: "Test app for connecting to Argent Mobile",
      url: "https://walletconnect.com/",
      icons: ["https://avatars.githubusercontent.com/u/37784886"],
    };

    const providerInstance = await UniversalProvider.init({
      projectId,
      metadata,
      relayUrl: "wss://relay.walletconnect.com",
    });

    console.log("Provider initialized successfully");
    return providerInstance;
  } catch (err: any) {
    console.error("Error initializing provider:", err);
    throw err;
  }
};

// Define a type for the UniversalProvider instance
type ProviderInstance = Awaited<ReturnType<typeof initializeProvider>>;

interface StarknetTransactionResponse {
  transaction_hash: string;
}

// Example ETH transfer transaction
const createEthTransferTransaction = (accountAddress: string) => ({
  accountAddress,
  executionRequest: {
    calls: [
      {
        contractAddress:
          "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7", // ETH contract address on Starknet
        entrypoint: "transfer",
        calldata: [
          accountAddress, // recipient (sending to self)
          "0x0000000000000000000000000000000000000000000000000000000000000001", // amount 1 wei
          "0x0",
        ],
      },
    ],
  },
});

export default function App() {
  const [provider, setProvider] = useState<ProviderInstance | null>(null);
  const [session, setSession] = useState<SessionTypes.Struct | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [wcUri, setWcUri] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<"MAINNET" | "SEPOLIA">(
    "MAINNET",
  );

  // Set up provider on mount
  useEffect(() => {
    initializeProvider()
      .then((prov) => {
        console.log("Provider initialized successfully");
        setProvider(prov);

        const activeSessions = Object.values(prov.session || {});
        if (activeSessions.length > 0) {
          console.log("Found active session:", activeSessions[0]);
          setSession(activeSessions[0] as SessionTypes.Struct);

          // Extract account if available
          const starknetAccounts =
            activeSessions[0]?.namespaces?.starknet?.accounts;
          if (starknetAccounts && starknetAccounts.length > 0) {
            const accountAddress = starknetAccounts[0].split(":")[2];
            setAccount(accountAddress);
          }
        }
      })
      .catch((err: any) => {
        console.error("Provider initialization failed:", err);
        setError("Setup failed: " + (err?.message || "Unknown error"));
      });
  }, []);

  // Try to open wallet with URI
  const openWallet = async (uri: string) => {
    const encodedUri = encodeURIComponent(uri);

    const readyScheme = `ready://wc?uri=${encodedUri}`; // ready-dev on testnet
    console.log("Opening Ready with scheme:", readyScheme);

    try {
      await Linking.openURL(readyScheme);
      console.log("Successfully opened Ready");
    } catch (err) {
      console.error("Failed to open Ready:", err);
      setError(
        "Failed to open Ready wallet. Please make sure it is installed.",
      );
    }
  };

  // Connect to Ready Mobile
  const handleConnect = async () => {
    if (!provider) {
      console.error("Provider is not initialized");
      setError("Provider is not initialized");
      return;
    }

    setIsConnecting(true);
    setError(null);
    setWcUri(null);

    try {
      console.log("Attempting to connect...");
      console.log(`Using Ready Mobile chain ID: starknet:SNMAIN`);

      // Create a connection with the wallet
      const { uri, approval } = await provider.client.connect({
        requiredNamespaces: {
          starknet: {
            chains: ["starknet:SNMAIN"], // Use Ready's specific chain ID format
            methods: [
              "starknet_account",
              "starknet_requestAddInvokeTransaction",
            ],
            events: ["accountsChanged", "chainChanged"],
          },
        },
      });

      // Store the URI for deep linking
      if (uri) {
        console.log("WalletConnect URI:", uri);
        setWcUri(uri);

        // Directly open Ready since we know it works
        openWallet(uri);
      } else {
        console.warn("No URI available for wallet connection");
        setIsConnecting(false);
        return;
      }

      // Wait for wallet approval
      console.log("Waiting for wallet approval...");
      const session = await approval();
      console.log("Session approved:", session);

      // If we have a session, extract the account address
      if (session && session.namespaces.starknet?.accounts?.length > 0) {
        const accountAddress =
          session.namespaces.starknet.accounts[0].split(":")[2]; // Extract address
        console.log("Connected to account:", accountAddress);
        setSession(session);
        setAccount(accountAddress);
      } else {
        console.warn("Session established but no accounts found");
        if (session) {
          console.log(
            "Session namespaces:",
            JSON.stringify(session.namespaces),
          );
        }
      }
    } catch (err: any) {
      console.error("Connection error:", err);
      setError("Connection failed: " + (err?.message || "Unknown error"));
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect from Ready Mobile
  const handleDisconnect = async () => {
    if (!provider || !session) {
      console.error(
        "Cannot disconnect: Provider or session is not initialized",
      );
      return;
    }
    try {
      console.log("Disconnecting session...");
      await provider.disconnect();
      console.log("Successfully disconnected");
      setSession(null);
      setAccount(null);
      setWcUri(null);
      setTransactionHash(null);
    } catch (err: any) {
      console.error("Disconnect error:", err);
      setError("Disconnect failed: " + (err?.message || "Unknown error"));
    }
  };

  const handleEthTransfer = async () => {
    if (!provider || !account || !session) {
      setError("Provider or account not initialized");
      return;
    }

    try {
      setError(null);
      console.log("Requesting ETH transfer transaction...");

      // Create transaction parameters
      const transaction = createEthTransferTransaction(account);
      console.log("ETH transfer params:", JSON.stringify(transaction, null, 2));

      // First, try to open the wallet app
      const readyScheme = `ready://`; // or ready-dev
      try {
        await Linking.openURL(readyScheme);
        console.log("Opened Ready app before transaction");
      } catch (err) {
        console.warn("Could not open Ready app:", err);
      }

      // Wait a moment for the app to open
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Use the client property of the provider to make the request
      const result = await provider.client.request<StarknetTransactionResponse>(
        {
          topic: session.topic,
          chainId: "starknet:SNMAIN",
          request: {
            method: "starknet_requestAddInvokeTransaction",
            params: {
              accountAddress: transaction.accountAddress,
              executionRequest: transaction.executionRequest,
            },
          },
        },
      );

      console.log("ETH transfer result:", result);
      if (result && result.transaction_hash) {
        setTransactionHash(result.transaction_hash);
      }
    } catch (err: any) {
      console.error("Error requesting ETH transfer:", err);
      setError("ETH transfer failed: " + (err?.message || "Unknown error"));
    } finally {
      // Clear the flag when done
      handleEthTransfer.isProcessing = false;
    }
  };

  // Add the property to the function
  handleEthTransfer.isProcessing = false;

  // Cancel connection attempt
  const handleCancelConnect = () => {
    if (isConnecting) {
      setIsConnecting(false);
      setWcUri(null);
      console.log("Connection attempt cancelled");
    }
  };

  if (!provider) {
    return (
      <View style={styles.container}>
        <Text>Loading provider...</Text>
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Starknet Wallet Test</Text>

        {!session && (
          <View style={styles.networkSelector}>
            <Text style={styles.networkLabel}>Network:</Text>
            <Text
              style={[
                styles.networkButton,
                selectedNetwork === "MAINNET" && styles.selectedNetwork,
              ]}
              onPress={() => setSelectedNetwork("MAINNET")}
            >
              <Text style={styles.networkButtonText}>Mainnet</Text>
            </Text>
          </View>
        )}

        {session ? (
          <>
            <Text style={styles.connectedText}>Connected to Argent</Text>
            <Text style={styles.networkText}>Network: Mainnet</Text>
            <Text style={styles.accountText}>Account: {account}</Text>

            <View style={styles.buttonContainer}>
              <Button
                title="Transfer ETH to Self"
                onPress={handleEthTransfer}
              />
            </View>

            {transactionHash && (
              <View style={styles.resultContainer}>
                <Text style={styles.resultTitle}>Transaction Hash:</Text>
                <Text style={styles.resultText}>{transactionHash}</Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <Button
                title="Disconnect"
                onPress={handleDisconnect}
                color="red"
              />
            </View>
          </>
        ) : (
          <>
            <Button
              title={isConnecting ? "Connecting..." : "Connect with Argent"}
              onPress={handleConnect}
              disabled={isConnecting}
            />
            {isConnecting && (
              <Button
                title="Cancel"
                onPress={handleCancelConnect}
                color="red"
              />
            )}
          </>
        )}
        {error && <Text style={styles.error}>{error}</Text>}
        <StatusBar style="auto" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  networkSelector: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  networkLabel: {
    marginRight: 10,
  },
  networkButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 5,
  },
  selectedNetwork: {
    backgroundColor: "#2196F3",
  },
  networkButtonText: {
    fontWeight: "500",
  },
  networkText: {
    fontSize: 16,
    marginBottom: 10,
    color: "#666",
  },
  connectedText: {
    fontSize: 18,
    marginBottom: 10,
    color: "green",
  },
  accountText: {
    fontSize: 14,
    marginBottom: 20,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  buttonContainer: {
    marginVertical: 10,
    width: "100%",
    maxWidth: 300,
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    width: "100%",
    maxWidth: 300,
  },
  resultTitle: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  resultText: {
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 12,
    color: "#333",
  },
  error: {
    color: "red",
    marginTop: 10,
  },
});
