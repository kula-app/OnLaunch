"use client";

import { TagSelect } from "@/components/tag-select";
import { MessageRuleComparator } from "@/models/message-rule-comparator";
import { MessageRuleGroupOperator } from "@/models/message-rule-group-operator";
import { MessageRuleSystemVariable } from "@/models/message-rule-system-variable";
import { Box, Button, Flex, Spacer } from "@chakra-ui/react";
import { Field, FieldArray, type FieldProps } from "formik";
import { useEffect, useRef, useState } from "react";
import { FaLayerGroup, FaPlus, FaTrash } from "react-icons/fa6";
import { v4 as uuidv4 } from "uuid";
import type { AdvancedFiltersRuleGroup } from "../../_models/filters/advanced-filters-rule-group";
import { displayLabelOfAdvancedFiltersRuleGroupOperator } from "../../_models/filters/advanced-filters-rule-group-operator";
import type { FilterFormData } from "../../_models/filters/filters-form-data";
import { AdvancedFiltersConditionBox } from "./advanced-filters-condition-box";

interface Props {
  level: number;
  keypath: string[];
  onDeleteGroup?: () => void;
  setAdvancedFilterDirty: () => void;
}

export const AdvancedFiltersRuleGroupBox: React.FC<Props> = ({
  level,
  keypath,
  onDeleteGroup,
  setAdvancedFilterDirty,
}) => {
  return (
    <Flex
      flexDir={"row"}
      background={level % 2 === 0 ? "gray.500" : "gray.400"}
      w={"full"}
      rounded={"lg"}
      py={2}
    >
      <OperatorContainerBox
        keypath={keypath}
        setAdvancedFilterDirty={setAdvancedFilterDirty}
      />
      <Flex flexDir={"column"} w={"full"} gap={2} pr={4} py={2}>
        <RulesContainerBox
          keypath={keypath}
          level={level}
          setAdvancedFilterDirty={setAdvancedFilterDirty}
        />
        <ConditionsContainerBox
          keypath={keypath}
          setAdvancedFilterDirty={setAdvancedFilterDirty}
        />
        <ActionsContainerBox
          keypath={keypath}
          onDeleteGroup={onDeleteGroup}
          setAdvancedFilterDirty={setAdvancedFilterDirty}
        />
      </Flex>
    </Flex>
  );
};

const OperatorContainerBox: React.FC<{
  keypath: string[];
  setAdvancedFilterDirty: () => void;
}> = ({ keypath, setAdvancedFilterDirty }) => {
  // Read the size of the group to determine if it should be rotated
  const containerRef = useRef<HTMLDivElement>(null);
  const [operatorContainerHeight, setOperatorContainerHeight] = useState(0);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { height } = entry.contentRect;
        setOperatorContainerHeight(height);
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <Field name={keypath.concat(["operator"]).join(".")}>
      {({
        field,
      }: FieldProps<AdvancedFiltersRuleGroup["operator"], FilterFormData>) => {
        const backgroundColorPerValue = {
          [MessageRuleGroupOperator.AND]: "green.500",
          [MessageRuleGroupOperator.OR]: "orange.500",
        };
        const shouldRotate = operatorContainerHeight > 72;
        return (
          <Flex
            ref={containerRef}
            flexDir={"column"}
            alignItems={"center"}
            position={"relative"}
            justify={"center"}
            px={!shouldRotate ? 2 : 0}
          >
            {/* Vertical Line */}
            <Box
              position="absolute"
              top={2}
              bottom={2}
              left="50%"
              zIndex="0"
              w={2}
              borderLeft={"2px solid white"}
              borderTop={"2px solid white"}
              borderBottom={"2px solid white"}
            />
            {/* Operator */}
            <Box w={"full"} css={{ rotate: shouldRotate ? "-90deg" : "" }}>
              <TagSelect
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  setAdvancedFilterDirty();
                }}
                id={field.name}
                size={"xs"}
                rounded={"full"}
                zIndex="1"
                background={backgroundColorPerValue[field.value] ?? "gray.500"}
                w={14}
              >
                {Object.values(MessageRuleGroupOperator).map((value) => (
                  <option key={value} value={value}>
                    {displayLabelOfAdvancedFiltersRuleGroupOperator(value)}
                  </option>
                ))}
              </TagSelect>
            </Box>
          </Flex>
        );
      }}
    </Field>
  );
};

const RulesContainerBox: React.FC<{
  keypath: string[];
  level: number;
  setAdvancedFilterDirty: () => void;
}> = ({ keypath, level, setAdvancedFilterDirty }) => {
  return (
    <Field name={keypath.concat(["rules"]).join(".")}>
      {({
        field,
      }: FieldProps<AdvancedFiltersRuleGroup["rules"], FilterFormData>) => (
        <Flex
          flexDir={"column"}
          w={"full"}
          gap={2}
          hidden={!field.value || field.value.length === 0}
        >
          <FieldArray name={field.name}>
            {(fieldArray) => (
              <>
                {field.value?.map((rule, index) => (
                  <AdvancedFiltersRuleGroupBox
                    key={index}
                    keypath={keypath.concat(["rules", `${index}`])}
                    level={level + 1}
                    onDeleteGroup={() => {
                      fieldArray.remove(index);
                      setAdvancedFilterDirty();
                    }}
                    setAdvancedFilterDirty={setAdvancedFilterDirty}
                  />
                ))}
              </>
            )}
          </FieldArray>
        </Flex>
      )}
    </Field>
  );
};

const ConditionsContainerBox: React.FC<{
  keypath: string[];
  setAdvancedFilterDirty: () => void;
}> = ({ keypath, setAdvancedFilterDirty }) => {
  return (
    <Field name={keypath.concat(["conditions"]).join(".")}>
      {({
        field,
      }: FieldProps<
        AdvancedFiltersRuleGroup["conditions"],
        FilterFormData
      >) => {
        const availableSystemVariables = new Set(
          Object.values(MessageRuleSystemVariable),
        ).difference(
          new Set(field.value?.map((rule) => rule.systemVariable ?? [])),
        );

        return (
          <Flex
            flexDir={"column"}
            w={"full"}
            gap={2}
            hidden={!field.value || field.value.length == 0}
          >
            <FieldArray name={field.name}>
              {(fieldArray) => (
                <>
                  {field.value?.map((rule, index) => (
                    <AdvancedFiltersConditionBox
                      key={index}
                      keypath={keypath.concat(["conditions", `${index}`])}
                      availableSystemVariables={availableSystemVariables}
                      onDelete={() => {
                        fieldArray.remove(index);
                        setAdvancedFilterDirty();
                      }}
                      setAdvancedFilterDirty={setAdvancedFilterDirty}
                    />
                  ))}
                </>
              )}
            </FieldArray>
          </Flex>
        );
      }}
    </Field>
  );
};

const ActionsContainerBox: React.FC<{
  keypath: string[];
  onDeleteGroup?: () => void;
  setAdvancedFilterDirty: () => void;
}> = ({ keypath, onDeleteGroup, setAdvancedFilterDirty }) => {
  return (
    <Flex gap={2} w={"full"}>
      <FieldArray name={keypath.concat(["conditions"]).join(".")}>
        {(fieldArray) => (
          <Field name={keypath.concat(["conditions"]).join(".")}>
            {({
              field,
              form,
            }: FieldProps<
              AdvancedFiltersRuleGroup["conditions"],
              FilterFormData
            >) => {
              const availableSystemVariables = Object.values(
                MessageRuleSystemVariable,
              ).filter(
                (variable) =>
                  !field.value?.some(
                    (rule) => rule.systemVariable === variable,
                  ),
              );

              return (
                <Button
                  variant={"solid"}
                  colorScheme={"gray"}
                  size={"xs"}
                  leftIcon={<FaPlus />}
                  onClick={() => {
                    fieldArray.push({
                      id: uuidv4(),
                      systemVariable: availableSystemVariables[0],
                      operator: MessageRuleComparator.EQUALS,
                      userVariable: "",
                    });
                    setAdvancedFilterDirty();
                  }}
                  disabled={availableSystemVariables.length === 0}
                >
                  Add Filter
                </Button>
              );
            }}
          </Field>
        )}
      </FieldArray>
      <FieldArray name={keypath.concat(["rules"]).join(".")}>
        {(fieldArray) => (
          <Button
            variant={"solid"}
            colorScheme={"gray"}
            size={"xs"}
            leftIcon={<FaLayerGroup />}
            onClick={() => {
              fieldArray.push({
                id: uuidv4(),
                operator: MessageRuleGroupOperator.AND,
                rules: [],
              });
              setAdvancedFilterDirty();
            }}
          >
            Add Group
          </Button>
        )}
      </FieldArray>
      <Spacer />
      {onDeleteGroup && (
        <Button
          variant={"solid"}
          colorScheme={"red"}
          size={"xs"}
          leftIcon={<FaTrash />}
          onClick={onDeleteGroup}
        >
          Delete Group
        </Button>
      )}
    </Flex>
  );
};
