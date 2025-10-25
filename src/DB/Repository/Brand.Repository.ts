import { Model } from "mongoose";
import { DataBaseRepository } from "./database.repository";
import { Injectable,  } from "@nestjs/common";
import { BrandDocument as TDocument, Brand } from "../Model";
import { InjectModel } from "@nestjs/mongoose";


@Injectable()
export class BrandReposirotry extends DataBaseRepository<Brand> {
    constructor(@InjectModel(Brand.name)protected override readonly model:Model<TDocument> ) {
        super(model)
    }
}

