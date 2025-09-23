import Ionicons from "@expo/vector-icons/Ionicons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { burnerAccounts, BurnerConnector } from "@scaffold-stark/stark-burner";
import { useConnect, useDisconnect } from "@starknet-react/core";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { themeColors, useTheme } from "../ThemeProvider";

interface WalletConnectModalProps {
  sheetRef: React.RefObject<BottomSheetModal>;
  onClose?: () => void;
  isWalletConnected: boolean;
  walletAddress?: string;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.6;

export function WalletConnectModal({
  sheetRef,
  onClose,
  isWalletConnected,
  walletAddress,
}: WalletConnectModalProps) {
  const { theme, isDark } = useTheme();
  const colors = themeColors[theme];
  const insets = useSafeAreaInsets();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = () => {
    const firstAccount = burnerAccounts[0];
    if (firstAccount) {
      const connector = connectors.find((it) => it.id === "burner-wallet");
      if (connector && connector instanceof BurnerConnector) {
        connector.burnerAccount = firstAccount;
        connect({ connector });
        onClose && onClose();
      }
    }
  };

  const handleDisconnect = () => {
    disconnect();
    onClose && onClose();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={["85%"]}
      onDismiss={onClose}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: isDark ? "#1A1A1A" : "#FFFFFF" }}
      handleIndicatorStyle={{ backgroundColor: isDark ? "#404040" : "#D1D5DB" }}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
        />
      )}
    >
      <BottomSheetView style={{ flex: 1, paddingBottom: insets.bottom + 28 }}>
        {/* Header */}
        <View className="px-6 pb-4">
          <Text className="text-xl font-bold" style={{ color: colors.text }}>
            {isWalletConnected ? "Wallet Connected" : "Connect Wallet"}
          </Text>
          {isWalletConnected && walletAddress && (
            <Text
              className="text-sm mt-1"
              style={{ color: colors.textSecondary }}
            >
              {formatAddress(walletAddress)}
            </Text>
          )}
        </View>

        {/* Content */}
        <View className="flex-1 px-6">
          {isWalletConnected ? (
            <View className="space-y-4">
              {/* Wallet Info Card */}
              <View
                className="p-4 rounded-xl"
                style={{
                  backgroundColor: isDark ? "#2A2A2A" : "#F9FAFB",
                  borderWidth: 1,
                  borderColor: isDark ? "#404040" : "#E5E7EB",
                }}
              >
                <View className="flex-row items-center mb-3">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center mr-3"
                    style={{ backgroundColor: isDark ? "#4DB4FF" : "#3B82F6" }}
                  >
                    <Ionicons name="wallet-outline" size={20} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="font-semibold"
                      style={{ color: colors.text }}
                    >
                      Burner Wallet
                    </Text>
                    <Text
                      className="text-sm"
                      style={{ color: colors.textSecondary }}
                    >
                      Connected
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between">
                  <Text
                    className="text-sm font-mono"
                    style={{ color: colors.textSecondary }}
                  >
                    {formatAddress(walletAddress!)}
                  </Text>
                  <TouchableOpacity onPress={() => {}} className="p-1">
                    <Ionicons
                      name="copy-outline"
                      size={16}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Disconnect Button */}
              <TouchableOpacity
                onPress={handleDisconnect}
                className="w-full py-4 rounded-xl items-center"
                style={{ backgroundColor: "#EF4444" }}
              >
                <View className="flex-row items-center">
                  <Ionicons name="log-out-outline" size={20} color="white" />
                  <Text className="text-white font-semibold ml-2">
                    Disconnect Wallet
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="space-y-4">
              {/* Available Wallets */}
              <View className="space-y-3">
                <Text
                  className="text-sm font-medium mb-3"
                  style={{ color: colors.textSecondary }}
                >
                  Available Wallets
                </Text>

                {/* Burner Wallet Option */}
                <TouchableOpacity onPress={handleConnect} className="w-full">
                  <LinearGradient
                    colors={
                      isDark ? ["#2A3655", "#5C92BB"] : ["#FFFFFF", "#F8FAFC"]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 16,
                      paddingHorizontal: 20,
                      borderRadius: 12,
                      borderWidth: isDark ? 1 : 1,
                      borderColor: isDark ? "#404040" : "#E5E7EB",
                    }}
                  >
                    <View
                      className="w-12 h-12 rounded-full items-center justify-center mr-4"
                      style={{
                        backgroundColor: isDark ? "#4DB4FF" : "#3B82F6",
                      }}
                    >
                      <Ionicons name="wallet-outline" size={24} color="white" />
                    </View>

                    <View className="flex-1">
                      <Text
                        className="font-semibold text-base"
                        style={{ color: colors.text }}
                      >
                        Burner Wallet
                      </Text>
                      <Text
                        className="text-sm mt-1"
                        style={{ color: colors.textSecondary }}
                      >
                        Connect to a temporary wallet for testing
                      </Text>
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={colors.textSecondary}
                    />
                  </LinearGradient>
                </TouchableOpacity>

                {/* Coming Soon Options */}
                <View
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: isDark ? "#2A2A2A" : "#F9FAFB",
                    borderWidth: 1,
                    borderColor: isDark ? "#404040" : "#E5E7EB",
                  }}
                >
                  <Text
                    className="text-center text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    More wallet options coming soon...
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
        {/* Bottom spacer to ensure content clears the handle & home indicator */}
        <View style={{ height: insets.bottom }} />
      </BottomSheetView>
    </BottomSheetModal>
  );
}
