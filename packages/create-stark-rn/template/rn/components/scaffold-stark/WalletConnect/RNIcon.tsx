import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Image } from "react-native";
import { SvgUri } from "react-native-svg";

export type RNIconProps = {
  iconUri?: string;
  name?: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
};

export function RNIcon({
  iconUri,
  name = "flash",
  size = 24,
  color = "#000",
}: RNIconProps) {
  if (iconUri) {
    const isSvg =
      iconUri.startsWith("data:image/svg") ||
      iconUri.toLowerCase().endsWith(".svg");
    return isSvg ? (
      <SvgUri uri={iconUri} width={size} height={size} />
    ) : (
      <Image
        source={{ uri: iconUri }}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    );
  }

  return <Ionicons name={name} size={size} color={color} />;
}

export default RNIcon;
