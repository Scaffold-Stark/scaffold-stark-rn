import { CopyIcon } from "@/components/scaffold-stark/icons/CopyIcon";
import {
  themeColors,
  useTheme,
} from "@/components/scaffold-stark/ThemeProvider";
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

  return (
    <View
      className="flex-row items-start rounded"
      style={{ backgroundColor: colors.backgroundSecondary }}
    >
      <TouchableOpacity onPress={handleCopy} className="p-2">
        <CopyIcon variant={theme} copied={txResultCopied} />
      </TouchableOpacity>
      <View className="flex-1 p-2">
        <Text style={{ color: colors.text, fontWeight: "700" }}>
          Transaction Receipt
        </Text>
        <Text className="pt-2" style={{ color: colors.textSecondary }}>
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
    </View>
  );
};
