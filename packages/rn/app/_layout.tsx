import { ScaffoldStarkAppWithProviders } from "@/components/scaffold-stark/ScaffoldStarkAppWithProviders";
import { Stack } from "expo-router";
import React from "react";
import "react-native-reanimated";
import ToastManager from "toastify-react-native";

import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

import { Header } from "@/app/_components/Header";
import { ScaffoldBgGradient } from "@/components/scaffold-stark/gradients/ScaffoldBgGradient";
import { useAegis } from "@cavos/aegis";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useAccount } from "@starknet-react/core";
import { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
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
  // const { address } = useAccount();
  const [result, setResult] = useState<any>(null);
  const { connectWallet, deployWallet, aegisAccount, isConnected, currentAddress } = useAegis();
  const walletSheetRef = useRef<any>(null);

  const handleConnectWallet = async () => {
    // Open bottom sheet instead of auto-connecting
    // (walletSheetRef as any).current?.present({ index: 0 });
    const pk = process.env.EXPO_PUBLIC_PK || "";
    if (pk) {
      await connectWallet(pk);
    } else {
      await deployWallet();
    }
  };

  const handleTest = async () => {
    try {
      if (!isConnected) {
        const pk = process.env.EXPO_PUBLIC_PK || "";
        if (pk) {
          await connectWallet(pk);
        } else {
          await deployWallet();
        }
      }

      const result: any = await aegisAccount.execute(
        "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
        "approve",
        [
          "0x06580f9E0914DB9D78Db20a368a1109f71789023B13BaF1Bbe7B1044BfDa98e4",
          "1",
        ],
      );
      setResult(result);
      console.log("approve tx:", result?.transactionHash ?? result);
    } catch (err) {
      const detail = err instanceof Error ? err.message : JSON.stringify(err);
      console.error("approve failed", detail, err);
      setResult(`"approve failed", ${detail}, ${err}`);
    }
  };

  return (
    <ScaffoldBgGradient>
      <Header
        onConnectWallet={handleConnectWallet}
        isWalletConnected={!!currentAddress}
        walletAddress={currentAddress || undefined}
      />
      <TouchableOpacity onPress={handleTest} className="bg-red-200">
        <Text className="text-center">Test: {currentAddress}</Text>
      </TouchableOpacity>
      <View>
        <Text>{result}</Text>
      </View>
      {/* <WalletConnectModal
        sheetRef={walletSheetRef}
        isWalletConnected={!!address}
        walletAddress={address}
        onClose={() => { }}
      /> */}
      {/* {children} */}
    </ScaffoldBgGradient>
  );
}
