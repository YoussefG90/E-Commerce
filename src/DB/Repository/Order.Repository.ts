import { Model } from "mongoose";
import { DataBaseRepository } from "./database.repository";
import { Injectable,  } from "@nestjs/common";
import { OrderDocument as TDocument, Order } from "../Model";
import { InjectModel } from "@nestjs/mongoose";


@Injectable()
export class OrderReposirotry extends DataBaseRepository<Order> {
    constructor(@InjectModel(Order.name)protected override readonly model:Model<TDocument> ) {
        super(model)
    }
}

