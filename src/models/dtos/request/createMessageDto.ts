import {
  ActionType,
  ButtonDesign,
  MessageActionLinkTarget,
  type MessageAction,
} from ".prisma/client";
import { IsAfter } from "@/util/validators/isAfterValidator";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from "class-validator";

class ActionDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  title!: string;

  @IsEnum(ActionType)
  actionType!: ActionType;

  @IsEnum(ButtonDesign)
  buttonDesign!: ButtonDesign;

  @ValidateIf((o: ActionDto) => o.actionType === ActionType.OPEN_LINK)
  @IsNotEmpty({
    message: "link is required when actionType is OPEN_LINK",
  })
  @IsString()
  @MaxLength(200)
  link?: string;

  @ValidateIf((o: ActionDto) => o.actionType === ActionType.OPEN_LINK)
  @IsNotEmpty({
    message: "linkTarget is required when actionType is OPEN_LINK",
  })
  @IsEnum(MessageActionLinkTarget)
  linkTarget?: MessageActionLinkTarget;
}

export class CreateMessageDto {
  @IsBoolean()
  blocking!: boolean;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  title!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  body!: string;

  @IsDateString()
  startDate!: Date;

  @IsDateString()
  @IsAfter("startDate", {
    message: "endDate must be after startDate",
  })
  endDate!: Date;

  @ValidateNested({ each: true })
  @Type(() => ActionDto)
  @IsArray()
  actions!: MessageAction[];
}
