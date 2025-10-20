import { Module } from "@nestjs/common";
import { AuthenticationService } from "./auth.service";
import { AuthenticationController } from "./auth.controller";
import { OtpModel, OtpReposirotry} from "src/DB";




@Module({
    imports:[OtpModel],
    exports:[],
    providers:[AuthenticationService , OtpReposirotry],
    controllers:[AuthenticationController]
})

export class AuthenticationModule {}