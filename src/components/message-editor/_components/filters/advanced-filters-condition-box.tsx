"use client";

import { MessageRuleComparator } from "@/models/message-rule-comparator";
import { MessageRuleSystemVariable } from "@/models/message-rule-system-variable";
import {
  Flex,
  Icon,
  IconButton,
  Input,
  Select,
  Field,
} from "@chakra-ui/react";
import { Field, type FieldProps } from "formik";
import { FaTrash } from "react-icons/fa6";
import type { AdvancedFiltersRuleCondition } from "../../_models/filters/advanced-filters-rule-condition";
import {
  displayTextForAdvancedFiltersRuleOperator,
  isUnaryOperator,
} from "../../_models/filters/advanced-filters-rule-operator";
import { displayTextForAdvancedFilterRulesSystemVariable } from "../../_models/filters/advanced-filters-rule-system-variable";

interface AdvancedFilterRuleConditionBoxProps {
  keypath: string[];
  availableSystemVariables: Set<MessageRuleSystemVariable>;
  onDelete: () => void;
  setAdvancedFilterDirty: () => void;
}

export const AdvancedFiltersConditionBox: React.FC<
  AdvancedFilterRuleConditionBoxProps
> = ({
  keypath,
  onDelete,
  availableSystemVariables,
  setAdvancedFilterDirty,
}) => {
  return (
    <Flex flexDir={"row"} gap={2} align={"center"}>
      <Field name={keypath.concat(["systemVariable"]).join(".")}>
        {({
          field,
        }: FieldProps<AdvancedFiltersRuleCondition["systemVariable"]>) => (
          <Field.Root w={"auto"}>
            <Select
              {...field}
              onChange={(e) => {
                field.onChange(e);
                setAdvancedFilterDirty();
              }}
              id={field.name}
              rounded={"full"}
              size={"xs"}
            >
              {Object.values(MessageRuleSystemVariable).map((value) => (
                <option
                  key={value}
                  value={value}
                  disabled={!availableSystemVariables.has(value)}
                >
                  {displayTextForAdvancedFilterRulesSystemVariable(value)}
                </option>
              ))}
            </Select>
          </Field.Root>
        )}
      </Field>
      <Field name={keypath.concat(["operator"]).join(".")}>
        {({
          field,
          form,
        }: FieldProps<AdvancedFiltersRuleCondition["comparator"]>) => (
          <Field.Root w={"auto"} flexGrow={1}>
            <Select
              {...field}
              onChange={(e) => {
                field.onChange(e);
                setAdvancedFilterDirty();
              }}
              id={field.name}
              rounded={"full"}
              size={"xs"}
            >
              {Object.values(MessageRuleComparator).map((value) => (
                <option key={value} value={value}>
                  {displayTextForAdvancedFiltersRuleOperator(value)}
                </option>
              ))}
            </Select>
          </Field.Root>
        )}
      </Field>
      <Field name={keypath.concat(["userVariable"]).join(".")}>
        {({
          field,
          form,
        }: FieldProps<AdvancedFiltersRuleCondition["userVariable"]>) => {
          const parent = keypath.reduce(
            (previous, key) => previous[key],
            form.values,
          );
          return (
            <Field.Root
              w={"auto"}
              flexGrow={1}
              hidden={isUnaryOperator(parent.operator)}
            >
              <Input
                {...field}
                value={field.value ?? ""}
                onChange={(e) => {
                  field.onChange(e);
                  setAdvancedFilterDirty();
                }}
                id={field.name}
                rounded={"full"}
                size={"xs"}
                placeholder={"Enter a value..."}
              />
            </Field.Root>
          );
        }}
      </Field>
      <IconButton
        aria-label={"Delete"}
        icon={<Icon as={FaTrash} />}
        colorScheme={"red"}
        rounded={"full"}
        size={"xs"}
        onClick={onDelete}
      />
    </Flex>
  );
};
