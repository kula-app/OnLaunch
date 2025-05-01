export enum MessageActionDtoType {
  DISMISS = "DISMISS",
}

export enum MessageActionButtonDesign {
  FILLED = "FILLED",
  TEXT = "TEXT",
}

export interface MessageActionDto {
  actionType: MessageActionDtoType;
  title: string;
  buttonDesign: MessageActionButtonDesign;
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
