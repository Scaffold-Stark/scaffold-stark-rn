import { blo } from "blo";
import { View } from "react-native";
import { SvgUri } from "react-native-svg";

interface BlockieAvatarProps {
  address: string;
  size: number;
}

// Custom Avatar for RainbowKit
export const BlockieAvatar = ({ address, size }: BlockieAvatarProps) => {
  const avatarSrc = blo(address as `0x${string}`);

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: "hidden",
      }}
    >
      <SvgUri uri={avatarSrc} width="100%" height="100%" />
    </View>
  );
};
