"use client";

import { NativeSelect } from "@chakra-ui/react";
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from "react";

type BrandSelectProps = ComponentPropsWithoutRef<typeof NativeSelect.Field> & {
  rootProps?: ComponentPropsWithoutRef<typeof NativeSelect.Root>;
  children?: ReactNode;
};

export const BrandSelect = forwardRef<HTMLSelectElement, BrandSelectProps>(
  function BrandSelect({ rootProps, children, ...rest }, ref) {
    return (
      <NativeSelect.Root
        {...rootProps}
        bg="rgb(19,21,54)"
        borderRadius="20px"
        border="0.0625rem solid rgb(86, 87, 122)"
      >
        <NativeSelect.Field ref={ref} {...rest}>
          {children}
        </NativeSelect.Field>
        <NativeSelect.Indicator color="white" />
      </NativeSelect.Root>
    );
  },
);
