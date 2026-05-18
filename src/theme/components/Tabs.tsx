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
import { tabsAnatomy } from "@chakra-ui/anatomy";
import { getColor } from "@chakra-ui/theme-tools";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(tabsAnatomy.keys);

const brandOnCardStyle = definePartsStyle((props) => {
  const { colorScheme: c, theme } = props;
  return {
    tab: {
      borderRadius: "full",
      fontWeight: "semibold",
      color: "white",
      _selected: {
        color: getColor(theme, `${c}.700`),
        bg: getColor(theme, `${c}.100`),
      },
    },
  };
});

const Tabs = defineMultiStyleConfig({
  variants: { "brand-on-card": brandOnCardStyle },
});

export const TabsComponent = {
  components: {
    Tabs,
  },
};
