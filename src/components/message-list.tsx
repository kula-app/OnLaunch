"use client";

import { Message } from "@/models/message";
import { truncateString } from "@/util/truncate-string";
import {
  Card,
  CardBody,
  HStack,
  IconButton,
  Skeleton,
  Spacer,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
} from "@chakra-ui/react";
import React from "react";
import { FaTrash } from "react-icons/fa6";
import { MdEdit } from "react-icons/md";

export const MessageList: React.FC<{
  isLoading: boolean;
  messages: Message[];

  editMessage?: (messageId: Message) => void;
  deleteMessage?: (messageId: Message) => void;
}> = ({ isLoading, messages, editMessage, deleteMessage }) => {
  return (
    <Card w={"full"}>
      <CardBody>
        {messages.length === 0 && (
          <Text size={"md"} color={"white"}>
            No messages found.
          </Text>
        )}
        {messages.length > 0 && (
          <Table w={"full"} variant={"brand-on-card"} size={"sm"}>
            <Thead>
              <Tr>
                <Th>Title</Th>
                <Th>Body</Th>
                <Th>Blocking</Th>
                <Th>Start Date</Th>
                <Th>End Date</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {messages.map((message: Message, index: number) => {
                return (
                  <Tr key={index}>
                    <Td>{message.title}</Td>
                    <Td>{truncateString(message.body, 70)}</Td>
                    <Td>
                      <div className="flex justify-center">
                        {message.isBlocking ? "Yes" : "No"}
                      </div>
                    </Td>
                    <Td>{message.startDate.toLocaleString()}</Td>
                    <Td>{message.endDate.toLocaleString()}</Td>
                    <Td>
                      <HStack gap={4} w={"full"}>
                        <Spacer />
                        {editMessage && (
                          <Tooltip label="Edit Message">
                            <IconButton
                              className="mr-2"
                              aria-label={"Edit Message"}
                              onClick={() => editMessage(message)}
                            >
                              <MdEdit />
                            </IconButton>
                          </Tooltip>
                        )}
                        {deleteMessage && (
                          <Tooltip label="Delete Message">
                            <IconButton
                              aria-label={"Delete message"}
                              onClick={() => deleteMessage(message)}
                              icon={<FaTrash />}
                              colorScheme="red"
                            />
                          </Tooltip>
                        )}
                      </HStack>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        )}
        {isLoading && (
          <div className="w-full">
            <Stack>
              <Skeleton height="60px" />
              <Skeleton height="60px" />
              <Skeleton height="60px" />
            </Stack>
          </div>
        )}
      </CardBody>
    </Card>
  );
};
