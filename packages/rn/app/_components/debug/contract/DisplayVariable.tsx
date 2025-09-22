import {
  themeColors,
  useTheme,
} from "@/components/scaffold-stark/ThemeProvider";
import { AbiFunction } from "@/utils/scaffold-stark/contract";
import { EvilIcons } from "@expo/vector-icons";
import { Address } from "@starknet-react/chains";
import { useReadContract } from "@starknet-react/core";
import { Abi } from "abi-wan-kanabi";
import { useEffect } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { BlockNumber } from "starknet";
import { decodeContractResponse } from "./utilsDisplay";

const ETH_ADDRESS =
  "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
const STRK_ADDRESS =
  "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

const TOKEN_INFO: Record<string, { name: string; symbol: string }> = {
  [ETH_ADDRESS]: {
    name: "Ether",
    symbol: "ETH",
  },
  [STRK_ADDRESS]: {
    name: "Stark Token",
    symbol: "STRK",
  },
};

type DisplayVariableProps = {
  contractAddress: Address;
  abiFunction: AbiFunction;
  refreshDisplayVariables: boolean;
  //   inheritedFrom?: string;
  abi: Abi;
};

export const DisplayVariable = ({
  contractAddress,
  abiFunction,
  refreshDisplayVariables,
  abi, //   inheritedFrom,
}: DisplayVariableProps) => {
  const { theme } = useTheme();
  const colors = themeColors[theme];

  const isPredeployedTokenNameOrSymbol =
    (contractAddress.toLowerCase() === ETH_ADDRESS.toLowerCase() ||
      contractAddress.toLowerCase() === STRK_ADDRESS.toLowerCase()) &&
    (abiFunction.name === "name" || abiFunction.name === "symbol");

  if (isPredeployedTokenNameOrSymbol) {
    const tokenInfo =
      TOKEN_INFO[
        ETH_ADDRESS.toLowerCase() === contractAddress.toLowerCase()
          ? ETH_ADDRESS
          : STRK_ADDRESS
      ];
    const value =
      abiFunction.name === "name" ? tokenInfo.name : tokenInfo.symbol;

    return (
      <View className="pb-2">
        <View className="flex-row items-center">
          <Text style={{ color: colors.text, fontWeight: "600" }}>
            {abiFunction.name}
          </Text>
        </View>
        <View className="mt-1">
          <Text style={{ color: colors.text }}>{value}</Text>
        </View>
      </View>
    );
  }

  const {
    data: result,
    isLoading,
    isFetching,
    refetch,
    error,
    // eslint-disable-next-line react-hooks/rules-of-hooks
  } = useReadContract({
    address: contractAddress,
    functionName: abiFunction.name,
    abi: [...abi],
    blockIdentifier: "pre_confirmed" as BlockNumber, // TODO : notify when failed - add error
  });
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const showAnimation = false;

  // error logging
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (error) {
      console.error(error?.message);
      console.error(error.stack);
    }
  }, [error]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    refetch();
  }, [refetch, refreshDisplayVariables]);

  const decoded = decodeContractResponse({
    resp: result as any,
    abi,
    functionOutputs: abiFunction?.outputs,
    asText: true,
    showAsString: false,
  }) as string;

  return (
    <View className="pb-2">
      <View className="flex-row items-center justify-between">
        <Text style={{ color: colors.text, fontWeight: "600" }}>
          {abiFunction.name}
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          className="ml-2 px-2 py-1"
          disabled={isLoading && isFetching}
        >
          {!isLoading && isFetching ? (
            <ActivityIndicator size="small" color={colors.textSecondary} />
          ) : (
            <EvilIcons name="refresh" size={22} color={colors.text} />
          )}
        </TouchableOpacity>
      </View>
      <View className="mt-1">
        <Text style={{ color: colors.text }}>{decoded}</Text>
      </View>
    </View>
  );
};
