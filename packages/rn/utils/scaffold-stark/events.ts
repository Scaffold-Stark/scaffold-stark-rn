import { ExtractAbiEvent, ExtractAbiEventNames } from "abi-wan-kanabi/kanabi";
import {
  Abi,
  AbiEntry,
  AbiEnums,
  AbiStructs,
  CallData,
  createAbiParser,
  getChecksumAddress,
  parseCalldataField,
  events as starknetEvents,
  RpcProvider,
  hash,
} from "starknet";
import { feltToHex } from "./common";
import { ContractAbi, ContractName } from "./contract";

/**
 * Resolves an event ABI entry by event name from the contract ABI.
 */
export function resolveEventAbi<
  TContractName extends ContractName,
  TEventName extends ExtractAbiEventNames<ContractAbi<TContractName>>,
>(abi: Abi | undefined, eventName: string) {
  const matches = (abi as Abi | undefined)?.filter(
    (part) =>
      part.type === "event" && part.name.split("::").slice(-1)[0] === eventName,
  ) as ExtractAbiEvent<ContractAbi<TContractName>, TEventName>[] | undefined;
  if (!matches || matches.length === 0) return undefined;
  if (matches.length > 1)
    throw new Error(`Ambiguous event "${String(eventName)}"`);
  return matches[0];
}

/**
 * Parses event logs and extracts the arguments.
 */
export function parseLogsArgs(abi: Abi, fullEventName: string, logs: any[]) {
  const cloned = logs.map((l) => JSON.parse(JSON.stringify(l)));
  const parsed = starknetEvents.parseEvents(
    cloned,
    starknetEvents.getAbiEvents(abi),
    CallData.getAbiStruct(abi),
    CallData.getAbiEnum(abi),
    createAbiParser(abi),
  );
  return parsed.length ? parsed[0][fullEventName] : {};
}

/**
 * Enriches a log with block, transaction, and receipt data.
 */
export async function enrichLog(
  client: RpcProvider,
  log: any,
  opts: { block?: boolean; transaction?: boolean; receipt?: boolean },
) {
  const [block, transaction, receipt] = await Promise.all([
    opts.block && log.block_hash !== null
      ? client.getBlockWithTxHashes(log.block_hash)
      : Promise.resolve(null),
    opts.transaction && log.transaction_hash !== null
      ? client.getTransactionByHash(log.transaction_hash)
      : Promise.resolve(null),
    opts.receipt && log.transaction_hash !== null
      ? client.getTransactionReceipt(log.transaction_hash)
      : Promise.resolve(null),
  ]);
  return { block, transaction, receipt };
}

/**
 * Gets the latest accepted block number.
 */
export async function getLatestAcceptedBlockNumber(
  client: RpcProvider,
): Promise<bigint> {
  const latest = await client.getBlockLatestAccepted();
  return BigInt(latest.block_number);
}

/**
 * Builds event keys for WebSocket subscription filtering.
 */
export function buildEventKeys(
  eventName: string,
  filters: Record<string, unknown> | undefined,
  eventAbi: any,
  abi: Abi,
  maxKeys = 16,
) {
  let keys: string[][] = [[hash.getSelectorFromName(eventName)]];
  if (filters) {
    keys = keys.concat(
      composeEventFilterKeys(filters as any, eventAbi as any, abi),
    );
  }
  return keys.slice(0, maxKeys);
}

const stringToByteArrayFelt = (str: string): string[] => {
  const bytes = new TextEncoder().encode(str);
  const result = [];
  const numFullWords = Math.floor(bytes.length / 31);
  result.push(numFullWords.toString());

  for (let i = 0; i < numFullWords; i++) {
    const chunk = bytes.slice(i * 31, (i + 1) * 31);
    const felt = "0x" + Buffer.from(chunk).toString("hex");
    result.push(felt);
  }

  const remainingBytes = bytes.slice(numFullWords * 31);
  if (remainingBytes.length > 0) {
    const pendingWord = "0x" + Buffer.from(remainingBytes).toString("hex");
    result.push(pendingWord);
  } else {
    result.push("0x0");
  }

  result.push(remainingBytes.length.toString());
  return result;
};

export const serializeEventKey = (
  input: any,
  abiEntry: AbiEntry,
  structs: AbiStructs,
  enums: AbiEnums,
  abi: Abi,
): string[] => {
  if (abiEntry.type === "core::byte_array::ByteArray") {
    return stringToByteArrayFelt(input).map((item) => feltToHex(BigInt(item)));
  }
  const args = [input][Symbol.iterator]();
  const parsed = parseCalldataField({
    argsIterator: args,
    input: abiEntry,
    structs,
    enums,
    parser: createAbiParser(abi),
  });
  if (typeof parsed === "string") {
    return [feltToHex(BigInt(parsed))];
  }
  return parsed.map((item: string) => feltToHex(BigInt(item)));
};

const is2DArray = (arr: any) => {
  return Array.isArray(arr) && arr.every((item) => Array.isArray(item));
};

const isUniformLength = (arr: any[][]) => {
  if (!Array.isArray(arr) || arr.length === 0) return false;

  const firstLength = arr[0].length;
  return arr.every((subArray) => subArray.length === firstLength);
};

const mergeArrays = (arrays: any[][]) => {
  return arrays[0].map((_, index) => arrays.map((array) => array[index][0]));
};

const certainLengthTypeMap: { [key: string]: string[][] } = {
  "core::starknet::contract_address::ContractAddress": [[]],
  "core::starknet::eth_address::EthAddress": [[]], // Kept for backward compatibility
  "core::starknet::class_hash::ClassHash": [[]],
  "core::starknet::storage_access::StorageAddress": [[]],
  "core::bool": [[]],
  "core::integer::u8": [[]],
  "core::integer::u16": [[]],
  "core::integer::u32": [[]],
  "core::integer::u64": [[]],
  "core::integer::u128": [[]],
  "core::integer::u256": [[], []],
  "core::integer::u512": [[], [], [], []],
  "core::bytes_31::bytes31": [[]],
  "core::felt252": [[]],
};

export const composeEventFilterKeys = (
  input: { [key: string]: any },
  event: ExtractAbiEvent<
    ContractAbi<ContractName>,
    ExtractAbiEventNames<ContractAbi<ContractName>>
  >,
  abi: Abi,
): string[][] => {
  if (!("members" in event)) {
    return [];
  }
  const enums = CallData.getAbiEnum(abi);
  const structs = CallData.getAbiStruct(abi);
  const members = event.members as unknown as {
    name: string;
    type: string;
    kind: "key" | "data";
    value: any;
  }[];
  let keys: string[][] = [];
  const keyMembers = members.filter((member) => member.kind === "key");
  const clonedKeyMembers = JSON.parse(JSON.stringify(keyMembers));
  for (const member of clonedKeyMembers) {
    if (member.name in input) {
      member.value = input[member.name];
    }
  }
  for (const member of clonedKeyMembers) {
    if (member.value !== undefined) {
      if (
        !member.type.startsWith("core::array::Array::") &&
        Array.isArray(member.value)
      ) {
        keys = keys.concat(
          mergeArrays(
            member.value.map((matchingItem: any) =>
              serializeEventKey(matchingItem, member, structs, enums, abi).map(
                (item) => [item],
              ),
            ),
          ),
        );
      } else if (
        member.type.startsWith("core::array::Array::") &&
        is2DArray(member.value)
      ) {
        if (!isUniformLength(member.value)) {
          break;
        }
        keys = keys.concat(
          mergeArrays(
            member.value.map((matchingItem: any) =>
              serializeEventKey(matchingItem, member, structs, enums, abi).map(
                (item) => [item],
              ),
            ),
          ),
        );
      } else {
        const serializedKeys = serializeEventKey(
          member.value,
          member,
          structs,
          enums,
          abi,
        ).map((item) => [item]);
        keys = keys.concat(serializedKeys);
      }
    } else {
      if (member.type in certainLengthTypeMap) {
        keys = keys.concat(certainLengthTypeMap[member.type]);
      } else {
        break;
      }
    }
  }
  return keys;
};

export const parseEventData = (
  args: Record<string, any>,
  types: { name: string; type: string; kind: string }[],
) => {
  const convertToHex = (value: bigint): string => {
    return getChecksumAddress(`0x${value.toString(16)}`);
  };

  const result: Record<string, any> = {};

  Object.keys(args).forEach((paramName: string) => {
    const paramValue = args[paramName];
    const paramType = types.find((t) => t.name === paramName)?.type;
    if (!paramType) {
      result[paramName] = paramValue;
      return;
    }

    if (paramType === "core::starknet::contract_address::ContractAddress") {
      result[paramName] = convertToHex(paramValue);
    } else if (
      paramType ===
      "core::array::Array::<core::starknet::contract_address::ContractAddress>"
    ) {
      result[paramName] = paramValue.map((item: bigint) => convertToHex(item));
    } else if (paramType.startsWith("(") && paramType.endsWith(")")) {
      const innerTypes = paramType.slice(1, -1).split(",");
      const indexesOfAddress = innerTypes
        .map((type, index) =>
          type.trim() === "core::starknet::contract_address::ContractAddress"
            ? index
            : -1,
        )
        .filter((index) => index !== -1);
      const newTuple: Record<number, any> = {};
      Object.keys(paramValue).forEach((key) => {
        newTuple[Number(key)] = paramValue[key];
      });
      for (const index of indexesOfAddress) {
        newTuple[index] = convertToHex(newTuple[index]);
      }
      result[paramName] = newTuple;
    } else {
      result[paramName] = paramValue;
    }
  });

  return result;
};
