import { mergeDeepLeft, reduce, unapply } from "ramda";
import { button } from "./button";
import { card } from "./card";
import { layout } from "./layout";

export const components = unapply(reduce(mergeDeepLeft, {}))(
  button,
  card,
  layout,
);
