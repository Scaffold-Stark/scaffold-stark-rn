import { WriteOnlyFunctionForm } from "@/app/_components/debug/contract";
import {
  Contract,
  ContractName,
  getFunctionsByStateMutability,
} from "@/utils/scaffold-stark/contract";
import { Abi } from "abi-wan-kanabi";
import { Text } from "react-native";

export const ContractWriteMethods = ({
  onChange,
  deployedContractData,
}: {
  onChange: () => void;
  deployedContractData: Contract<ContractName>;
}) => {
  if (!deployedContractData) {
    return null;
  }

  const functionsToDisplay = getFunctionsByStateMutability(
    (deployedContractData.abi || []) as Abi,
    "external",
  ).map((fn) => {
    return {
      fn,
    };
  });

  if (!functionsToDisplay.length) {
    return <Text>No write methods</Text>;
  }

  return (
    <>
      {functionsToDisplay.map(({ fn }, idx) => (
        <WriteOnlyFunctionForm
          abi={deployedContractData.abi as Abi}
          key={`${fn.name}-${idx}}`}
          abiFunction={fn}
          onChange={onChange}
          contractAddress={deployedContractData.address}
          //   inheritedFrom={inheritedFrom}
        />
      ))}
    </>
  );
};
