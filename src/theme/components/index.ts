import { mergeDeepLeft, reduce, unapply } from "ramda";
import { AlertComponent } from "./Alert";
import { ButtonComponent } from "./Button";
import { CardComponent } from "./Card";
import { FormErrorComponent } from "./FormErrorComponent";
import { InputComponent } from "./Input";
import { MainPanelComponent } from "./MainPanel";
import { MenuComponent } from "./Menu";
import { PanelContainerComponent } from "./PanelContainer";
import { PanelContentComponent } from "./PanelContent";
import { SelectComponent } from "./Select";
import { TableComponent } from "./Table";

export const components = unapply(reduce(mergeDeepLeft, {}))(
  AlertComponent,
  ButtonComponent,
  CardComponent,
  FormErrorComponent,
  MenuComponent,
  SelectComponent,
  InputComponent,
  MainPanelComponent,
  PanelContentComponent,
  PanelContainerComponent,
  TableComponent,
);
