import {
  feltToHex,
  isAddress,
  isJsonString,
  isValidContractArgs,
  replacer,
} from "@/services/utils/scaffold-stark/common";

describe("common utils", () => {
  test("replacer converts bigint to string", () => {
    const obj = { a: 1n, b: "x" } as any;
    const json = JSON.stringify(obj, replacer);
    expect(json).toContain('"a":"1"');
  });

  test("isAddress validates 0x-prefixed 40-hex string", () => {
    expect(isAddress("0x" + "a".repeat(40))).toBe(true);
    expect(isAddress("0x" + "g".repeat(40))).toBe(false);
    expect(isAddress("0x123")).toBe(false);
  });

  test("feltToHex converts bigint to 0x-hex", () => {
    expect(feltToHex(0n)).toBe("0x0");
    expect(feltToHex(255n)).toBe("0xff");
  });

  test("isJsonString detects valid/invalid JSON", () => {
    expect(isJsonString('{"a":1}')).toBe(true);
    expect(isJsonString("not json")).toBe(false);
  });

  test("isValidContractArgs checks array length and non-empty elements", () => {
    expect(isValidContractArgs([1, 2], 2)).toBe(true);
    expect(isValidContractArgs([1], 2)).toBe(false);
    expect(isValidContractArgs([1, ""], 2)).toBe(false);
    expect(isValidContractArgs("not array" as any, 1)).toBe(false);
  });
});
