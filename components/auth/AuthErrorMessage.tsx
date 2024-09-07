"use client";

import { Text } from "@chakra-ui/react";
import { ErrorMessage } from "formik";
import { PropsWithChildren } from "react";

export const AuthErrorMessage: React.FC<{ name: string }> = ({ name }) => {
  return (
    <ErrorMessage
      name={name}
      component={({ children }: PropsWithChildren<Record<string, never>>) => (
        <Text pl={"4px"} mt="6px" color="red.400" fontSize={"12px"}>
          {children}
        </Text>
      )}
    />
  );
};
