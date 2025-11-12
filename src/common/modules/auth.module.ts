import { Global, Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TokenService } from "src/common/Services";
import { UserReposirotry, TokenRepository } from "src/DB";
import { UserModel, TokenModel } from "src/DB/Model"; 
import { createClient } from 'redis';

@Global()
@Module({
  imports: [
    UserModel,
    TokenModel,
  ],
  providers: [
    JwtService,
    TokenService,
    UserReposirotry,
    TokenRepository,{
      provide: 'REDIS_CLIENT',
      useFactory: async () => {
        const client = createClient({
          url: 'https://select-grouse-22022.upstash.io',
        });
        client.on('error', (err) => console.error('Redis Client Error', err));
        await client.connect();
        console.log('✅ Redis connected');

        return client;
      },
    },
  ],
  exports: [
    JwtService,
    TokenService,
    UserReposirotry,
    TokenRepository,
    UserModel,
    TokenModel,
    'REDIS_CLIENT'
  ],
})
export class SharedAuthenticationModule {}
