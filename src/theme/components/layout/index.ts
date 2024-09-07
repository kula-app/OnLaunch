import { mergeDeepLeft, reduce, unapply } from "ramda";
import { MainPanelComponent } from "./MainPanel";
import { PanelContainerComponent } from "./PanelContainer";
import { PanelContentComponent } from "./PanelContent";

export const layout = unapply(reduce(mergeDeepLeft, {}))(
  MainPanelComponent,
  PanelContentComponent,
  PanelContainerComponent,
);
