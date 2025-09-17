import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, View } from "react-native";
import { themeColors, useTheme } from "./ThemeProvider";

interface WelcomeSectionProps {
  title?: string;
  subtitle?: string;
  contractPath?: string;
}

export function WelcomeSection({
  title = "Welcome to",
  subtitle = "Scaffold-Stark 2",
  contractPath = "YourContract.cairo in packages/snfoundry/contracts/src",
}: WelcomeSectionProps) {
  const { theme } = useTheme();
  const colors = themeColors[theme];

  return (
    <LinearGradient
      colors={[colors.gradientStart, colors.gradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1 items-center justify-center px-6 py-8"
    >
      {/* Home Icon */}
      <View className="w-20 h-20 bg-white bg-opacity-20 rounded-full items-center justify-center mb-8">
        <View className="w-12 h-12 bg-white rounded-xl items-center justify-center">
          <View className="w-6 h-6 border-2 border-purple-600">
            <View className="w-full h-2 bg-purple-600 mt-1" />
            <View className="flex-row justify-center mt-0.5">
              <View className="w-1.5 h-2 bg-purple-600" />
            </View>
          </View>
        </View>
      </View>

      {/* Welcome Text */}
      <Text className="text-white text-4xl font-light text-center mb-2">
        {title}
      </Text>
      <Text className="text-purple-200 text-4xl font-bold text-center mb-8">
        {subtitle}
      </Text>

      {/* Contract Info */}
      <Text className="text-white text-lg font-medium mb-2">
        Edit your smart contract :
      </Text>
      <Text className="text-white text-base text-center opacity-80 italic">
        {contractPath}
      </Text>
    </LinearGradient>
  );
}
