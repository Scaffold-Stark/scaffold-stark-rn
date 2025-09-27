import { CopyIcon } from "@/components/scaffold-stark/icons/CopyIcon";
import {
  themeColors,
  useTheme,
} from "@/components/scaffold-stark/ThemeProvider";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { InvokeTransactionReceiptResponse } from "starknet";
import { decodeContractResponse } from "./utilsDisplay";

export const TxReceipt = (
  txResult:
    | string
    | number
    | bigint
    | Record<string, any>
    | InvokeTransactionReceiptResponse
    | undefined,
) => {
  const [txResultCopied, setTxResultCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme } = useTheme();
  const colors = themeColors[theme];

  const textToCopy = decodeContractResponse({
    resp: txResult as any,
    abi: [] as any,
    functionOutputs: [],
    asText: true,
    showAsString: true,
  }) as string;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(textToCopy || "");
    setTxResultCopied(true);
    setTimeout(() => setTxResultCopied(false), 800);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <View
      className="rounded"
      style={{ backgroundColor: colors.backgroundSecondary }}
    >
      {/* Header with title and controls */}
      <View className="flex-row items-center justify-between p-2">
        <Text style={{ color: colors.text, fontWeight: "700" }}>
          Transaction Receipt
        </Text>
        <View className="flex-row items-center">
          <TouchableOpacity onPress={handleCopy} className="p-1 mr-2">
            <CopyIcon variant={theme} copied={txResultCopied} />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleExpanded} className="p-1">
            <Ionicons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {isExpanded && (
        <View className="px-2 pb-2">
          <Text style={{ color: colors.textSecondary }}>
            {
              decodeContractResponse({
                resp: txResult as any,
                abi: [] as any,
                functionOutputs: [],
                asText: true,
              }) as string
            }
          </Text>
        </View>
      )}
    </View>
  );
};

export default TxReceipt;
