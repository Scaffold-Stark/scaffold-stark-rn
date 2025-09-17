import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { themeColors, useTheme } from "./ThemeProvider";

interface InfoCardProps {
  icon: string;
  title: string;
  description: string;
  onPress?: () => void;
}

export function InfoCard({ icon, title, description, onPress }: InfoCardProps) {
  const { theme } = useTheme();
  const colors = themeColors[theme];

  return (
    <TouchableOpacity
      onPress={onPress}
      className="mx-4 mb-4 p-6 rounded-2xl"
      style={{
        backgroundColor: colors.cardBackground,
        borderColor:
          theme === "dark"
            ? "rgba(139, 92, 246, 0.3)"
            : "rgba(139, 92, 246, 0.2)",
        borderWidth: 1,
      }}
    >
      <View className="flex-row items-start">
        {/* Icon */}
        <View className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 items-center justify-center mr-4">
          <Text className="text-2xl">{icon}</Text>
        </View>

        {/* Content */}
        <View className="flex-1">
          <Text
            className="text-base font-medium mb-2 leading-6"
            style={{ color: colors.text }}
          >
            {title}
          </Text>
          {description && (
            <Text className="text-sm" style={{ color: colors.primary }}>
              {description}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
