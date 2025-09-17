import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { themeColors, useTheme } from "./ThemeProvider";

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
}

interface BottomNavigationProps {
  activeTab?: string;
  onTabPress?: (tabId: string) => void;
}

const navigationItems: NavigationItem[] = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "debug", label: "Debug", icon: "🐛" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

export function BottomNavigation({
  activeTab = "home",
  onTabPress,
}: BottomNavigationProps) {
  const { theme } = useTheme();
  const colors = themeColors[theme];

  return (
    <View
      className="flex-row items-center justify-around py-4 px-6 rounded-t-3xl"
      style={{ backgroundColor: colors.cardBackground }}
    >
      {navigationItems.map((item) => {
        const isActive = item.id === activeTab;

        return (
          <TouchableOpacity
            key={item.id}
            onPress={() => onTabPress?.(item.id)}
            className={`px-6 py-3 rounded-full ${isActive ? "bg-purple-600" : ""}`}
            style={isActive ? { backgroundColor: colors.primary } : {}}
          >
            <Text
              className={`text-base font-semibold ${isActive ? "text-white" : ""}`}
              style={!isActive ? { color: colors.textSecondary } : {}}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
