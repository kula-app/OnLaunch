import type { OrgRole } from "./org-role";

export interface OrgUser {
  id: number;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: OrgRole;
}
