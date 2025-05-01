export enum MessageActionDtoType {
  DISMISS = "DISMISS",
  LINK = "LINK",
}

export enum MessageActionLinkDtoTarget {
  IN_APP_BROWSER = "IN_APP_BROWSER",
  SHARE_SHEET = "SHARE_SHEET",
  SYSTEM_BROWSER = "SYSTEM_BROWSER",
}

export interface MessageActionLinkDto {
  link?: string;
  target?: MessageActionLinkDtoTarget;
}

export interface MessageActionDto {
  actionType: MessageActionDtoType;
  title: string;
  link?: MessageActionLinkDto;
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
