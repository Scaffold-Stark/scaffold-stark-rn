import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Text, View } from "react-native";
import {
  themeColors,
  useTheme,
} from "../../components/scaffold-stark/ThemeProvider";
import Address from "@/components/scaffold-stark/Address";

interface WelcomeSectionProps {
  title?: string;
  subtitle?: string;
  contractPath?: string;
  address?: string;
}

export function WelcomeSection({
  title = "Welcome to",
  subtitle = "Scaffold-Stark 2",
  contractPath = "YourContract.cairo in packages/snfoundry/contracts/src",
  address = undefined,
}: WelcomeSectionProps) {
  const { theme, isDark } = useTheme();
  const colors = themeColors[theme];

  return (
    <View className="items-center justify-center py-6">
      {/* Home Icon */}
      <View className="items-center justify-center">
        <View
          className="rounded-full items-center justify-center mb-8 p-3"
          style={{
            backgroundColor: isDark ? colors.primary + "25" : "#ffffff" + "25",
          }}
        >
          <View
            className="rounded-full items-center justify-center p-4"
            style={{
              backgroundColor: isDark
                ? colors.primaryLight + "50"
                : "#ffffff" + "50",
            }}
          >
            {/* Ionicons Home Icon */}
            <Ionicons
              name={address ? "wallet-outline" : "home-outline"}
              size={48}
              color={colors.text}
            />
          </View>
        </View>
      </View>

      {address ? (
        <>
          <Text
            className={`text-lg font-medium mb-2 text-center ${isDark ? "text-white" : "text-black"}`}
          >
            Wallet Address
          </Text>
          <Address address={address} />
        </>
      ) : (
        <>
          {/* Welcome Text */}
          <Text
            className={`text-5xl font-light text-center mb-2 ${isDark ? "text-white" : "text-black"}`}
            style={{ fontFamily: "SpaceGrotesk-Bold" }}
          >
            {title}
          </Text>
          <Text
            className={`text-5xl text-center mb-8`}
            style={{ fontFamily: "SpaceGrotesk-Bold", color: colors.primary }}
          >
            {subtitle}
          </Text>

          {/* Contract Info */}
          <Text
            className={`text-lg font-medium mb-2 text-center ${isDark ? "text-white" : "text-black"}`}
          >
            Edit your smart contract :
          </Text>
          <Text
            className={`text-base text-center opacity-80 italic ${isDark ? "text-white" : "text-black"}`}
          >
            {contractPath}
          </Text>
        </>
      )}
    </View>
  );
}
