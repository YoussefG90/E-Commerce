import { isEmail, IsEmail, IsEnum, IsNotEmpty, IsString, IsStrongPassword, Length, Matches, Min, ValidateIf } from "class-validator";
import { GenderEnum, IsMatch } from "src/common";


export class resendConfirmEmailDto {
    @IsEmail()
    email:string
}

export class LoginDto extends resendConfirmEmailDto{

    @IsStrongPassword()
    password:string
}

export class ConfirmEmailDto extends resendConfirmEmailDto{
    @Matches(/^\d{6}$/)
    code:string
}


export class SignupBodyDto extends LoginDto{
    @Length(2,5000,{})
    @IsNotEmpty()
    @IsString()
    firstName:string;
    @Length(2,5000,{})
    @IsNotEmpty()
    @IsString()
    lastName:string;
    @ValidateIf((data:SignupBodyDto)=>{
        return Boolean(data.password)
    })
    @IsMatch<string>(['password'],{})
    confirmPassword:string;
    @Min(18)
    age:number
    @IsEnum(GenderEnum)
    gender:GenderEnum
    @Matches(/^(002|\+2)?01[0125][0-9]{8}$/)
    phone: string;
}

