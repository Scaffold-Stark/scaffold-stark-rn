import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ViewStyle } from "react-native";
import { useTheme } from "../ThemeProvider";

interface ScaffoldBtnGradientProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function ScaffoldBtnGradient({
  children,
  style,
}: ScaffoldBtnGradientProps) {
  const { isDark } = useTheme();

  // Dark mode: linear-gradient(180deg, #3457D1 0%, #8A45FC 100%)
  // Light mode: linear-gradient(270deg, #A7ECFF -17.42%, #E8B6FF 109.05%)
  const colors = isDark
    ? (["#3457D1", "#8A45FC"] as const)
    : (["#A7ECFF", "#E8B6FF"] as const);
  const start = isDark ? { x: 0, y: 0 } : { x: 1, y: 0 }; // 270deg = right to left
  const end = isDark ? { x: 0, y: 1 } : { x: 0, y: 0 }; // 180deg = top to bottom, 270deg = right to left

  return (
    <LinearGradient
      colors={colors}
      start={start}
      end={end}
      style={[
        {
          borderRadius: 9999, // equivalent to rounded-full
          paddingHorizontal: 24, // equivalent to px-6
          paddingVertical: 12, // equivalent to py-3
        },
        style,
      ]}
    >
      {children}
    </LinearGradient>
  );
}
