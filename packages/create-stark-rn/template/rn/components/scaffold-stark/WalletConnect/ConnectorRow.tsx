import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { RNIcon } from "./RNIcon";

export interface ConnectorRowProps {
  title: string;
  iconUri?: string;
  iconBg: string;
  iconColor: string;
  containerBg: string;
  textColor: string;
  onPress: () => void;
  disabled?: boolean;
}

export function ConnectorRow({
  title,
  iconUri,
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
        style={{ backgroundColor: iconBg, overflow: "hidden" }}
      >
        <RNIcon iconUri={iconUri} name="flash" size={28} color={iconColor} />
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
