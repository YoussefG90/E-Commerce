import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CartReposirotry, CouponReposirotry, OrderDocument, OrderProduct, OrderReposirotry, ProductReposirotry, UserDocument } from 'src/DB';
import { CouponEnum } from 'src/common';
import { randomUUID } from 'crypto';
import { CartService } from '../cart/cart.service';

@Injectable()
export class OrderService {
  constructor(private readonly couponReposirotry:CouponReposirotry,
              private readonly orderReposirotry:OrderReposirotry , 
              private readonly productReposirotry:ProductReposirotry,
              private readonly cartService:CartService,
              private readonly cartReposirotry:CartReposirotry
  ){}
  async create(createOrderDto: CreateOrderDto,user:UserDocument):Promise<OrderDocument> {
    const cart  = await this.cartReposirotry.findOne({filter:{createdBy:user._id}})
    if (!cart?.products?.length) {
      throw new NotFoundException("Cart is Empty")
    }
    let discount = 0
    let coupon:any
    if (createOrderDto.coupon) {
      coupon = await this.couponReposirotry.findOne({filter:{_id:createOrderDto.coupon,
        startDate:{$lte:new Date()},endDate:{$gte:new Date()},
      }})
      if (!coupon) {
        throw new NotFoundException("Coupon Not Found")
      }
      if (coupon.duration <= coupon.usedBy.filter(
        (ele)=>{return ele.toString() == user._id.toString()}).length
      ) {
        throw new ConflictException("Coupon Reached Limit Please Try Another One")
      }
    }
    let total = 0
    const products:OrderProduct[]=[]
    for (const product of cart.products) {
      const cartProduct = await this.productReposirotry.findOne({filter:{
        _id:product.productId,stock:{$gte:product.quantity}
      }})
      if (!cartProduct) {
        throw new NotFoundException(`Product ${product.productId} Not Found or Out Of Stock`)
      }
      const finalPrice = cartProduct.salePrice * product.quantity 
      products.push({
        productId:cartProduct._id,
        quantity:product.quantity,
        unitPrice:cartProduct.salePrice,
        finalPrice
      })
      total += finalPrice
    }
    if (coupon) {
      discount = coupon.type == CouponEnum.Percent ? coupon.discount/100 : coupon.discount/total
    }
    delete createOrderDto.coupon
    const [order] = await this.orderReposirotry.create({data:[{
      ...createOrderDto,coupon:coupon?._id,discount,createdBy:user._id,orderId:randomUUID().slice(0,8),
      products,total

    }]})
    if (!order) {
      throw new BadRequestException("Fail To Place Order")
    }
    if (coupon) {
      coupon.usedBy.push(user._id)
      await coupon.save()
    }
     for (const product of cart.products) {
      await this.productReposirotry.updateOne({filter:{
        _id:product.productId,stock:{$gte:product.quantity}
      },update:{$inc:{__v:1,stock:-product.quantity}}
    })
    }
    await this.cartService.remove(user)
    return order;
  }




  findAll() {
    return `This action returns all order`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
