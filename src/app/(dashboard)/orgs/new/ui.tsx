"use client";

import { createOrg } from "@/app/actions/create-org";
import { ConfiguredNavigationBar } from "@/components/configured-navigation-bar";
import { loadClientConfig } from "@/config/loadClientConfig";
import { ServerError } from "@/errors/server-error";
import { Routes } from "@/routes/routes";
import {
  Button,
  Card,
  Flex,
  Heading,
  HStack,
  Input,
  Spacer,
  Text,
  useToast,
  VStack,
  Field,
} from "@chakra-ui/react";
import {
  ErrorMessage,
  Field,
  Form,
  Formik,
  type FieldProps,
  type FormikProps,
} from "formik";
import { useRouter } from "next/navigation";
import * as Yup from "yup";

interface CreateOrgFormValues {
  name: string;
}

const createOrgSchema = Yup.object<CreateOrgFormValues>().shape({
  name: Yup.string().required("Please enter a name for your organization."),
});

export default function NewOrgPage() {
  const router = useRouter();
  const toast = useToast();

  const initialValues: CreateOrgFormValues = {
    name: "",
  };
  return (
    <Flex
      direction={"column"}
      align={"stretch"}
      minH={{ base: 0, sm: "100vh" }}
    >
      <ConfiguredNavigationBar
        items={[{ kind: "orgs" }, { kind: "create-org" }]}
      />
      <Flex
        direction={"column"}
        justifyContent={{ base: "start", sm: "center" }}
        alignItems={"center"}
        flex={1} // Setting flex to 1 to make the flex item grow and take up the remaining space
        mt={{ base: 12, md: 0 }}
        px={{ base: 4, md: 0 }}
      >
        <Flex direction={"column"} justifyContent={"center"}>
          <VStack color="white" gap={"24px"} textAlign={"center"}>
            <Heading size="lg" as="h1">
              Create Your Organization
            </Heading>
            <Heading size="sm" as="h2">
              This will allow you to manage multiple app projects, and invite
              your team to collaborate.
            </Heading>
          </VStack>
          <Card.Root
            mt={{ base: 8 }}
            p={{
              base: 2,
              md: "22px",
            }}
          >
            <Card.Header>
              <Heading size="md" color="white">
                What&apos;s the name of your organization / team?
              </Heading>
              <Text size="sm" color="gray.400">
                You can always change this later in the settings.
              </Text>
            </Card.Header>
            <Card.Body>
              <Formik
                initialValues={initialValues}
                validationSchema={createOrgSchema}
                onSubmit={async (values, { setStatus }) => {
                  try {
                    const result = await createOrg({ name: values.name });
                    if (!result.success) {
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

                    // If stripe is configured, redirect to the plan selection page
                    const stripeConfig = loadClientConfig().stripeConfig;
                    if (stripeConfig.isEnabled) {
                      router.push(
                        Routes.upgradeOrganization({
                          orgId: result.value,
                        }),
                      );
                    } else {
                      router.push(Routes.apps({ orgId: result.value }));
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
                {(props: FormikProps<CreateOrgFormValues>) => (
                  <Form>
                    <VStack
                      w={"full"}
                      gap={{ base: 4, md: "24px" }}
                      align={"center"}
                    >
                      <Field name="name">
                        {({
                          field,
                          form,
                        }: FieldProps<string, CreateOrgFormValues>) => {
                          const isFieldInvalid =
                            !!form.errors?.name && !!form.touched?.name;

                          return (
                            <Field.Root
                              color="white"
                              w={"full"}
                              invalid={isFieldInvalid}
                            >
                              <Field.Label htmlFor={field.name}>Name</Field.Label>
                              <Input
                                {...field}
                                id={field.name}
                                placeholder="e.g. kula app GmbH"
                                w={"full"}
                                variant={"brand-on-card"}
                                minH={"50px"}
                              />
                              <ErrorMessage
                                name={field.name}
                                render={(errorMessage) => (
                                  <Field.ErrorText>
                                    {errorMessage}
                                  </Field.ErrorText>
                                )}
                              />
                            </Field.Root>
                          );
                        }}
                      </Field>
                      <HStack w={"full"}>
                        <Button
                          colorPalette={"gray"}
                          variant={"solid"}
                          onClick={() => router.push(Routes.organizations)}
                        >
                          Cancel
                        </Button>
                        <Spacer />
                        <Button
                          colorPalette="brand"
                          type="submit"
                          loading={props.isSubmitting}
                        >
                          CREATE
                        </Button>
                      </HStack>
                    </VStack>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card.Root>
        </Flex>
      </Flex>
    </Flex>
  );
}
