import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";


@Module({
    imports:[],
    exports:[],
    providers:[UserService],
    controllers:[UserController]
})
export class UserModule {}
