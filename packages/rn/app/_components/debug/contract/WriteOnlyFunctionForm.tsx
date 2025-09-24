"use client";

import {
  themeColors,
  useTheme,
} from "@/components/scaffold-stark/ThemeProvider";
import { useTargetNetwork } from "@/hooks/scaffold-stark/useTargetNetwork";
import { useTransactor } from "@/hooks/scaffold-stark/useTransactor";
import { AbiFunction } from "@/utils/scaffold-stark/contract";
import { Address } from "@starknet-react/chains";
import { useAccount, useContract, useNetwork } from "@starknet-react/core";
import { Abi } from "abi-wan-kanabi";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { InvokeTransactionReceiptResponse } from "starknet";
import { ContractInput } from "./ContractInput";
import { TxReceipt } from "./TxReceipt";
import {
  getArgsAsStringInputFromForm,
  getFunctionInputKey,
  getInitialFormState,
  transformAbiFunction,
} from "./utilsContract";
import {
  FormErrorMessageState,
  getTopErrorMessage,
  isError,
} from "./utilsDisplay";

type WriteOnlyFunctionFormProps = {
  abi: Abi;
  abiFunction: AbiFunction;
  onChange: () => void;
  contractAddress: Address;
  //   inheritedFrom?: string;
};

export const WriteOnlyFunctionForm = ({
  abi,
  abiFunction,
  onChange,
  contractAddress,
}: WriteOnlyFunctionFormProps) => {
  const [form, setForm] = useState<Record<string, any>>(() =>
    getInitialFormState(abiFunction),
  );
  const [formErrorMessage, setFormErrorMessage] =
    useState<FormErrorMessageState>({});
  const { status: walletStatus, isConnected, account, chainId } = useAccount();
  const { chain } = useNetwork();
  const {
    writeTransaction,
    transactionReceiptInstance,
    sendTransactionInstance,
  } = useTransactor();
  const { data: txResult } = transactionReceiptInstance;
  const { targetNetwork } = useTargetNetwork();

  const writeDisabled = useMemo(
    () =>
      !chain ||
      chain?.network !== targetNetwork.network ||
      walletStatus === "disconnected",
    [chain, targetNetwork.network, walletStatus],
  );

  const { contract: contractInstance } = useContract({
    abi,
    address: contractAddress,
  });

  const { isPending: isLoading, error } = sendTransactionInstance;

  // side effect for error logging
  useEffect(() => {
    if (error) {
      console.error(error?.message);
      console.error(error.stack);
    }
  }, [error]);

  const handleWrite = async () => {
    try {
      setDisplayedTxResult(undefined);
      await writeTransaction(
        !!contractInstance
          ? [
              contractInstance.populate(
                abiFunction.name,
                getArgsAsStringInputFromForm(form),
              ),
            ]
          : [],
      );
      // Call onChange after successful transaction to refresh display variables
      onChange();
    } catch (e: any) {
      const errorPattern = /Contract (.*?)"}/;
      const match = errorPattern.exec(e.message);
      const message = match ? match[1] : e.message;

      console.error(
        "⚡️ ~ file: WriteOnlyFunctionForm.tsx:handleWrite ~ error",
        message,
      );
    }
  };

  const [displayedTxResult, setDisplayedTxResult] =
    useState<InvokeTransactionReceiptResponse>();
  useEffect(() => {
    if (txResult) {
      setDisplayedTxResult(
        txResult as unknown as InvokeTransactionReceiptResponse,
      );
    }
  }, [txResult]);

  // TODO use `useMemo` to optimize also update in ReadOnlyFunctionForm
  const transformedFunction = transformAbiFunction(abiFunction);
  const inputs = transformedFunction.inputs.map(
    (input: any, inputIndex: number) => {
      const key = getFunctionInputKey(abiFunction.name, input, inputIndex);
      return (
        <ContractInput
          abi={abi}
          key={key}
          setForm={(updatedFormValue: Record<string, any>) => {
            setForm(updatedFormValue);
          }}
          form={form}
          stateObjectKey={key}
          paramType={input}
          setFormErrorMessage={setFormErrorMessage}
        />
      );
    },
  );
  const zeroInputs = inputs.length === 0;

  const errorMsg = (() => {
    if (writeDisabled) return "Wallet not connected or on wrong network";
    return getTopErrorMessage(formErrorMessage);
  })();

  const { theme } = useTheme();
  const colors = themeColors[theme];

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
      {inputs}

      {!zeroInputs && displayedTxResult ? (
        <View className="mt-3">
          <TxReceipt txResult={displayedTxResult} />
        </View>
      ) : null}

      <View className="mt-3">
        <TouchableOpacity
          onPress={handleWrite}
          disabled={writeDisabled || isError(formErrorMessage) || isLoading}
          className="rounded-full items-center justify-center py-2"
          style={{
            backgroundColor:
              writeDisabled || isError(formErrorMessage) || isLoading
                ? colors.border
                : colors.primary,
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={{ color: "#ffffff", fontWeight: "600" }}>Send 💸</Text>
          )}
        </TouchableOpacity>
        {!!errorMsg ? (
          <Text className="mt-2" style={{ color: colors.textSecondary }}>
            {errorMsg}
          </Text>
        ) : null}
      </View>

      {zeroInputs && txResult ? (
        <View className="mt-3">
          <TxReceipt txResult={txResult} />
        </View>
      ) : null}

      <View
        className="mt-6"
        style={{ borderBottomWidth: 1, borderColor: colors.divider }}
      />
    </View>
  );
};
