import { StarkIcon } from "@/components/scaffold-stark/icons/StarkIcon";
import {
  themeColors,
  useTheme,
} from "@/components/scaffold-stark/ThemeProvider";
import React from "react";
import { ScrollView, StatusBar, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DebugContracts } from "../_components/debug/DebugContracts";
import Footer from "../_components/Footer";

export default function Debug() {
  const { theme, isDark } = useTheme();
  const colors = themeColors[theme];
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1">
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 72,
          paddingHorizontal: 16,
        }}
      >
        {/* Stark Logo */}
        <View className="items-center justify-center mt-8">
          <View
            className="rounded-full items-center justify-center mb-8 p-3"
            style={{
              backgroundColor: isDark
                ? colors.primary + "25"
                : "#ffffff" + "25",
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
              <StarkIcon />
            </View>
          </View>
        </View>

        <DebugContracts />

        <Footer />
      </ScrollView>
    </View>
  );
}
