import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express'
import path from 'path';

async function bootstrap() {
  const port = process.env.PORT ?? 5000
  const app = await NestFactory.create(AppModule);
  app.use("/order/webhook",express.raw({type:'application/json'}))
  app.enableCors()
  app.use("/uploads",express.static(path.resolve("./uploads")))
  await app.listen(port, () => {
    console.log(`Server is Running on Port ${port} 🔥`);
  });
  
  
}
bootstrap();
