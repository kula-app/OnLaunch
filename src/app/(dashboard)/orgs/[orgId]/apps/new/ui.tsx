"use client";

import { createApp } from "@/app/actions/create-app";
import { ConfiguredNavigationBar } from "@/components/configured-navigation-bar";
import { ServerError } from "@/errors/server-error";
import type { Org } from "@/models/org";
import { Routes } from "@/routes/routes";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Text,
  useToast,
  VStack,
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
  const toast = useToast();

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
          <VStack color="white" spacing={"24px"} textAlign={"center"}>
            <Heading size="lg" as="h1">
              Create Your App
            </Heading>
          </VStack>
          <Card
            mt={{ base: 8 }}
            p={{
              base: 2,
              md: "22px",
            }}
          >
            <CardHeader>
              <Heading size="md" color="white">
                What&apos;s the name of your app?
              </Heading>
              <Text size="sm" color="gray.400">
                You can always change this later in the settings.
              </Text>
            </CardHeader>
            <CardBody>
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
                    toast({
                      title: "Success!",
                      description: "New app created.",
                      status: "success",
                      isClosable: true,
                      duration: 6000,
                    });

                    router.push(
                      Routes.app({
                        orgId: orgId,
                        appId: result.value.id,
                      }),
                    );
                  } catch (error) {
                    toast({
                      title: "Error while creating new app!",
                      description: `${error}`,
                      status: "error",
                      isClosable: true,
                      duration: 6000,
                    });
                  }
                }}
              >
                {(props: FormikProps<CreateAppFormValues>) => (
                  <Form>
                    <VStack
                      w={"full"}
                      spacing={{ base: 4, md: "24px" }}
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
                            <FormControl
                              color="white"
                              w={"full"}
                              isInvalid={isFieldInvalid}
                            >
                              <FormLabel htmlFor={field.name}>Name</FormLabel>
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
                                  <FormErrorMessage>
                                    {errorMessage}
                                  </FormErrorMessage>
                                )}
                              />
                            </FormControl>
                          );
                        }}
                      </Field>
                      <Button
                        colorScheme="brand"
                        type="submit"
                        isLoading={props.isSubmitting}
                      >
                        CREATE
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
};
