import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'path';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './modules/user/user.module';
import { BrandModule } from './modules/brand/brand.module';


@Module({
  imports: [ConfigModule.forRoot({envFilePath:resolve("./config/.env.devolpment"),
    isGlobal:true}),MongooseModule.forRoot(process.env.DB_URI as string),
    AuthenticationModule,UserModule,BrandModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
