import Ionicons from "@expo/vector-icons/Ionicons";
import { useDisconnect } from "@starknet-react/core";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  themeColors,
  useTheme,
} from "../../components/scaffold-stark/ThemeProvider";

interface ConnectedWalletMenuProps {
  address?: string;
}

export function ConnectedWalletMenu({ address }: ConnectedWalletMenuProps) {
  const { theme, isDark } = useTheme();
  const colors = themeColors[theme];
  const insets = useSafeAreaInsets();

  const { disconnect } = useDisconnect();

  const menuItems = [
    {
      icon: "search-outline",
      title: "Block Explorer",
      status: "Coming soon",
      onPress: () => {},
    },
    {
      icon: "settings-outline",
      title: "Configure Contracts",
      status: "Coming soon",
      onPress: () => {},
    },
    {
      icon: "cash-outline",
      title: "Faucet",
      status: "Coming soon",
      onPress: () => {},
    },
  ];

  return (
    <View
      className="flex-1 px-4"
      style={{
        marginBottom: insets.bottom + 72,
      }}
    >
      {/* Main Container with #000000B8 background */}
      <View
        className="rounded-2xl p-4 flex-1 flex-col gap-1 justify-between"
        style={{
          backgroundColor: isDark ? "#000000B8" : "#FFFFFFB8",
        }}
      >
        <View>
          {/* Menu Items */}
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={item.onPress}
              className="mb-3"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              <LinearGradient
                colors={
                  isDark ? ["#2A3655", "#5C92BB"] : ["#FFFFFF", "#FFFFFF"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 9999,
                  borderWidth: isDark ? 1 : 0,
                  borderColor: isDark ? "#696969" : "#FFFFFF",
                  borderStyle: "solid",
                }}
              >
                <View className="w-[18px] h-[18px] items-center justify-center mr-1">
                  <Ionicons
                    name={item.icon as any}
                    size={16}
                    color={isDark ? "white" : "#747474"}
                  />
                </View>
                <View className="flex-1">
                  <Text style={{ color: colors.text }}>{item.title}</Text>
                </View>
                <Text
                  className="italic font-medium"
                  style={{ color: isDark ? "#A7ECFF" : "#656565" }}
                >
                  <Text style={{ color: "#4DB4FF" }}>[</Text>
                  <Text>{item.status}</Text>
                  <Text style={{ color: "#4DB4FF" }}>]</Text>
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Disconnect Button */}
        {address && (
          <View
            style={{
              // Second, softer shadow layer: 0 2px 4px -2px rgba(0,0,0,0.10)
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
              borderRadius: 9999,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                disconnect();
              }}
              className="flex-row items-center justify-center px-3 py-2.5 rounded-full"
              style={{
                backgroundColor: "#FF0000",
                // Primary shadow layer: 0 4px 6px -1px rgba(0,0,0,0.10)
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
          </View>
        )}
      </View>
    </View>
  );
}

export default ConnectedWalletMenu;
