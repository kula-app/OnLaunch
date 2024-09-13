import { mergeDeepLeft, reduce, unapply } from "ramda";
import { button } from "./button";
import { CardComponent } from "./Card";
import { layout } from "./layout";

export const components = unapply(reduce(mergeDeepLeft, {}))(
  button,
  CardComponent,
  layout,
);
