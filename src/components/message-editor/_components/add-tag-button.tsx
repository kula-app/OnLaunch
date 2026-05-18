"use client";

import { Steps, Box, Input, Menu, Tag, TagLabel, TagRightIcon, Portal } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FiPlusCircle } from "react-icons/fi";

interface Props<T> {
  values: {
    id: T;
    name: string;
  }[];
  onClick: (id: T) => void;
}

export function AddTagButton<T extends React.Key>({
  values,
  onClick,
}: Props<T>) {
  const [search, setSearch] = useState("");
  const [filteredValues, setFilteredValues] = useState(values);

  useEffect(() => {
    setFilteredValues(
      values.filter((value) =>
        value.name.toLowerCase().includes(search.toLowerCase()),
      ),
    );
  }, [search, values]);

  return (
    <Menu.Root closeOnSelect={false}>
      <Menu.Trigger type={"button"}>
        <Tag.Root size={"md"} key={"add"} variant="outline" colorPalette="blue">
          <Tag.Label>Add</Tag.Label>
          <Tag.EndElement asChild><FiPlusCircle /></Tag.EndElement>
        </Tag.Root>
      </Menu.Trigger>
      <Portal><Menu.Positioner><Menu.Content>
            <Box px={3} pb={2}>
              <Input
                value={search}
                onValueChange={(e) => setSearch(e.target.value)}
                placeholder={"Search..."}
              />
            </Box>
            {filteredValues.map((value) => (
              <Menu.Item
                key={value.id}
                onSelect={() => {
                  onClick(value.id);
                  setSearch("");
                }}
                value='item-0'>
                {value.name}
              </Menu.Item>
            ))}
          </Menu.Content></Menu.Positioner></Portal>
    </Menu.Root>
  );
}
