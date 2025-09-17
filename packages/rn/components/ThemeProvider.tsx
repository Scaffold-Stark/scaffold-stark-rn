import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

export type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>(systemColorScheme || "light");

  useEffect(() => {
    if (systemColorScheme) {
      setTheme(systemColorScheme);
    }
  }, [systemColorScheme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const isDark = theme === "dark";

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export const themeColors = {
  light: {
    primary: "#8B5CF6", // Purple
    primaryLight: "#A78BFA",
    background: "#FFFFFF",
    backgroundSecondary: "#F8FAFC",
    text: "#1F2937",
    textSecondary: "#6B7280",
    border: "#E5E7EB",
    cardBackground: "rgba(255, 255, 255, 0.9)",
    gradientStart: "#A855F7", // Lighter purple for light mode
    gradientEnd: "#EC4899", // Pink
    themeButton: "#0C0C4F",
  },
  dark: {
    primary: "#8B5CF6", // Purple
    primaryLight: "#A78BFA",
    background: "#111827", // Darker background
    backgroundSecondary: "#1F2937",
    text: "#FFFFFF",
    textSecondary: "#D1D5DB",
    border: "#374151",
    cardBackground: "rgba(31, 41, 55, 0.9)",
    gradientStart: "#4C1D95", // Dark purple
    gradientEnd: "#7C3AED", // Darker purple
    themeButton: "#8B5CF6",
  },
};
