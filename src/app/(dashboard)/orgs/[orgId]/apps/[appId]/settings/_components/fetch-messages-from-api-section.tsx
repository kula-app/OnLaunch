"use client";
import {
  Box,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  VStack,
} from "@chakra-ui/react";

export const FetchMessagesFromAPISection: React.FC<{
  apiKey: string | null | undefined;
}> = ({ apiKey }) => {
  const endpoint = `https://api.onlaunch.app/api/v0.2/messages`;

  return (
    <VStack w={"full"} gap={4}>
      <Heading size={"md"} color={"white"} w={"full"}>
        Fetch directly from API
      </Heading>
      <Tabs w={"full"} variant={"soft-rounded"} colorScheme="teal">
        <TabList>
          <Tab>cURL</Tab>
          <Tab>JavaScript</Tab>
          <Tab>Python</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
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
          </TabPanel>
          <TabPanel>
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
          </TabPanel>
          <TabPanel>
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
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};
