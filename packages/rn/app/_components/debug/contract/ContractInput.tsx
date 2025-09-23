"use client";

import { InputBase, IntegerInput } from "@/components/scaffold-stark";
import {
  themeColors,
  useTheme,
} from "@/components/scaffold-stark/ThemeProvider";
import { AbiParameter } from "@/utils/scaffold-stark/contract";
import {
  isCairoArray,
  isCairoBigInt,
  isCairoInt,
  isCairoOption,
  isCairoResult,
  isCairoTuple,
  isCairoType,
  isCairoU256,
  isCairoVoid,
} from "@/utils/scaffold-stark/typeValidations";
import { Abi } from "abi-wan-kanabi";
import { Dispatch, SetStateAction } from "react";
import { Text, View } from "react-native";
import { ArrayInput } from "./Array";
import { Struct } from "./Struct";
import {
  addError,
  clearError,
  displayType,
  FormErrorMessageState,
} from "./utilsDisplay";

type ContractInputProps = {
  abi?: Abi;
  setForm: Dispatch<SetStateAction<Record<string, any>>>;
  form: Record<string, any> | undefined;
  stateObjectKey: string;
  paramType: AbiParameter;
  setFormErrorMessage: Dispatch<SetStateAction<FormErrorMessageState>>;
  isDisabled?: boolean;
};

export const ContractInput = ({
  abi,
  setForm,
  form,
  stateObjectKey,
  paramType,
  setFormErrorMessage,
  isDisabled,
}: ContractInputProps) => {
  const { theme } = useTheme();
  const colors = themeColors[theme];

  const inputProps = {
    name: stateObjectKey,
    value: form?.[stateObjectKey],
    placeholder: paramType.name
      ? `${displayType(paramType.type)} ${paramType.name}`
      : displayType(paramType.type),
    onChange: (value: any) => {
      setForm((form) => ({
        ...form,
        [stateObjectKey]: value,
      }));
    },
  };

  const renderInput = () => {
    if (isCairoArray(paramType.type)) {
      return (
        <ArrayInput
          abi={abi!}
          parentStateObjectKey={stateObjectKey}
          abiParameter={paramType}
          parentForm={form}
          setParentForm={setForm}
          setFormErrorMessage={setFormErrorMessage}
          isDisabled={isDisabled}
        />
      );
    }

    // we prio tuples here to avoid wrong input
    else if (isCairoTuple(paramType.type)) {
      return <InputBase {...inputProps} disabled={isDisabled} />;
    } else if (
      isCairoInt(paramType.type) ||
      isCairoBigInt(paramType.type) ||
      isCairoU256(paramType.type)
    ) {
      return (
        <IntegerInput
          {...inputProps}
          variant={paramType.type}
          disabled={isDisabled}
          onError={(errMessage: string | null) =>
            setFormErrorMessage((prev) => {
              if (!!errMessage)
                return addError(prev, "intError" + stateObjectKey, errMessage);
              return clearError(prev, "intError" + stateObjectKey);
            })
          }
        />
      );
    } else if (
      isCairoType(paramType.type) &&
      !isCairoResult(paramType.type) &&
      !isCairoOption(paramType.type)
    ) {
      if (isCairoVoid(paramType.type)) {
        return <></>;
      }
      return <InputBase {...inputProps} disabled={isDisabled} />;
    } else {
      return (
        <Struct
          setFormErrorMessage={setFormErrorMessage}
          abi={abi}
          parentForm={form}
          setParentForm={setForm}
          parentStateObjectKey={stateObjectKey}
          // @ts-ignore
          abiMember={abi?.find(
            // @ts-ignore
            (member) => member.name === paramType.type,
          )}
          isDisabled={isDisabled}
        />
      );
    }
  };

  return (
    <View className="w-full mb-3">
      <View className="flex-row items-center ml-2 mb-1">
        {paramType.name ? (
          <Text
            className="text-xs font-medium mr-2"
            style={{ color: colors.text }}
          >
            {paramType.name}
          </Text>
        ) : null}
        <Text className="text-xs font-light" style={{ color: colors.textType }}>
          [{displayType(paramType.type)}]
        </Text>
      </View>
      {renderInput()}
    </View>
  );
};
