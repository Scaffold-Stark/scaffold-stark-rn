import { ScaffoldStarkAppWithProviders } from "@/components/scaffold-stark/ScaffoldStarkAppWithProviders";
import { Stack } from "expo-router";
import React from "react";
import "react-native-reanimated";
import ToastManager from "toastify-react-native";

import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

import { Header } from "@/app/_components/Header";
import { ScaffoldBgGradient } from "@/components/scaffold-stark/gradients/ScaffoldBgGradient";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useAccount } from "@starknet-react/core";
import { useEffect, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { WalletConnectModal } from "../components/scaffold-stark/WalletConnect/WalletConnectModal";
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
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <Stack
            screenOptions={{ headerShown: false }}
            screenLayout={({ children }: { children: React.ReactNode }) => (
              <AppShell>{children}</AppShell>
            )}
          />
          <ToastManager />
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </ScaffoldStarkAppWithProviders>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  const { address } = useAccount();
  const walletSheetRef = useRef<any>(null);

  const handleConnectWallet = () => {
    // Open bottom sheet instead of auto-connecting
    (walletSheetRef as any).current?.present({ index: 0 });
  };

  return (
    <ScaffoldBgGradient>
      <Header
        onConnectWallet={handleConnectWallet}
        isWalletConnected={!!address}
        walletAddress={address}
      />
      <WalletConnectModal sheetRef={walletSheetRef} onClose={() => {}} />
      {children}
    </ScaffoldBgGradient>
  );
}
