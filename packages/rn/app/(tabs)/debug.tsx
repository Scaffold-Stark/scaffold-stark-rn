import Address from "@/components/scaffold-stark/Address";
import Balance from "@/components/scaffold-stark/Balance";
import ClassHash from "@/components/scaffold-stark/ClassHash";
import { DollarIcon } from "@/components/scaffold-stark/icons/DollarIcon";
import { StarkIcon } from "@/components/scaffold-stark/icons/StarkIcon";
import {
  themeColors,
  useTheme,
} from "@/components/scaffold-stark/ThemeProvider";
import { useDeployedContractInfo } from "@/hooks/scaffold-stark/useDeployedContractInfo";
import { useScaffoldEventHistory } from "@/hooks/scaffold-stark/useScaffoldEventHistory";
import { useScaffoldMultiWriteContract } from "@/hooks/scaffold-stark/useScaffoldMultiWriteContract";
import { useScaffoldReadContract } from "@/hooks/scaffold-stark/useScaffoldReadContract";
import { useScaffoldWriteContract } from "@/hooks/scaffold-stark/useScaffoldWriteContract";
import { useTargetNetwork } from "@/hooks/scaffold-stark/useTargetNetwork";
import { useAccount } from "@starknet-react/core";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CairoOption, CairoOptionVariant } from "starknet";

export default function Debug() {
  const { address } = useAccount();
  const { theme, isDark } = useTheme();
  const colors = themeColors[theme];
  const insets = useSafeAreaInsets();

  const yourContractInfo = useDeployedContractInfo("YourContract");
  const strkContractInfo = useDeployedContractInfo("Strk");
  const { targetNetwork } = useTargetNetwork();

  const { data: greeting, isLoading: isLoadingGreeting } =
    useScaffoldReadContract({
      contractName: "YourContract",
      functionName: "greeting",
      args: [],
      enabled: true,
    });

  const { data: allowance, isLoading: isLoadingAllowance } =
    useScaffoldReadContract({
      contractName: "Strk",
      functionName: "allowance",
      args: [yourContractInfo?.data?.address, address as `0x${string}`],
      enabled: !!address && !!yourContractInfo?.data?.address,
    });

  const [newGreeting, setNewGreeting] = useState("");
  const [tipAmount, setTipAmount] = useState<string>("");
  const tipAmountBigInt = useMemo(() => {
    try {
      if (!tipAmount) return 0n;
      if (tipAmount.startsWith("0x")) return BigInt(tipAmount);
      return BigInt(tipAmount);
    } catch {
      return 0n;
    }
  }, [tipAmount]);

  const { sendAsync: sendSetGreeting, isPending: isSetting } =
    useScaffoldWriteContract({
      contractName: "YourContract",
      functionName: "set_greeting",
      args: [newGreeting || "", new CairoOption(CairoOptionVariant.None, 0n)],
    });

  const { sendAsync: sendMultiWrite, isPending: isMultiPending } =
    useScaffoldMultiWriteContract({
      calls: [
        {
          contractName: "Strk",
          functionName: "approve",
          args: [yourContractInfo?.data?.address, tipAmountBigInt],
        },
        {
          contractName: "YourContract",
          functionName: "set_greeting",
          args: [
            newGreeting || "",
            new CairoOption(
              tipAmountBigInt > 0n
                ? CairoOptionVariant.Some
                : CairoOptionVariant.None,
              tipAmountBigInt,
            ),
          ],
        },
      ],
    });

  const { data: events, isLoading: isLoadingEvents } = useScaffoldEventHistory({
    contractName: "YourContract",
    eventName: "GreetingChanged",
    fromBlock: 0n,
    enabled: true,
  });

  const disabledWrite =
    !address || !yourContractInfo?.data?.address || isSetting;
  const disabledMulti =
    !address ||
    !yourContractInfo?.data?.address ||
    isMultiPending ||
    tipAmountBigInt < 0n;

  return (
    <View className="flex-1">
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 72,
          paddingHorizontal: 16,
        }}
      >
        {/* Stark Logo */}
        <View className="items-center justify-center mt-8">
          <View
            className="rounded-full items-center justify-center mb-8 p-3"
            style={{
              backgroundColor: isDark
                ? colors.primary + "25"
                : "#ffffff" + "25",
            }}
          >
            <View
              className="rounded-full items-center justify-center p-4"
              style={{
                backgroundColor: isDark
                  ? colors.primaryLight + "50"
                  : "#ffffff" + "50",
              }}
            >
              <StarkIcon />
            </View>
          </View>
        </View>

        {/* Info Card */}
        <View
          className="pb-4 rounded-[20px]"
          style={{
            backgroundColor: colors.cardBackground,
            borderWidth: 1,
            borderColor: "#5C4FE5",
          }}
        >
          <View
            className="flex-row items-center justify-between px-4 py-3 rounded-t-[20px]"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            <Text className="font-bold" style={{ color: colors.text }}>
              STRK
            </Text>
            <View
              className="px-3 py-2 rounded-full flex-row items-center"
              style={{
                borderWidth: 1,
                borderColor: isDark ? "#32BAC4" : "#B248DD",
                backgroundColor: isDark ? "#2A3655" : "#FFFFFF",
              }}
            >
              <DollarIcon variant={isDark ? "dark" : "light"} />
              <Text className="ml-1" style={{ color: colors.textSecondary }}>
                0.11576
              </Text>
            </View>
          </View>
          <View className="px-4 py-4">
            <View className="flex-row items-center">
              <Address address={strkContractInfo?.data?.address} size="base" />
            </View>
            <View className="mt-3">
              <ClassHash
                classHash={strkContractInfo?.data?.classHash as string}
                size="base"
              />
            </View>
            <View className="mt-3 flex-row items-center h-5">
              <Text style={{ color: colors.textHighlight }}>Balance:</Text>
              <View className="ml-2">
                <Balance className="px-0" />
              </View>
            </View>

            {targetNetwork ? (
              <View className="mt-3">
                <Text style={{ color: colors.textHighlight }}>
                  Network: {targetNetwork.name}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <View className="gap-y-4">
          <Text
            className="text-xl font-semibold"
            style={{ color: colors.text }}
          >
            Debug Contracts
          </Text>

          <View
            className="rounded-xl p-4"
            style={{ backgroundColor: colors.cardBackground }}
          >
            <Text
              className="text-base mb-2"
              style={{ color: colors.textSecondary }}
            >
              Contract
            </Text>
            <Text selectable style={{ color: colors.text }}>
              {yourContractInfo?.data?.address ?? "—"}
            </Text>
          </View>

          <View
            className="rounded-xl p-4"
            style={{ backgroundColor: colors.cardBackground }}
          >
            <Text
              className="text-base mb-2"
              style={{ color: colors.textSecondary }}
            >
              Current greeting
            </Text>
            {isLoadingGreeting ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={{ color: colors.text }}>
                {greeting?.toString() ?? "—"}
              </Text>
            )}
          </View>

          <View
            className="rounded-xl p-4"
            style={{ backgroundColor: colors.cardBackground }}
          >
            <Text
              className="text-base mb-2"
              style={{ color: colors.textSecondary }}
            >
              STRK allowance to contract
            </Text>
            {isLoadingAllowance ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={{ color: colors.text }}>
                {allowance?.toString() ?? "—"}
              </Text>
            )}
          </View>

          <View
            className="rounded-xl p-4 gap-y-3"
            style={{ backgroundColor: colors.cardBackground }}
          >
            <Text className="text-base" style={{ color: colors.textSecondary }}>
              Set greeting
            </Text>
            <TextInput
              value={newGreeting}
              onChangeText={setNewGreeting}
              placeholder="Enter new greeting"
              placeholderTextColor={colors.textSecondary}
              className="rounded-lg px-3 py-2"
              style={{
                backgroundColor: colors.backgroundSecondary,
                color: colors.text,
              }}
            />
            <TouchableOpacity
              disabled={disabledWrite}
              onPress={() => sendSetGreeting()}
              className="rounded-lg items-center justify-center py-3"
              style={{
                backgroundColor: disabledWrite ? colors.border : colors.primary,
              }}
            >
              {isSetting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={{ color: "#ffffff", fontWeight: "600" }}>
                  Send
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View
            className="rounded-xl p-4 gap-y-3"
            style={{ backgroundColor: colors.cardBackground }}
          >
            <Text className="text-base" style={{ color: colors.textSecondary }}>
              Approve STRK + Set greeting
            </Text>
            <TextInput
              value={tipAmount}
              onChangeText={setTipAmount}
              placeholder="Approval amount (wei)"
              keyboardType="numeric"
              placeholderTextColor={colors.textSecondary}
              className="rounded-lg px-3 py-2"
              style={{
                backgroundColor: colors.backgroundSecondary,
                color: colors.text,
              }}
            />
            <TouchableOpacity
              disabled={disabledMulti}
              onPress={() => sendMultiWrite()}
              className="rounded-lg items-center justify-center py-3"
              style={{
                backgroundColor: disabledMulti ? colors.border : colors.primary,
              }}
            >
              {isMultiPending ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={{ color: "#ffffff", fontWeight: "600" }}>
                  Send Multi
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View
            className="rounded-xl p-4"
            style={{ backgroundColor: colors.cardBackground }}
          >
            <Text
              className="text-base mb-2"
              style={{ color: colors.textSecondary }}
            >
              Events
            </Text>
            {isLoadingEvents ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <View className="gap-y-2">
                {events?.length ? (
                  events.map((ev, idx) => (
                    <Text key={idx} style={{ color: colors.text }}>
                      {ev.args?.new_greeting?.toString?.() ?? "—"}
                    </Text>
                  ))
                ) : (
                  <Text style={{ color: colors.textSecondary }}>No events</Text>
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
