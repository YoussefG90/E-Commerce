import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { BrandReposirotry, CategoryDocument, UserDocument } from 'src/DB';
import { FolderEnum, GetAllDto, SuccessResponse, type IMulterFile } from 'src/common';
import { CloudinaryService } from 'src/common/utils/Multer';
import {  UpdateCategoryDto } from './dto/update-category.dto';
import { Types } from 'mongoose';
import { Lean } from 'src/DB/Repository/database.repository';
import { CategoryReposirotry } from 'src/DB/Repository/Category.Repository';
import { randomUUID } from 'crypto';

@Injectable()
export class CategoryService {
    constructor(private readonly brandReposirotry:BrandReposirotry,
            private readonly categoryReposirotry:CategoryReposirotry,
                private readonly cloudinaryService: CloudinaryService
    ){}
 async create(createCategoryDto: CreateCategoryDto, file: IMulterFile, user: UserDocument) {
  const { name, description } = createCategoryDto;
  const existingCategory = await this.categoryReposirotry.findOne({ filter: { name , paranoId:false } });
  if (existingCategory) {
    throw new ConflictException(existingCategory.freezedAt?"Already Archived Category Exists with Same Name"
      :"Category Already Exists");
  }

  const brands:Types.ObjectId[] = [...new Set(createCategoryDto.brands || [])]
  if (brands && (await this.brandReposirotry.find({filter:{_id:{$in:brands}}})).length != brands.length) {
    throw new NotFoundException("Some Of Brands Not Exists")
  }
  let assetFolderId:string = randomUUID()
  const result = await this.cloudinaryService.uploadFile(file, `${FolderEnum.Category}/${assetFolderId}`);
  const newCategory = await this.categoryReposirotry.create({
    data: [
      {
        ...createCategoryDto,
        description,assetFolderId,
        image: result.secure_url,
        imagePublicId: result.public_id,
        createdBy: user._id,brands:brands.map(brand=>
          {return Types.ObjectId.createFromHexString(brand as unknown as string)})
      },
    ],
  });
  return SuccessResponse({message: "Category created successfully",status:201,data: {newCategory}})
}

  async update(categoryId:Types.ObjectId, updateCategoryDto: UpdateCategoryDto , user:UserDocument
  ):Promise<CategoryDocument | Lean<CategoryDocument>> {
    if (updateCategoryDto.name && (
      await this.categoryReposirotry.findOne({filter:{name:updateCategoryDto.name}}))) {
      throw new ConflictException("Category Already Exists")
    }
      const brands:Types.ObjectId[] = [...new Set(updateCategoryDto.brands || [])]
  if (brands && (await this.brandReposirotry.find({filter:{_id:{$in:brands}}})).length != brands.length) {
    throw new NotFoundException("Some Of Brands Not Exists")
  }
  const removeBrands = updateCategoryDto.brands ?? [];
  delete (updateCategoryDto as any).removeBrands;
    const Category  = await this.categoryReposirotry.findOneAndUpdate({filter:{_id:categoryId},
      update:[{
        $set:{...updateCategoryDto,updatedBy:user._id,brands:{$setUnion:[
          {$setDifference:[
            "$brands",(removeBrands || []).map((brand)=>{
                        return Types.ObjectId.createFromHexString(brand as unknown as string)
                    })
          ]},
          
            brands.map((brand)=>{
                        return Types.ObjectId.createFromHexString(brand as unknown as string)})
          
        ]}}
      }]})
    if (!Category) {
      throw new NotFoundException("Fail to update Category")
    }
    return Category;
  }

  async updateAttachment(categoryId:Types.ObjectId, file: IMulterFile , user:UserDocument
  ):Promise<CategoryDocument | Lean<CategoryDocument>> {
    const Category  = await this.categoryReposirotry.findOne({filter:{_id:categoryId}})
    if (!Category) {
      throw new NotFoundException("Fail to update Category")
    }
    const assetFolderId = (Category as any).assetFolderId ?? randomUUID();
    const result = await this.cloudinaryService.uploadFile(file, `${FolderEnum.Category}/${assetFolderId}`);
    const updatedCategory  = await this.categoryReposirotry.findOneAndUpdate({filter:{_id:categoryId},
      update:{image: result.secure_url,imagePublicId: result.public_id,updatedBy:user._id},
      })
    if (!updatedCategory) {
      await this.cloudinaryService.deleteFile(result.public_id)
      throw new NotFoundException("Fail to update Category")
    }
    return updatedCategory;
  }
  
  async freeze(categoryId:Types.ObjectId, user:UserDocument
  ):Promise<string> {
    const Category  = await this.categoryReposirotry.findOneAndUpdate({filter:{_id:categoryId},
      update:{freezedAt:new Date(),$unset:{restoredAt:true},updatedBy:user._id},
      options:{new:false}})
    if (!Category) {
      throw new NotFoundException("Fail To SoftDelete Category")
    }
    return "SoftDeleted Successfully";
  }

  async hardDelete(categoryId:Types.ObjectId, user:UserDocument
  ) {
    const Category  = await this.categoryReposirotry.findOneAndDelete({
      filter:{_id:categoryId,paranoId:false,freezedAt:{$exists:true}}})
    if (!Category) {
      throw new NotFoundException("Fail To HardDelete Category")
    }
    if (Category.imagePublicId) {
      await this.cloudinaryService.deleteFile(Category.imagePublicId)
    }
    return "HardDelete Successfully";
  }

  async restore(categoryId:Types.ObjectId, user:UserDocument
  ):Promise<CategoryDocument | Lean<CategoryDocument>> {
    const Category  = await this.categoryReposirotry.findOneAndUpdate({
      filter:{_id:categoryId,paranoId:false,freezedAt:{$exists:true}},
      update:{restoredAt:new Date(),$unset:{freezedAt:true},updatedBy:user._id},
      options:{new:false}})
    if (!Category) {
      throw new NotFoundException("Fail To Restore Category")
    }
    return Category;
  }


  async findAll(data:GetAllDto, archive:boolean = false
  ):Promise<{docsCount?:number; limit?:number; pages?:number;
     currentPage?: number | undefined ;result:CategoryDocument[] | Lean<CategoryDocument>[]}> {
    const {page , size , search} = data
    const result = await this.categoryReposirotry.paginate({
      filter:{...(search?{$or:[
        {name:{$regex:search,$options:"i"}},
        {slug:{$regex:search,$options:"i"}},
        {description:{$regex:search,$options:"i"}},
      ]}:{}),...(archive?{paranoId:false,freezedAt:{$exists:true}}:{})},
      page,
      size
    })
    return result;
  }

  async findOne(categoryId:Types.ObjectId, archive:boolean = false
  ):Promise<CategoryDocument | Lean<CategoryDocument>> {
    const Category = await this.categoryReposirotry.findOne({
      filter:{_id:categoryId,...(archive?{paranoId:false,freezedAt:{$exists:true}}:{})}
    })
    if (!Category) {
      throw new NotFoundException("Fail To Find Category")
    }
    return Category;
  }



}
