import {
  themeColors,
  useTheme,
} from "@/components/scaffold-stark/ThemeProvider";
import { Tabs } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const colors = themeColors[theme];

  return (
    <View
      className="absolute left-0 right-0"
      style={{ bottom: Math.max(insets.bottom, 8) }}
      pointerEvents="box-none"
    >
      <View
        className="mx-3 flex-row items-center justify-around py-3 px-2 rounded-full"
        style={{
          backgroundColor: colors.background,
          zIndex: 20,
          shadowColor: "#000",
          shadowOpacity: 0.12,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        }}
      >
        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              className={`px-6 py-3 rounded-full ${isFocused ? "bg-purple-600" : ""}`}
              style={isFocused ? { backgroundColor: colors.primary } : {}}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
            >
              <Text
                className={`text-base font-semibold ${isFocused ? "text-white" : ""}`}
                style={!isFocused ? { color: colors.textSecondary } : {}}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: "shift",
        sceneStyle: {
          backgroundColor: "transparent",
        },
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="hooks" options={{ title: "Debug" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}
