import { BottomNavigation } from "@/app/_components/BottomNavigation";
import { Header } from "@/app/_components/Header";
import { InfoCard } from "@/app/_components/InfoCard";
import { WelcomeSection } from "@/app/_components/WelcomeSection";
import { ScaffoldBgGradient } from "@/components/scaffold-stark/gradients/ScaffoldBgGradient";
import {
  themeColors,
  useTheme,
} from "@/components/scaffold-stark/ThemeProvider";
import { useScaffoldReadContract } from "@/hooks/scaffold-stark/useScaffoldReadContract";
import { useScaffoldWriteContract } from "@/hooks/scaffold-stark/useScaffoldWriteContract";
import Ionicons from "@expo/vector-icons/Ionicons";
import { burnerAccounts, BurnerConnector } from "@scaffold-stark/stark-burner";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StatusBar, View } from "react-native";
import { CairoOption, CairoOptionVariant } from "starknet";

// STRK Address: 0x4718F5A0FC34CC1AF16A1CDEE98FFB20C31F5CD61D6AB07201858F4287C938D

export default function Index() {
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { address } = useAccount();
  const { theme } = useTheme();
  const colors = themeColors[theme];
  const [activeTab, setActiveTab] = useState("home");

  const { data: balance } = useScaffoldReadContract({
    contractName: "Strk",
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    enabled: !!address,
  });

  const { data: greeting } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "greeting",
    args: [],
    enabled: true,
  });

  const router = useRouter();

  const myOption = new CairoOption<bigint>(CairoOptionVariant.None);
  const { sendAsync, error } = useScaffoldWriteContract({
    contractName: "YourContract",
    functionName: "set_greeting",
    args: ["Hello World", myOption],
  });

  useEffect(() => {
    if (error) {
      console.error("sendAsync error: ", error);
    }
  }, [error]);

  const handleConnectWallet = () => {
    if (address) {
      disconnect();
    } else {
      // Connect with first available burner account
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

  const handleDebugPress = () => {
    router.push("/hooks");
  };

  const handleMultiWritePress = async () => {
    try {
      const result = await sendAsync();
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  };

  const handleTabPress = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === "debug") {
      router.push("/hooks");
    }
  };

  return (
    <ScaffoldBgGradient>
      <SafeAreaView className="flex-1">
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />

        <Header
          onConnectWallet={handleConnectWallet}
          isWalletConnected={!!address}
          walletAddress={address}
        />

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <WelcomeSection />

          <View className="px-4 py-6">
            <InfoCard
              icon={<Ionicons name="bug" size={24} color={colors.text} />}
              title="Tinker with your smart contract using the Debug Contracts tab."
              description=""
              onPress={handleDebugPress}
            />

            <InfoCard
              icon={<Ionicons name="pricetag" size={24} color={colors.text} />}
              title="Play around with Multiwrite transactions using useScaffoldMultiWrite() hook"
              description=""
              onPress={handleMultiWritePress}
            />
          </View>
        </ScrollView>

        <BottomNavigation activeTab={activeTab} onTabPress={handleTabPress} />
      </SafeAreaView>
    </ScaffoldBgGradient>
  );
}
