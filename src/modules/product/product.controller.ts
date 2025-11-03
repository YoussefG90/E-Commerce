import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, UsePipes, UseInterceptors, UploadedFiles, ParseFilePipe, MaxFileSizeValidator, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductParamsDto, UpdateProductAttachmentDto, UpdateProductDto } from './dto/update-product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { cloudFileUpload, fileValidation } from 'src/common/utils/Multer';
import { Auth, GetAllDto, GetAllResponse, IProduct, IResponse, RoleEnum, SuccessResponse, User } from 'src/common';
import type { UserDocument } from 'src/DB';
import { ProductResponse } from './entities/product.entity';


@UsePipes(new ValidationPipe({whitelist:true,forbidNonWhitelisted:true}))
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Auth([RoleEnum.superAdmin, RoleEnum.admin])
  @UseInterceptors(FilesInterceptor("attachments" ,5, cloudFileUpload({Validation:fileValidation.Image})))
  @Post()
  async create(@User() user:UserDocument,
      @Body() createProductDto: CreateProductDto, @UploadedFiles(
            new ParseFilePipe({
              validators: [new MaxFileSizeValidator({ maxSize: 4 * 1024 * 1024 })],
            }),
          )
          files: Express.Multer.File[],):Promise<IResponse<ProductResponse>> {
      const product = await this.productService.create(createProductDto , files , user);
      return SuccessResponse<ProductResponse>({status:201,data:{product}})
    }

  @Auth([RoleEnum.superAdmin, RoleEnum.admin])
  @Patch(':productId')  
  async update(@User() user:UserDocument,@Param() params:ProductParamsDto, @Body() updateProductDto: UpdateProductDto
):Promise<IResponse<ProductResponse>>
   {
    const product = await this.productService.update(params.productId, updateProductDto ,user);
    return SuccessResponse<ProductResponse>({data:{product}})
  }  

  @Auth([RoleEnum.superAdmin, RoleEnum.admin])
  @UseInterceptors(FilesInterceptor("attachments" ,5, cloudFileUpload({Validation:fileValidation.Image})))
  @Patch(':productId/attachment')  
  async updateAttachment(@User() user:UserDocument,@Param() params:ProductParamsDto,
   @Body() updateProductAttachmentDto: UpdateProductAttachmentDto,@UploadedFiles(
            new ParseFilePipe({
              validators: [new MaxFileSizeValidator({ maxSize: 4 * 1024 * 1024 })],
              fileIsRequired:false
            }),
          )
          files: Express.Multer.File[]
  )
   {
    const product = await this.productService.updateAttachment(
      params.productId, updateProductAttachmentDto ,user,files
    );
    return SuccessResponse({data:{product}})
  }  

 @Auth([RoleEnum.superAdmin])
   @Delete(':productId/freeze')
   async freeze(@Param() params:ProductParamsDto,@User() user:UserDocument):Promise<IResponse> {
     await this.productService.freeze(params.productId,user);
     return SuccessResponse()
   }
 
   @Auth([RoleEnum.superAdmin])
   @Patch(':productId/restore')
   async restore(@Param() params:ProductParamsDto,@User() user:UserDocument):Promise<IResponse> {
    const Category =  await this.productService.freeze(params.productId,user);
     return SuccessResponse({data:{Category}})
   }
 
   @Auth([RoleEnum.superAdmin])
   @Delete(':productId')
   async hardDelete(@Param() params:ProductParamsDto,@User() user:UserDocument) {
     await this.productService.hardDelete(params.productId,user);
     return SuccessResponse()
   }
 
   @Get()
   async findAll(@Query() query:GetAllDto):Promise<IResponse<GetAllResponse<IProduct>>> {
     const result = await this.productService.findAll(query)
     return SuccessResponse<GetAllResponse<IProduct>>({data:{result}})
   }
   @Auth([RoleEnum.superAdmin])
   @Get('/archive')
   async findAllArchives(@Query() query:GetAllDto):Promise<IResponse<GetAllResponse<IProduct>>> {
     const result = await this.productService.findAll(query , true)
     return SuccessResponse<GetAllResponse<IProduct>>({data:{result}})
   }
 
   @Get(':productId')
   async findOne(@Param() params: ProductParamsDto) {
     const product = await this.productService.findOne(params.productId);
     return SuccessResponse<ProductResponse>({data:{product}})
   }
 
   @Auth([RoleEnum.superAdmin])
   @Get(':productId/archive')
   async findOneArchive(@Param() params: ProductParamsDto) {
     const product = await this.productService.findOne(params.productId ,true);
     return SuccessResponse<ProductResponse>({data:{product}})
   }

  @Auth([RoleEnum.user])
  @Patch(':productId/add-to-wishlist')  
  async addToWishlist(@User() user:UserDocument,@Param() params:ProductParamsDto
):Promise<IResponse<ProductResponse>>
   {
    const product = await this.productService.addToWishlist(params.productId ,user);
    return SuccessResponse<ProductResponse>({data:{product}})
  }  

  @Auth([RoleEnum.user])
  @Patch(':productId/remove-from-wishlist')  
  async removeFromWishlist(@User() user:UserDocument,@Param() params:ProductParamsDto
):Promise<IResponse>
   {
    await this.productService.removeFromWishlist(params.productId ,user);
    return SuccessResponse()
  } 
}
