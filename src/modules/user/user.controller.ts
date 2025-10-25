import { Controller, Get, MaxFileSizeValidator, ParseFilePipe, Patch, UploadedFile, UploadedFiles, UseInterceptors} from "@nestjs/common";
import { UserService } from "./user.service";
import { RoleEnum, User } from "src/common";
import { Auth } from "src/common/decorators/auth";
import type { UserDocument } from "src/DB";
import { FileInterceptor } from "@nestjs/platform-express";
import type { IMulterFile } from "src/common";
import { cloudFileUpload, fileValidation } from "src/common/utils/Multer";

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}
    @Auth([RoleEnum.user , RoleEnum.admin])
    @Get('profile')
    profile(
        @User() user:UserDocument
    ) {
        return this.userService.profile();
    }

  @Auth([RoleEnum.user])
  @UseInterceptors(FileInterceptor('profileImage'))
  @Patch('profile-image')
  async uploadProfileImage(
    @User() user: UserDocument,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 4 * 1024 * 1024 })],
      }),
    )
    file: IMulterFile,
  ) {
    return this.userService.uploadProfileImage(user._id.toString(), file);
  }

    // @UseInterceptors(FilesInterceptor('coverImages' ,2,
    //      localFileUpload({folder:"User" , Validation:fileValidation.Image ,fileSize:4 })))
    // @Auth([RoleEnum.user])
    // @Patch("profile-image")
    // coverImage(@UploadedFiles(new ParseFilePipe({
    //     validators:[new MaxFileSizeValidator({maxSize:4*1024*1024})]})) files:Array<IMulterFile>){
    //     return {message:"Done" ,files}
    // }

    // @UseInterceptors(FileFieldsInterceptor([{name:"profileImage" , maxCount:1},
    //     {name:"coverImage" , maxCount:2}],
    //      localFileUpload({folder:"User" , Validation:fileValidation.Image ,fileSize:4 })))
    // @Auth([RoleEnum.user])
    // @Patch("image")
    // Image(@UploadedFiles(new ParseFilePipe({
    //     validators:[new MaxFileSizeValidator({maxSize:6*1024*1024})]})) 
    //     files:{profileImage:Array<IMulterFile>;coverImage:Array<IMulterFile>}){
    //     return {message:"Done" ,files}
    // }
}