import { mergeDeepLeft, reduce, unapply } from "ramda";
import { CardComponent } from "./Card";
import { CardBodyComponent } from "./CardBody";
import { CardHeaderComponent } from "./CardHeader";

export const card = unapply(reduce(mergeDeepLeft, {}))(
  CardComponent,
  CardBodyComponent,
  CardHeaderComponent
);
