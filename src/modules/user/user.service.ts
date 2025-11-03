import { Injectable, NotFoundException } from "@nestjs/common";
import { FolderEnum } from "src/common";
import { CloudinaryService } from "src/common/utils/Multer";
import { UserDocument, UserReposirotry } from "src/DB";




@Injectable()
export class UserService {
    constructor(private readonly cloudinaryService: CloudinaryService,
      private readonly userReposirotry:UserReposirotry
    ){}


    
    async profile(user:UserDocument):Promise<UserDocument> {
      const profile = await this.userReposirotry.findOne({
        filter:{_id:user._id},options:{populate:[{path:"wishlist"}]} 
      }) as UserDocument
        return profile
    }


  async uploadProfileImage(userId: string, file: Express.Multer.File) {
    const user = await this.userReposirotry.findOne({filter:{_id:userId}});
    if (!user) throw new NotFoundException('User not found');
    if (user.profileImagePublicId) {
      await this.cloudinaryService.deleteFile(user.profileImagePublicId);
    }
    const result = await this.cloudinaryService.uploadFile(file, `${FolderEnum.User}/profile-image`);
    user.profileImage = result.secure_url;
    user.profileImagePublicId = result.public_id;
    await user.save();
    return {
      message: 'Profile image uploaded successfully',
      url: result.secure_url,
    };
  }


}    