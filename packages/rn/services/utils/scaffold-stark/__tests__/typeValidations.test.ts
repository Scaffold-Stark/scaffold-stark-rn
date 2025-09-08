import {
  isCairoBigInt,
  isCairoBool,
  isCairoByteArray,
  isCairoBytes31,
  isCairoClassHash,
  isCairoContractAddress,
  isCairoEthAddress,
  isCairoFelt,
  isCairoFunction,
  isCairoInt,
  isCairoSecp256k1Point,
  isCairoSpan,
  isCairoTuple,
  isCairoType,
  isCairoU256,
  isCairoVoid,
  parseGenericType,
} from "@/services/utils/scaffold-stark/typeValidations";

describe("typeValidations", () => {
  test("isCairoInt matches small ints", () => {
    expect(isCairoInt("core::integer::u8")).toBe(true);
    expect(isCairoInt("core::integer::i32")).toBe(true);
    expect(isCairoInt("core::integer::u64")).toBe(false);
  });

  test("isCairoBigInt matches 64/128", () => {
    expect(isCairoBigInt("core::integer::u64")).toBe(true);
    expect(isCairoBigInt("core::integer::i128")).toBe(true);
    expect(isCairoBigInt("core::integer::u32")).toBe(false);
  });

  test("isCairoU256", () => {
    expect(isCairoU256("core::integer::u256")).toBe(true);
    expect(isCairoU256("core::zeroable::NonZero::<core::integer::u256>")).toBe(
      true,
    );
    expect(isCairoU256("core::integer::u128")).toBe(false);
  });

  test("address/classhash/ethaddress detection", () => {
    expect(
      isCairoContractAddress(
        "core::starknet::contract_address::ContractAddress",
      ),
    ).toBe(true);
    expect(isCairoEthAddress("core::starknet::eth_address::EthAddress")).toBe(
      true,
    );
    expect(isCairoClassHash("core::starknet::class_hash::ClassHash")).toBe(
      true,
    );
  });

  test("misc type checks", () => {
    expect(isCairoFunction("function(core::felt252)")).toBe(true);
    expect(isCairoVoid("()")).toBe(true);
    expect(isCairoBool("core::bool")).toBe(true);
    expect(isCairoBytes31("core::bytes_31::bytes31")).toBe(true);
    expect(isCairoByteArray("core::byte_array::ByteArray")).toBe(true);
    expect(
      isCairoSecp256k1Point("core::starknet::secp256k1::Secp256k1Point"),
    ).toBe(true);
    expect(isCairoFelt("core::felt252")).toBe(true);
    expect(isCairoTuple("(core::felt252,core::felt252)")).toBe(true);
    expect(isCairoSpan("core::array::Span::<core::felt252>")).toBe(true);
  });

  test("isCairoType aggregates", () => {
    expect(isCairoType("core::integer::u8")).toBe(true);
    expect(isCairoType("unknown")).toBe(false);
  });

  test("parseGenericType parses nested generics and tuples", () => {
    expect(parseGenericType("core::option::Option::<core::felt252>")).toEqual([
      "core::felt252",
    ]);
    expect(
      parseGenericType("core::result::Result::<core::felt252, core::felt252>"),
    ).toEqual(["core::felt252", "core::felt252"]);
    expect(
      parseGenericType("core::array::Array::<(core::felt252,core::felt252)>"),
    ).toEqual("(core::felt252,core::felt252)");
    expect(parseGenericType("no generics")).toBe("no generics");
  });
});
