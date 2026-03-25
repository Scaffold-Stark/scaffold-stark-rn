/**
 * Shared test utilities and mock factories for Scaffold Stark RN hooks.
 *
 * Usage in test files:
 *   import { createMockDeployedContract, createMockAccount } from "@/test/test-utils";
 */

// ---------------------------------------------------------------------------
// Mock contract factory
// ---------------------------------------------------------------------------

export interface MockDeployedContract {
  address: string;
  abi: any[];
  classHash: string;
}

/**
 * Creates a mock deployed contract with sensible defaults.
 * Override any field via the `overrides` parameter.
 */
export function createMockDeployedContract(
  overrides: Partial<MockDeployedContract> = {},
): MockDeployedContract {
  return {
    address:
      "0x6e0d97cfd6ad07cea15de51b1761b70cc648948fd183ce03cac9e3a1f8c7f26",
    abi: [
      {
        type: "event",
        name: "contracts::your_contract::YourContract::Transfer",
        kind: "struct",
        members: [
          {
            name: "from",
            type: "core::starknet::contract_address::ContractAddress",
            kind: "key",
          },
          {
            name: "to",
            type: "core::starknet::contract_address::ContractAddress",
            kind: "key",
          },
          { name: "value", type: "core::integer::u256", kind: "data" },
        ],
      },
      {
        type: "function",
        name: "balance_of",
        inputs: [
          {
            name: "account",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [{ type: "core::integer::u256" }],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "transfer",
        inputs: [
          {
            name: "recipient",
            type: "core::starknet::contract_address::ContractAddress",
          },
          { name: "amount", type: "core::integer::u256" },
        ],
        outputs: [],
        state_mutability: "external",
      },
    ],
    classHash:
      "0x15981f4687739d007cf4d6ec112dc72f2e46026c1d1e031ec698fb282d43399",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Mock account / wallet
// ---------------------------------------------------------------------------

export interface MockAccount {
  address: string;
  execute: jest.Mock;
  getChainId: jest.Mock;
  estimateInvokeFee: jest.Mock;
}

/**
 * Creates a mock Starknet account object.
 */
export function createMockAccount(
  overrides: Partial<MockAccount> = {},
): MockAccount {
  return {
    address: "0xacc",
    execute: jest.fn(async () => ({ transaction_hash: "0xtxhash" })),
    getChainId: jest.fn(async () => "SN_SEPOLIA"),
    estimateInvokeFee: jest.fn(async () => ({ overall_fee: "0x100" })),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Mock target network
// ---------------------------------------------------------------------------

export const MOCK_DEVNET_NETWORK = {
  id: 1,
  network: "devnet",
  name: "Devnet",
  rpcUrls: {
    public: { http: ["http://127.0.0.1:5050/rpc"] },
  },
} as const;

export const MOCK_SEPOLIA_NETWORK = {
  id: 2,
  network: "sepolia",
  name: "Sepolia",
  rpcUrls: {
    public: {
      http: ["https://starknet-sepolia.public.blastapi.io/rpc/v0_10"],
    },
  },
} as const;

// ---------------------------------------------------------------------------
// Mock provider
// ---------------------------------------------------------------------------

export function createMockProvider() {
  return {
    getClassHashAt: jest.fn(async () => "0xfeed"),
    callContract: jest.fn(),
    getBlockLatestAccepted: jest.fn(async () => ({ block_number: 100 })),
    getBlockWithTxHashes: jest.fn(async () => ({ block_number: 100 })),
    getTransactionByHash: jest.fn(async () => ({ transaction_hash: "0x1" })),
    getTransactionReceipt: jest.fn(async () => ({ status: "ACCEPTED" })),
    getEvents: jest.fn(async () => ({ events: [] })),
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Flush all pending microtasks and timers (useful after act() blocks).
 */
export async function flushPromises(): Promise<void> {
  await new Promise((resolve) => setImmediate(resolve));
}
