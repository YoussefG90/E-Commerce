import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CartReposirotry, CouponReposirotry, OrderDocument, OrderProduct, OrderReposirotry, ProductDocument, ProductReposirotry, UserDocument } from 'src/DB';
import { CouponEnum, GetAllDto, GetAllGraphDto, OrderStatusEnum, PaymentEnum, PaymentService } from 'src/common';
import { randomUUID } from 'crypto';
import { CartService } from '../cart/cart.service';
import { Types } from 'mongoose';
import Stripe from 'stripe';
import type { Request } from 'express';
import { RealtimeGateway } from '../gateway/gateway';
import { Lean } from 'src/DB/Repository/database.repository';

@Injectable()
export class OrderService {
  constructor(private readonly couponReposirotry:CouponReposirotry,
              private readonly orderReposirotry:OrderReposirotry , 
              private readonly productReposirotry:ProductReposirotry,
              private readonly cartService:CartService,
              private readonly cartReposirotry:CartReposirotry,
               private readonly paymentService:PaymentService,
               private readonly realtimeGateway:RealtimeGateway
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
    const stockProducts:{productId:Types.ObjectId,stock:number} []= []
     for (const product of cart.products) {
     const updatedProduct = await this.productReposirotry.findOneAndUpdate({filter:{
        _id:product.productId,stock:{$gte:product.quantity}
      },update:{$inc:{__v:1,stock:-product.quantity}}
    }) as ProductDocument
    stockProducts.push({productId:updatedProduct._id,stock:updatedProduct?.stock})
    }
    this.realtimeGateway.changeProductStock(stockProducts)
    await this.cartService.remove(user)
    return order;
  }

  async cancel(orderId:Types.ObjectId,user:UserDocument):Promise<OrderDocument> {
    const order = await this.orderReposirotry.findOneAndUpdate({
      filter:{
        _id:orderId,status:{$lt:OrderStatusEnum.Cancel}
    },update:{
      status:OrderStatusEnum.Cancel,updatedBy:user._id
    }
  })
    if (!order) {
      throw new NotFoundException("Fail to find order")
    }
    for (const product of order.products) {
      const cartProduct = await this.productReposirotry.updateOne({
        filter:{_id:product.productId},
        update:{$inc:{stock:product.quantity,__v:1}}
      })}
    if (order.coupon) {
      await this.couponReposirotry.updateOne({filter:{_id:order.coupon},
      update:{$pull:{usedBy:order.createdBy}}
    })
    }

    if (order.payment == PaymentEnum.Card) {
      await this.paymentService.refund(order.intentId)
    }

    return order as OrderDocument;
  }

  async checkout (user:UserDocument , orderId:Types.ObjectId) {
    const order = await this.orderReposirotry.findOne({filter:{
      _id:orderId,createdBy:user._id,payment:PaymentEnum.Card,status:OrderStatusEnum.Pending
    },options:{populate:[{path:"products.productId" , select:"name"}]}})

    if (!order) {
      throw new NotFoundException("Order Not Found")
    }
    let discounts:Stripe.Checkout.SessionCreateParams.Discount[] = []
    if (order.discount) {
      const coupon = await this.paymentService.createCoupon({
        duration:'once',currency:'egp',percent_off:order.discount * 100
      })
      discounts.push({coupon:coupon.id})
    }
    const session = await this.paymentService.checkoutSession({
      customer_email:user.email,
      metadata:{orderId:orderId.toString()},
      discounts,
      line_items:order.products.map(product => {
        return {
          quantity:product.quantity,price_data:{
            currency:'egp', product_data:{
              name:(product.productId as ProductDocument).name
            },
            unit_amount:product.unitPrice * 100
          }
        }
      })
    })
    const method = await this.paymentService.createPaymentMethod({
      type:'card', card:{
        token:" tok_visa"
      }
    })
    const intent = await this.paymentService.createPaymentIntent({
      amount:order.subTotal*100,currency:'egp',payment_method:method.id,
      automatic_payment_methods:{
        enabled:true , allow_redirects:'never'
      }
    })
    order.intentId = intent.id
    await order.save()
    return session.url as string

  }

  async webhook (req:Request) {
    const event = await this.paymentService.webhook(req)
    const {orderId} = event.data.object.metadata as {orderId:string}
    const order = await this.orderReposirotry.findOneAndUpdate({filter:{
      _id:Types.ObjectId.createFromHexString(orderId),status:OrderStatusEnum.Pending,payment:PaymentEnum.Card
    },update:{
      paidAt:new Date(),status:OrderStatusEnum.Placed
    }})
    if (!order) {
      throw new NotFoundException("Order Not Found")
    }
    await this.paymentService.confirmPaymentIntent(order.intentId)
    return "Done"
  }


  async findAll(data:GetAllGraphDto = {}, archive:boolean = false
  ):Promise<{docsCount?:number; limit?:number; pages?:number;
     currentPage?: number | undefined ;result:OrderDocument[] | Lean<OrderDocument>[]}> {
    const {page , size , search} = data
    const result = await this.orderReposirotry.paginate({
      filter:{...(archive?{paranoId:false,freezedAt:{$exists:true}}:{})},
      page,
      size,
      options:{populate:[{path:"createdBy"}]}
    })
    return result;
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
