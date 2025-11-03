import { Model } from "mongoose";
import { DataBaseRepository } from "./database.repository";
import { Injectable,  } from "@nestjs/common";
import { CategoryDocument as TDocument, Category } from "../Model";
import { InjectModel } from "@nestjs/mongoose";


@Injectable()
export class CategoryReposirotry extends DataBaseRepository<Category> {
    constructor(@InjectModel(Category.name)protected override readonly model:Model<TDocument> ) {
        super(model)
    }
}

