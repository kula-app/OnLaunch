import { defineStyle, defineStyleConfig } from '@chakra-ui/react';

const MainPanel = defineStyleConfig({
  baseStyle: defineStyle({
    float: 'right',
    maxWidth: '100%',
    overflow: 'auto',
    position: 'relative',
    maxHeight: '100%',
    transition: 'all 0.33s cubic-bezier(0.685, 0.0473, 0.346, 1)',
    transitionDuration: '.2s, .2s, .35s',
    transitionProperty: 'top, bottom, width',
    transitionTimingFunction: 'linear, linear, ease',
  }),
  variants: {
    main: defineStyle({
      float: 'right',
    }),
  },
  defaultProps: {
    variant: 'main',
  },
});

export const MainPanelComponent = {
  components: {
    MainPanel,
  },
};
