import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Document, Types } from "mongoose";
import { GenderEnum, IUser, ProviderEnum, RoleEnum } from "src/common";
import { OTP } from "src/DB";


registerEnumType(ProviderEnum,{name:"ProviderEnum"})
registerEnumType(GenderEnum,{name:"GenderEnum"})
registerEnumType(RoleEnum,{name:"RoleEnum"})


@ObjectType()
export class OneUserResponse implements IUser {
          @Field(() => ID)
          _id?:Types.ObjectId;
          @Field(() => String)
          firstName: string;
          @Field(() => String)
          lastName: string;
          @Field(() => String,{nullable:true})
          userName?:string;
          @Field(() => String)
          email: string;
          @Field(() => String,{nullable:true})
          password?:string;
          @Field(() => ProviderEnum)
          provider:ProviderEnum;
          @Field(() => GenderEnum,{nullable:true})
          gender?:GenderEnum;
          @Field(() => Number)
          age:number; 
          @Field(() => String,{nullable:true})
          phone?:string;
          @Field(() => RoleEnum)
          role:RoleEnum; 
          @Field(() => Date,{nullable:true})
          changeCredentialsTime?:Date;
          @Field(() => Boolean,{nullable:true})
          confirmEmail?:boolean;
          @Field(() => String,{nullable:true})
          profileImage?: string;
          @Field(() => String,{nullable:true})
          profileImagePublicId?: string;
          @Field(() => Date,{nullable:true})
          createdAt?:Date;
          @Field(() => Date,{nullable:true})
          updatedAt?:Date;
        //   otp?: (Document<unknown, {}, OTP, {}, {}> & OTP & { _id: Types.ObjectId; } & { __v: number; })[]
          @Field(() => [ID],{nullable:true})
          wishlist?:Types.ObjectId[]
}