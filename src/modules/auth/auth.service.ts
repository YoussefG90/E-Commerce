import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import {OtpReposirotry, UserDocument, UserReposirotry } from "src/DB";
import { ConfirmEmailDto, LoginDto, resendConfirmEmailDto, SignupBodyDto } from "./dto/auth.dto";
import { compareHash, generateEncryption, LoginCredentialsResponse, OtpEnum, ProviderEnum} from "src/common";
import { Types } from "mongoose";

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
 

}