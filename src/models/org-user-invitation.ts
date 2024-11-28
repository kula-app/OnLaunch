import type { OrgRole } from "./org-role";

export interface OrgUserInvitation {
  id: number;
  email: string;
  role?: OrgRole;
}
