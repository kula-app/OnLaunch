import { Action } from "./action";

export interface Message {
  endDate: string;
  startDate: string;
  blocking: boolean;
  body: string;
  title: string;
  id?: number;
  appId: number;
  actions?: Action[];
}
