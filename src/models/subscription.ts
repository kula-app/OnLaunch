import { Organisation } from "@prisma/client";

export interface Subscription {
  subId?: string;
  subName: string;
  org: Organisation;
}
