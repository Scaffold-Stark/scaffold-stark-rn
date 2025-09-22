import {
  themeColors,
  useTheme,
} from "@/components/scaffold-stark/ThemeProvider";
import { replacer } from "@/utils/scaffold-stark/common";
import { AbiEnum, AbiStruct } from "@/utils/scaffold-stark/contract";
import { isCairoOption } from "@/utils/scaffold-stark/typeValidations";
import { Abi } from "abi-wan-kanabi";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { ContractInput } from "./ContractInput";
import { getFunctionInputKey, getInitialTupleFormState } from "./utilsContract";
import { FormErrorMessageState } from "./utilsDisplay";

type StructProps = {
  abi?: Abi;
  parentForm: Record<string, any> | undefined;
  setParentForm: (form: Record<string, any>) => void;
  parentStateObjectKey: string;
  abiMember?: AbiStruct | AbiEnum;
  setFormErrorMessage: Dispatch<SetStateAction<FormErrorMessageState>>;
  isDisabled?: boolean;
};

export const Struct = ({
  parentForm,
  setParentForm,
  parentStateObjectKey,
  abiMember,
  abi,
  setFormErrorMessage,
  isDisabled = false,
}: StructProps) => {
  const [form, setForm] = useState<Record<string, any>>(() =>
    getInitialTupleFormState(
      abiMember ?? { type: "struct", name: "", members: [] },
    ),
  );

  // select enum
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);

  // side effect to transform data before setState
  useEffect(() => {
    const values = Object.values(form);
    const argsStruct: Record<string, any> = {};
    if (!abiMember) return;

    if (abiMember.type === "struct") {
      abiMember.members.forEach((member, index) => {
        argsStruct[member.name || `input_${index}_`] = {
          type: member.type,
          value: values[index],
        };
      });
    } else {
      abiMember.variants.forEach((variant, index) => {
        argsStruct[variant.name || `input_${index}_`] = {
          type: variant.type,
          value: index === activeVariantIndex ? values[index] : undefined,
        };
      });
    }

    setParentForm({
      ...parentForm,
      [parentStateObjectKey]:
        abiMember.type === "struct" ? argsStruct : { variant: argsStruct },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abiMember, JSON.stringify(form, replacer), activeVariantIndex]);

  if (!abiMember) return null;

  const { theme } = useTheme();
  const colors = themeColors[theme];

  return (
    <View>
      <View
        className="pl-4 pt-2 rounded"
        style={{
          borderWidth: 1,
          borderColor: isDisabled ? colors.border : colors.primary,
        }}
      >
        <Text style={{ color: colors.text, marginBottom: 8 }}>
          {abiMember.type}
        </Text>
        <View
          className="ml-3 pl-3"
          style={{ borderLeftWidth: 1, borderLeftColor: colors.border }}
        >
          {abiMember.type === "struct"
            ? abiMember.members.map((member, index) => {
                const key = getFunctionInputKey(
                  abiMember.name || "struct",
                  member,
                  index,
                );
                return (
                  <ContractInput
                    setFormErrorMessage={setFormErrorMessage}
                    abi={abi}
                    setForm={setForm}
                    form={form}
                    key={index}
                    stateObjectKey={key}
                    paramType={{ name: member.name, type: member.type }}
                  />
                );
              })
            : abiMember.variants.map((variant, index) => {
                const key = getFunctionInputKey(
                  abiMember.name || "tuple",
                  variant,
                  index,
                );

                return (
                  <View key={index} className="flex-row items-center">
                    <TouchableOpacity
                      onPress={() => setActiveVariantIndex(index)}
                      className="mr-2"
                    >
                      <Text style={{ color: colors.text }}>
                        {index === activeVariantIndex ? "◉" : "○"}
                      </Text>
                    </TouchableOpacity>
                    <ContractInput
                      setFormErrorMessage={setFormErrorMessage}
                      abi={abi}
                      setForm={setForm}
                      form={form}
                      key={index}
                      stateObjectKey={key}
                      paramType={variant}
                      isDisabled={
                        index !== activeVariantIndex ||
                        (isCairoOption(abiMember.name) &&
                          variant.name === "None")
                      }
                    />
                  </View>
                );
              })}
        </View>
      </View>
    </View>
  );
};
