import { FormControl, FormLabel, Input } from "@chakra-ui/react";
import { Field, FieldProps } from "formik";
import { HTMLInputAutoCompleteAttribute, HTMLInputTypeAttribute } from "react";
import { AuthErrorMessage } from "./AuthErrorMessage";
import { AuthGradientBorder } from "./AuthGradientBorder";

export const AuthTextField: React.FC<{
  name: string;
  label: string;
  type: HTMLInputTypeAttribute;
  placeholder: string;
  autoComplete: HTMLInputAutoCompleteAttribute;
}> = ({ name, type, placeholder, label, autoComplete }) => (
  <FormControl>
    <FormLabel color={"white"} ms="4px" fontSize="sm" fontWeight="normal">
      {label}
    </FormLabel>
    <AuthGradientBorder h="50px" w={"100%"} borderRadius="20px">
      <Field name={name}>
        {({ field }: FieldProps) => (
          <Input
            name={field.name}
            onChange={field.onChange}
            onBlur={field.onBlur}
            value={field.value}
            checked={field.checked}
            color={"white"}
            bg={{
              base: "rgb(19,21,54)",
            }}
            border="transparent"
            borderRadius="20px"
            fontSize="sm"
            size="lg"
            w={"100%"}
            maxW={"100%"}
            h="46px"
            type={type}
            placeholder={placeholder}
            autoComplete={autoComplete}
          />
        )}
      </Field>
    </AuthGradientBorder>
    <AuthErrorMessage name={name} />
  </FormControl>
);
