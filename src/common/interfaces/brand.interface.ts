import { Types } from "mongoose"
import { IUser } from "./user.interface";


export interface IBrand {
        _id?:Types.ObjectId;
        name:string;
        slug:string;
        createdBy:Types.ObjectId | IUser;
        updatedBy?:Types.ObjectId | IUser;
        slogan:string
        image:string;
        imagePublicId?: string;
        createdAt?:Date;
        updatedAt?:Date;
        freezedAt?:Date;
        restoredAt?:Date;
}