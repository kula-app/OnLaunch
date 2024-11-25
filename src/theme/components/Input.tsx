import { inputAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(inputAnatomy.keys);

const brandOnCardStyle = definePartsStyle({
  field: {
    color: "white",
    bg: "rgb(19,21,54)",
    borderRadius: "20px",
    border: "0.0625rem solid rgb(86, 87, 122)",
    _invalid: {
      borderColor: "red.400",
    },
    _focus: {
      borderColor: "blue.400",
    },
    _active: {
      borderColor: "blue.400",
    },
  },
});

const Input = defineMultiStyleConfig({
  variants: { "brand-on-card": brandOnCardStyle },
});

export const InputComponent = {
  components: {
    Input,
  },
};
