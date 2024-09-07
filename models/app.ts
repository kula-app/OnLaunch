import { Message } from "./message";

export interface App {
  id: number;
  name: string;
  publicKey?: string;
  role?: string;
  orgId?: number;
  messages?: Message[];
  activeMessages?: number;
}
