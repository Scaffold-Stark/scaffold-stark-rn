import {
  ContractClassHashCache,
  deepMergeContracts,
  getFunctionsByStateMutability,
  parseParamWithType,
  parseTuple,
} from "@/utils/scaffold-stark/contract";

describe("contract utils", () => {
  test("deepMergeContracts merges nested objects preferring external values", () => {
    const local = { a: 1, nested: { x: 1, y: 2 }, onlyLocal: { z: 3 } } as any;
    const external = { a: 2, nested: { y: 5 }, onlyExternal: { k: 9 } } as any;
    const merged = deepMergeContracts(local, external);
    expect(merged.a).toBe(2);
    expect(merged.nested.x).toBe(1);
    expect(merged.nested.y).toBe(5);
    expect((merged as any).onlyLocal.z).toBe(3);
    expect((merged as any).onlyExternal.k).toBe(9);
  });

  test("deepMergeContracts uses local value when external is undefined", () => {
    const local = { a: 1, b: 2 } as any;
    const external = {} as any;
    const merged = deepMergeContracts(local, external);
    expect(merged.a).toBe(1);
    expect(merged.b).toBe(2);
  });

  test("getFunctionsByStateMutability extracts interface functions", () => {
    const abi: any = [
      {
        type: "interface",
        name: "I",
        items: [
          {
            type: "function",
            name: "read",
            state_mutability: "view",
            inputs: [],
            outputs: [],
          },
          {
            type: "function",
            name: "write",
            state_mutability: "external",
            inputs: [],
            outputs: [],
          },
        ],
      },
    ];
    const reads = getFunctionsByStateMutability(abi, "view");
    const writes = getFunctionsByStateMutability(abi, "external");
    expect(reads.map((f) => f.name)).toEqual(["read"]);
    expect(writes.map((f) => f.name)).toEqual(["write"]);
  });

  test("getFunctionsByStateMutability extracts top-level functions", () => {
    const abi: any = [
      {
        type: "function",
        name: "topLevel",
        state_mutability: "view",
        inputs: [],
        outputs: [],
      },
    ];
    const result = getFunctionsByStateMutability(abi, "view");
    expect(result.map((f) => f.name)).toEqual(["topLevel"]);
  });

  test("getFunctionsByStateMutability filters non-function interface items", () => {
    const abi: any = [
      {
        type: "interface",
        name: "I",
        items: [
          { type: "event", name: "SomeEvent" },
          {
            type: "function",
            name: "fn1",
            state_mutability: "view",
            inputs: [],
            outputs: [],
          },
        ],
      },
    ];
    const result = getFunctionsByStateMutability(abi, "view");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("fn1");
  });

  test("parseTuple splits top-level tuple values respecting nesting", () => {
    expect(parseTuple("(a,b)")).toEqual(["a", "b"]);
    expect(parseTuple("(a,(b,c),d)")).toEqual(["a", "(b,c)", "d"]);
  });

  test("parseTuple handles deeply nested tuples", () => {
    expect(parseTuple("(a,((b,c),d))")).toEqual(["a", "((b,c),d)"]);
  });

  test("parseTuple handles single element", () => {
    expect(parseTuple("(a)")).toEqual(["a"]);
  });

  // --- parseParamWithType DECODE (isRead=true) tests ---

  test("parseParamWithType decodes felts and bools for reads", () => {
    expect(parseParamWithType("core::felt252", 255n as any, true)).toBe("0xff");
    expect(parseParamWithType("core::bool", "0x1" as any, true)).toBe("true");
  });

  test("parseParamWithType decodes bool false", () => {
    expect(parseParamWithType("core::bool", "0x0" as any, true)).toBe("false");
    expect(parseParamWithType("core::bool", true as any, true)).toBe(true);
  });

  test("parseParamWithType decodes integer types", () => {
    const result = parseParamWithType("core::integer::u8", 42n as any, true);
    expect(result).toBe(42);
  });

  test("parseParamWithType decodes hex integer", () => {
    const result = parseParamWithType("core::integer::u16", "0x0a" as any, true);
    expect(result).toBe(10);
  });

  test("parseParamWithType decodes bigint types", () => {
    const result = parseParamWithType("core::integer::u256", 123n as any, true);
    expect(typeof result === "bigint" || typeof result === "object").toBe(true);
  });

  test("parseParamWithType decodes bytes31", () => {
    const result = parseParamWithType("core::bytes_31::bytes31", 255n as any, true);
    expect(result).toBe("0xff");
  });

  test("parseParamWithType decodes contract address", () => {
    const result = parseParamWithType(
      "core::starknet::contract_address::ContractAddress",
      "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
      true,
    );
    expect(typeof result).toBe("string");
    expect(result).toMatch(/^0x/);
  });

  test("parseParamWithType decodes tuple for reads", () => {
    const result = parseParamWithType(
      "(core::felt252,core::felt252)",
      { 0: 1n, 1: 2n } as any,
      true,
    );
    expect(result).toContain("0x1");
    expect(result).toContain("0x2");
  });

  test("parseParamWithType decodes array for reads", () => {
    const result = parseParamWithType(
      "core::array::Array::<core::felt252>",
      [1n, 2n] as any,
      true,
    );
    expect(Array.isArray(result)).toBe(true);
  });

  test("parseParamWithType decodes CairoOption None for reads", () => {
    const { CairoOption, CairoOptionVariant } = require("starknet");
    const noneOpt = new CairoOption(CairoOptionVariant.None);
    const result = parseParamWithType(
      "core::option::Option::<core::felt252>",
      noneOpt,
      true,
    );
    expect(result).toBe("None");
  });

  test("parseParamWithType decodes CairoOption Some for reads", () => {
    const { CairoOption, CairoOptionVariant } = require("starknet");
    const someOpt = new CairoOption(CairoOptionVariant.Some, 42n);
    const result = parseParamWithType(
      "core::option::Option::<core::felt252>",
      someOpt,
      true,
    );
    expect(typeof result).toBe("string");
    expect(result).toContain("Some");
  });

  test("parseParamWithType decodes CairoResult Ok for reads", () => {
    const { CairoResult, CairoResultVariant } = require("starknet");
    const okResult = new CairoResult(CairoResultVariant.Ok, 10n);
    const result = parseParamWithType(
      "core::result::Result::<core::felt252,core::felt252>",
      okResult,
      true,
    );
    expect(typeof result).toBe("string");
    expect(result).toContain("Ok");
  });

  test("parseParamWithType decodes CairoResult Err for reads", () => {
    const { CairoResult, CairoResultVariant } = require("starknet");
    const errResult = new CairoResult(CairoResultVariant.Err, 99n);
    const result = parseParamWithType(
      "core::result::Result::<core::felt252,core::felt252>",
      errResult,
      true,
    );
    expect(typeof result).toBe("string");
    expect(result).toContain("Err");
  });

  test("parseParamWithType decodes byte array for reads", () => {
    const { byteArray } = require("starknet");
    const ba = byteArray.byteArrayFromString("hello");
    const result = parseParamWithType(
      "core::byte_array::ByteArray",
      ba,
      true,
    );
    expect(result).toBe("hello");
  });

  test("parseParamWithType passes through unknown types for reads", () => {
    const input = { custom: "data" };
    const result = parseParamWithType("some::unknown::Type", input, true);
    expect(result).toEqual(input);
  });

  // --- parseParamWithType ENCODE (isRead=false) tests ---

  test("parseParamWithType encodes felt for writes", () => {
    const result = parseParamWithType("core::felt252", "0x123", false);
    expect(result).toBe("0x123");
  });

  test("parseParamWithType encodes bool for writes", () => {
    expect(parseParamWithType("core::bool", "false", false)).toBe("0x0");
    expect(parseParamWithType("core::bool", "true", false)).toBe("0x1");
  });

  test("parseParamWithType encodes u256 for writes", () => {
    const result = parseParamWithType("core::integer::u256", "100", false);
    expect(result).toBeDefined();
  });

  test("parseParamWithType encodes byte array for writes", () => {
    const result = parseParamWithType("core::byte_array::ByteArray", "hello", false);
    expect(result).toBeDefined();
  });

  test("parseParamWithType encodes byte array for read args parsing", () => {
    const result = parseParamWithType(
      "core::byte_array::ByteArray",
      "hello",
      false,
      true,
    );
    expect(result).toBe("hello");
  });

  test("parseParamWithType encodes contract address for writes", () => {
    const result = parseParamWithType(
      "core::starknet::contract_address::ContractAddress",
      "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
      false,
    );
    expect(result).toBeDefined();
  });

  test("parseParamWithType encodes CairoOption None for writes", () => {
    const result = parseParamWithType(
      "core::option::Option::<core::felt252>",
      "None",
      false,
    );
    expect(result).toBeDefined();
  });

  test("parseParamWithType encodes CairoOption Some for writes", () => {
    const result = parseParamWithType(
      "core::option::Option::<core::felt252>",
      "Some(0x123)",
      false,
    );
    expect(result).toBeDefined();
  });

  test("parseParamWithType encodes array from string for writes", () => {
    const result = parseParamWithType(
      "core::array::Array::<core::felt252>",
      "0x1, 0x2, 0x3",
      false,
    );
    expect(Array.isArray(result)).toBe(true);
  });

  test("parseParamWithType encodes array from array for writes", () => {
    const result = parseParamWithType(
      "core::array::Array::<core::felt252>",
      ["0x1", "0x2"],
      false,
    );
    expect(Array.isArray(result)).toBe(true);
  });

  test("parseParamWithType encodes array for read args parsing", () => {
    const result = parseParamWithType(
      "core::array::Array::<core::felt252>",
      "0x1, 0x2",
      false,
      true,
    );
    expect(Array.isArray(result)).toBe(true);
  });

  test("parseParamWithType encodes array from array for read args parsing", () => {
    const result = parseParamWithType(
      "core::array::Array::<core::felt252>",
      ["0x1", "0x2"],
      false,
      true,
    );
    expect(Array.isArray(result)).toBe(true);
  });

  test("parseParamWithType encodes array with no generic type returns param", () => {
    const result = parseParamWithType(
      "core::array::Array::<>",
      "0x1, 0x2",
      false,
    );
    // When genericType is empty/falsy, returns param as-is
    expect(result).toBe("0x1, 0x2");
  });

  test("parseParamWithType encodes tuple for writes", () => {
    const result = parseParamWithType(
      "(core::felt252,core::felt252)",
      "(0x1,0x2)",
      false,
    );
    expect(result).toBeDefined();
  });

  test("parseParamWithType encodes struct object for read args parsing", () => {
    const result = parseParamWithType(
      "some::custom::Struct",
      {
        field1: { type: "core::felt252", value: "0x1" },
        field2: { type: "core::felt252", value: "0x2" },
      },
      false,
      true,
    );
    expect(typeof result).toBe("object");
    expect(result.field1).toBe("0x1");
  });

  test("parseParamWithType encodes struct object for raw args", () => {
    const result = parseParamWithType(
      "some::custom::Struct",
      {
        field1: { type: "core::felt252", value: "0x1" },
        field2: { type: "core::felt252", value: "0x2" },
      },
      false,
      false,
    );
    expect(Array.isArray(result)).toBe(true);
  });

  test("parseParamWithType handles struct with array fields for raw args", () => {
    const result = parseParamWithType(
      "some::custom::Struct",
      {
        field1: { type: "core::array::Array::<core::felt252>", value: ["0x1", "0x2"] },
      },
      false,
      false,
    );
    expect(Array.isArray(result)).toBe(true);
  });

  test("parseParamWithType skips empty/undefined struct values for read args", () => {
    const result = parseParamWithType(
      "some::custom::Struct",
      {
        field1: { type: "core::felt252", value: "" },
        field2: { type: "core::felt252", value: "0x1" },
      },
      false,
      true,
    );
    expect(result.field1).toBeUndefined();
    expect(result.field2).toBe("0x1");
  });

  test("parseParamWithType handles encode error gracefully", () => {
    const result = parseParamWithType(
      "some::custom::Struct",
      null,
      false,
      false,
    );
    // Should return param on error
    expect(result).toBeNull();
  });

  test("parseParamWithType handles CairoResult encode for writes", () => {
    const result = parseParamWithType(
      "core::result::Result::<core::felt252,core::felt252>",
      {
        variant: {
          Ok: { value: "0x1", type: "core::felt252" },
          Err: { value: undefined, type: "core::felt252" },
        },
      },
      false,
    );
    expect(result).toBeDefined();
  });

  test("parseParamWithType handles CairoResult Err encode for writes", () => {
    const result = parseParamWithType(
      "core::result::Result::<core::felt252,core::felt252>",
      {
        variant: {
          Ok: { value: undefined, type: "core::felt252" },
          Err: { value: "0x1", type: "core::felt252" },
        },
      },
      false,
    );
    expect(result).toBeDefined();
  });

  test("parseParamWithType handles custom enum encode for writes", () => {
    const result = parseParamWithType(
      "some::custom::Enum",
      {
        variant: {
          VariantA: { value: "0x1", type: "core::felt252" },
          VariantB: { value: "", type: "core::felt252" },
        },
      },
      false,
      false,
    );
    expect(result).toBeDefined();
  });

  test("parseParamWithType handles custom enum encode for read args parsing", () => {
    const result = parseParamWithType(
      "some::custom::Enum",
      {
        variant: {
          VariantA: { value: "0x1", type: "core::felt252" },
          VariantB: { value: undefined, type: "core::felt252" },
        },
      },
      false,
      true,
    );
    expect(result).toBeDefined();
  });

  test("parseParamWithType returns param for non-object fallback encode", () => {
    const result = parseParamWithType(
      "core::array::Array::<core::felt252>",
      123,
      false,
    );
    expect(result).toBe(123);
  });

  // --- ContractClassHashCache tests ---

  test("ContractClassHashCache caches and dedupes requests", async () => {
    const cache = ContractClassHashCache.getInstance();
    cache.clear();
    const getClassHashAt = jest
      .fn()
      .mockResolvedValueOnce("0xabc")
      .mockResolvedValueOnce("0xdef");
    const client: any = { getClassHashAt };
    const p1 = cache.getClassHash(client, "0xaddr", "pending");
    const p2 = cache.getClassHash(client, "0xaddr", "pending");
    const [r1, r2] = await Promise.all([p1, p2]);
    expect(r1).toBe("0xabc");
    expect(r2).toBe("0xabc");
    expect(getClassHashAt).toHaveBeenCalledTimes(1);
    // cached call
    const r3 = await cache.getClassHash(client, "0xaddr", "pending");
    expect(r3).toBe("0xabc");
    expect(getClassHashAt).toHaveBeenCalledTimes(1);
  });

  test("ContractClassHashCache returns undefined on error", async () => {
    const cache = ContractClassHashCache.getInstance();
    cache.clear();
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    const client: any = {
      getClassHashAt: jest.fn().mockRejectedValue(new Error("network error")),
    };
    const result = await cache.getClassHash(client, "0xfail", "pending");
    expect(result).toBeUndefined();
    consoleErrorSpy.mockRestore();
  });

  test("ContractClassHashCache uses default block identifier", async () => {
    const cache = ContractClassHashCache.getInstance();
    cache.clear();
    const client: any = {
      getClassHashAt: jest.fn().mockResolvedValue("0xdef"),
    };
    const result = await cache.getClassHash(client, "0xaddr2");
    expect(result).toBe("0xdef");
    expect(client.getClassHashAt).toHaveBeenCalledWith(
      "0xaddr2",
      "pre_confirmed",
    );
  });

  test("ContractClassHashCache different keys are cached separately", async () => {
    const cache = ContractClassHashCache.getInstance();
    cache.clear();
    const client: any = {
      getClassHashAt: jest
        .fn()
        .mockResolvedValueOnce("0xaaa")
        .mockResolvedValueOnce("0xbbb"),
    };
    const r1 = await cache.getClassHash(client, "0xaddr1", "pending");
    const r2 = await cache.getClassHash(client, "0xaddr2", "pending");
    expect(r1).toBe("0xaaa");
    expect(r2).toBe("0xbbb");
    expect(client.getClassHashAt).toHaveBeenCalledTimes(2);
  });
});
