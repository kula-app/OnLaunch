import type { AppAccessLevel } from "@prisma/client";

export interface AppAdminToken {
  id: number;
  token: string;
  accessLevel: AppAccessLevel;
  label: string | null;
  expiryDate: Date | null;
}
