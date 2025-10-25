import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { CloudinaryModule } from "src/common/utils/Multer";


@Module({
    imports:[CloudinaryModule],
    exports:[],
    providers:[UserService],
    controllers:[UserController]
})
export class UserModule {}
