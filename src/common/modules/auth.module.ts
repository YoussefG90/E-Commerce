import { Global, Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { TokenService } from "src/common/Services";
import { UserReposirotry, TokenRepository } from "src/DB";
import { UserModel, TokenModel } from "src/DB/Model"; 

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
    TokenRepository,
  ],
  exports: [
    JwtService,
    TokenService,
    UserReposirotry,
    TokenRepository,
    UserModel,
    TokenModel,
  ],
})
export class SharedAuthenticationModule {}
