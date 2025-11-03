import { Model } from "mongoose";
import { DataBaseRepository } from "./database.repository";
import { Injectable,  } from "@nestjs/common";
import { CouponDocument as TDocument, Coupon } from "../Model";
import { InjectModel } from "@nestjs/mongoose";


@Injectable()
export class CouponReposirotry extends DataBaseRepository<Coupon> {
    constructor(@InjectModel(Coupon.name)protected override readonly model:Model<TDocument> ) {
        super(model)
    }
}

