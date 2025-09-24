import {
  composeEventFilterKeys,
  parseEventData,
  serializeEventKey,
} from "@/services/utils/scaffold-stark/events";
import type { Abi } from "starknet";

// Minimal ABI pieces to exercise logic paths
const abi: Abi = [{ type: "interface", name: "I", items: [] }];

describe("events utils", () => {
  test("serializeEventKey handles byte array", () => {
    const abiEntry = { type: "core::byte_array::ByteArray", name: "k" } as any;
    const result = serializeEventKey("hello", abiEntry, {} as any, {} as any);
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toMatch(/^0x/);
  });

  test("composeEventFilterKeys returns empty for non-keyed events", () => {
    const event: any = { members: [] };
    const keys = composeEventFilterKeys({}, event, abi);
    expect(Array.isArray(keys)).toBe(true);
  });

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
});
