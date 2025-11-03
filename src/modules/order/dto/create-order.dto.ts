import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString, Matches } from "class-validator";
import { Types } from "mongoose";
import { IOrder, PaymentEnum } from "src/common";

export class CreateOrderDto implements Partial<IOrder> {
    @IsString()
    @IsNotEmpty()
    address: string
    @IsMongoId()
    @IsOptional() 
    coupon?: Types.ObjectId 
    @IsOptional() 
    @IsString()
    @IsNotEmpty()
    note?: string 
    @Matches(/^(002|\+2)?01[0125][0-9]{8}$/)
    phone: string 
    @IsEnum(PaymentEnum)
    payment: PaymentEnum 

}
