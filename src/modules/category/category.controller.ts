import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, UsePipes, ValidationPipe, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import {  Auth, RoleEnum, SuccessResponse, User } from 'src/common';
import type { UserDocument } from 'src/DB';
import type {GetAllDto, GetAllResponse, ICategory, IMulterFile, IResponse} from 'src/common'
import { FileInterceptor } from '@nestjs/platform-express';
import { cloudFileUpload, fileValidation } from 'src/common/utils/Multer';
import { CategoryParamsDto } from './dto/update-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponse} from './entities/category.entity';

@UsePipes(new ValidationPipe({whitelist:true,forbidNonWhitelisted:true}))
@Controller('Category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Auth([RoleEnum.superAdmin])
  @UseInterceptors(FileInterceptor("attachment" , cloudFileUpload({Validation:fileValidation.Image})))
  @Post()
  async create(
    @User() user:UserDocument,
    @Body() createCategoryDto: CreateCategoryDto, @UploadedFile(
          new ParseFilePipe({
            validators: [new MaxFileSizeValidator({ maxSize: 4 * 1024 * 1024 })],
          }),
        )
        file: IMulterFile,):Promise<IResponse> {
    const Category = await this.categoryService.create(createCategoryDto , file , user);
    return SuccessResponse({status:201,data:{Category}})
  }

  @Auth([RoleEnum.superAdmin])
  @Patch(':categoryId')  
  async update(@User() user:UserDocument,@Param() params:CategoryParamsDto, @Body() updateCategoryDto: UpdateCategoryDto
):Promise<IResponse<CategoryResponse>>
   {
    const category = await this.categoryService.update(params.categoryId, updateCategoryDto ,user);
    return SuccessResponse<CategoryResponse>({data:{category}})
  }

  @UseInterceptors(FileInterceptor("attachment" , cloudFileUpload({Validation:fileValidation.Image})))
  @Auth([RoleEnum.superAdmin])
  @Patch(':categoryId/attachment')  
  async updateAttachment(@User() user:UserDocument,@UploadedFile(ParseFilePipe) file: IMulterFile,
    @Param() params:CategoryParamsDto
    
):Promise<IResponse<CategoryResponse>>
   {
    const category = await this.categoryService.updateAttachment(params.categoryId, file ,user);
    return SuccessResponse<CategoryResponse>({data:{category}})
  }


  @Auth([RoleEnum.superAdmin])
  @Delete(':categoryId/freeze')
  async freeze(@Param() params:CategoryParamsDto,@User() user:UserDocument):Promise<IResponse> {
    await this.categoryService.freeze(params.categoryId,user);
    return SuccessResponse()
  }

  @Auth([RoleEnum.superAdmin])
  @Patch(':categoryId/restore')
  async restore(@Param() params:CategoryParamsDto,@User() user:UserDocument):Promise<IResponse> {
   const Category =  await this.categoryService.freeze(params.categoryId,user);
    return SuccessResponse({data:{Category}})
  }

  @Auth([RoleEnum.superAdmin])
  @Delete(':categoryId')
  async hardDelete(@Param() params:CategoryParamsDto,@User() user:UserDocument) {
    await this.categoryService.hardDelete(params.categoryId,user);
    return SuccessResponse()
  }

  @Get()
  async findAll(@Query() query:GetAllDto):Promise<IResponse<GetAllResponse<ICategory>>> {
    const result = await this.categoryService.findAll(query)
    return SuccessResponse<GetAllResponse<ICategory>>({data:{result}})
  }
  @Auth([RoleEnum.superAdmin])
  @Get('/archive')
  async findAllArchives(@Query() query:GetAllDto):Promise<IResponse<GetAllResponse<ICategory>>> {
    const result = await this.categoryService.findAll(query , true)
    return SuccessResponse<GetAllResponse<ICategory>>({data:{result}})
  }

  @Get(':categoryId')
  async findOne(@Param() params: CategoryParamsDto) {
    const category = await this.categoryService.findOne(params.categoryId);
    return SuccessResponse<CategoryResponse>({data:{category}})
  }

  @Auth([RoleEnum.superAdmin])
  @Get(':categoryId/archive')
  async findOneArchive(@Param() params: CategoryParamsDto) {
    const category = await this.categoryService.findOne(params.categoryId ,true);
    return SuccessResponse<CategoryResponse>({data:{category}})
  }

}
