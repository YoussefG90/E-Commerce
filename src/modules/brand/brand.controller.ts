import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, UsePipes, ValidationPipe } from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import {  Auth, RoleEnum, SuccessResponse, User } from 'src/common';
import type { UserDocument } from 'src/DB';
import type {IMulterFile, IResponse} from 'src/common'
import { FileInterceptor } from '@nestjs/platform-express';
import { cloudFileUpload, fileValidation } from 'src/common/utils/Multer';
import { BrandParamsDto } from './dto/update-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandResponse } from './entities/brand.entity';

@UsePipes(new ValidationPipe({whitelist:true,forbidNonWhitelisted:true}))
@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Auth([RoleEnum.superAdmin])
  @UseInterceptors(FileInterceptor("attachment" , cloudFileUpload({Validation:fileValidation.Image})))
  @Post()
  async create(
    @User() user:UserDocument,
    @Body() createBrandDto: CreateBrandDto, @UploadedFile(
          new ParseFilePipe({
            validators: [new MaxFileSizeValidator({ maxSize: 4 * 1024 * 1024 })],
          }),
        )
        file: IMulterFile,):Promise<IResponse> {
    const brand = await this.brandService.create(createBrandDto , file , user);
    return SuccessResponse({status:201,data:{brand}})
  }

  @Auth([RoleEnum.superAdmin])
  @Patch(':brandId')  
  async update(@User() user:UserDocument,@Param() params:BrandParamsDto, @Body() updateBrandDto: UpdateBrandDto
):Promise<IResponse<BrandResponse>>
   {
    const brand = await this.brandService.update(params.brandId, updateBrandDto ,user);
    return SuccessResponse<BrandResponse>({data:{brand}})
  }

  @UseInterceptors(FileInterceptor("attachment" , cloudFileUpload({Validation:fileValidation.Image})))
  @Auth([RoleEnum.superAdmin])
  @Patch(':brandId/attachment')  
  async updateAttachment(@User() user:UserDocument,@UploadedFile(ParseFilePipe) file: IMulterFile,
    @Param() params:BrandParamsDto
    
):Promise<IResponse<BrandResponse>>
   {
    const brand = await this.brandService.updateAttachment(params.brandId, file ,user);
    return SuccessResponse<BrandResponse>({data:{brand}})
  }


  @Auth([RoleEnum.superAdmin])
  @Delete(':brandId/freeze')
  async freeze(@Param() params:BrandParamsDto,@User() user:UserDocument):Promise<IResponse> {
    await this.brandService.freeze(params.brandId,user);
    return SuccessResponse()
  }

  @Auth([RoleEnum.superAdmin])
  @Patch(':brandId/restore')
  async restore(@Param() params:BrandParamsDto,@User() user:UserDocument):Promise<IResponse> {
   const brand =  await this.brandService.freeze(params.brandId,user);
    return SuccessResponse({data:{brand}})
  }

  @Auth([RoleEnum.superAdmin])
  @Delete(':brandId')
  async hardDelete(@Param() params:BrandParamsDto,@User() user:UserDocument) {
    await this.brandService.hardDelete(params.brandId,user);
    return SuccessResponse()
  }

  @Get()
  findAll() {
    return this.brandService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brandService.findOne(+id);
  }



}
