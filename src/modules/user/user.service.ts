import { Injectable, NotFoundException } from "@nestjs/common";
import { SuccessResponse } from "src/common";
import { CloudinaryService } from "src/common/utils/Multer";
import { UserReposirotry } from "src/DB";




@Injectable()
export class UserService {
    constructor(private readonly cloudinaryService: CloudinaryService,
      private readonly userReposirotry:UserReposirotry
    ){}


    
    profile() {
        return SuccessResponse();
    }


  async uploadProfileImage(userId: string, file: Express.Multer.File) {
    const user = await this.userReposirotry.findOne({filter:{_id:userId}});
    if (!user) throw new NotFoundException('User not found');
    if (user.profileImagePublicId) {
      await this.cloudinaryService.deleteFile(user.profileImagePublicId);
    }
    const result = await this.cloudinaryService.uploadFile(file, 'profile-images');
    user.profileImage = result.secure_url;
    user.profileImagePublicId = result.public_id;
    await user.save();
    return {
      message: 'Profile image uploaded successfully',
      url: result.secure_url,
    };
  }


}    