import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { CartModel, CartReposirotry, CouponModel, CouponReposirotry, OrderModel, OrderReposirotry, ProductModel, ProductReposirotry } from 'src/DB';
import { CartService } from '../cart/cart.service';
import { PaymentService } from 'src/common';
import { RealtimeGateway } from '../gateway/gateway';
import { OrederResolver } from './order.resolver';

@Module({
  imports:[ProductModel,CartModel,OrderModel, CouponModel],
  controllers: [OrderController],
  providers: [RealtimeGateway,OrederResolver,OrderService,ProductReposirotry,CartReposirotry,OrderReposirotry,PaymentService,CouponReposirotry,CartService],
})
export class OrderModule {}
