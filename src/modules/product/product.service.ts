import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductAttachmentDto, UpdateProductDto } from './dto/update-product.dto';
import { BrandReposirotry, CategoryDocument, Product, ProductDocument, ProductReposirotry, UserDocument, UserReposirotry } from 'src/DB';
import { CategoryReposirotry } from 'src/DB/Repository/Category.Repository';
import { CloudinaryService } from 'src/common/utils/Multer';
import { randomUUID } from 'crypto';
import { FolderEnum, GetAllDto } from 'src/common';
import { Types } from 'mongoose';
import { Lean } from 'src/DB/Repository/database.repository';


@Injectable()
export class ProductService {
  constructor(private readonly productReposirotry:ProductReposirotry,
              private readonly brandReposirotry:BrandReposirotry, 
              private readonly categoryReposirotry:CategoryReposirotry, 
              private readonly userReposirotry:UserReposirotry,  
              private readonly cloudinaryService: CloudinaryService 
  ){}
async create(createProductDto: CreateProductDto,files:Express.Multer.File[],user:UserDocument
):Promise<ProductDocument> {
  const {name ,description,discountPercent,originalPrice,stock} = createProductDto
  const category = await this.categoryReposirotry.findOne({filter:{_id:createProductDto.category}})
  if (!category) {
    throw new NotFoundException("This Category Not Exist")
  }
  const brand = await this.brandReposirotry.findOne({filter:{_id:createProductDto.brand}})
  if (!brand) {
    throw new NotFoundException("This Brand Not Exist")
  }
  let assetFolderId:string = randomUUID()
  if (!files || files.length === 0) {
    throw new BadRequestException('No files provided');
  }
  const uploadPath = `${FolderEnum.Category}/${createProductDto.category}/${FolderEnum.Product}/${assetFolderId}`;
  const results = await Promise.all(files.map(file => this.cloudinaryService.uploadFile(file, uploadPath)));
  const [product] = await this.productReposirotry.create({data:[{
    category: category._id,
    brand: brand._id,
    name,
    description,
    salePrice:originalPrice - originalPrice * (discountPercent/100),
    discountPercent,
    originalPrice,
    stock,
    assetFolderId,
    images: results.map(r => r.secure_url),
    imagePublicId: results.map(r => r.public_id),
    createdBy: user._id
  }]});
      if (!product) {
      throw new BadRequestException("Fail to Create Product")
    }
  return product;
}

async update(productId:Types.ObjectId, updateProductDto: UpdateProductDto , user:UserDocument
  ):Promise<ProductDocument> {
    const product = await this.productReposirotry.findOne({filter:{_id:productId}})
    if (!product) {
      throw new NotFoundException("This Product Not Exist")
    }
  if (updateProductDto.category) {
    const category = await this.categoryReposirotry.findOne({filter:{_id:updateProductDto.category}})
  if (!category) {
    throw new NotFoundException("This Category Not Exist")
    }
    updateProductDto.category = category._id
  }
  if (updateProductDto.brand) {
    const brand = await this.brandReposirotry.findOne({filter:{_id:updateProductDto.brand}})
  if (!brand) {
    throw new NotFoundException("This Brand Not Exist")
    }
    updateProductDto.brand = brand._id
  }

  let salePrice = product.salePrice
  if (updateProductDto.originalPrice || updateProductDto.discountPercent) {
    const originalPrice = updateProductDto.originalPrice ?? product.originalPrice
    const discountPercent = updateProductDto.discountPercent ?? product.discountPercent
    const finalPrice = originalPrice -  (originalPrice * (discountPercent/100))
    salePrice = finalPrice > 0?finalPrice:1
  }
  const updatedProduct = await this.productReposirotry.findOneAndUpdate({filter:{_id:productId},
  update:{...updateProductDto,updatedBy:user._id,salePrice}})
  
      if (!updatedProduct) {
      throw new BadRequestException("Fail to Update Product")
    }
  return updatedProduct;


  }


async updateAttachment(
  productId: Types.ObjectId,
  updateProductAttachmentDto: UpdateProductAttachmentDto,
  user: UserDocument,
  files: Express.Multer.File[],
): Promise<ProductDocument> {
  const product = await this.productReposirotry.findOne({
    filter: { _id: productId },
    options: { populate: [{ path: "category" }] },
  });

  if (!product) {
    throw new NotFoundException("This Product Not Exist");
  }

  let attachments: { secure_url: string; public_id: string }[] = [];
  if (files?.length) {
    attachments = await this.cloudinaryService.uploadMultiple(
      files,
      `${FolderEnum.Category}/${(product.category as unknown as ProductDocument).assetFolderId}/${FolderEnum.Product}/${product.assetFolderId}`,
    );
  }
  const removedAttachment = [...new Set(updateProductAttachmentDto.removedAttachment ?? [])];
  const updatedProduct = await this.productReposirotry.findOneAndUpdate({
    filter: { _id: productId },
    update: [
      {
        $set: {
          updatedBy: user._id,
          images: {
            $setUnion: [
              { $setDifference: ["$images", removedAttachment] },
              attachments.map((a) => a.secure_url),
            ],
          },
          imagePublicId: {
            $setUnion: [
              { $setDifference: ["$imagePublicId", removedAttachment] },
              attachments.map((a) => a.public_id),
            ],
          },
        },
      },
    ],
  });

  if (!updatedProduct) {
    throw new BadRequestException("Fail to Update Product");
  }
  for (const id of removedAttachment) {
    await this.cloudinaryService.deleteFile(id);
  }

  return updatedProduct;
}

 async freeze(productId:Types.ObjectId, user:UserDocument
  ):Promise<string> {
    const Product  = await this.productReposirotry.findOneAndUpdate({filter:{_id:productId},
      update:{freezedAt:new Date(),$unset:{restoredAt:true},updatedBy:user._id},
      options:{new:false}})
    if (!Product) {
      throw new NotFoundException("Fail To SoftDelete Product")
    }
    return "SoftDeleted Successfully";
  }

  async hardDelete(productId: Types.ObjectId, user: UserDocument) {
 const product  = await this.productReposirotry.findOneAndDelete({
      filter:{_id:productId,paranoId:false,freezedAt:{$exists:true}}})
  if (!product) {
    throw new NotFoundException("Fail To HardDelete Product");
  }

  const prefix = `${FolderEnum.Category}/${(product.category as unknown as CategoryDocument).assetFolderId}/${FolderEnum.Product}/${product.assetFolderId}`;
  await this.cloudinaryService.deleteByPrefix(prefix);

  return "HardDelete Successfully";
}


  async restore(productId:Types.ObjectId, user:UserDocument
  ):Promise<ProductDocument | Lean<ProductDocument>> {
    const Product  = await this.productReposirotry.findOneAndUpdate({
      filter:{_id:productId,paranoId:false,freezedAt:{$exists:true}},
      update:{restoredAt:new Date(),$unset:{freezedAt:true},updatedBy:user._id},
      options:{new:false}})
    if (!Product) {
      throw new NotFoundException("Fail To Restore Product")
    }
    return Product;
  }


  async findAll(data:GetAllDto, archive:boolean = false
  ):Promise<{docsCount?:number; limit?:number; pages?:number;
     currentPage?: number | undefined ;result:ProductDocument[] | Lean<ProductDocument>[]}> {
    const {page , size , search} = data
    const result = await this.productReposirotry.paginate({
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

  async findOne(productId:Types.ObjectId, archive:boolean = false
  ):Promise<ProductDocument | Lean<ProductDocument>> {
    const Product = await this.productReposirotry.findOne({
      filter:{_id:productId,...(archive?{paranoId:false,freezedAt:{$exists:true}}:{})}
    })
    if (!Product) {
      throw new NotFoundException("Fail To Find Product")
    }
    return Product;
  }

  async addToWishlist(productId:Types.ObjectId, user:UserDocument
  ):Promise<ProductDocument | Lean<ProductDocument>> {
    const Product = await this.productReposirotry.findOne({filter:{_id:productId}})
    if (!Product) {
      throw new NotFoundException("Fail To Find Product")
    }
    await this.userReposirotry.updateOne({filter:{_id:user._id},
      update:{$addToSet:{wishlist:Product._id}}})
    return Product;
  }

  async removeFromWishlist(productId:Types.ObjectId, user:UserDocument
  ):Promise<string> {
    await this.userReposirotry.updateOne({filter:{_id:user._id},
      update:{$pull:{wishlist:Types.ObjectId.createFromHexString(productId as unknown as string)}}})
    return "Done";
  }
}
