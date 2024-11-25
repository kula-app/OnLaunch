import {
  HTMLChakraProps,
  chakra,
  forwardRef,
  useFormControl,
  useMultiStyleConfig,
  type FormControlOptions,
} from "@chakra-ui/react";
import {
  SystemStyleObject,
  ThemingProps,
  layoutPropNames,
  omitThemingProps,
} from "@chakra-ui/styled-system";
import { split } from "@chakra-ui/utils";

import { SelectField, SelectFieldProps } from "./tag-select-field";

interface RootProps extends Omit<HTMLChakraProps<"div">, "color"> {}

interface SelectOptions extends FormControlOptions {
  /**
   * The border color when the select is focused. Use color keys in `theme.colors`
   * @example
   * focusBorderColor = "blue.500"
   */
  focusBorderColor?: string;
  /**
   * The border color when the select is invalid. Use color keys in `theme.colors`
   * @example
   * errorBorderColor = "red.500"
   */
  errorBorderColor?: string;
  /**
   * The placeholder for the select. We render an `<option/>` element that has
   * empty value.
   *
   * ```jsx
   * <option value="">{placeholder}</option>
   * ```
   */
  placeholder?: string;
}

export interface SelectProps
  extends SelectFieldProps,
    ThemingProps<"Select">,
    SelectOptions {
  /**
   * Props to forward to the root `div` element
   */
  rootProps?: RootProps;
}

/**
 * React component used to select one item from a list of options.
 *
 * @see Docs https://v2.chakra-ui.com/docs/components/select
 */
export const TagSelect = forwardRef<SelectProps, "select">((props, ref) => {
  const styles = useMultiStyleConfig("Select", props);

  const { rootProps, placeholder, color, height, h, minH, minHeight, ...rest } =
    omitThemingProps(props);

  const [layoutProps, otherProps] = split(rest, layoutPropNames as any[]);

  const ownProps = useFormControl(otherProps);

  const rootStyles: SystemStyleObject = {
    width: "100%",
    height: "fit-content",
    position: "relative",
    overflow: "visible",
    color,
  };

  const fieldStyles: SystemStyleObject = {
    paddingEnd: "0rem",
    ...styles.field,
    _focus: {
      zIndex: "unset",
      ...(styles as any).field?.["_focus"],
    },
    padding: 0,
    paddingLeft: 2,
    paddingRight: 2,
    overflow: "visible",
    textAlign: "center",
  };

  return (
    <chakra.div
      className="chakra-extended-select__wrapper"
      __css={rootStyles}
      {...layoutProps}
      {...rootProps}
    >
      <SelectField
        ref={ref}
        height={h ?? height}
        minH={minH ?? minHeight}
        placeholder={placeholder}
        {...ownProps}
        __css={fieldStyles}
      >
        {props.children}
      </SelectField>
    </chakra.div>
  );
});

TagSelect.displayName = "TagSelect";
