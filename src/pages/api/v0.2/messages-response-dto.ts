export enum MessageActionDtoType {
  DISMISS = "DISMISS",
}

export interface MessageActionDto {
  actionType: MessageActionDtoType;
  title: string;
}

export interface MessageDto {
  id: number;
  blocking: boolean;
  title: string;
  body: string;
  actions: MessageActionDto[];
}

export interface ErrorObjectDto {
  message: string;
}

export type MessagesResponseDto = MessageDto[] | ErrorObjectDto;
