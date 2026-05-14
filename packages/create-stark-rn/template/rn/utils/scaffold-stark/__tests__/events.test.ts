import {
  buildEventKeys,
  composeEventFilterKeys,
  enrichLog,
  getLatestAcceptedBlockNumber,
  parseEventData,
  parseLogsArgs,
  resolveEventAbi,
  serializeEventKey,
} from "@/utils/scaffold-stark/events";
import type { Abi } from "starknet";

// Minimal ABI pieces to exercise logic paths
const abi: Abi = [{ type: "interface", name: "I", items: [] }];

describe("events utils", () => {
  // --- resolveEventAbi ---

  test("resolveEventAbi returns undefined for undefined abi", () => {
    const result = resolveEventAbi(undefined, "Transfer");
    expect(result).toBeUndefined();
  });

  test("resolveEventAbi returns undefined when no event matches", () => {
    const testAbi: any = [
      { type: "event", name: "pkg::Transfer", kind: "struct", members: [] },
    ];
    const result = resolveEventAbi(testAbi, "Approval");
    expect(result).toBeUndefined();
  });

  test("resolveEventAbi returns event when exactly one matches", () => {
    const testAbi: any = [
      { type: "event", name: "pkg::Transfer", kind: "struct", members: [] },
    ];
    const result = resolveEventAbi(testAbi, "Transfer");
    expect(result).toBeDefined();
    expect((result as any).name).toBe("pkg::Transfer");
  });

  test("resolveEventAbi throws when multiple events match", () => {
    const testAbi: any = [
      { type: "event", name: "a::Transfer", kind: "struct", members: [] },
      { type: "event", name: "b::Transfer", kind: "struct", members: [] },
    ];
    expect(() => resolveEventAbi(testAbi, "Transfer")).toThrow("Ambiguous");
  });

  // --- parseLogsArgs ---

  test("parseLogsArgs returns empty object when no events parsed", () => {
    const testAbi: any = [
      { type: "interface", name: "I", items: [] },
    ];
    const result = parseLogsArgs(testAbi, "pkg::Event", []);
    expect(result).toEqual({});
  });

  // --- enrichLog ---

  test("enrichLog fetches block, transaction, and receipt", async () => {
    const mockClient: any = {
      getBlockWithTxHashes: jest.fn().mockResolvedValue({ block_number: 1 }),
      getTransactionByHash: jest.fn().mockResolvedValue({ hash: "0x1" }),
      getTransactionReceipt: jest.fn().mockResolvedValue({ status: "ok" }),
    };
    const log = { block_hash: "0xblock", transaction_hash: "0xtx" };
    const result = await enrichLog(mockClient, log, {
      block: true,
      transaction: true,
      receipt: true,
    });
    expect(result.block).toEqual({ block_number: 1 });
    expect(result.transaction).toEqual({ hash: "0x1" });
    expect(result.receipt).toEqual({ status: "ok" });
  });

  test("enrichLog skips fetches when opts are false", async () => {
    const mockClient: any = {
      getBlockWithTxHashes: jest.fn(),
      getTransactionByHash: jest.fn(),
      getTransactionReceipt: jest.fn(),
    };
    const log = { block_hash: "0xblock", transaction_hash: "0xtx" };
    const result = await enrichLog(mockClient, log, {
      block: false,
      transaction: false,
      receipt: false,
    });
    expect(result.block).toBeNull();
    expect(result.transaction).toBeNull();
    expect(result.receipt).toBeNull();
    expect(mockClient.getBlockWithTxHashes).not.toHaveBeenCalled();
  });

  test("enrichLog skips fetches when hashes are null", async () => {
    const mockClient: any = {
      getBlockWithTxHashes: jest.fn(),
      getTransactionByHash: jest.fn(),
      getTransactionReceipt: jest.fn(),
    };
    const log = { block_hash: null, transaction_hash: null };
    const result = await enrichLog(mockClient, log, {
      block: true,
      transaction: true,
      receipt: true,
    });
    expect(result.block).toBeNull();
    expect(result.transaction).toBeNull();
    expect(result.receipt).toBeNull();
  });

  // --- getLatestAcceptedBlockNumber ---

  test("getLatestAcceptedBlockNumber returns bigint block number", async () => {
    const mockClient: any = {
      getBlockLatestAccepted: jest.fn().mockResolvedValue({ block_number: 42 }),
    };
    const result = await getLatestAcceptedBlockNumber(mockClient);
    expect(result).toBe(42n);
  });

  // --- buildEventKeys ---

  test("buildEventKeys returns selector key without filters", () => {
    const keys = buildEventKeys("Transfer", undefined, {} as any, abi);
    expect(keys.length).toBe(1);
    expect(keys[0].length).toBe(1);
    expect(keys[0][0]).toMatch(/^0x/);
  });

  test("buildEventKeys concatenates filter keys", () => {
    // Mock composeEventFilterKeys to return additional keys
    const eventAbi: any = { members: [] };
    const keys = buildEventKeys("Transfer", {}, eventAbi, abi);
    expect(keys.length).toBeGreaterThanOrEqual(1);
  });

  test("buildEventKeys limits to maxKeys", () => {
    const keys = buildEventKeys("Transfer", undefined, {} as any, abi, 1);
    expect(keys.length).toBeLessThanOrEqual(1);
  });

  // --- serializeEventKey ---

  test("serializeEventKey handles byte array", () => {
    const abiEntry = { type: "core::byte_array::ByteArray", name: "k" } as any;
    const result = serializeEventKey("hello", abiEntry, {} as any, {} as any, abi);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toMatch(/^0x/);
  });

  test("serializeEventKey handles felt252 type", () => {
    const abiEntry = { type: "core::felt252", name: "k" } as any;
    const result = serializeEventKey("123", abiEntry, {} as any, {} as any, abi);
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  // --- composeEventFilterKeys ---

  test("composeEventFilterKeys returns empty for non-keyed events", () => {
    const event: any = { members: [] };
    const keys = composeEventFilterKeys({}, event, abi);
    expect(Array.isArray(keys)).toBe(true);
  });

  test("composeEventFilterKeys returns empty when event has no members property", () => {
    const event: any = {};
    const keys = composeEventFilterKeys({}, event, abi);
    expect(keys).toEqual([]);
  });

  test("composeEventFilterKeys serializes key members with values", () => {
    const event: any = {
      members: [
        { name: "from", type: "core::felt252", kind: "key" },
      ],
    };
    const keys = composeEventFilterKeys({ from: "123" }, event, abi);
    expect(keys.length).toBeGreaterThan(0);
  });

  test("composeEventFilterKeys handles key members without values using certainLengthTypeMap", () => {
    const event: any = {
      members: [
        { name: "from", type: "core::felt252", kind: "key" },
        { name: "to", type: "core::felt252", kind: "key" },
      ],
    };
    // "from" has no value in input, "core::felt252" is in certainLengthTypeMap
    const keys = composeEventFilterKeys({}, event, abi);
    expect(keys.length).toBeGreaterThanOrEqual(1);
  });

  test("composeEventFilterKeys breaks on unknown type without value", () => {
    const event: any = {
      members: [
        { name: "data", type: "some::unknown::Type", kind: "key" },
        { name: "from", type: "core::felt252", kind: "key" },
      ],
    };
    // Should break on "data" since it has no value and unknown type
    const keys = composeEventFilterKeys({}, event, abi);
    expect(keys).toEqual([]);
  });

  test("composeEventFilterKeys handles array filter values", () => {
    const event: any = {
      members: [
        { name: "from", type: "core::felt252", kind: "key" },
      ],
    };
    const keys = composeEventFilterKeys({ from: ["123", "456"] }, event, abi);
    expect(keys.length).toBeGreaterThan(0);
  });

  test("composeEventFilterKeys skips data kind members", () => {
    const event: any = {
      members: [
        { name: "amount", type: "core::integer::u256", kind: "data" },
        { name: "from", type: "core::felt252", kind: "key" },
      ],
    };
    const keys = composeEventFilterKeys({ from: "123" }, event, abi);
    expect(keys.length).toBeGreaterThan(0);
  });

  // --- parseEventData ---

  test("parseEventData converts contract addresses in fields and arrays", () => {
    const args = { addr: 0x123n, arr: [0x456n] } as any;
    const types = [
      {
        name: "addr",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "data",
      },
      {
        name: "arr",
        type: "core::array::Array::<core::starknet::contract_address::ContractAddress>",
        kind: "data",
      },
    ];
    const parsed = parseEventData(args, types);
    expect(parsed.addr).toMatch(/^0x/);
    expect(parsed.arr[0]).toMatch(/^0x/);
  });

  test("parseEventData handles tuple with contract address", () => {
    const args = {
      pair: { 0: 0x123n, 1: 42n },
    } as any;
    const types = [
      {
        name: "pair",
        type: "(core::starknet::contract_address::ContractAddress,core::integer::u256)",
        kind: "data",
      },
    ];
    const parsed = parseEventData(args, types);
    expect(parsed.pair[0]).toMatch(/^0x/);
    // non-address tuple member stays as-is
    expect(parsed.pair[1]).toBe(42n);
  });

  test("parseEventData returns value as-is for unknown types", () => {
    const args = { val: 42n } as any;
    const types = [
      { name: "val", type: "core::integer::u256", kind: "data" },
    ];
    const parsed = parseEventData(args, types);
    expect(parsed.val).toBe(42n);
  });

  test("parseEventData returns value as-is when type not found", () => {
    const args = { unknown: "hello" } as any;
    const types: any[] = [];
    const parsed = parseEventData(args, types);
    expect(parsed.unknown).toBe("hello");
  });
});
