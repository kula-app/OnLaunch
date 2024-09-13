import { mergeDeepLeft, reduce, unapply } from "ramda";
import { button } from "./button";
import { CardComponent } from "./Card";
import { layout } from "./layout";
import { MenuComponent } from "./Menu";

export const components = unapply(reduce(mergeDeepLeft, {}))(
  button,
  CardComponent,
  MenuComponent,
  layout,
);
