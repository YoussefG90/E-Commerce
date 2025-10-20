import { Controller, Get} from "@nestjs/common";
import { UserService } from "./user.service";
import { RoleEnum, User } from "src/common";
import { Auth } from "src/common/decorators/auth";
import type { UserDocument } from "src/DB";

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}
    @Auth([RoleEnum.user])
    @Get('profile')
    profile(
        @User() user:UserDocument
    ) {
        return this.userService.profile();
    }
}