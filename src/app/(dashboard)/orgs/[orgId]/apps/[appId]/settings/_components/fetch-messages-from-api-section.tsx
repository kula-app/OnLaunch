"use client";
import { Box, Heading, Tabs, VStack } from "@chakra-ui/react";

export const FetchMessagesFromAPISection: React.FC<{
  apiKey: string | null | undefined;
}> = ({ apiKey }) => {
  const endpoint = `https://api.onlaunch.app/api/v0.2/messages`;

  return (
    <VStack w={"full"} gap={4}>
      <Heading size={"md"} color={"white"} w={"full"}>
        Fetch directly from API
      </Heading>
      <Tabs.Root
        w={"full"}
        variant={"soft-rounded"}
        colorPalette="teal"
        defaultValue={"curl"}
      >
        <Tabs.List>
          <Tabs.Trigger value={"curl"}>cURL</Tabs.Trigger>
          <Tabs.Trigger value={"javascript"}>JavaScript</Tabs.Trigger>
          <Tabs.Trigger value={"python"}>Python</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value={"curl"}>
          <Box
            as="pre"
            backgroundColor={"gray.900"}
            color={"white"}
            border={"1px solid"}
            borderColor={"gray.600"}
            p={4}
            borderRadius={"md"}
            fontSize={"xs"}
            overflowX={"scroll"}
            overflowY={"hidden"}
          >
            {`curl "${endpoint}" \\\n  -H "X-API-Key: ${apiKey}"`}
          </Box>
        </Tabs.Content>
        <Tabs.Content value={"javascript"}>
          <Box
            as="pre"
            backgroundColor={"gray.900"}
            color={"white"}
            border={"1px solid"}
            borderColor={"gray.600"}
            p={4}
            borderRadius={"md"}
            fontSize={"xs"}
            overflowX={"scroll"}
            overflowY={"hidden"}
          >
            {`fetch("${endpoint}", {
  headers: {
    "X-API-Key": "${apiKey}"
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`}
          </Box>
        </Tabs.Content>
        <Tabs.Content value={"python"}>
          <Box
            as="pre"
            backgroundColor={"gray.900"}
            color={"white"}
            border={"1px solid"}
            borderColor={"gray.600"}
            p={4}
            borderRadius={"md"}
            fontSize={"xs"}
            overflowX={"scroll"}
            overflowY={"hidden"}
          >
            {`import requests

url = "${endpoint}"
headers = {
    "X-API-Key": "${apiKey}"
}

response = requests.get(url, headers=headers)
print(response.json())`}
          </Box>
        </Tabs.Content>
      </Tabs.Root>
    </VStack>
  );
};
