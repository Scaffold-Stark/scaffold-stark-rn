// @refresh reset
import Address from "@/components/scaffold-stark/Address";
import Balance from "@/components/scaffold-stark/Balance";
import ClassHash from "@/components/scaffold-stark/ClassHash";
import { DollarIcon } from "@/components/scaffold-stark/icons/DollarIcon";
import {
  themeColors,
  useTheme,
} from "@/components/scaffold-stark/ThemeProvider";
import { useDeployedContractInfo } from "@/hooks/scaffold-stark/useDeployedContractInfo";
import { useTargetNetwork } from "@/hooks/scaffold-stark/useTargetNetwork";
import {
  ContractCodeStatus,
  ContractName,
} from "@/utils/scaffold-stark/contract";
import { useMemo, useReducer, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ContractReadMethods } from "./ContractReadMethods";
import { ContractVariables } from "./ContractVariables";
import { ContractWriteMethods } from "./ContractWriteMethods";

type ContractUIProps = {
  contractName: ContractName;
  className?: string;
};

/**
 * UI component to interface with deployed contracts.
 **/
export const ContractUI = ({
  contractName,
  className = "",
}: ContractUIProps) => {
  const [activeTab, setActiveTab] = useState("read");
  const [refreshDisplayVariables, triggerRefreshDisplayVariables] = useReducer(
    (value) => !value,
    false,
  );
  const { targetNetwork } = useTargetNetwork();
  const {
    raw: deployedContractData,
    isLoading: deployedContractLoading,
    status,
  } = useDeployedContractInfo(contractName);

  const tabs = [
    { id: "read", label: "Read" },
    { id: "write", label: "Write" },
  ];

  const tabContent = useMemo(() => {
    return activeTab === "write" ? (
      <ContractWriteMethods
        deployedContractData={deployedContractData}
        onChange={triggerRefreshDisplayVariables}
      />
    ) : (
      <ContractReadMethods deployedContractData={deployedContractData} />
    );
  }, [activeTab, deployedContractData, triggerRefreshDisplayVariables]);

  const { theme, isDark } = useTheme();
  const colors = themeColors[theme];

  if (status === ContractCodeStatus.NOT_FOUND) {
    return (
      <View className="mt-6 px-4">
        <Text style={{ color: colors.text, fontSize: 18 }}>
          {`No contract found by the name of "${contractName}" on chain "${targetNetwork.name}"!`}
        </Text>
      </View>
    );
  }

  return (
    <View className="w-full">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-4">
          {/* Info card */}
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
                {contractName}
              </Text>
              <View
                className="px-3 py-2 rounded-full flex-row items-center"
                style={{
                  borderWidth: 1,
                  borderColor: theme === "dark" ? "#32BAC4" : "#B248DD",
                  backgroundColor: theme === "dark" ? "#2A3655" : "#FFFFFF",
                }}
              >
                <DollarIcon variant={theme === "dark" ? "dark" : "light"} />
                <Text className="ml-1" style={{ color: colors.textSecondary }}>
                  0.11576
                </Text>
              </View>
            </View>
            <View className="px-4 py-4">
              <View className="flex-row items-center">
                <Address address={deployedContractData.address} size="base" />
              </View>
              <View className="mt-3">
                <ClassHash
                  classHash={deployedContractData.classHash}
                  size="base"
                />
              </View>
              <View className="mt-3 flex-row items-center h-5">
                <Text style={{ color: colors.textHighlight }}>Balance:</Text>
                <View className="ml-2">
                  <Balance
                    className="px-0"
                    address={deployedContractData.address}
                  />
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

          {/* Contract variables */}
          <View
            className="px-4 py-5 rounded-[20px] mt-[5px]"
            style={{
              backgroundColor: colors.cardBackground,
              borderWidth: 1,
              borderColor: "#5C4FE5",
            }}
          >
            <ContractVariables
              refreshDisplayVariables={refreshDisplayVariables}
              deployedContractData={deployedContractData}
            />
          </View>

          <View className="mt-4">
            {/* Tabs */}
            <View
              className="flex-row mb-3 p-[5px] rounded-2xl"
              style={{
                backgroundColor: isDark ? "#141A31" : "white",
                borderWidth: 1,
                borderColor: "#5C4FE5",
              }}
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    onPress={() => setActiveTab(tab.id)}
                    className="flex-1 rounded-xl items-center justify-center h-10"
                    style={{
                      backgroundColor: isActive
                        ? colors.primary
                        : "transparent",
                    }}
                  >
                    <Text style={{ color: isActive ? "#ffffff" : colors.text }}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Tab content */}
            <View
              className=" rounded-[20px]"
              style={{
                backgroundColor: colors.cardBackground,
                borderWidth: 1,
                borderColor: "#5C4FE5",
              }}
            >
              <View className="p-4">{tabContent}</View>
              {deployedContractLoading ? (
                <View
                  className="absolute inset-0 rounded-[5px] items-center justify-center"
                  style={{
                    backgroundColor:
                      theme === "dark"
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(0,0,0,0.06)",
                  }}
                >
                  <ActivityIndicator color={colors.primary} />
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
