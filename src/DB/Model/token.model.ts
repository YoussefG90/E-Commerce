import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { IToken } from "src/common";







@Schema({timestamps:true,})
export class Token implements IToken {
  @Prop({type:String,required:true,unique:true})
  jti:string
  @Prop({type:Date , required:true})
  expiresAt:Date
  @Prop({type:Types.ObjectId ,ref:"User" , required:true})
  createdBy:Types.ObjectId
}

export type TokenDocument = HydratedDocument<Token>
export const tokenSchema = SchemaFactory.createForClass(Token)

tokenSchema.index({expiresAt:1},{expireAfterSeconds:0})

export const TokenModel = MongooseModule.forFeature([
  {name:Token.name , schema:tokenSchema}
])
