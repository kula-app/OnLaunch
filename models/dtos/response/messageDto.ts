import { ActionDto } from "./actionDto";

export interface MessageDto {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  blocking: boolean;
  title: string;
  body: string;
  endDate: Date;
  startDate: Date;
  actions?: ActionDto[];
}
