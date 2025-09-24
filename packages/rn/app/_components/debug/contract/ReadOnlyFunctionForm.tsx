"use client";

import {
  themeColors,
  useTheme,
} from "@/components/scaffold-stark/ThemeProvider";
import { isValidContractArgs } from "@/utils/scaffold-stark/common";
import { AbiFunction } from "@/utils/scaffold-stark/contract";
import { Address } from "@starknet-react/chains";
import { useContract, useReadContract } from "@starknet-react/core";
import { Abi } from "abi-wan-kanabi";
import { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { BlockNumber } from "starknet";
import { ContractInput } from "./ContractInput";
import {
  getArgsAsStringInputFromForm,
  getFunctionInputKey,
  getInitialFormState,
  transformAbiFunction,
} from "./utilsContract";
import {
  decodeContractResponse,
  FormErrorMessageState,
  getTopErrorMessage,
  isError,
} from "./utilsDisplay";
// keep only above import; remove duplicate below

type ReadOnlyFunctionFormProps = {
  contractAddress: Address;
  abiFunction: AbiFunction;
  abi: Abi;
  isLast: boolean;
};

export const ReadOnlyFunctionForm = ({
  contractAddress,
  abiFunction,
  abi,
  isLast,
}: ReadOnlyFunctionFormProps) => {
  const [form, setForm] = useState<Record<string, any>>(() =>
    getInitialFormState(abiFunction),
  );
  const [inputValue, setInputValue] = useState<any | undefined>(undefined);
  const [formErrorMessage, setFormErrorMessage] =
    useState<FormErrorMessageState>({});
  const lastForm = useRef(form);

  const { contract: contractInstance } = useContract({
    abi,
    address: contractAddress,
  });

  const inputIsValidArray = isValidContractArgs(
    inputValue,
    abiFunction.inputs.length,
  );

  const { isFetching, data, refetch, error } = useReadContract({
    address: contractAddress,
    functionName: abiFunction.name,
    abi: [...abi],
    args: inputIsValidArray ? inputValue : undefined,
    enabled: !!inputValue && !!contractInstance,
    blockIdentifier: "pre_confirmed" as BlockNumber,
  });

  useEffect(() => {
    if (error) {
      console.error(error?.message);
      console.error(error.stack);
    }
  }, [error]);

  const transformedFunction = transformAbiFunction(abiFunction);
  const inputElements = transformedFunction.inputs.map((input, inputIndex) => {
    const key = getFunctionInputKey(abiFunction.name, input, inputIndex);
    return (
      <ContractInput
        abi={abi}
        key={key}
        setForm={setForm}
        form={form}
        stateObjectKey={key}
        paramType={input}
        setFormErrorMessage={setFormErrorMessage}
      />
    );
  });

  const handleRead = () => {
    const newInputValue = getArgsAsStringInputFromForm(form);
    const expectedArgCount = abiFunction.inputs.length;

    const isValidInput = isValidContractArgs(newInputValue, expectedArgCount);

    if (!isValidInput) {
      /**
       * Todo: add extra logging in future release.
       */
      console.warn(
        `Read blocked: Expected ${expectedArgCount} args, got ${newInputValue.length}`,
      );
      return;
    }

    if (JSON.stringify(form) !== JSON.stringify(lastForm.current)) {
      setInputValue(newInputValue);
      lastForm.current = form;
    }

    refetch();
  };

  const { theme } = useTheme();
  const colors = themeColors[theme];

  const disabled = (inputValue && isFetching) || isError(formErrorMessage);

  return (
    <View className="py-3">
      <Text
        style={{
          color: colors.textHighlight,
          fontWeight: "600",
          marginBottom: 8,
        }}
      >
        {abiFunction.name}
      </Text>
      {inputElements}

      <View className="mt-3">
        {data !== null && data !== undefined ? (
          <View
            className="p-3 rounded"
            style={{ backgroundColor: colors.backgroundSecondary }}
          >
            <Text
              style={{ color: colors.text, fontWeight: "700", marginBottom: 6 }}
            >
              Result:
            </Text>
            <Text selectable style={{ color: colors.text }}>
              {
                decodeContractResponse({
                  resp: data,
                  abi,
                  functionOutputs: abiFunction?.outputs,
                  asText: true,
                }) as string
              }
            </Text>
          </View>
        ) : null}
      </View>

      <View className="mt-3">
        <TouchableOpacity
          onPress={handleRead}
          disabled={!!disabled}
          className="rounded-full items-center justify-center py-2"
          style={{ backgroundColor: disabled ? colors.border : colors.primary }}
        >
          <Text style={{ color: "#ffffff", fontWeight: "600" }}>
            {inputValue && isFetching ? "Reading..." : "Read 📡"}
          </Text>
        </TouchableOpacity>
        {isError(formErrorMessage) ? (
          <Text className="mt-2" style={{ color: colors.textSecondary }}>
            {getTopErrorMessage(formErrorMessage)}
          </Text>
        ) : null}
      </View>

      {!isLast && (
        <View
          className="mt-6"
          style={{ borderBottomWidth: 1, borderColor: colors.divider }}
        />
      )}
    </View>
  );
};
