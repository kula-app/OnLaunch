"use client";
import {
  AspectRatio,
  Box,
  Flex,
  GridItem,
  Image,
  Link,
  Text,
} from "@chakra-ui/react";

export const SDKCard: React.FC<{
  sdk: {
    id: string;
    name: string;
    imageUrl: string;
    url?: string;
  };
}> = ({ sdk }) => {
  return (
    <GridItem key={sdk.id} as={Flex} direction={"column"}>
      <Link href={sdk.url} w={"full"} target={"_blank"}>
        <Box
          p={4}
          background={"white"}
          _hover={{
            background: "gray.200",
            m: 1,
          }}
          borderRadius={20}
        >
          <AspectRatio ratio={1}>
            <Image
              src={sdk.imageUrl}
              alt={sdk.name}
              fit={"contain !important" as "contain"}
            />
          </AspectRatio>
        </Box>
        <Text w={"full"} mt={2} align={"center"} color={"white"}>
          {sdk.name}
        </Text>
      </Link>
    </GridItem>
  );
};
