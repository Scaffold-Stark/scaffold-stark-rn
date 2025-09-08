import { StarknetProvider } from "@/components/StarknetProvider";
import { Stack } from "expo-router";
import ToastManager from "toastify-react-native";
import "../global.css";

export default function RootLayout() {
  return (
    <StarknetProvider>
      <Stack />
      <ToastManager />
    </StarknetProvider>
  );
}
