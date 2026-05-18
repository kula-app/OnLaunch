/*
 ============================================================
 CHAKRA UI v3 MIGRATION - STYLE CONFIG CHANGES
 ============================================================

 The following style config patterns were found and need migration:
 - defineStyleConfig

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
import { Steps, defineStyle } from "@chakra-ui/react";

const MainPanel = defineStyleConfig({
  baseStyle: defineStyle({
    float: "right",
    maxWidth: "100%",
    overflow: "auto",
    position: "relative",
    maxHeight: "100%",
    transition: "all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)",
    transitionDuration: ".2s, .2s, .35s",
    transitionProperty: "top, bottom, width",
    transitionTimingFunction: "linear, linear, ease",
  }),
  variants: {
    main: defineStyle({
      float: "right",
    }),
  },
  defaultProps: {
    variant: "main",
  },
});

export const MainPanelComponent = {
  components: {
    MainPanel,
  },
};
