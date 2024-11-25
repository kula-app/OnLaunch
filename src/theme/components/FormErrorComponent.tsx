import { formErrorAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(formErrorAnatomy.keys);

const baseStyle = definePartsStyle({
  text: {
    color: "red.400",
  },
});

const formErrorTheme = defineMultiStyleConfig({ baseStyle });

export const FormErrorComponent = {
  components: {
    FormError: formErrorTheme,
  },
};
