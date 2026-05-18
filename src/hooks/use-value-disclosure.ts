import { useDisclosure, UseDisclosureReturn } from "@chakra-ui/react";
import { useEffect, useState } from "react";

interface UseValueDisclosureReturn<T>
  extends Omit<UseDisclosureReturn, "onOpen"> {
  value: T | undefined;
  setValue: (value?: T) => void;
}

/**
 * A hook that combines the functionality of a value state and a disclosure state.
 *
 * The disclosure state is automatically opened when the value is set.
 * This is useful for modals that are controlled by a value state.
 *
 * `onOpen` is not exposed as it is handled internally.
 *
 * @param initialValue
 * @returns
 */
export function useValueDisclosure<T>(
  initialValue?: T,
): UseValueDisclosureReturn<T> {
  const disclosure = useDisclosure();
  const [value, setValue] = useState<T | undefined>(initialValue);

  // Open the disclosure if the value is set
  useEffect(() => {
    if (value !== undefined && value !== null) {
      disclosure.onOpen();
    } else {
      disclosure.onClose();
    }
  }, [value, disclosure]);

  // Return both the disclosure methods and value state management
  return {
    ...disclosure,
    onClose: () => {
      setValue(undefined);
    },
    value,
    setValue,
  };
}
