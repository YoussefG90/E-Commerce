import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import {OtpReposirotry, UserDocument, UserReposirotry } from "src/DB";
import { ConfirmEmailDto, ForgetPasswordDto, GmailDto, LoginDto, resendConfirmEmailDto, ResetPasswordDto, SignupBodyDto, VerifyResetCodeDto } from "./dto/auth.dto";
import { compareHash, emailEvent, generateEncryption, generateHash, LoginCredentialsResponse, OtpEnum, ProviderEnum} from "src/common";
import { Types } from "mongoose";
import { OAuth2Client, TokenPayload } from 'google-auth-library';

import { TokenService } from "src/common/Services";

export const generateotp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

@Injectable()
export class AuthenticationService {
    constructor(
        private readonly userReposirotry:UserReposirotry,
        private readonly otpReposirotry:OtpReposirotry,
        private readonly tokenService:TokenService
    ){}

      private async verifyGmailAccount(idToken: string): Promise<TokenPayload> {
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.WEB_CLIENT_ID?.split(',') || [],
    });
    const payload = ticket.getPayload();

    if (!payload?.email_verified) {
      throw new BadRequestException('Fail To Verify Google Account');
    }

    return payload;
  }

    async loginWithGmail({ idToken }: GmailDto): Promise<LoginCredentialsResponse> {
    const { email } = await this.verifyGmailAccount(idToken);
    const user = await this.userReposirotry.findOne({ filter: { email, provider: ProviderEnum.Google } });

    if (!user) {
      throw new NotFoundException('User Not Found Or Registered From Another Provider');
    }
    return await this.tokenService.CreateLoginCredentials(user as UserDocument)
  }

    async signupWithGmail({ idToken }: GmailDto): Promise<LoginCredentialsResponse> {
    const { email, given_name, family_name } = await this.verifyGmailAccount(idToken);
    const user = await this.userReposirotry.findOne({ filter: { email } });

    if (user) {
      if (user.provider === ProviderEnum.Google) {
        return this.loginWithGmail({ idToken });
      }
      throw new ConflictException('Email Exists');
    }

    const [newUser] = await this.userReposirotry.create({
      data: [
        {
          firstName: given_name,
          lastName: family_name,
          email,
          provider: ProviderEnum.Google,
        },
      ],
    });

    if (!newUser) {
      throw new BadRequestException('Fail To SignUp With Gmail. Please Try Again Later');
    }

    return await this.tokenService.CreateLoginCredentials(newUser as UserDocument)
  }


    private async createConfirmEmailOtp(userId:Types.ObjectId){
        const generatedotp = generateotp()
        await this.otpReposirotry.create({
            data:[{code:generatedotp , expiredAt:new Date(Date.now() + 2 * 60 * 1000) 
                , createdBy:userId,type:OtpEnum.ConfirmEmail}]
        })
    }

    async signup(data:SignupBodyDto):Promise<string>{
        const {email , password , firstName,lastName,age,gender,phone} = data
        const checkuserExist = await this.userReposirotry.findOne({filter:{email}})
        if (checkuserExist) {
            throw new ConflictException("User Exist")
        }
        const encryptePhone = generateEncryption({plaintext : phone})
        const [user] = await this.userReposirotry.create({
            data:[{firstName , lastName , email , 
            password , phone:encryptePhone , age , gender}]
        })
        await this.createConfirmEmailOtp(user._id)
        if (!user) {
            throw new BadRequestException("Fail To Create Account")
        }
        return "Done"
    }

    async resendConfirmEmail(data:resendConfirmEmailDto):Promise<string>{
        const {email} = data
        const user = await this.userReposirotry.findOne({filter:{email , confirmedAt:{$exists:false}},
            options:{populate:[{path:"otp",match:{type:OtpEnum.ConfirmEmail}}]}
        })
        if (!user) {
            throw new NotFoundException("Account Not Exist")
        }
        if (user.otp?.length) {
            throw new ConflictException('There Already OTP Please Check Your Email')
        }
        await this.createConfirmEmailOtp(user._id)
    
        return "Done"
    }

    async ConfirmEmail(data: ConfirmEmailDto): Promise<string> {
        const { email, code } = data;

        const user = await this.userReposirotry.findOne({
            filter: { email, confirmedAt: { $exists: false } },
            options: { populate: [{ path: "otp", match: { type: OtpEnum.ConfirmEmail } }] }
        });

        if (!user) {
            throw new NotFoundException("Account Not Exist");
        }

        if (!user.otp?.length) {
            throw new BadRequestException('OTP not found');
        }

        const isValid = await compareHash(code, user.otp[0].code);
        if (!isValid) {
            throw new BadRequestException('Invalid OTP');
        }

        user.confirmEmail = true;
        await user.save();
        await this.otpReposirotry.deleteOne({ filter: { _id: user.otp[0]._id } });

        return "Done";
        }

        async login(data:LoginDto):Promise<LoginCredentialsResponse>{
            const {email , password } = data
            const user = await this.userReposirotry.findOne({
                filter:{email,confirmedAt:{$exists:true},provider:ProviderEnum.System
            }})
            if (!user) {
                throw new NotFoundException("User Not Found")
            }
            const isValid = await compareHash(password, user.password);
             if (!isValid) {
            throw new BadRequestException('Invalid Credentials');
            }
            return await this.tokenService.CreateLoginCredentials(user as UserDocument)
        }
          async forgetPassword(data: ForgetPasswordDto): Promise<string> {
    const { email } = data;
    const user = await this.userReposirotry.findOne({
      filter: { email, provider: ProviderEnum.System },
    });

    if (!user) {
      throw new NotFoundException("User Not Found");
    }

    const otpCode = generateotp();

    await this.otpReposirotry.create({
      data: [
        {
          code: otpCode,
          expiredAt: new Date(Date.now() + 5 * 60 * 1000), // صالح 5 دقايق
          createdBy: user._id,
          type: OtpEnum.ResetPassword,
        },
      ],
    });
    emailEvent.emit(OtpEnum.ResetPassword, { to: email, otp: otpCode });

    return "Reset password code sent to your email.";
  }

  async verifyResetCode(data: VerifyResetCodeDto): Promise<string> {
    const { email, code } = data;

    const user = await this.userReposirotry.findOne({
      filter: { email },
      options: {
        populate: [{ path: "otp", match: { type: OtpEnum.ResetPassword } }],
      },
    });

    if (!user || !user.otp?.length) {
      throw new BadRequestException("Invalid or expired code");
    }

    const otp = user.otp[0];
    const isValid = otp.code === code && otp.expiredAt > new Date();

    if (!isValid) {
      throw new BadRequestException("Invalid or expired code");
    }

    return "Code verified successfully";
  }

  async resetPassword(data: ResetPasswordDto): Promise<string> {
    const { email, newPassword } = data;

    const user = await this.userReposirotry.findOne({
      filter: { email },
      options: {
        populate: [{ path: "otp", match: { type: OtpEnum.ResetPassword } }],
      },
    });

    if (!user || !user.otp?.length) {
      throw new BadRequestException("Reset code not found or expired");
    }
    user.password = await generateHash(newPassword);
    await user.save();
    await this.otpReposirotry.deleteOne({
      filter: { _id: user.otp[0]._id },
    });

    return "Password reset successfully";
  }


}