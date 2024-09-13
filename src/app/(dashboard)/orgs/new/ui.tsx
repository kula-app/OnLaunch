"use client";

import { createOrg } from "@/app/actions/create-org";
import { NavigationBar } from "@/components/NavigationBar";
import { loadClientConfig } from "@/config/loadClientConfig";
import { ServerError } from "@/errors/server-error";
import Routes from "@/routes/routes";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Step,
  StepIcon,
  StepIndicator,
  StepNumber,
  Stepper,
  StepSeparator,
  StepStatus,
  StepTitle,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { Field, Form, Formik, type FieldProps } from "formik";
import { useRouter } from "next/navigation";
import * as Yup from "yup";

const createOrgSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
});

export default function NewOrgPage() {
  const router = useRouter();
  const toast = useToast();

  function navigateToUpgradePage(orgId: number) {
    router.push(Routes.getOrgUpgradeByOrgId(orgId));
  }

  function navigateToOrgAppsPage(orgId: number) {
    router.push(Routes.getOrgAppsByOrgId(orgId));
  }

  const steps = [
    { title: "Create Organization" },
    { title: "Create App" },
    { title: "Invite Team" },
  ];
  const activeStep = 0;
  return (
    <Flex direction={"column"} justify={"stretch"}>
      <NavigationBar />
      <Flex
        direction={"column"}
        justifyContent={"center"}
        alignItems={"center"}
        minH={"100vh"}
      >
        <Flex direction={"column"} justifyContent={"center"}>
          <VStack color="white" spacing={"24px"}>
            <Heading size="lg" as="h1">
              Create Your Organization
            </Heading>
            <Heading size="sm" as="h2">
              This will allow you to manage multiple app projects, and invite
              your team to collaborate.
            </Heading>
          </VStack>
          <Stepper index={activeStep} minW={"750px"} my={"48px"}>
            {steps.map((step, index) => (
              <Step key={index}>
                <StepIndicator
                  color={index <= activeStep ? "white" : "gray.400"}
                  borderColor={"gray.400"}
                >
                  <StepStatus
                    complete={<StepIcon />}
                    incomplete={<StepNumber />}
                    active={<StepNumber />}
                  />
                </StepIndicator>

                <Box
                  flexShrink="0"
                  color={index <= activeStep ? "white" : "gray.400"}
                >
                  <StepTitle>{step.title}</StepTitle>
                </Box>

                <StepSeparator />
              </Step>
            ))}
          </Stepper>
          <Card>
            <CardHeader>
              <Heading size="md" color="white">
                What&apos;s the name of your organization / team?
              </Heading>
              <Text size="sm" color="gray.400">
                You can always change this later in the settings.
              </Text>
            </CardHeader>
            <CardBody>
              <Formik
                initialValues={{
                  name: "Name",
                }}
                validationSchema={createOrgSchema}
                onSubmit={async (values, { setStatus }) => {
                  try {
                    const result = await createOrg({ name: values.name });
                    if (result.error) {
                      throw new ServerError(
                        result.error.name,
                        result.error.message,
                      );
                    }

                    toast({
                      title: "Success!",
                      description: "New organisation created.",
                      status: "success",
                      isClosable: true,
                      duration: 6000,
                    });

                    const stripeConfig = loadClientConfig().stripeConfig;
                    if (stripeConfig.isEnabled) {
                      navigateToUpgradePage(result.value);
                    } else {
                      navigateToOrgAppsPage(result.value);
                    }
                  } catch (error) {
                    toast({
                      title: "Error while creating new organisation!",
                      description: `${error}`,
                      status: "error",
                      isClosable: true,
                      duration: 6000,
                    });
                  }
                }}
              >
                {(props) => (
                  <Form>
                    <VStack w={"full"} spacing={"24px"} align={"end"}>
                      <FormControl color="white" w={"full"}>
                        <FormLabel>Name</FormLabel>
                        <Field name="name">
                          {({ field }: FieldProps) => (
                            <Input
                              {...field}
                              id="name"
                              placeholder="Organization Name"
                              w={"full"}
                              color={"white"}
                              bg={"rgb(19,21,54)"}
                              borderRadius="20px"
                              border="0.0625rem solid rgb(86, 87, 122)"
                              minH={"50px"}
                            />
                          )}
                        </Field>
                      </FormControl>
                      <Button
                        colorScheme="blue"
                        type="submit"
                        isLoading={props.isSubmitting}
                      >
                        NEXT
                      </Button>
                    </VStack>
                  </Form>
                )}
              </Formik>
            </CardBody>
          </Card>
        </Flex>
      </Flex>
    </Flex>
  );
}
