import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";





@ValidatorConstraint({ name: 'check_fields_exist', async: false })
export class CheckAnyFieldsAreApplied implements ValidatorConstraintInterface {
  validate(value:any, args: ValidationArguments) {
    return Object.keys(args.object).length > 0 && Object.values(args.object).filter((arg)=>{
      return arg != undefined
    }).length > 0 
  }

  defaultMessage(validationArguments?: ValidationArguments):string {
    return `All Update Fields Are Empty`;
  }
}


export function ContainField(constraints: string[], validationOptions?: ValidationOptions) {
  return function (constructor:Function) {
    registerDecorator({
      target: constructor,
      propertyName: undefined !,
      constraints:[],
      options: validationOptions,
      validator:CheckAnyFieldsAreApplied
    });
  };
}