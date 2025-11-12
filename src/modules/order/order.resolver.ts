import { Args, Query, Resolver } from "@nestjs/graphql";
import { OrderService } from "./order.service";
import { GetAllOrderResponse } from "./entities/order.entity";
import { Auth, GetAllGraphDto, RoleEnum, User } from "src/common";
import { UsePipes, ValidationPipe } from "@nestjs/common";
import { type UserDocument } from "src/DB";






@UsePipes(new ValidationPipe({whitelist:true,forbidNonWhitelisted:true}))
@Resolver()
export class OrederResolver {
    constructor(private readonly orderService:OrderService){}
    @Auth([RoleEnum.admin])
    @Query(() => GetAllOrderResponse,{name:"allOrders",description:"Get All Orders"})
    async allOrders(@User() user:UserDocument , @Args("data", {nullable:true}) getAllGraphDto?:GetAllGraphDto){
        const result = await this.orderService.findAll(getAllGraphDto,false)

        return result
    }

}