import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { CartModel, CartReposirotry, CouponModel, CouponReposirotry, OrderModel, OrderReposirotry, ProductModel, ProductReposirotry } from 'src/DB';
import { CartService } from '../cart/cart.service';

@Module({
  imports:[ProductModel,CartModel,OrderModel, CouponModel],
  controllers: [OrderController],
  providers: [OrderService,ProductReposirotry,CartReposirotry,OrderReposirotry,CouponReposirotry,CartService],
})
export class OrderModule {}
