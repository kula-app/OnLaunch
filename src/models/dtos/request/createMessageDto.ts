import { Action, ActionType, ButtonDesign } from ".prisma/client";
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
  actions!: Action[];
}
