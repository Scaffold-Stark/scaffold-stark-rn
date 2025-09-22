import {
  themeColors,
  useTheme,
} from "@/components/scaffold-stark/ThemeProvider";
import { replacer } from "@/utils/scaffold-stark/common";
import { AbiParameter } from "@/utils/scaffold-stark/contract";
import { parseGenericType } from "@/utils/scaffold-stark/typeValidations";
import { Abi } from "abi-wan-kanabi";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { ContractInput } from "./ContractInput";
import { FormErrorMessageState } from "./utilsDisplay";

type ArrayProps = {
  abi: Abi;
  abiParameter: AbiParameter;
  parentForm: Record<string, any> | undefined;
  setParentForm: (form: Record<string, any>) => void;
  parentStateObjectKey: string;
  setFormErrorMessage: Dispatch<SetStateAction<FormErrorMessageState>>;
  isDisabled?: boolean;
};

export const ArrayInput = ({
  abi,
  parentForm,
  setParentForm,
  parentStateObjectKey,
  abiParameter,
  setFormErrorMessage,
  isDisabled,
}: ArrayProps) => {
  // array in object representation
  const [inputArr, setInputArr] = useState<any>({});
  const [arrLength, setArrLength] = useState<number>(-1);

  const elementType = useMemo(() => {
    const parsed = parseGenericType(abiParameter.type);
    return Array.isArray(parsed) ? parsed[0] : parsed;
  }, [abiParameter.type]);

  // side effect to transform data before setState
  useEffect(() => {
    // non empty objects only
    setParentForm({
      ...parentForm,
      [parentStateObjectKey]: Object.values(inputArr).filter(
        (item) => item !== null,
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(inputArr, replacer)]);

  const { theme } = useTheme();
  const colors = themeColors[theme];

  return (
    <View>
      <View
        className="pl-4 pt-2 rounded"
        style={{ borderWidth: 1, borderColor: colors.primary }}
      >
        <Text style={{ color: colors.text, marginBottom: 8 }}>
          array (length: {arrLength + 1})
        </Text>
        <View
          className="ml-3 pl-3"
          style={{ borderLeftWidth: 1, borderLeftColor: colors.border }}
        >
          {Object.keys(inputArr).map((index) => {
            return (
              <ContractInput
                abi={abi}
                key={index}
                isDisabled={isDisabled}
                setForm={(
                  nextInputRecipe:
                    | Record<string, any>
                    | ((arg: Record<string, any>) => void),
                ) => {
                  const nextInputObject: Record<string, any> =
                    typeof nextInputRecipe === "function"
                      ? nextInputRecipe(parentForm!)
                      : nextInputRecipe;

                  setInputArr((currentInputArray: any) => ({
                    ...currentInputArray,
                    [index]: nextInputObject?.[index] || null,
                  }));
                }}
                form={inputArr}
                stateObjectKey={index}
                paramType={
                  {
                    name: `${abiParameter.name}[${index}]`,
                    type: elementType,
                  } as AbiParameter
                }
                setFormErrorMessage={setFormErrorMessage}
              />
            );
          })}

          <View className="flex-row gap-3 mt-2">
            <TouchableOpacity
              onPress={() => {
                const nextLength = arrLength + 1;
                setInputArr((prev: any) => ({ ...prev, [nextLength]: null }));
                setArrLength(nextLength);
              }}
              className="px-3 py-2 rounded-full"
              style={{ backgroundColor: colors.primary }}
            >
              <Text style={{ color: "#ffffff" }}>+ Add (push)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (arrLength > -1) {
                  const nextInputArr = { ...inputArr } as any;
                  delete nextInputArr[arrLength];
                  setInputArr(nextInputArr);
                  setArrLength((prev) => prev - 1);
                }
              }}
              className="px-3 py-2 rounded"
              style={{ backgroundColor: colors.border }}
            >
              <Text style={{ color: colors.text }}>- Remove (pop)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};
