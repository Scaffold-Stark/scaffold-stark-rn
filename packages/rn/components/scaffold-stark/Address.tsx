import * as Clipboard from "expo-clipboard";
import { useEffect, useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { getChecksumAddress, StarkProfile } from "starknet";
import { BlockieAvatar } from "./BlockieAvatar";
import { CopyIcon } from "./icons/CopyIcon";
import { useTheme } from "./ThemeProvider";

type AddressProps = {
  address?: string;
  disableAddressLink?: boolean;
  format?: "short" | "long";
  profile?: StarkProfile;
  isLoading?: boolean;
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
};

const blockieSizeMap = {
  xs: 6,
  sm: 7,
  base: 8,
  lg: 9,
  xl: 10,
  "2xl": 12,
  "3xl": 15,
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

export default function Address({
  address,
  disableAddressLink = false,
  format = "short",
  profile,
  isLoading = false,
  size = "base",
}: AddressProps) {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [displayAddress, setDisplayAddress] = useState("");

  const checksumAddress = useMemo(() => {
    if (!address) return undefined;
    if (address.toLowerCase() === "0x") return "0x0";
    try {
      return getChecksumAddress(address);
    } catch {
      return undefined;
    }
  }, [address]);

  const isValidHexAddress = (value: string): boolean => {
    let candidate = value;
    if (candidate.toLowerCase() === "0x") candidate = "0x0";
    if (candidate.toLowerCase() === "0x0x0") return false;
    const hexAddressRegex = /^0x[0-9a-fA-F]+$/;
    return hexAddressRegex.test(candidate);
  };

  useEffect(() => {
    const addressWithFallback = checksumAddress || address || "";

    if (profile?.name) {
      setDisplayAddress(profile.name);
    } else if (format === "long") {
      setDisplayAddress(addressWithFallback || "");
    } else {
      setDisplayAddress(
        addressWithFallback.slice(0, 6) + "..." + addressWithFallback.slice(-4),
      );
    }
  }, [profile, checksumAddress, address, format]);

  const handleCopy = async () => {
    try {
      const textToCopy = checksumAddress ?? address ?? "";
      await Clipboard.setStringAsync(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  };

  // Skeleton UI
  if (isLoading) {
    return (
      <View className="flex-row items-center space-x-4">
        <View
          className="rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"
          style={{
            width: (blockieSizeMap[size] * 24) / blockieSizeMap["base"],
            height: (blockieSizeMap[size] * 24) / blockieSizeMap["base"],
          }}
        />
        <View className="h-2 w-28 bg-gray-200 dark:bg-gray-700 rounded-sm animate-pulse" />
      </View>
    );
  }

  if (!address) {
    return (
      <Text className={`${textSizeMap[size]} font-medium italic text-center`}>
        Wallet not connected
      </Text>
    );
  }

  if (!checksumAddress || !isValidHexAddress(checksumAddress)) {
    return (
      <Text
        className={`${textSizeMap[size]} font-medium text-center text-red-500`}
      >
        Invalid address format
      </Text>
    );
  }

  return (
    <View className="flex-row items-center justify-center">
      <View className="shrink-0">
        <BlockieAvatar
          address={checksumAddress}
          size={(blockieSizeMap[size] * 24) / blockieSizeMap["base"]}
        />
      </View>
      <Text className={`ml-2 ${textSizeMap[size]} font-medium`}>
        {profile?.name || displayAddress}
      </Text>
      <TouchableOpacity onPress={handleCopy} className="ml-1">
        <CopyIcon variant={theme} copied={copied} />
      </TouchableOpacity>
    </View>
  );
}
