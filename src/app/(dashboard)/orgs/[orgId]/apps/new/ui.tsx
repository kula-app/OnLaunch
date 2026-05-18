"use client";

import { createApp } from "@/app/actions/create-app";
import { ConfiguredNavigationBar } from "@/components/configured-navigation-bar";
import { ServerError } from "@/errors/server-error";
import type { Org } from "@/models/org";
import { Routes } from "@/routes/routes";
import { Button, Card, Flex, Heading, Input, Text, VStack, Field as ChakraField } from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
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

interface CreateAppFormValues {
  name: string;
}

const createAppSchema = Yup.object<CreateAppFormValues>().shape({
  name: Yup.string().required("Please enter a name for your app."),
});

export const UI: React.FC<{
  orgId: Org["id"];
}> = ({ orgId }) => {
  const router = useRouter();

  const initialValues: CreateAppFormValues = {
    name: "",
  };
  return (
    <Flex
      direction={"column"}
      align={"stretch"}
      minH={{ base: 0, sm: "100vh" }}
    >
      <ConfiguredNavigationBar
        items={[
          { kind: "orgs" },
          { kind: "org", orgId },
          { kind: "apps", orgId },
          { kind: "create-app", orgId },
        ]}
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
              Create Your App
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
                What&apos;s the name of your app?
              </Heading>
              <Text size="sm" color="gray.400">
                You can always change this later in the settings.
              </Text>
            </Card.Header>
            <Card.Body>
              <Formik
                initialValues={initialValues}
                validationSchema={createAppSchema}
                onSubmit={async (values, { setStatus }) => {
                  try {
                    const result = await createApp({
                      orgId: orgId,
                      name: values.name,
                    });
                    if (!result.success) {
                      throw new ServerError(
                        result.error.name,
                        result.error.message,
                      );
                    }
                    toaster.create({
                      title: "Success!",
                      description: "New app created.",
                      type: "success",
                      closable: true,
                      duration: 6000,
                    });

                    router.push(
                      Routes.app({
                        orgId: orgId,
                        appId: result.value.id,
                      }),
                    );
                  } catch (error) {
                    toaster.create({
                      title: "Error while creating new app!",
                      description: `${error}`,
                      type: "error",
                      closable: true,
                      duration: 6000,
                    });
                  }
                }}
              >
                {(props: FormikProps<CreateAppFormValues>) => (
                  <Form>
                    <VStack
                      w={"full"}
                      gap={{ base: 4, md: "24px" }}
                      align={"end"}
                    >
                      <Field name="name">
                        {({
                          field,
                          form,
                        }: FieldProps<string, CreateAppFormValues>) => {
                          const isFieldInvalid =
                            !!form.errors?.name && !!form.touched?.name;

                          return (
                            <ChakraField.Root
                              color="white"
                              w={"full"}
                              invalid={isFieldInvalid}
                            >
                              <ChakraField.Label htmlFor={field.name}>Name</ChakraField.Label>
                              <Input
                                {...field}
                                id={field.name}
                                placeholder="e.g. My First App"
                                w={"full"}
                                variant={"brand-on-card"}
                                minH={"50px"}
                              />
                              <ErrorMessage
                                name={field.name}
                                render={(errorMessage) => (
                                  <ChakraField.ErrorText>
                                    {errorMessage}
                                  </ChakraField.ErrorText>
                                )}
                              />
                            </ChakraField.Root>
                          );
                        }}
                      </Field>
                      <Button
                        colorPalette="brand"
                        type="submit"
                        loading={props.isSubmitting}
                      >
                        CREATE
                      </Button>
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
};
