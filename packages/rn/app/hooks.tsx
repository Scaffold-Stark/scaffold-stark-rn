// THIS IS A PAGE TO TEST HOOKS
// TODO: DELETE THIS FILE AFTER TESTING

import { useScaffoldReadContract } from "@/hooks/useScaffoldReadContract";
import { useAccount } from "@starknet-react/core";
import { Text, View } from "react-native";

export default function Hooks() {
  const { address } = useAccount();

  const { data: greeting } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "greeting",
    args: [],
    enabled: !!address,
  });

  return (
    <View>
      <Text>Hooks</Text>
      <Text>{greeting?.toString()}</Text>
    </View>
  );
}
