import { ContractUI } from "@/app/_components/debug/contract";
import {
  themeColors,
  useTheme,
} from "@/components/scaffold-stark/ThemeProvider";
import { useTargetNetwork } from "@/hooks/scaffold-stark/useTargetNetwork";
import { ContractName, contracts } from "@/utils/scaffold-stark/contract";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export function DebugContracts() {
  const { theme } = useTheme();
  const colors = themeColors[theme];
  const { targetNetwork } = useTargetNetwork();

  const contractNames: ContractName[] = useMemo(() => {
    const byNetwork = contracts?.[targetNetwork.network] || {};
    return Object.keys(byNetwork) as ContractName[];
  }, [targetNetwork.network]);

  const [selectedContract, setSelectedContract] = useState<
    ContractName | undefined
  >(contractNames[0]);

  useEffect(() => {
    if (!selectedContract || !contractNames.includes(selectedContract)) {
      setSelectedContract(contractNames[0]);
    }
  }, [contractNames, selectedContract]);

  if (!contractNames.length) {
    return (
      <View className="items-center justify-center py-8">
        <Text style={{ color: colors.textSecondary, fontSize: 18 }}>
          No contracts found!
        </Text>
      </View>
    );
  }

  return (
    <View className="py-6">
      {contractNames.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-3"
        >
          <View className="flex-row gap-2 px-2">
            {contractNames.map((name) => {
              const isActive = name === selectedContract;
              return (
                <TouchableOpacity
                  key={name}
                  onPress={() => setSelectedContract(name)}
                  className="px-3 py-2 rounded-full"
                  style={{
                    backgroundColor: isActive ? colors.primary : "transparent",
                    borderWidth: 1,
                    borderColor: colors.primary,
                  }}
                >
                  <Text style={{ color: isActive ? "#ffffff" : colors.text }}>
                    {name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}

      {contractNames.map((name) => (
        <View
          key={name}
          style={{ display: name === selectedContract ? "flex" : "none" }}
        >
          <ContractUI contractName={name} />
        </View>
      ))}
    </View>
  );
}

export default DebugContracts;
