import { Address } from "@starknet-react/chains";
import { blo } from "blo";
import { useCallback, useEffect, useState } from "react";
import { Image, View } from "react-native";
import { InputBase } from "./InputBase";
import { CommonInputProps } from "./utils";

/**
 * Avatar component for address input
 */
const AddressAvatar = ({ address }: { address: string }) => {
  const [avatarSrc, setAvatarSrc] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const avatarUrl = blo(address as `0x${string}`);
    setAvatarSrc(avatarUrl);
    setIsLoading(false);
  }, [address]);

  if (isLoading) {
    return <View className="w-[35px] h-[35px] rounded-full bg-gray-200" />;
  }

  return (
    <Image
      source={{ uri: avatarSrc }}
      style={{ width: 35, height: 35, borderRadius: 35 }}
    />
  );
};

/**
 * Address input with ENS name resolution
 */
export const AddressInput = ({
  value,
  name,
  placeholder,
  onChange,
  disabled,
}: CommonInputProps<Address | string>) => {
  // TODO : Add Starkname functionality here with cached profile, check ENS on scaffold-stark

  const handleChange = useCallback(
    (newValue: Address) => {
      const sanitizedValue = newValue.toLowerCase();

      if (sanitizedValue === "0x") {
        onChange("0x0" as Address);
        return;
      }

      const isValid = /^0x[a-f0-9]{1,64}$/.test(sanitizedValue);
      if (!isValid) {
        return;
      }

      onChange(newValue);
    },
    [onChange],
  );

  return (
    <InputBase<Address>
      name={name}
      placeholder={placeholder}
      value={value as Address}
      onChange={handleChange}
      disabled={disabled}
      prefix={null}
      suffix={value && <AddressAvatar address={value as string} />}
    />
  );
};
