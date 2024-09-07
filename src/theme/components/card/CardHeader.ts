import { defineStyleConfig } from '@chakra-ui/react';

const CardHeader = defineStyleConfig({
  baseStyle: {
    display: 'flex',
    width: '100%',
  },
});

export const CardHeaderComponent = {
  components: {
    CardHeader,
  },
};
