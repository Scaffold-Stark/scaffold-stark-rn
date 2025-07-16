import { universalErc20Abi } from "@/contracts/constants";
import deployedContracts from "@/contracts/deployedContracts";
import { burnerAccounts, BurnerConnector } from "@scaffold-stark/stark-burner";
import {
  useAccount,
  useConnect,
  useContract,
  useDisconnect,
  useReadContract,
  useSendTransaction,
} from "@starknet-react/core";
import { useEffect } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { CairoOption, CairoOptionVariant } from "starknet";

// STRK Address: 0x4718F5A0FC34CC1AF16A1CDEE98FFB20C31F5CD61D6AB07201858F4287C938D

export default function Index() {
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { address } = useAccount();
  const { contract } = useContract({
    address: deployedContracts.devnet.YourContract.address,
    abi: deployedContracts.devnet.YourContract.abi,
  });
  const { data: balance } = useReadContract({
    address:
      "0x4718F5A0FC34CC1AF16A1CDEE98FFB20C31F5CD61D6AB07201858F4287C938D",
    abi: universalErc20Abi,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    enabled: !!address,
  });
  const { data: greeting } = useReadContract({
    address: deployedContracts.devnet.YourContract.address,
    abi: deployedContracts.devnet.YourContract.abi,
    functionName: "greeting",
    args: [],
    enabled: true,
  });

  const myOption = new CairoOption<bigint>(CairoOptionVariant.None);
  const { sendAsync, error } = useSendTransaction({
    calls:
      contract && address
        ? [contract.populate("set_greeting", ["Hello world!", myOption])]
        : undefined,
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
                    (it) => it.id === "burner-wallet"
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
