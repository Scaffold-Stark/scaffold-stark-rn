import { useTargetNetwork } from "@/hooks/scaffold-stark/useTargetNetwork";
import { appToast } from "@/utils/scaffold-stark/toast";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { burnerAccounts, BurnerConnector } from "@scaffold-stark/stark-burner";
import {
  Connector,
  useAccount,
  useConnect,
  useDisconnect,
} from "@starknet-react/core";
import * as Clipboard from "expo-clipboard";
import React, { useMemo, useState } from "react";
import { Dimensions, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { themeColors, useTheme } from "../ThemeProvider";
import { CopyIcon } from "../icons/CopyIcon";
import { ConnectorRow } from "./ConnectorRow";
import { RNIcon } from "./RNIcon";
// Svg rendering handled in ConnectorRow; keep connected card simple

interface WalletConnectModalProps {
  sheetRef: React.RefObject<BottomSheetModal>;
  onClose?: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.6;

export function WalletConnectModal({
  sheetRef,
  onClose,
}: WalletConnectModalProps) {
  const { theme, isDark } = useTheme();
  const colors = themeColors[theme];
  const insets = useSafeAreaInsets();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [copied, setCopied] = useState(false);
  const [isBurnerWallet, setIsBurnerWallet] = useState(false);
  const [showOtherOptions, setShowOtherOptions] = useState(false);
  const { targetNetwork } = useTargetNetwork();
  const {
    address: walletAddress,
    isConnected: isWalletConnected,
    connector: connectedConnector,
  } = useAccount();
  const isDevnet = targetNetwork.network === "devnet";

  const { mainConnectors, otherConnectors } = useMemo(() => {
    const burnerConn = connectors.filter((c) => c.id === "burner-wallet");
    const others = connectors.filter((c) => c.id !== "burner-wallet");

    if (!isDevnet) {
      return {
        mainConnectors: others,
        otherConnectors: [] as typeof connectors,
      };
    }

    return {
      mainConnectors: [...burnerConn],
      otherConnectors: others,
    };
  }, [connectors, isDevnet]);

  const handleConnectWallet = (connector: Connector) => {
    if (connector.id === "burner-wallet") {
      setIsBurnerWallet(true);
      return;
    }

    try {
      connect({ connector });
    } catch (error) {
      if (connector.id === "ready-mobile") {
        appToast.showPersistentInfo(
          "Connecting to Ready...",
          "If Ready doesn't open, install it and try again.",
          { position: "top" },
        );
      }
      console.error("Failed to connect wallet:", error);
    } finally {
      onClose && onClose();
    }
  };

  const handleConnectBurner = (ix: number) => {
    const connector = connectors.find((it) => it.id === "burner-wallet");
    if (connector && connector instanceof BurnerConnector) {
      connector.burnerAccount = burnerAccounts[ix];
      connect({ connector });
      onClose && onClose();
    }
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

  const handleSheetChange = (index: number) => {
    setIsBurnerWallet(false);
    setShowOtherOptions(false);
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={["85%"]}
      onDismiss={onClose}
      onChange={handleSheetChange}
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
            {isWalletConnected
              ? "Wallet connected"
              : isBurnerWallet
                ? "Choose account"
                : showOtherOptions
                  ? "Other Wallet Options"
                  : "Connect a wallet"}
          </Text>
          <Text
            className="text-sm mt-1"
            style={{ color: colors.textSecondary }}
          >
            {"Get ready by connecting your wallet you preferred wallet below"}
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
                    style={{ backgroundColor: isDark ? "#2C2C2C" : "#F4F4F4" }}
                  >
                    <RNIcon
                      iconUri={(connectedConnector?.icon as any)?.[theme]}
                      name="flash"
                      size={24}
                      color="#FFFFFF"
                    />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="font-semibold"
                      style={{ color: colors.text }}
                    >
                      {connectedConnector?.name}
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
              {!isBurnerWallet ? (
                !showOtherOptions ? (
                  <>
                    {mainConnectors.map((connector) => (
                      <View
                        key={connector.id || connector.name}
                        style={{ marginTop: 6 }}
                      >
                        <ConnectorRow
                          title={connector.name}
                          iconUri={(connector.icon as any)[theme]}
                          iconBg={
                            connector.id === "burner-wallet"
                              ? "#3B82F6"
                              : "#FFFFFF"
                          }
                          iconColor={
                            connector.id === "burner-wallet"
                              ? "#FFFFFF"
                              : "#F97316"
                          }
                          containerBg={isDark ? "#2C2C2C" : "#F4F4F4"}
                          textColor={colors.text}
                          onPress={() => handleConnectWallet(connector)}
                        />
                      </View>
                    ))}
                    {isDevnet && otherConnectors.length > 0 && (
                      <TouchableOpacity
                        className="w-full py-3 rounded-xl items-center mt-2"
                        onPress={() => setShowOtherOptions(true)}
                        style={{
                          backgroundColor: isDark ? "#2C2C2C" : "#F4F4F4",
                        }}
                      >
                        <Text style={{ color: colors.text }}>
                          Other Options
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <>
                    {otherConnectors.map((connector) => (
                      <View
                        key={connector.id || connector.name}
                        style={{ marginTop: 6 }}
                      >
                        <ConnectorRow
                          title={connector.name}
                          iconUri={(connector.icon as any)[theme]}
                          iconBg="#FFFFFF"
                          iconColor="#F97316"
                          containerBg={isDark ? "#2C2C2C" : "#F4F4F4"}
                          textColor={colors.text}
                          onPress={() => handleConnectWallet(connector)}
                        />
                      </View>
                    ))}
                    <TouchableOpacity
                      className="w-full py-3 rounded-xl items-center mt-2"
                      onPress={() => setShowOtherOptions(false)}
                      style={{
                        backgroundColor: isDark ? "#2C2C2C" : "#F4F4F4",
                      }}
                    >
                      <Text style={{ color: colors.text }}>Back</Text>
                    </TouchableOpacity>
                  </>
                )
              ) : isBurnerWallet ? (
                <View className="space-y-4">
                  <View
                    style={{
                      backgroundColor: isDark ? "#2A2A2A" : "#F9FAFB",
                      borderWidth: 1,
                      borderColor: isDark ? "#404040" : "#E5E7EB",
                      borderRadius: 12,
                      padding: 12,
                    }}
                  >
                    {burnerAccounts.map((burnerAcc, ix) => (
                      <View
                        key={burnerAcc.publicKey}
                        style={{ marginBottom: 8 }}
                      >
                        <TouchableOpacity
                          onPress={() => handleConnectBurner(ix)}
                          style={{
                            borderRadius: 10,
                            paddingVertical: 8,
                            paddingHorizontal: 10,
                            flexDirection: "row",
                            alignItems: "center",
                            borderWidth: isDark ? 1 : 0,
                            borderColor: isDark ? "#385183" : "transparent",
                          }}
                        >
                          <View
                            className="w-8 h-8 rounded-full items-center justify-center mr-4"
                            style={{
                              backgroundColor: isDark ? "#4DB4FF" : "#3B82F6",
                            }}
                          >
                            <Ionicons
                              name="wallet-outline"
                              size={18}
                              color="white"
                            />
                          </View>
                          <Text style={{ color: colors.text }}>
                            {`${burnerAcc.accountAddress.slice(0, 6)}...${burnerAcc.accountAddress.slice(-4)}`}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}
            </View>
          )}
        </View>
        {/* Bottom spacer to ensure content clears the handle & home indicator */}
        <View style={{ height: insets.bottom }} />
      </BottomSheetView>
    </BottomSheetModal>
  );
}
