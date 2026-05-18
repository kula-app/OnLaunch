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
import { menuAnatomy } from "@chakra-ui/anatomy";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(menuAnatomy.keys);

const Menu = defineMultiStyleConfig({
  baseStyle: definePartsStyle({
    list: {
      backdropFilter: "blur(120px)",
      bg: "rgba(10, 14, 35, 0.49)",
      border: "1px solid #888888",
    },
    groupTitle: {
      color: "white",
    },
    item: {
      color: "white",
      background: "transparent",
      _hover: {
        background: "#2B327E",
      },
    },
  }),
});

export const MenuComponent = {
  components: {
    Menu,
  },
};
