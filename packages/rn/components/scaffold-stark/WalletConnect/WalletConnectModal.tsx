import Ionicons from "@expo/vector-icons/Ionicons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { burnerAccounts, BurnerConnector } from "@scaffold-stark/stark-burner";
import { useConnect, useDisconnect } from "@starknet-react/core";
import React from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { themeColors, useTheme } from "../ThemeProvider";
import { CopyIcon } from "../icons/CopyIcon";

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

  // mockData for wallet options
  const walletOptions = [
    {
      key: "burner",
      title: "Burner Wallet",
      disabled: false,
      iconName: "wallet-outline" as const,
      iconColor: "#FFFFFF",
      iconBg: "#3B82F6",
      onPress: handleConnect,
    },
    {
      key: "phantom",
      title: "Phantom",
      disabled: true,
      iconName: "logo-react" as const,
      iconColor: "#E0E7FF",
      iconBg: "#4F46E5",
    },
    {
      key: "argent",
      title: "Argent",
      disabled: true,
      iconName: "flash" as const,
      iconColor: "#F97316",
      iconBg: "#FFFFFF",
    },
  ];

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={["85%"]}
      onDismiss={onClose}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: isDark ? "#000000" : "#FFFFFF" }}
      handleIndicatorStyle={{ backgroundColor: "#8B8B8B" }}
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
          <Text className="text-2xl font-bold" style={{ color: colors.text }}>
            {isWalletConnected ? "Wallet connected" : "Connect a wallet"}
          </Text>
          <Text
            className="text-sm mt-1"
            style={{ color: colors.textSecondary }}
          >
            Get ready by connecting your wallet you preferred wallet below
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
                  <CopyIcon variant={theme} copied={false} />
                </View>
              </View>

              {/* Disconnect Button */}
              <TouchableOpacity
                onPress={handleDisconnect}
                className="w-full py-4 rounded-xl items-center mt-4"
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
              {/* Wallet options styled to match design */}
              <View>
                {walletOptions.map((item, index) => {
                  const isFirst = index === 0;
                  const isLast = index === walletOptions.length - 1;
                  const borderTopLeftRadius = isFirst ? 18 : 0;
                  const borderTopRightRadius = isFirst ? 18 : 0;
                  const borderBottomLeftRadius = isLast ? 18 : 0;
                  const borderBottomRightRadius = isLast ? 18 : 0;

                  const Container = (
                    <View
                      style={{
                        backgroundColor: isDark ? "#2C2C2C" : "#F4F4F4",
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderTopLeftRadius,
                        borderTopRightRadius,
                        borderBottomLeftRadius,
                        borderBottomRightRadius,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <View
                        className="w-8 h-8 rounded-full items-center justify-center mr-4"
                        style={{ backgroundColor: item.iconBg }}
                      >
                        <Ionicons
                          name={item.iconName}
                          size={24}
                          color={item.iconColor}
                        />
                      </View>
                      <Text className="text-lg" style={{ color: colors.text }}>
                        {item.title}
                      </Text>
                    </View>
                  );

                  return (
                    <View
                      key={item.key}
                      style={{ marginTop: index > 0 ? 3 : 0 }}
                    >
                      {item.disabled ? (
                        <TouchableOpacity disabled className="w-full">
                          {Container}
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          onPress={item.onPress}
                          className="w-full"
                        >
                          {Container}
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </View>

              {/* Footer text */}
              <View className="py-2 items-center">
                <Text
                  className="text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  Other wallets
                </Text>
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
