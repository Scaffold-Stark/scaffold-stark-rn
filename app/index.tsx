import { universalErc20Abi } from "@/assets/abi/constants";
import { burnerAccounts, BurnerConnector } from "@scaffold-stark/stark-burner";
import { useAccount, useConnect, useDisconnect, useReadContract } from "@starknet-react/core";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

// STRK Address: 0x4718F5A0FC34CC1AF16A1CDEE98FFB20C31F5CD61D6AB07201858F4287C938D

export default function Index() {
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { address } = useAccount();
  const { data: balance } = useReadContract({
    address: "0x4718F5A0FC34CC1AF16A1CDEE98FFB20C31F5CD61D6AB07201858F4287C938D",
    abi: universalErc20Abi,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    enabled: !!address,
  });
  return (
    <View className="flex-1 items-center justify-center">
      <TouchableOpacity onPress={() => {
        disconnect();
      }}>
        <Text>Disconnect</Text>
      </TouchableOpacity>
      <Text className="text-xl font-bold text-blue-500">
        Welcome to Scaffold Stark RN!
      </Text>
      <Text>{address || "No address"}</Text>
      <TouchableOpacity onPress={() => {
        disconnect();
      }}>
        <Text>{balance ? balance.toString() : "Get Balance"}</Text>
      </TouchableOpacity>
      {!address && <FlatList
        data={burnerAccounts.map((account) => account)}
        keyExtractor={(item) => item.accountAddress}
        renderItem={({ item }) => <View className="p-4">
          <TouchableOpacity onPress={() => {
            const connector = connectors.find((it) => it.id === "burner-wallet");
            if (connector && connector instanceof BurnerConnector) {
              connector.burnerAccount = item;
              connect({ connector });
            }
            
          }}>
            <Text>{item.accountAddress}</Text></TouchableOpacity>
          </View>}
      />}
    </View>
  );
}
