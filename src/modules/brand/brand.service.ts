import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { BrandDocument, BrandReposirotry, UserDocument } from 'src/DB';
import { FolderEmun, SuccessResponse, type IMulterFile } from 'src/common';
import { CloudinaryService } from 'src/common/utils/Multer';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Types } from 'mongoose';
import { Lean } from 'src/DB/Repository/database.repository';

@Injectable()
export class BrandService {
    constructor(private readonly brandReposirotry:BrandReposirotry,
                private readonly cloudinaryService: CloudinaryService
    ){}
 async create(createBrandDto: CreateBrandDto, file: IMulterFile, user: UserDocument) {
  const { name, slogan } = createBrandDto;
  const existingBrand = await this.brandReposirotry.findOne({ filter: { name , paranoId:false } });
  if (existingBrand) {
    throw new ConflictException(existingBrand.freezedAt?"Already Archived Brand Exists with Same Name"
      :"Brand Already Exists");
  }
  const result = await this.cloudinaryService.uploadFile(file, FolderEmun.Brand);
  const newBrand = await this.brandReposirotry.create({
    data: [
      {
        name,
        slogan,
        image: result.secure_url,
        imagePublicId: result.public_id,
        createdBy: user._id,
      },
    ],
  });
  return SuccessResponse({message: "Brand created successfully",status:201,data: {newBrand}})
}

  async update(brandId:Types.ObjectId, updateBrandDto: UpdateBrandDto , user:UserDocument
  ):Promise<BrandDocument | Lean<BrandDocument>> {
    if (updateBrandDto.name && (
      await this.brandReposirotry.findOne({filter:{name:updateBrandDto.name}}))) {
      throw new ConflictException("Brand Already Exists")
    }
    const brand  = await this.brandReposirotry.findOneAndUpdate({filter:{_id:brandId},
      update:{...updateBrandDto,updatedBy:user._id}})
    if (!brand) {
      throw new NotFoundException("Fail to update brand")
    }
    return brand;
  }

  async updateAttachment(brandId:Types.ObjectId, file: IMulterFile , user:UserDocument
  ):Promise<BrandDocument | Lean<BrandDocument>> {
    const result = await this.cloudinaryService.uploadFile(file, FolderEmun.Brand);
    const brand  = await this.brandReposirotry.findOneAndUpdate({filter:{_id:brandId},
      update:{image: result.secure_url,imagePublicId: result.public_id,updatedBy:user._id},
      options:{new:false}})
    if (!brand) {
      throw new NotFoundException("Fail to update brand")
    }
    await this.cloudinaryService.deleteFile(result.public_id)
    return brand;
  }
  
  async freeze(brandId:Types.ObjectId, user:UserDocument
  ):Promise<string> {
    const brand  = await this.brandReposirotry.findOneAndUpdate({filter:{_id:brandId},
      update:{freezedAt:new Date(),$unset:{restoredAt:true},updatedBy:user._id},
      options:{new:false}})
    if (!brand) {
      throw new NotFoundException("Fail To SoftDelete Brand")
    }
    return "SoftDeleted Successfully";
  }

  async hardDelete(brandId:Types.ObjectId, user:UserDocument
  ) {
    const brand  = await this.brandReposirotry.findOneAndDelete({
      filter:{_id:brandId,paranoId:false,freezedAt:{$exists:true}}})
    if (!brand) {
      throw new NotFoundException("Fail To HardDelete Brand")
    }
    if (brand.imagePublicId) {
      await this.cloudinaryService.deleteFile(brand.imagePublicId)
    }
    return "HardDelete Successfully";
  }

  async restore(brandId:Types.ObjectId, user:UserDocument
  ):Promise<BrandDocument | Lean<BrandDocument>> {
    const brand  = await this.brandReposirotry.findOneAndUpdate({
      filter:{_id:brandId,paranoId:false,freezedAt:{$exists:true}},
      update:{restoredAt:new Date(),$unset:{freezedAt:true},updatedBy:user._id},
      options:{new:false}})
    if (!brand) {
      throw new NotFoundException("Fail To Restore Brand")
    }
    return brand;
  }


  findAll() {
    return `This action returns all brand`;
  }

  findOne(id: number) {
    return `This action returns a #${id} brand`;
  }


}
