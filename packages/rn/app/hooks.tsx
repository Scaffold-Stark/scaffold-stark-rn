// THIS IS A PAGE TO TEST HOOKS
// TODO: DELETE THIS FILE AFTER TESTING

import { useScaffoldReadContract } from "@/hooks/useScaffoldReadContract";
import { useScaffoldWriteContract } from "@/hooks/useScaffoldWriteContract";
import { useAccount } from "@starknet-react/core";
import { Text, TouchableOpacity, View } from "react-native";
import { CairoOption, CairoOptionVariant } from "starknet";

export default function Hooks() {
  const { address } = useAccount();

  const { data: greeting } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "greeting",
    args: [],
    enabled: !!address,
  });

  const { sendAsync } = useScaffoldWriteContract({
    contractName: "YourContract",
    functionName: "set_greeting",
    args: ["GM World ", new CairoOption(CairoOptionVariant.None, 0n)],
  });

  return (
    <View>
      <Text>Hooks</Text>
      <Text>{greeting?.toString()}</Text>
      <TouchableOpacity onPress={() => sendAsync()}>
        <Text>Set greeting</Text>
      </TouchableOpacity>
    </View>
  );
}
