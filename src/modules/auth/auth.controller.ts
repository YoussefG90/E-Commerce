import { Body, Controller, HttpCode, Post, UsePipes, ValidationPipe } from "@nestjs/common";
import { ConfirmEmailDto, ForgetPasswordDto, GmailDto, LoginDto, resendConfirmEmailDto, ResetPasswordDto, SignupBodyDto, VerifyResetCodeDto } from "./dto/auth.dto";
import { AuthenticationService } from "./auth.service";
import { IResponse, SuccessResponse } from "src/common";
import { LoginResponse } from "./entities";


@UsePipes(new ValidationPipe({whitelist:true,forbidNonWhitelisted:true }))

@Controller('auth')
export class AuthenticationController {
    constructor(private readonly authenticationservice:AuthenticationService){}

    @Post('signup')
   async signup(@Body() body:SignupBodyDto):Promise<IResponse>{
        await this.authenticationservice.signup(body)
        return SuccessResponse({message:"SignUp Successed Please Check Your Email To Verify"})    
    }
    @Post('resend-confirm-email')
   async resendConfirmEmail(@Body() body:resendConfirmEmailDto):Promise<IResponse>{
        await this.authenticationservice.resendConfirmEmail(body)
        return SuccessResponse({message:"New OTP Sent Please Check Your Email To Verify"})    
    } 

    @Post('confirm-email')
   async ConfirmEmail(@Body() body:ConfirmEmailDto):Promise<IResponse>{
        await this.authenticationservice.ConfirmEmail(body)
        return SuccessResponse({message:"New OTP Sent Please Check Your Email To Verify"})    
    }        

    @HttpCode(200)
    @Post('login')
    async login(@Body() body:LoginDto):Promise<IResponse<LoginResponse>>{
        const credentials = await this.authenticationservice.login(body)
        return SuccessResponse<LoginResponse>({data:{credentials}});
    }
    @Post('login/gmail')
  async loginWithGmail(@Body() body: GmailDto): Promise<IResponse<LoginResponse>> {
    const credentials = await this.authenticationservice.loginWithGmail(body);
    return SuccessResponse<LoginResponse>({data:{credentials}});
  }

    @Post('signup/gmail')
  async signupWithGmail(@Body() body: GmailDto): Promise<IResponse<LoginResponse>> {
    const credentials = await this.authenticationservice.signupWithGmail(body);
    return SuccessResponse<LoginResponse>({data:{credentials}});
  }

    @Post('forget-password')
    forgetPassword(@Body() data: ForgetPasswordDto) {
    return this.authenticationservice.forgetPassword(data);
    }

    @Post('verify-reset-code')
    verifyResetCode(@Body() data: VerifyResetCodeDto) {
    return this.authenticationservice.verifyResetCode(data);
    }

    @Post('reset-password')
    resetPassword(@Body() data: ResetPasswordDto) {
    return this.authenticationservice.resetPassword(data);
    }
}