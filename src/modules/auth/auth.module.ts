import { Module } from "@nestjs/common";
import { AuthenticationService } from "./auth.service";
import { AuthenticationController } from "./auth.controller";
import { OtpModel, OtpReposirotry, TokenModel, TokenRepository, UserModel, UserReposirotry} from "src/DB";
import { TokenService } from "src/common";
import { JwtService } from "@nestjs/jwt";




@Module({
    imports:[OtpModel,UserModel,TokenModel],
    exports:[JwtService,TokenService,UserReposirotry,TokenRepository,UserModel,TokenModel],
    providers:[AuthenticationService , OtpReposirotry,JwtService,TokenService,UserReposirotry,TokenRepository],
    controllers:[AuthenticationController]
})

export class AuthenticationModule {}