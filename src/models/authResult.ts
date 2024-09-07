export interface AuthResult {
  success: boolean;
  authToken?: string;
  id?: number;
  statusCode: number;
  errorMessage?: string;
}
