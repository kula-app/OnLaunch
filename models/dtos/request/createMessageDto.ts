import { Action, ActionType, ButtonDesign } from ".prisma/client";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  ValidateNested,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from "class-validator";

@ValidatorConstraint({ async: false })
class IsAfterConstraint implements ValidatorConstraintInterface {
  validate(endDate: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints;
    const startDate = (args.object as any)[relatedPropertyName];
    return (
      typeof startDate === "string" &&
      typeof endDate === "string" &&
      new Date(startDate) < new Date(endDate)
    );
  }

  defaultMessage(args: ValidationArguments) {
    return `"${args.property}" must be after "${args.constraints[0]}"`;
  }
}

function IsAfter(property: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsAfterConstraint,
    });
  };
}

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
