import { ScaffoldStarkAppWithProviders } from "@/components/scaffold-stark/ScaffoldStarkAppWithProviders";
import { Stack } from "expo-router";
import ToastManager from "toastify-react-native";

import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

import { Header } from "@/app/_components/Header";
import { ScaffoldBgGradient } from "@/components/scaffold-stark/gradients/ScaffoldBgGradient";
import { burnerAccounts, BurnerConnector } from "@scaffold-stark/stark-burner";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { useEffect } from "react";
import { SafeAreaView } from "react-native";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceGrotesk: require("../assets/fonts/SpaceGrotesk-Regular.ttf"),
    "SpaceGrotesk-Bold": require("../assets/fonts/SpaceGrotesk-Bold.ttf"),
    "SpaceGrotesk-SemiBold": require("../assets/fonts/SpaceGrotesk-SemiBold.ttf"),
    "SpaceGrotesk-Medium": require("../assets/fonts/SpaceGrotesk-Medium.ttf"),
    "SpaceGrotesk-Light": require("../assets/fonts/SpaceGrotesk-Light.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <ScaffoldStarkAppWithProviders>
      <Stack
        screenOptions={{ headerShown: false }}
        screenLayout={({ children }) => <AppShell>{children}</AppShell>}
      />
      <ToastManager />
    </ScaffoldStarkAppWithProviders>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { address } = useAccount();

  const handleConnectWallet = () => {
    if (address) {
      disconnect();
    } else {
      const firstAccount = burnerAccounts[0];
      if (firstAccount) {
        const connector = connectors.find((it) => it.id === "burner-wallet");
        if (connector && connector instanceof BurnerConnector) {
          connector.burnerAccount = firstAccount;
          connect({ connector });
        }
      }
    }
  };

  return (
    <ScaffoldBgGradient>
      <Header
        onConnectWallet={handleConnectWallet}
        isWalletConnected={!!address}
        walletAddress={address}
      />
      {children}
    </ScaffoldBgGradient>
  );
}
