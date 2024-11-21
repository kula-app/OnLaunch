export enum ActionType {
  Dismiss = "DISMISS",
}

export type ActionDto = {
  actionType: ActionType;
  title: string;
};

export type MessageDto = {
  id: number;
  blocking: boolean;
  title: string;
  body: string;
  actions: ActionDto[];
};

export interface ErrorObjectDto {
  message: string;
}

export type MessagesResponseDto = MessageDto[] | ErrorObjectDto;
