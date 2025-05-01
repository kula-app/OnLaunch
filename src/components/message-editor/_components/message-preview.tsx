"use client";

import { PhoneBezel } from "@/components/phone-bezel";
import { PhoneModalSheet } from "@/components/phone-modal-sheet";
import type { MessageAction } from "@/models/message-action";
import {
  Button,
  Heading,
  HStack,
  IconButton,
  Spacer,
  Text,
  VStack,
  type ButtonProps,
} from "@chakra-ui/react";
import { FiX } from "react-icons/fi";

interface Props {
  isCloseButtonVisible: boolean;
  title: string;
  content: string;
  actions: Array<{
    id: MessageAction["id"];
    label: string;
    variant: ButtonProps["variant"];
  }>;
}

export const MessagePreview: React.FC<Props> = ({
  isCloseButtonVisible,
  title,
  content,
  actions,
}) => {
  return (
    <PhoneBezel>
      <PhoneModalSheet>
        <VStack h={"full"} maxH={"full"} align={"start"}>
          <HStack w={"full"} px={2} pt={2}>
            <Spacer />
            <IconButton
              aria-label="Close"
              icon={<FiX />}
              variant={"solid"}
              colorScheme={"gray"}
              rounded="full"
              size={"sm"}
              opacity={isCloseButtonVisible ? 1 : 0}
            />
          </HStack>
          <Heading
            size="lg"
            px={4}
            textAlign={"start"}
            color={title.length > 0 ? "black" : "gray.400"}
            wordBreak={"break-all"}
          >
            {title.length > 0 ? title : "Your Title"}
          </Heading>
          <VStack
            px={4}
            align={"start"}
            w={"full"}
            spacing={2}
            overflowY={"scroll"}
          >
            {content.length > 0 ? (
              content.split("\n").map((text, idx) => (
                <Text key={idx} wordBreak={"break-all"}>
                  {text}
                </Text>
              ))
            ) : (
              <Text color={"gray.400"}>Your message body...</Text>
            )}
          </VStack>
          <Spacer />
          <VStack spacing={4} p={4} w={"full"}>
            {actions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant}
                w={"full"}
                colorScheme={"blue"}
              >
                {action.label.length > 0 ? (
                  action.label
                ) : (
                  <Text fontStyle={"italic"} color={"gray.300"}>
                    Your Action
                  </Text>
                )}
              </Button>
            ))}
          </VStack>
        </VStack>
      </PhoneModalSheet>
    </PhoneBezel>
  );
};
