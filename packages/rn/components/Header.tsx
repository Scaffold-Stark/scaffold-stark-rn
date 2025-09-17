import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { themeColors, useTheme } from "./ThemeProvider";

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
    <View
      className="flex-row items-center justify-between px-4 pt-12 pb-4"
      style={{ backgroundColor: colors.background }}
    >
      {/* Logo/Brand */}
      <View className="w-12 h-12 bg-purple-600 rounded-xl items-center justify-center">
        <Text className="text-white text-xl font-bold">SS</Text>
      </View>

      {/* Center - Connect Wallet Button */}
      <TouchableOpacity
        onPress={onConnectWallet}
        className="px-6 py-3 bg-purple-600 rounded-full"
        style={{ backgroundColor: colors.primary }}
      >
        <Text className="text-white font-semibold">
          {isWalletConnected && walletAddress
            ? formatAddress(walletAddress)
            : "Connect wallet"}
        </Text>
      </TouchableOpacity>

      {/* Theme Toggle */}
      <TouchableOpacity
        onPress={toggleTheme}
        className="w-12 h-12 rounded-full items-center justify-center"
        style={{ backgroundColor: colors.primary }}
      >
        <Text className="text-white text-lg">{isDark ? "☀️" : "🌙"}</Text>
      </TouchableOpacity>
    </View>
  );
}
