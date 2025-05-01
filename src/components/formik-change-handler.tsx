"use client";
import { useFormikContext } from "formik";
import { useEffect } from "react";

export const FormikChangeHandler = <T,>({
  onChange,
}: {
  onChange: (values: T) => void;
}) => {
  const { values } = useFormikContext<T>();

  useEffect(() => {
    onChange(values);
  }, [values, onChange]);

  return null;
};
