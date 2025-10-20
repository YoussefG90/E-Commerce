import { Model } from "mongoose";
import { DataBaseRepository } from "./database.repository";
import { Injectable,  } from "@nestjs/common";
import { OtpDocument as TDocument, OTP } from "../Model";
import { InjectModel } from "@nestjs/mongoose";


@Injectable()
export class OtpReposirotry extends DataBaseRepository<OTP> {
    constructor(@InjectModel(OTP.name)protected override readonly model:Model<TDocument> ) {
        super(model)
    }
}

