import {
  themeColors,
  useTheme,
} from "@/components/scaffold-stark/ThemeProvider";
import {
  Contract,
  ContractName,
  getFunctionsByStateMutability,
} from "@/utils/scaffold-stark/contract";
import { Abi } from "abi-wan-kanabi";
import { Text } from "react-native";
import ReadOnlyFunctionForm from "./ReadOnlyFunctionForm";

export const ContractReadMethods = ({
  deployedContractData,
}: {
  deployedContractData: Contract<ContractName>;
}) => {
  const { theme } = useTheme();
  const colors = themeColors[theme];

  if (!deployedContractData) {
    return null;
  }

  const functionsToDisplay = getFunctionsByStateMutability(
    (deployedContractData.abi || []) as Abi,
    "view",
  )
    .filter((fn) => {
      const isQueryableWithParams = fn.inputs.length > 0;
      return isQueryableWithParams;
    })
    .map((fn) => {
      return {
        fn,
      };
    });
  if (!functionsToDisplay.length) {
    return <Text style={{ color: colors.text }}>No read methods</Text>;
  }
  return (
    <>
      {functionsToDisplay.map(({ fn }, idx) => (
        <ReadOnlyFunctionForm
          abi={deployedContractData.abi as Abi}
          contractAddress={deployedContractData.address}
          abiFunction={fn}
          key={fn.name}
          isLast={idx === functionsToDisplay.length - 1}
        />
      ))}
    </>
  );
};

export default ContractReadMethods;
