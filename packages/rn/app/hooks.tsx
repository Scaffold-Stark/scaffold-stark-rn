// THIS IS A PAGE TO TEST HOOKS
// TODO: DELETE THIS FILE AFTER TESTING

import { useDeployedContractInfo } from "@/hooks/scaffold-stark/useDeployedContractInfo";
import { useScaffoldEventHistory } from "@/hooks/scaffold-stark/useScaffoldEventHistory";
import { useScaffoldMultiWriteContract } from "@/hooks/scaffold-stark/useScaffoldMultiWriteContract";
import { useScaffoldReadContract } from "@/hooks/scaffold-stark/useScaffoldReadContract";
import { useScaffoldWriteContract } from "@/hooks/scaffold-stark/useScaffoldWriteContract";
import { useAccount } from "@starknet-react/core";
import { Text, TouchableOpacity, View } from "react-native";
import { CairoOption, CairoOptionVariant } from "starknet";

export default function Hooks() {
  const { address } = useAccount();

  const YourContract = useDeployedContractInfo("YourContract");

  const { data: greeting } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "greeting",
    args: [],
    enabled: !!address,
  });

  const { data: allowance } = useScaffoldReadContract({
    contractName: "Strk",
    functionName: "allowance",
    args: [YourContract?.data?.address, address as `0x${string}`],
    enabled: !!address,
  });

  const { sendAsync } = useScaffoldWriteContract({
    contractName: "YourContract",
    functionName: "set_greeting",
    args: ["GM World ", new CairoOption(CairoOptionVariant.None, 0n)],
  });

  const { sendAsync: sendAsyncMulti } = useScaffoldMultiWriteContract({
    calls: [
      {
        contractName: "Strk",
        functionName: "approve",
        args: [YourContract?.data?.address, 40100000000000000000n],
      },
      {
        contractName: "YourContract",
        functionName: "set_greeting",
        args: [
          "GM World Multi Write",
          new CairoOption(CairoOptionVariant.Some, 33000000000000000000n),
        ],
      },
    ],
  });

  const { data: events } = useScaffoldEventHistory({
    contractName: "YourContract",
    eventName: "GreetingChanged",
    fromBlock: 0n,
    enabled: !!address,
  });

  return (
    <View>
      <Text>Hooks</Text>
      <Text>Greeting: {greeting?.toString()}</Text>
      <Text>Allowance: {allowance?.toString()}</Text>
      <Text>Events: {events?.length}</Text>
      <Text>
        Events: {events?.map((event) => event.args.new_greeting.toString())}
      </Text>
      <TouchableOpacity onPress={() => sendAsync()}>
        <Text>Set greeting</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => sendAsyncMulti()}>
        <Text>Set greeting with Strk + Approval</Text>
      </TouchableOpacity>
    </View>
  );
}
