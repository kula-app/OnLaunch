"use client";

import {
  Box,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Tag,
  TagLabel,
  TagRightIcon,
} from "@chakra-ui/react";
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
    <Menu closeOnSelect={false}>
      <MenuButton type={"button"}>
        <Tag size={"md"} key={"add"} variant="outline" colorScheme="blue">
          <TagLabel>Add</TagLabel>
          <TagRightIcon as={FiPlusCircle} />
        </Tag>
      </MenuButton>
      <MenuList>
        <Box px={3} pb={2}>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={"Search..."}
          />
        </Box>
        {filteredValues.map((value) => (
          <MenuItem
            key={value.id}
            onClick={() => {
              onClick(value.id);
              setSearch("");
            }}
          >
            {value.name}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
}
