import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import { UserDocument } from "src/DB";

export interface IToken {
  _id?:Types.ObjectId
  jti:string
  expiresAt:Date
  createdBy:Types.ObjectId
  createdAt?:Date;
  updatedAt?:Date;
}

export interface ICredentials {
    user : UserDocument;
    decoded:JwtPayload;
}

export interface IAuthRequest extends Request {
    credentials : ICredentials
}