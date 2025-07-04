import { StarknetProvider } from "@/components/starknet-provider";
import { Stack } from "expo-router";
import "../global.css";

export default function RootLayout() {
  return (
    <StarknetProvider>
      <Stack />
    </StarknetProvider>
  );
}
