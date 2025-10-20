import { Body, Controller, HttpCode, Post, UsePipes, ValidationPipe } from "@nestjs/common";
import { ConfirmEmailDto, LoginDto, resendConfirmEmailDto, SignupBodyDto } from "./dto/auth.dto";
import { AuthenticationService } from "./auth.service";
import { LoginCredentialsResponse } from "src/common";
import { LoginResponse } from "./entities";


@UsePipes(new ValidationPipe({whitelist:true,forbidNonWhitelisted:true }))

@Controller('auth')
export class AuthenticationController {
    constructor(private readonly authenticationservice:AuthenticationService){}

    @Post('signup')
   async signup(@Body() body:SignupBodyDto):Promise<{message:string}>{
        await this.authenticationservice.signup(body)
        return {message:"SignUp Successed Please Check Your Email To Verify"}    
    }
    @Post('resend-confirm-email')
   async resendConfirmEmail(@Body() body:resendConfirmEmailDto):Promise<{message:string}>{
        await this.authenticationservice.resendConfirmEmail(body)
        return {message:"New OTP Sent Please Check Your Email To Verify"}    
    } 

    @Post('confirm-email')
   async ConfirmEmail(@Body() body:ConfirmEmailDto):Promise<{message:string}>{
        await this.authenticationservice.ConfirmEmail(body)
        return {message:"New OTP Sent Please Check Your Email To Verify"}    
    }        

    @HttpCode(200)
    @Post('login')
    async login(@Body() body:LoginDto):Promise<LoginResponse>{
        const credentials = await this.authenticationservice.login(body)
        return {message:"Done",data:{credentials}}
    }
}