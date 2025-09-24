import {
  ContractClassHashCache,
  deepMergeContracts,
  getFunctionsByStateMutability,
  parseParamWithType,
  parseTuple,
} from "@/services/utils/scaffold-stark/contract";

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

  test("parseTuple splits top-level tuple values respecting nesting", () => {
    expect(parseTuple("(a,b)")).toEqual(["a", "b"]);
    expect(parseTuple("(a,(b,c),d)")).toEqual(["a", "(b,c)", "d"]);
  });

  test("parseParamWithType decodes felts and bools for reads", () => {
    expect(parseParamWithType("core::felt252", 255n as any, true)).toBe("0xff");
    expect(parseParamWithType("core::bool", "0x1" as any, true)).toBe("true");
  });

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
});
