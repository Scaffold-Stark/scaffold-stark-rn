import { ScaffoldStarkAppWithProviders } from "@/components/scaffold-stark/ScaffoldStarkAppWithProviders";
import { Stack } from "expo-router";
import ToastManager from "toastify-react-native";
import "../global.css";

export default function RootLayout() {
  return (
    <ScaffoldStarkAppWithProviders>
      <Stack screenOptions={{ headerShown: false }} />
      <ToastManager />
    </ScaffoldStarkAppWithProviders>
  );
}
