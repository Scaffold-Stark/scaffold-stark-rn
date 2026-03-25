import Ionicons from "@expo/vector-icons/Ionicons";
import { useDisconnect } from "@starknet-start/react";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  themeColors,
  useTheme,
} from "../../components/scaffold-stark/ThemeProvider";

interface ConnectedWalletMenuProps {
  address?: string;
  onConnectWallet?: () => void;
}

export function ConnectedWalletMenu({ address, onConnectWallet }: ConnectedWalletMenuProps) {
  const { theme, isDark } = useTheme();
  const colors = themeColors[theme];
  const insets = useSafeAreaInsets();

  const { disconnect } = useDisconnect();

  return (
    <View
      className="px-4"
      style={{
        marginBottom: insets.bottom + 72,
      }}
    >
      <View
        className="rounded-2xl p-4"
        style={{
          backgroundColor: isDark ? "#000000B8" : "#FFFFFFB8",
        }}
      >
        {!address && (
          <>
            <View className="flex-row items-center mb-3 px-1">
              <Ionicons
                name="warning-outline"
                size={16}
                color={isDark ? "#FBBF24" : "#D97706"}
                style={{ marginRight: 6 }}
              />
              <Text
                className="text-sm"
                style={{ color: isDark ? "#FBBF24" : "#D97706" }}
              >
                Connect a wallet to send transactions
              </Text>
            </View>
            {onConnectWallet && (
              <TouchableOpacity
                onPress={onConnectWallet}
                className="flex-row items-center justify-center px-3 py-2.5 rounded-full"
                style={{
                  backgroundColor: colors.primary,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 6,
                  elevation: 4,
                }}
              >
                <Ionicons
                  name="wallet-outline"
                  size={20}
                  color="white"
                  style={{ marginRight: 4 }}
                />
                <Text className="text-white font-medium text-base">
                  Connect Wallet
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {address && (
          <TouchableOpacity
            onPress={() => {
              disconnect();
            }}
            className="flex-row items-center justify-center px-3 py-2.5 rounded-full"
            style={{
              backgroundColor: "#FF0000",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            <Ionicons
              name="log-out-outline"
              size={20}
              color="white"
              style={{ marginRight: 4, transform: [{ scaleX: -1 }] }}
            />
            <Text className="text-white font-medium text-base">
              Disconnect Wallet
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default ConnectedWalletMenu;
