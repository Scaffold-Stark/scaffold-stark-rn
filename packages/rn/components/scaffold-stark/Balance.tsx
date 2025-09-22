import { useScaffoldReadContract } from "@/hooks/scaffold-stark/useScaffoldReadContract";
import { useAccount } from "@starknet-react/core";
import React, { useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { themeColors, useTheme } from "./ThemeProvider";

type BalanceProps = {
  address?: `0x${string}`;
  className?: string;
  usdMode?: boolean;
};

// Temporary fake price until nativeCurrencyPrice store is implemented
const FAKE_STRK_PRICE_USD = 0.11576;

export default function Balance({
  address,
  className = "",
  usdMode,
}: BalanceProps) {
  const { address: connectedAddress } = useAccount();
  const { theme } = useTheme();
  const colors = themeColors[theme];

  const targetAddress = (address || connectedAddress) as
    | `0x${string}`
    | undefined;

  const {
    data: rawBalance,
    isLoading: isLoadingBalance,
    error: balanceError,
  } = useScaffoldReadContract({
    contractName: "Strk",
    functionName: "balanceOf",
    args: [targetAddress as `0x${string}`],
    enabled: !!targetAddress,
  });

  const { data: decimals, isLoading: isLoadingDecimals } =
    useScaffoldReadContract({
      contractName: "Strk",
      functionName: "decimals",
      args: [],
      enabled: true,
    });

  const [displayUsdMode, setDisplayUsdMode] = useState(
    FAKE_STRK_PRICE_USD > 0 ? Boolean(usdMode) : false,
  );

  const toggleBalanceMode = () => {
    if (FAKE_STRK_PRICE_USD > 0) {
      setDisplayUsdMode((prev) => !prev);
    }
  };

  const formattedBalance = useMemo(() => {
    try {
      if (rawBalance === undefined || decimals === undefined) return null;
      const balanceBigInt = BigInt(
        (rawBalance as any).toString?.() ?? rawBalance,
      );
      const decimalsNum = Number((decimals as any).toString?.() ?? decimals);
      if (decimalsNum <= 0) return balanceBigInt.toString();
      const divisor = 10 ** Math.min(decimalsNum, 18);
      const asNumber = Number(balanceBigInt) / divisor;
      return asNumber.toFixed(4);
    } catch {
      return null;
    }
  }, [rawBalance, decimals]);

  const balanceInUsd = useMemo(() => {
    if (!formattedBalance) return null;
    const asFloat = parseFloat(formattedBalance);
    const usd = asFloat * FAKE_STRK_PRICE_USD;
    return usd.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [formattedBalance]);

  if (
    !targetAddress ||
    isLoadingBalance ||
    isLoadingDecimals ||
    formattedBalance === null
  ) {
    return (
      <View className="flex-row items-center">
        <View
          className="rounded-md"
          style={{ backgroundColor: colors.border, height: 24, width: 24 }}
        />
        <View
          className="ml-2 h-2 w-28 rounded-sm"
          style={{ backgroundColor: colors.border }}
        />
      </View>
    );
  }

  if (balanceError) {
    return (
      <View
        className="px-2 rounded-md"
        style={{ borderWidth: 2, borderColor: colors.border }}
      >
        <Text style={{ color: colors.textSecondary }}>Error</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      className={`items-center ${className}`}
      onPress={toggleBalanceMode}
      activeOpacity={0.7}
    >
      <View className="w-full items-center justify-center">
        {displayUsdMode && balanceInUsd !== null ? (
          <View className="flex-row">
            <Text style={{ color: colors.text, fontWeight: "700" }}>$</Text>
            <Text className="ml-1" style={{ color: colors.text }}>
              {balanceInUsd}
            </Text>
          </View>
        ) : (
          <View className="flex-row">
            <Text style={{ color: colors.text }}>{formattedBalance}</Text>
            <Text
              className="ml-1"
              style={{ color: colors.text, fontWeight: "700" }}
            >
              STRK
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
