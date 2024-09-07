import { MessageDto } from './messageDto';

export interface AppDto {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  publicKey: string;
  messages?: MessageDto[];
}
