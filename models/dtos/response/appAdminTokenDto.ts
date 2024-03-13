export interface AppAdminTokenDto {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  token: string;
  role: string;
  label?: string;
  expiryDate?: Date;
}
