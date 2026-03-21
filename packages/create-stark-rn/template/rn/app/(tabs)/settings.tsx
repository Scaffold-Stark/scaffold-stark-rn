import { ConnectedWalletMenu } from "@/app/_components/ConnectedWalletMenu";
import { WelcomeSection } from "@/app/_components/WelcomeSection";
import { useAccount } from "@starknet-react/core";
import React from "react";
import { ScrollView, StatusBar, View } from "react-native";

export default function Settings() {
  const { address } = useAccount();

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
        {address && <WelcomeSection address={address} />}
        <ConnectedWalletMenu address={address} />
      </ScrollView>
    </View>
  );
}
