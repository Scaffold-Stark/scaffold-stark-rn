import { useTargetNetwork } from "@/hooks/scaffold-stark/useTargetNetwork";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { burnerAccounts, BurnerConnector } from "@scaffold-stark/stark-burner";
import { Connector, useConnect, useDisconnect } from "@starknet-react/core";
import * as Clipboard from "expo-clipboard";
import React, { useMemo, useState } from "react";
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
  const [copied, setCopied] = useState(false);
  const { targetNetwork } = useTargetNetwork();
  const [showOtherOptions, setShowOtherOptions] = useState(false);

  const isDevnet = targetNetwork.network === "devnet";

  const { mainConnectors, otherConnectors } = useMemo(() => {
    if (!isDevnet) {
      return { mainConnectors: connectors, otherConnectors: [] as Connector[] };
    }
    const mains = connectors.filter((c) => c.id === "burner-wallet");
    const others = connectors.filter((c) => c.id !== "burner-wallet");
    return { mainConnectors: mains, otherConnectors: others };
  }, [connectors, isDevnet]);

  const handleConnectBurner = () => {
    const firstAccount = burnerAccounts[0];
    if (!firstAccount) return;
    const connector = connectors.find((it) => it.id === "burner-wallet");
    if (connector && connector instanceof BurnerConnector) {
      connector.burnerAccount = firstAccount;
      connect({ connector });
      onClose && onClose();
    }
  };

  const handleConnectConnector = (connector: Connector) => {
    if (connector.id === "burner-wallet") {
      handleConnectBurner();
      return;
    }
    connect({ connector });
    onClose && onClose();
  };

  const handleDisconnect = () => {
    disconnect();
    onClose && onClose();
  };

  const handleCopy = async () => {
    if (!walletAddress) return;
    try {
      await Clipboard.setStringAsync(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getConnectorDisplay = (connector: Connector) => {
    const id = connector.id;
    if (id === "burner-wallet") {
      return {
        title: "Burner Wallet",
        iconName: "wallet-outline" as const,
        iconBg: "#3B82F6",
        iconColor: "#FFFFFF",
      };
    }
    if (id === "controller") {
      return {
        title: "Controller",
        iconName: "flash" as const,
        iconBg: isDark ? "#222222" : "#F0F0F0",
        iconColor: isDark ? "#F97316" : "#4F46E5",
      };
    }
    return {
      title: connector.name || connector.id,
      iconName: "logo-react" as const,
      iconBg: isDark ? "#2C2C2C" : "#F4F4F4",
      iconColor: isDark ? "#E0E7FF" : "#4F46E5",
    };
  };

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
                  <TouchableOpacity onPress={handleCopy}>
                    <CopyIcon variant={theme} copied={copied} />
                  </TouchableOpacity>
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
              <View>
                {(isDevnet && !showOtherOptions
                  ? mainConnectors
                  : isDevnet
                    ? otherConnectors
                    : connectors
                ).map((connector, index, arr) => {
                  const display = getConnectorDisplay(connector);
                  const isFirst = index === 0;
                  const isLast = index === arr.length - 1;
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
                        style={{ backgroundColor: display.iconBg }}
                      >
                        <Ionicons
                          name={display.iconName}
                          size={24}
                          color={display.iconColor}
                        />
                      </View>
                      <Text className="text-lg" style={{ color: colors.text }}>
                        {display.title}
                      </Text>
                    </View>
                  );

                  return (
                    <View
                      key={connector.id || index}
                      style={{ marginTop: index > 0 ? 3 : 0 }}
                    >
                      <TouchableOpacity
                        onPress={() => handleConnectConnector(connector)}
                        className="w-full"
                      >
                        {Container}
                      </TouchableOpacity>
                    </View>
                  );
                })}

                {isDevnet &&
                  otherConnectors.length > 0 &&
                  !showOtherOptions && (
                    <View style={{ marginTop: 8 }}>
                      <TouchableOpacity
                        onPress={() => setShowOtherOptions(true)}
                        className="w-full"
                      >
                        <View
                          style={{
                            backgroundColor: isDark ? "#1F2937" : "#E5E7EB",
                            paddingVertical: 10,
                            paddingHorizontal: 12,
                            borderRadius: 12,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text
                            className="text-base"
                            style={{ color: colors.text }}
                          >
                            Other Options
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}

                {isDevnet && showOtherOptions && (
                  <View style={{ marginTop: 8 }}>
                    <TouchableOpacity
                      onPress={() => setShowOtherOptions(false)}
                      className="w-full"
                    >
                      <View
                        style={{
                          backgroundColor: isDark ? "#1F2937" : "#E5E7EB",
                          paddingVertical: 10,
                          paddingHorizontal: 12,
                          borderRadius: 12,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          className="text-base"
                          style={{ color: colors.text }}
                        >
                          Back
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
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
