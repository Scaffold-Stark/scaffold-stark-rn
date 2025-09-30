import scaffoldConfig from "@/scaffold.config";

const currentNetwork = scaffoldConfig.targetNetworks[0].network as string;

const aegisConfig = {
  network:
    currentNetwork === "sepolia"
      ? ("SN_SEPOLIA" as const)
      : ("SN_DEVNET" as const),
  appName: "Starknet React Native",
  appId: process.env.EXPO_PUBLIC_AEGIS_APP_ID || "",
  paymasterApiKey:
    process.env.EXPO_PUBLIC_AVNU_API_KEY ||
    "c37c52b7-ea5a-4426-8121-329a78354b0b",
  enableLogging: true,
};

export default aegisConfig;
