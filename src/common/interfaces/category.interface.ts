import { Types } from "mongoose"
import { IUser } from "./user.interface";
import { IBrand } from "./brand.interface";


export interface ICategory {
        _id?:Types.ObjectId;
        name:string;
        slug:string;
        createdBy:Types.ObjectId | IUser;
        updatedBy?:Types.ObjectId | IUser;
        description?:string
        assetFolderId:string
        brands?:Types.ObjectId[] | IBrand[]
        image:string;
        imagePublicId?: string;
        createdAt?:Date;
        updatedAt?:Date;
        freezedAt?:Date;
        restoredAt?:Date;
}