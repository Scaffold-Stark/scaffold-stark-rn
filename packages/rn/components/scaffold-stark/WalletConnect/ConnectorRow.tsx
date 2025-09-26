import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export interface ConnectorRowProps {
  title: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  containerBg: string;
  textColor: string;
  onPress: () => void;
  disabled?: boolean;
}

export function ConnectorRow({
  title,
  iconName,
  iconBg,
  iconColor,
  containerBg,
  textColor,
  onPress,
  disabled,
}: ConnectorRowProps) {
  const Container = (
    <View
      style={{
        backgroundColor: containerBg,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 18,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <View
        className="w-8 h-8 rounded-full items-center justify-center mr-4"
        style={{ backgroundColor: iconBg }}
      >
        <Ionicons name={iconName} size={24} color={iconColor} />
      </View>
      <Text className="text-lg" style={{ color: textColor }}>
        {title}
      </Text>
    </View>
  );

  return disabled ? (
    <TouchableOpacity disabled className="w-full">
      {Container}
    </TouchableOpacity>
  ) : (
    <TouchableOpacity onPress={onPress} className="w-full">
      {Container}
    </TouchableOpacity>
  );
}

export default ConnectorRow;
