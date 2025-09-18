import { ScaffoldStarkAppWithProviders } from "@/components/scaffold-stark/ScaffoldStarkAppWithProviders";
import { Stack } from "expo-router";
import ToastManager from "toastify-react-native";

import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

import { ScaffoldBgGradient } from "@/components/scaffold-stark/gradients/ScaffoldBgGradient";
import { useEffect } from "react";
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
        screenLayout={({ children }) => (
          <ScaffoldBgGradient>{children}</ScaffoldBgGradient>
        )}
      />
      <ToastManager />
    </ScaffoldStarkAppWithProviders>
  );
}
