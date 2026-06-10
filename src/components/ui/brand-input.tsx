"use client";

import { Input, type InputProps } from "@chakra-ui/react";
import { forwardRef } from "react";

const brandOnCardProps: InputProps = {
  color: "white",
  bg: "rgb(19,21,54)",
  borderRadius: "20px",
  border: "0.0625rem solid rgb(86, 87, 122)",
  _invalid: { borderColor: "red.400" },
  _focus: { borderColor: "blue.400" },
  _active: { borderColor: "blue.400" },
};

export const BrandInput = forwardRef<HTMLInputElement, InputProps>(
  function BrandInput(props, ref) {
    return <Input ref={ref} {...brandOnCardProps} {...props} />;
  },
);
