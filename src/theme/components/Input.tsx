/*
 ============================================================
 CHAKRA UI v3 MIGRATION - STYLE CONFIG CHANGES
 ============================================================

 The following style config patterns were found and need migration:
 - defineMultiStyleConfig
 - createMultiStyleConfigHelpers

 These have been replaced with:
 - defineRecipe (for single-part components)
 - defineSlotRecipe (for multi-part components)

 Key differences:
 1. Recipes use a different structure (base, variants, defaultVariants)
 2. No more "parts" - use "slots" in slot recipes
 3. Variants are defined directly, not in a separate object
 4. Default variants use "defaultVariants" key

 Documentation:
 - Recipes: https://chakra-ui.com/docs/theming/recipes
 - Slot Recipes: https://chakra-ui.com/docs/theming/slot-recipes
 - Migration Guide: https://chakra-ui.com/docs/get-started/migration

 ============================================================
*/
import { inputAnatomy } from "@chakra-ui/anatomy";

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
