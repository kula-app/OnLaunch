export enum ActionType {
  Dismiss = "DISMISS",
  OPEN_APP_IN_APP_STORE = "OPEN_APP_IN_APP_STORE",
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
