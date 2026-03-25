/**
 * Lightweight replacements for viem's formatUnits/formatEther/parseEther
 * so we don't need the full viem dependency (an EVM client library) for
 * simple BigInt math.
 */

/**
 * Formats a bigint value with the given number of decimals.
 * Equivalent to viem's formatUnits.
 */
export function formatUnits(value: bigint, decimals: number): string {
  const divisor = 10n ** BigInt(decimals);
  const integerPart = value / divisor;
  const remainder = value % divisor;

  if (remainder === 0n) {
    return integerPart.toString();
  }

  const remainderStr = remainder.toString().padStart(decimals, "0").replace(/0+$/, "");
  return `${integerPart}.${remainderStr}`;
}

/**
 * Formats a bigint wei value to ether (18 decimals).
 * Equivalent to viem's formatEther.
 */
export function formatEther(value: bigint): string {
  return formatUnits(value, 18);
}

/**
 * Parses an ether string to a bigint wei value (18 decimals).
 * Equivalent to viem's parseEther.
 */
export function parseEther(value: string): bigint {
  const [integerPart, fractionalPart = ""] = value.split(".");
  const paddedFraction = fractionalPart.padEnd(18, "0").slice(0, 18);
  return BigInt(integerPart + paddedFraction);
}
