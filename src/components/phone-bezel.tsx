import { Box, HStack, Text } from "@chakra-ui/react";
import React, { type PropsWithChildren } from "react";
import { FiBatteryCharging, FiWifi } from "react-icons/fi";

type PhoneBezelProps = PropsWithChildren<{
  bg?: string;
  buttonBg?: string;
  border?: string;
  statusBarMode?: "light" | "dark";
  contentBg?: string;
}>;

export const PhoneBezel: React.FC<PhoneBezelProps> = ({
  bg = "gray.700",
  buttonBg = "gray.800",
  border = `0.1rem solid rgb(86, 87, 122)`,
  statusBarMode = "light",
  contentBg = "black",
  children,
}) => {
  const buttonWidth = "6px";

  return (
    <Box
      width="375px"
      height="812px"
      bg={bg}
      borderRadius="55px"
      padding="12px"
      position="relative"
      border={border}
      m={"2px"}
    >
      {/* Volume Buttons */}
      <Box
        position="absolute"
        left={`-${buttonWidth}`}
        top="100px"
        width={buttonWidth}
        height="30px"
        bg={buttonBg}
        borderLeftRadius="sm"
        border={border}
      />
      <Box
        position="absolute"
        left={`-${buttonWidth}`}
        top="150px"
        width={buttonWidth}
        height="60px"
        bg={buttonBg}
        borderLeftRadius="sm"
        border={border}
      />
      <Box
        position="absolute"
        left={`-${buttonWidth}`}
        top="220px"
        width={buttonWidth}
        height="60px"
        bg={buttonBg}
        borderLeftRadius="sm"
        border={border}
      />

      {/* Power Button */}
      <Box
        position="absolute"
        right={`-${buttonWidth}`}
        top="200px"
        width={buttonWidth}
        height="80px"
        bg={buttonBg}
        borderRightRadius="sm"
        border={border}
      />

      <Box
        width="full"
        height="full"
        bg={contentBg}
        borderRadius="44px"
        position="relative"
        overflow="hidden"
      >
        {/* Status Bar */}
        <HStack
          alignItems={"center"}
          px={8}
          height="48px"
          color={statusBarMode === "light" ? "white" : "black"}
          w={"full"}
          justify={"space-between"}
          position="relative" // Added to make the notch position relative to this container
        >
          {/* Time */}
          <Text fontSize="sm" fontWeight="medium">
            9:41
          </Text>

          {/* Notch */}
          <Box
            position="absolute" // Center the notch absolutely within the HStack
            left="50%"
            transform="translateX(-50%)"
            width="40%"
            height="30px"
            bg={bg}
            borderRadius="20px"
            zIndex={20}
          />

          {/* Battery and Wifi */}
          <HStack spacing={2}>
            <FiWifi size={18} />
            <FiBatteryCharging size={18} />
          </HStack>
        </HStack>

        {/* Screen */}
        <Box h={"calc(100% - 48px)"}>{children}</Box>
      </Box>
    </Box>
  );
};
