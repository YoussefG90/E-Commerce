import { Model } from "mongoose";
import { DataBaseRepository } from "./database.repository";
import { Injectable,  } from "@nestjs/common";
import { CartDocument as TDocument, Cart } from "../Model";
import { InjectModel } from "@nestjs/mongoose";


@Injectable()
export class CartReposirotry extends DataBaseRepository<Cart> {
    constructor(@InjectModel(Cart.name)protected override readonly model:Model<TDocument> ) {
        super(model)
    }
}

