import { Box, VStack } from "@chakra-ui/react";
import React, { type PropsWithChildren } from "react";

export const PhoneModalSheet: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <VStack spacing={0} h={"full"} w={"full"}>
      {/* Reduced background */}
      <Box px={4} w={"full"} h={3} zIndex={10}>
        <Box bg="white" h="full" borderTopRadius={12} />
      </Box>
      {/* Sheet Modal */}
      <Box
        w={"full"}
        h={"full"}
        bg={"white"}
        borderTopRadius={12}
        boxShadow="0 -5px 20px rgba(0,0,0,0.15)"
        zIndex={11}
        pb={5}
      >
        {children}
      </Box>
    </VStack>
  );
};
