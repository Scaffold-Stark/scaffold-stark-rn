import * as Clipboard from "expo-clipboard";
import { useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { CopyIcon } from "./icons/CopyIcon";
import { themeColors, useTheme } from "./ThemeProvider";

type ClassHashProps = {
  classHash?: string;
  format?: "short" | "long";
  isLoading?: boolean;
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
  className?: string;
};

const textSizeMap = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
};

export default function ClassHash({
  classHash,
  format = "short",
  isLoading = false,
  size = "xs",
  className = "",
}: ClassHashProps) {
  const { theme, isDark } = useTheme();
  const [copied, setCopied] = useState(false);
  const colors = themeColors[theme];

  const display = useMemo(() => {
    if (!classHash) return "";
    if (format === "long") return classHash;
    return classHash.slice(0, 6) + "..." + classHash.slice(-4);
  }, [classHash, format]);

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(classHash || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 800);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-row items-center">
        <Text
          className={`${textSizeMap[size]} font-normal`}
          style={{ color: colors.textHighlight }}
        >
          Class Hash:
        </Text>
        <View className="ml-1.5 h-3 w-28 bg-gray-200 dark:bg-gray-700 rounded-sm animate-pulse" />
      </View>
    );
  }

  if (!classHash) {
    return (
      <Text
        className={`${textSizeMap[size]} font-normal italic`}
        style={{ color: colors.textHighlight }}
      >
        Class Hash: —
      </Text>
    );
  }

  return (
    <View className={`flex-row items-center ${className}`}>
      <Text
        className={`${textSizeMap[size]} font-normal`}
        style={{ color: colors.textHighlight }}
      >
        Class Hash:
      </Text>
      <Text
        className={`ml-1.5 ${textSizeMap[size]} font-normal ${isDark ? "text-white" : "text-black"}`}
      >
        {display}
      </Text>
      <TouchableOpacity onPress={handleCopy} className="ml-1.5">
        <CopyIcon variant={theme} copied={copied} />
      </TouchableOpacity>
    </View>
  );
}
