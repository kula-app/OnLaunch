import { defineStyleConfig } from '@chakra-ui/react';

const CardBody = defineStyleConfig({
  baseStyle: {
    display: 'flex',
    width: '100%',
  },
});

export const CardBodyComponent = {
  components: {
    CardBody,
  },
};
