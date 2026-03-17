import { useCallback, useEffect, useState } from "react";
import { Text, TouchableOpacity } from "react-native";
import { parseEther } from "viem";
import { InputBase } from "./InputBase";
import { CommonInputProps, isValidInteger } from "./utils";

type IntegerInputProps = CommonInputProps<string | bigint> & {
  variant?: string;
  disableMultiplyBy1e18?: boolean;
  onError?: (message: string | null) => void;
};

export const IntegerInput = ({
  value,
  onChange,
  name,
  placeholder,
  disabled,
  variant = "core::integer::u256",
  disableMultiplyBy1e18 = false,
  onError,
}: IntegerInputProps) => {
  const [inputError, setInputError] = useState(false);
  const multiplyBy1e18 = useCallback(() => {
    if (!value) {
      return;
    }

    return inputError
      ? onChange(value)
      : onChange(parseEther(value.toString()).toString());
  }, [onChange, value, inputError]);

  useEffect(() => {
    const isIntValid = isValidInteger(variant, value);
    setInputError(!isIntValid);
    if (onError) {
      onError(null);
      if (!isIntValid) onError("Invalid number input");
    }
  }, [value, variant, onError]);

  return (
    <InputBase
      name={name}
      value={value}
      placeholder={placeholder}
      error={inputError}
      onChange={onChange}
      disabled={disabled}
      suffix={
        !inputError &&
        !disabled &&
        !disableMultiplyBy1e18 && (
          <TouchableOpacity
            onPress={multiplyBy1e18}
            disabled={disabled}
            className="px-3"
          >
            <Text>∗</Text>
          </TouchableOpacity>
        )
      }
    />
  );
};
