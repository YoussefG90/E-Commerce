import { DataBaseRepository } from "./database.repository";
import {TokenDocument as TDocument, Token} from "../Model"
import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class TokenRepository extends DataBaseRepository<Token>{
    constructor(@InjectModel(Token.name)protected override readonly model:Model<TDocument>){
        super(model)
    }
    
}