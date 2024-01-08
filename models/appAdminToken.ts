export interface AppAdminToken {
  id: number;
  token: string;
  role: string;
  expiryDate?: string;
}
