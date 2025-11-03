import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { RemoveItemsFromCartDto, UpdateCartDto } from './dto/update-cart.dto';
import { CartDocument, CartReposirotry, ProductReposirotry, UserDocument } from 'src/DB';

@Injectable()
export class CartService {
    constructor(private readonly cartReposirotry: CartReposirotry,
                private readonly productReposirotry:ProductReposirotry,
    ){}
  async create(createCartDto: CreateCartDto , user:UserDocument
    ):Promise<{status:number,cart:CartDocument}> {
    const product = await this.productReposirotry.findOne({filter:{
      _id:createCartDto.productId,stock:{$gt:createCartDto.quantity}
    }})
    if (!product) {
      throw new NotFoundException("Product Not Found Or Out Of Stock")
    }
    const cart = await this.cartReposirotry.findOne({filter:{createdBy:user._id}})
    if (!cart) {
      const [newCart] = await this.cartReposirotry.create({data:[{
        createdBy:user._id,products:[{productId:product._id,quantity:createCartDto.quantity}]
      }]})
      if (!newCart) {
        throw new BadRequestException("Fail To Create Cart")
      }
      return {status:201 , cart:newCart}
    }

    const checkProductInCart = cart.products.find(product=>{
      return product.productId == createCartDto.productId
    })
    if (checkProductInCart) {
      checkProductInCart.quantity = createCartDto.quantity
    }else{
      cart.products.push({productId:product._id,quantity:createCartDto.quantity})
    }
    await cart.save()
    return {status:200, cart: cart as CartDocument};
  }


  async remove( user:UserDocument):Promise<string> {
    const cart = await this.cartReposirotry.deleteOne({filter:{createdBy:user._id}})
    if (!cart.deletedCount) {
        throw new NotFoundException("Cart Not Found")
    }
    return "Done";
  }

  async removeFromCart(removeItemsFromCartDto: RemoveItemsFromCartDto , user:UserDocument
  ):Promise<CartDocument> {
    const cart = await this.cartReposirotry.findOneAndUpdate({filter:{createdBy:user._id},
      update:{$pull:{products:{_id:{$in:removeItemsFromCartDto.productIds}}}}
    })
    if (!cart) {
        throw new NotFoundException("Cart Not Found")
    }
    return cart;
  }


  async findOne(user:UserDocument):Promise<CartDocument> {
    const cart = await this.cartReposirotry.findOne({filter:{createdBy:user._id},
      options:{populate:[{path:"products.productId"}]}})
    if (!cart) {
        throw new NotFoundException("Cart Not Found")
    }
    return cart as unknown as CartDocument;
  }










}
