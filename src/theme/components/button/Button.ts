import { defineStyle, defineStyleConfig } from '@chakra-ui/react';

const Button = defineStyleConfig({
  variants: {
    brand: defineStyle({
      bg: 'brand.400',
      color: '#fff',
      _hover: {
        bg: 'brand.500',
      },
      _active: {
        bg: 'brand.600',
      },
      _focus: {},
      fontSize: '16px',
    }),
  },
});

export const ButtonComponent = {
  components: {
    Button,
  },
};
