import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { CartModel, CartReposirotry, ProductModel, ProductReposirotry } from 'src/DB';

@Module({
  imports:[CartModel,ProductModel],
  controllers: [CartController],
  providers: [CartService,CartReposirotry,ProductReposirotry],
})
export class CartModule {}
