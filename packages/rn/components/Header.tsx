import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { themeColors, useTheme } from "./ThemeProvider";
import { ScaffoldBtnGradient } from "./gradients/ScaffoldBtnGradient";
import { ScaffoldDarkIcon } from "./scaffold-stark/icons/ScaffoldDarkIcon";
import { ScaffoldLightIcon } from "./scaffold-stark/icons/ScaffoldLightIcon";
interface HeaderProps {
  onConnectWallet?: () => void;
  isWalletConnected?: boolean;
  walletAddress?: string;
}

export function Header({
  onConnectWallet,
  isWalletConnected,
  walletAddress,
}: HeaderProps) {
  const { theme, toggleTheme, isDark } = useTheme();
  const colors = themeColors[theme];

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <View className="flex-row items-center justify-between px-4 py-4 pb-4">
      {/* Logo/Brand */}
      <View className="w-12 h-12 rounded-xl items-center justify-center">
        {isDark ? <ScaffoldDarkIcon /> : <ScaffoldLightIcon />}
      </View>

      <View className="flex flex-row gap-4">
        {/* Center - Connect Wallet Button */}
        <TouchableOpacity onPress={onConnectWallet} activeOpacity={0.8}>
          <ScaffoldBtnGradient>
            <Text
              className="font-semibold"
              style={{ color: isDark ? "#FFFFFF" : "#1F2937" }}
            >
              {isWalletConnected && walletAddress
                ? formatAddress(walletAddress)
                : "Connect wallet"}
            </Text>
          </ScaffoldBtnGradient>
        </TouchableOpacity>

        {/* Theme Toggle */}
        <TouchableOpacity
          onPress={toggleTheme}
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{
            backgroundColor: colors.themeButton,
          }}
        >
          <Ionicons
            name={
              isDark ? ("moon-outline" as const) : ("sunny-outline" as const)
            }
            size={24}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
