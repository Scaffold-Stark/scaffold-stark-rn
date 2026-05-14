import { ConnectedWalletMenu } from "@/app/_components/ConnectedWalletMenu";
import { WelcomeSection } from "@/app/_components/WelcomeSection";
import { useWalletModal } from "@/app/_layout";
import { useAccount } from "@starknet-start/react";
import React from "react";
import { ScrollView, StatusBar, View } from "react-native";

export default function Settings() {
  const { address } = useAccount();
  const { openConnectModal } = useWalletModal();

  return (
    <View className="flex-1">
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <WelcomeSection address={address} />
        <ConnectedWalletMenu address={address} onConnectWallet={openConnectModal} />
      </ScrollView>
    </View>
  );
}
