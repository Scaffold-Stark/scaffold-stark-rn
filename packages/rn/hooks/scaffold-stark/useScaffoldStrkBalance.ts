import { Address } from "@starknet-react/chains";
import { useReadContract } from "@starknet-react/core";
import { Abi } from "abi-wan-kanabi";
import { BlockNumber } from "starknet";
import { formatUnits } from "viem";
import { useDeployedContractInfo } from "./useDeployedContractInfo";

type UseScaffoldStrkBalanceProps = {
  address?: Address | string;
};

/**
 * Fetches STRK token balance for a given address.
 * This hook reads the balance_of function from the STRK token contract
 * and provides both raw and formatted balance values.
 */
const useScaffoldStrkBalance = ({ address }: UseScaffoldStrkBalanceProps) => {
  const { data: deployedContract } = useDeployedContractInfo("Strk");

  const { data, ...props } = useReadContract({
    functionName: "balance_of",
    address: deployedContract?.address,
    abi: deployedContract?.abi as Abi as any[],
    watch: true,
    enabled: true,
    args: address ? [address] : [],
    blockIdentifier: "pre_confirmed" as BlockNumber,
  });

  return {
    value: data as unknown as bigint,
    decimals: 18,
    symbol: "STRK",
    formatted: data ? formatUnits(data as unknown as bigint, 18) : "0",
    ...props,
  } as const;
};

export default useScaffoldStrkBalance;
