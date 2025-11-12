import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Types } from "mongoose";
import { IOrder, IOrderProduct, IToken, type IUser, OrderStatusEnum, PaymentEnum } from "src/common";
import { OneUserResponse } from "src/modules/user/entities";

export class OrderResponse {
    order:IOrder
}

registerEnumType(PaymentEnum,{name:"PaymentEnum"})
registerEnumType(OrderStatusEnum,{name:"OrderStatusEnum"})

@ObjectType()
export class OneOrderProductResponse implements IOrderProduct {
    @Field(() => ID)
    _id:Types.ObjectId;
    @Field(() => ID)
    productId:Types.ObjectId
    @Field(() => Date)
    quantity:number
    @Field(() => Date)
    unitPrice:number
    @Field(() => Date)
    finalPrice:number
    @Field(() => Date)
    createdAt?:Date;
    @Field(() => Date)
    updatedAt?:Date;
}

@ObjectType()
export class OneOrderResponse implements IOrder {
    @Field(() => ID)
    _id?: Types.ObjectId 
    @Field(() => ID)
    orderId: string;
    @Field(() => String)
    address: string;
    @Field(() => String)
    phone: string;
    @Field(() => String,{nullable:true})
    note?: string 
    @Field(() => ID,{nullable:true})
    coupon?: Types.ObjectId 
    @Field(() => Number,{nullable:true})
    discount?: number 
    @Field(() => String,{nullable:true})
    intentId?: string 
    @Field(() => Number)
    subTotal: number;
    @Field(() => Number)
    total: number;
    @Field(() => Date,{nullable:true})
    paidAt?: Date 
    @Field(() => Date,{nullable:true})
    freezedAt?: Date 
    @Field(() => Date,{nullable:true})
    restoredAt?: Date 
    @Field(() => Date,{nullable:true})
    createdAt?: Date 
    @Field(() => Date,{nullable:true})
    updatedAt?: Date 
    @Field(() => ID,{nullable:true})
    updatedBy?: Types.ObjectId 
    @Field(() => OneUserResponse)
    createdBy: IUser 
    @Field(() => PaymentEnum)
    payment: PaymentEnum;
    @Field(() => String)
    status: OrderStatusEnum;
    @Field(() => [OneOrderProductResponse])
    products: IOrderProduct[];
}

@ObjectType()
export class GetAllOrderResponse {
     @Field(() => Number,{nullable:true})
     docsCount?:number;
     @Field(() => Number,{nullable:true})
     limit?:number; 
     @Field(() => Number,{nullable:true})
     pages?:number; 
     @Field(() => Number,{nullable:true})
     currentPage?: number | undefined
     @Field(() => OneOrderResponse)
     result:IToken[]
}