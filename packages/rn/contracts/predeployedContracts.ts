import {
  devnetStrkClassHash,
  sepoliaMainnetStrkClassHash,
  universalErc20Abi,
  universalStrkAddress,
} from "./constants";

const preDeployedContracts = {
  devnet: {
    Strk: {
      address: universalStrkAddress,
      abi: universalErc20Abi,
      classHash: devnetStrkClassHash,
    },
  },
  sepolia: {
    Strk: {
      address: universalStrkAddress,
      abi: universalErc20Abi,
      classHash: sepoliaMainnetStrkClassHash,
    },
  },
  mainnet: {
    Strk: {
      address: universalStrkAddress,
      abi: universalErc20Abi,
      classHash: sepoliaMainnetStrkClassHash,
    },
  },
} as const;

export default preDeployedContracts;
