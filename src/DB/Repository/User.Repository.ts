import { Model } from "mongoose";
import { DataBaseRepository } from "./database.repository";
import { Injectable} from "@nestjs/common";
import { UserDocument as TDocument, User } from "../Model";
import { InjectModel } from "@nestjs/mongoose";


@Injectable()
export class UserReposirotry extends DataBaseRepository<User> {
    constructor(@InjectModel(User.name)protected override readonly model:Model<TDocument> ) {
        super(model)
    }
}

