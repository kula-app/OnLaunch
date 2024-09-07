import { AppDto } from './appDto';

export interface OrgDto {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  apps?: AppDto[];
}
