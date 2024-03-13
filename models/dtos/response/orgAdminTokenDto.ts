export interface OrgAdminTokenDto {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  token: string;
  role: string;
  label: string | null;
}
