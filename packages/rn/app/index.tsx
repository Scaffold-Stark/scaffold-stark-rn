import { useScaffoldReadContract } from "@/hooks/scaffold-stark/useScaffoldReadContract";
import { useScaffoldWriteContract } from "@/hooks/scaffold-stark/useScaffoldWriteContract";
import { burnerAccounts, BurnerConnector } from "@scaffold-stark/stark-burner";
import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { CairoOption, CairoOptionVariant } from "starknet";

// STRK Address: 0x4718F5A0FC34CC1AF16A1CDEE98FFB20C31F5CD61D6AB07201858F4287C938D

export default function Index() {
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { address } = useAccount();
  const { data: balance } = useScaffoldReadContract({
    contractName: "Strk",
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    enabled: !!address,
  });
  const { data: greeting } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "greeting",
    args: [],
    enabled: true,
  });
  const router = useRouter();

  const myOption = new CairoOption<bigint>(CairoOptionVariant.None);
  const { sendAsync, error } = useScaffoldWriteContract({
    contractName: "YourContract",
    functionName: "set_greeting",
    args: ["Hello World", myOption],
  });

  useEffect(() => {
    if (error) {
      console.error("sendAsync error: ", error);
    }
  }, [error]);

  return (
    <View className="flex-1 items-center justify-center">
      <TouchableOpacity
        onPress={() => {
          disconnect();
        }}
      >
        <Text>Disconnect</Text>
      </TouchableOpacity>
      <Text className="text-xl font-bold text-blue-500">
        Welcome to Scaffold Stark RN!
      </Text>
      {address && <Text>{address}</Text>}
      {address && balance && <Text>{balance.toString()}</Text>}

      <Text>{`Current greeting: ${greeting}`}</Text>

      <TouchableOpacity
        onPress={() => {
          // Navigate to hooks page
          router.push("/hooks");
        }}
      >
        <Text>Go to Hooks</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={async () => {
          try {
            const result = await sendAsync();
            console.log(result);
          } catch (error) {
            console.error(error);
          }
        }}
      >
        <Text>Set greeting</Text>
      </TouchableOpacity>

      {!address && (
        <FlatList
          data={burnerAccounts.map((account) => account)}
          keyExtractor={(item) => item.accountAddress}
          renderItem={({ item }) => (
            <View className="p-4">
              <TouchableOpacity
                onPress={() => {
                  const connector = connectors.find(
                    (it) => it.id === "burner-wallet",
                  );
                  if (connector && connector instanceof BurnerConnector) {
                    connector.burnerAccount = item;
                    connect({ connector });
                  }
                }}
              >
                <Text>{item.accountAddress}</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}
