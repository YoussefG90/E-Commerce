import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { join, resolve } from 'path';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './modules/user/user.module';
import { BrandModule } from './modules/brand/brand.module';
import { CategoryModule } from './modules/category/category.module';
import { CartModule } from './modules/cart/cart.module';
import { ProductModule } from './modules/product/product.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { OrderModule } from './modules/order/order.module';
import { RealtimeModule } from './modules/gateway/gateway.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';


@Module({
  imports: [ConfigModule.forRoot({envFilePath:resolve("./config/.env.devolpment"),
    isGlobal:true}),MongooseModule.forRoot(process.env.DB_URI as string),
    AuthenticationModule,UserModule,BrandModule,CategoryModule,CartModule,RealtimeModule
    ,ProductModule,CouponModule,OrderModule, 
  GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,graphiql:true,
  autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
}),
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
