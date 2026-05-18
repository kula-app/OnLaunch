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
import { cardAnatomy } from "@chakra-ui/anatomy";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(cardAnatomy.keys);

const Card = defineMultiStyleConfig({
  baseStyle: definePartsStyle({
    container: {
      display: "flex",
      flexDirection: "column",
      backdropFilter: "blur(120px)",
      borderRadius: 20,
      bg: "linear-gradient(127deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.49) 75%)",
      backgroundClip: "border-box",
    },
    header: {
      display: "flex",
      flexDirection: "column",
    },
    body: {
      display: "flex",
      flexDirection: "column",
    },
  }),
});

export const CardComponent = {
  components: {
    Card,
  },
};
