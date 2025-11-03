import { Types } from "mongoose"
import { IUser } from "./user.interface";
import { OrderStatusEnum, PaymentEnum } from "../enums";
import { ICoupon } from "./coupon.interface";
import { IProduct } from "./product.interface";

export interface IOrderProduct {
        _id?:Types.ObjectId;
        productId:Types.ObjectId | IProduct;
        quantity:number
        unitPrice:number
        finalPrice:number
        createdAt?:Date;
        updatedAt?:Date;

}
export interface IOrder {
        _id?:Types.ObjectId;
        address:string
        phone:string
        note?:string
        cancelReason?:string
        coupon?:Types.ObjectId | ICoupon
        discount?:number
        total:number
        subTotal:number
        paidAt?:Date
        paymentIntent?:string
        status:OrderStatusEnum
        payment:PaymentEnum
        orderId:string
        products:IOrderProduct[]
        createdBy:Types.ObjectId | IUser;
        updatedBy?:Types.ObjectId | IUser;
        createdAt?:Date;
        updatedAt?:Date;
        freezedAt?:Date;
        restoredAt?:Date;
}