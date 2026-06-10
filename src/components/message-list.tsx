"use client";;
import { Message } from "@/models/message";
import { truncateString } from "@/util/truncate-string";
import {
  Card,
  HStack,
  IconButton,
  Skeleton,
  Spacer,
  Stack,
  Table,
  Text,
} from "@chakra-ui/react";
import { Tooltip } from '@/components/ui/tooltip';
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
    <Card.Root w={"full"}>
      <Card.Body>
        {messages.length === 0 && (
          <Text size={"md"} color={"white"}>
            No messages found.
          </Text>
        )}
        {messages.length > 0 && (
          <Table.Root w={"full"} size={"sm"}>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Title</Table.ColumnHeader>
                <Table.ColumnHeader>Body</Table.ColumnHeader>
                <Table.ColumnHeader>Blocking</Table.ColumnHeader>
                <Table.ColumnHeader>Start Date</Table.ColumnHeader>
                <Table.ColumnHeader>End Date</Table.ColumnHeader>
                <Table.ColumnHeader></Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {messages.map((message: Message, index: number) => {
                return (
                  <Table.Row key={index}>
                    <Table.Cell>{message.title}</Table.Cell>
                    <Table.Cell>{truncateString(message.body, 70)}</Table.Cell>
                    <Table.Cell>
                      <div className="flex justify-center">
                        {message.isBlocking ? "Yes" : "No"}
                      </div>
                    </Table.Cell>
                    <Table.Cell>{message.startDate.toLocaleString()}</Table.Cell>
                    <Table.Cell>{message.endDate.toLocaleString()}</Table.Cell>
                    <Table.Cell>
                      <HStack gap={4} w={"full"}>
                        <Spacer />
                        {editMessage && (
                          <Tooltip content="Edit Message">
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
                          <Tooltip content="Delete Message">
                            <IconButton
                              aria-label={"Delete message"}
                              onClick={() => deleteMessage(message)}
                              colorPalette="red"><FaTrash /></IconButton>
                          </Tooltip>
                        )}
                      </HStack>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Root>
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
      </Card.Body>
    </Card.Root>
  );
};
