import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ViewStyle } from "react-native";
import { ScaffoldBgStripes } from "../images/ScaffoldBgStripes";
import { useTheme } from "../ThemeProvider";

interface ScaffoldBgGradientProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function ScaffoldBgGradient({
  children,
  style,
}: ScaffoldBgGradientProps) {
  // Gradient: background: linear-gradient(180deg, #4E4EDA 0%, #2F3050 100%);
  const { theme, isDark } = useTheme();
  const colors =
    theme === "light"
      ? (["#FFFFFF", "#FFFFFF"] as const)
      : (["#030206", "#020654"] as const);
  const start = { x: 0, y: 0 }; // 180deg = top to bottom
  const end = { x: 0, y: 1 }; // 180deg = top to bottom

  return (
    <LinearGradient
      colors={colors}
      start={start}
      end={end}
      style={[
        {
          flex: 1,
        },
        style,
      ]}
    >
      <Image
        source={
          isDark
            ? require("@/assets/images/background-blur-dark.png")
            : require("@/assets/images/background-blur-light.png")
        }
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          zIndex: 0,
        }}
        alt="Background Blur"
        contentFit="cover"
      />

      {/* Stripes background */}
      <ScaffoldBgStripes
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          top: -30,
          left: 0,
          zIndex: 0,
        }}
      />

      {children}
    </LinearGradient>
  );
}
