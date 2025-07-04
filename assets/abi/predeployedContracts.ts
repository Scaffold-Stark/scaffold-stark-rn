import {
  devnetStrkClassHash,
  universalErc20Abi,
  universalStrkAddress,
} from "./constants.ts";

const preDeployedContracts = {
  devnet: {
    Strk: {
      address: universalStrkAddress,
      abi: universalErc20Abi,
      classHash: devnetStrkClassHash,
    },
  },
} as const;

export default preDeployedContracts;
