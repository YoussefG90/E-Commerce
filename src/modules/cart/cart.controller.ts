import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, UsePipes, Res } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { RemoveItemsFromCartDto, UpdateCartDto } from './dto/update-cart.dto';
import { Auth, IResponse, RoleEnum, SuccessResponse, User } from 'src/common';
import type {UserDocument} from 'src/DB'
import { CartResponse } from './entities/cart.entity';
import type { Response } from 'express';


@Auth([RoleEnum.user])
@UsePipes(new ValidationPipe({whitelist:true,forbidNonWhitelisted:true}))
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService,
  ) {}

  @Post()
 async create(
    @Body() createCartDto: CreateCartDto ,
    @User() user:UserDocument ,
    @Res({passthrough:true}) res:Response 
  ):Promise<IResponse<CartResponse>> {
    const {status,cart} = await this.cartService.create(createCartDto , user);
    res.status(status)
    return SuccessResponse<CartResponse>({status,data:{cart}})
  }

  @Patch("remove-from-cart")
 async removeFromCart(
    @Body() removeItemsFromCartDto: RemoveItemsFromCartDto ,
    @User() user:UserDocument ,
  ):Promise<IResponse<CartResponse>> {
    const cart = await this.cartService.removeFromCart(removeItemsFromCartDto , user);
    return SuccessResponse<CartResponse>({data:{cart}})
  }

  @Delete()
 async remove(@User() user:UserDocument):Promise<IResponse> {
    await this.cartService.remove(user);
    return SuccessResponse()
  }


  @Get()
 async findOne(@User() user:UserDocument):Promise<IResponse<CartResponse>> {
    const cart = await this.cartService.findOne(user);
    return SuccessResponse<CartResponse>({data:{cart}})
  }

}
