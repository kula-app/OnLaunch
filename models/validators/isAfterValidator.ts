import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

@ValidatorConstraint({ async: false })
export class IsAfterConstraint implements ValidatorConstraintInterface {
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

export function IsAfter(
  property: string,
  validationOptions?: ValidationOptions,
) {
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
