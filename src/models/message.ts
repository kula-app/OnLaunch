import { MessageAction } from "./message-action";
import type { MessageRuleGroup } from "./message-rule-group";

export interface Message {
  id: number;
  appId: number;

  title: string;
  body: string;
  actions?: MessageAction[];

  isBlocking: boolean;

  startDate: Date;
  endDate: Date;

  ruleRootGroup: MessageRuleGroup | undefined;
}
