import { Types } from "mongoose";
import { OtpDocument } from "src/DB";
import { GenderEnum, ProviderEnum, RoleEnum } from "../enums";


export interface IUser {
    _id?:Types.ObjectId;
      firstName:string
      lastName: string;
      userName?:string;
      email: string;
      password?:string;
      provider:ProviderEnum;
      gender?:GenderEnum;
      age:number; 
      phone?:string;
      role:RoleEnum; 
      changeCredentialsTime?:Date;
      otp?:OtpDocument[]
      confirmEmail?:boolean;
      profileImage?: string;
      profileImagePublicId?: string;
      createdAt?:Date;
      updatedAt?:Date;
}