import React, { ReactNode, useEffect, useRef } from "react";
import { TextInput, View } from "react-native";
import { themeColors, useTheme } from "../ThemeProvider";
import { CommonInputProps } from "./utils";

type InputBaseProps<T> = CommonInputProps<T> & {
  error?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  reFocus?: boolean;
};

export const InputBase = <
  T extends { toString: () => string } | undefined = string,
>({
  name,
  value,
  onChange,
  placeholder,
  error,
  disabled,
  prefix,
  suffix,
  reFocus,
}: InputBaseProps<T>) => {
  const inputRef = useRef<TextInput>(null);
  const { theme } = useTheme();
  const colors = themeColors[theme];

  useEffect(() => {
    if (reFocus) inputRef.current?.focus();
  }, [reFocus]);

  return (
    <View
      className="flex-row items-center rounded-full"
      style={{
        backgroundColor: colors.backgroundSecondary,
        borderColor: error ? "#EF4444" : colors.border,
        borderWidth: 1,
      }}
    >
      {prefix}
      <TextInput
        ref={inputRef}
        placeholder={placeholder}
        value={value?.toString() || ""}
        editable={!disabled}
        onChangeText={(text) => onChange(text as unknown as T)}
        autoCorrect={false}
        autoCapitalize="none"
        style={{
          flex: 1,
          paddingHorizontal: 12,
          paddingVertical: 8,
          color: colors.text,
        }}
        placeholderTextColor={colors.textSecondary}
        className="rounded-full"
      />
      {suffix}
    </View>
  );
};
