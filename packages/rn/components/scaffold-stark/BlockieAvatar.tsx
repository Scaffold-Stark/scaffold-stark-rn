import { blo } from "blo";
import { useEffect, useState } from "react";
import { Image, View } from "react-native";
import { SvgUri } from "react-native-svg";

interface BlockieAvatarProps {
  address: string;
  ensImage?: string | null;
  size: number;
}

// Custom Avatar for RainbowKit
export const BlockieAvatar = ({
  address,
  ensImage,
  size,
}: BlockieAvatarProps) => {
  const [avatarSrc, setAvatarSrc] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (ensImage) {
      setAvatarSrc(ensImage);
      setIsLoading(false);
    } else {
      const avatarUrl = blo(address as `0x${string}`);
      setAvatarSrc(avatarUrl);
      setIsLoading(false);
    }
  }, [address, ensImage]);

  if (isLoading) {
    return (
      <View
        className="bg-gray-200 dark:bg-gray-700"
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }

  const isDataUri = avatarSrc.startsWith("data:");
  const isLikelySvg = isDataUri && avatarSrc.includes("image/svg");

  if (ensImage) {
    return (
      <Image
        source={{ uri: avatarSrc }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }

  if (isLikelySvg) {
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
  }

  return (
    <Image
      source={{ uri: avatarSrc }}
      style={{ width: size, height: size, borderRadius: size / 2 }}
    />
  );
};
