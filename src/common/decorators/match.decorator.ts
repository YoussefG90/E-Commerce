import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";





@ValidatorConstraint({ name: 'match_between_fields', async: false })
export class MatchBetweenFields<T = any> implements ValidatorConstraintInterface {
  validate(value:T, args: ValidationArguments) {
    return value === args.object[args.constraints[0]] 
  }

  defaultMessage(validationArguments?: ValidationArguments):string {
    return `Fail To Match ${validationArguments?.property} With ${validationArguments?.constraints[0]}`;
  }
}


export function IsMatch<T = any>(constraints: string[], validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isMatch',
      target: object.constructor,
      propertyName: propertyName,
      constraints,
      options: validationOptions,
      validator:MatchBetweenFields<T>
    });
  };
}