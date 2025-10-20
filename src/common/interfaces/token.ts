import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";
import { UserDocument } from "src/DB";



export interface ICredentials {
    user : UserDocument;
    decoded:JwtPayload;
}

export interface IAuthRequest extends Request {
    credentials : ICredentials
}