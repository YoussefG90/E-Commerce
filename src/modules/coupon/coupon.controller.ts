import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, UseInterceptors, UploadedFile, ParseFilePipe, Query } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { CouponParamsDto, UpdateCouponDto } from './dto/update-coupon.dto';
import { Auth, GetAllDto, GetAllResponse, ICoupon, IMulterFile, IResponse, RoleEnum, SuccessResponse, User } from 'src/common';
import type { UserDocument } from 'src/DB';
import { FileInterceptor } from '@nestjs/platform-express';
import { cloudFileUpload, fileValidation } from 'src/common/utils/Multer';
import { CouponResponse } from './entities/coupon.entity';



@UsePipes(new ValidationPipe({whitelist:true,forbidNonWhitelisted:true}))
@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Auth([RoleEnum.superAdmin,RoleEnum.admin])
  @UseInterceptors(FileInterceptor("attachment" , cloudFileUpload({Validation:fileValidation.Image})))
  @Post()
  async create(@Body() createCouponDto: CreateCouponDto,user:UserDocument,@UploadedFile(ParseFilePipe)
        file:Express.Multer.File ):Promise<IResponse<CouponResponse>> {
    const coupon = await this.couponService.create(createCouponDto,user,file);
    return SuccessResponse<CouponResponse>({status:201,data:{coupon}})
  }

 @Auth([RoleEnum.superAdmin])
  @Patch(':couponId')
  async update(
    @User() user: UserDocument,
    @Param() params: CouponParamsDto,
    @Body() updateCouponDto: UpdateCouponDto,
  ): Promise<IResponse<CouponResponse>> {
    const coupon = await this.couponService.update(
      params.couponId,
      updateCouponDto,
      user,
    );
    return SuccessResponse<CouponResponse>({ data: { coupon } });
  }


  @Auth([RoleEnum.superAdmin])
  @UseInterceptors(
    FileInterceptor(
      'attachment',
      cloudFileUpload({ Validation: fileValidation.Image }),
    ),
  )
  @Patch(':couponId/attachment')
  async updateAttachment(
    @User() user: UserDocument,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File,
    @Param() params: CouponParamsDto,
  ): Promise<IResponse<CouponResponse>> {
    const coupon = await this.couponService.updateAttachment(
      params.couponId,
      file,
      user,
    );
    return SuccessResponse<CouponResponse>({ data: { coupon } });
  }

  @Auth([RoleEnum.superAdmin])
  @Delete(':couponId/freeze')
  async freeze(
    @Param() params: CouponParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse> {
    await this.couponService.freeze(params.couponId, user);
    return SuccessResponse();
  }

  @Auth([RoleEnum.superAdmin])
  @Patch(':couponId/restore')
  async restore(
    @Param() params: CouponParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse<CouponResponse>> {
    const coupon = await this.couponService.restore(params.couponId, user);
    return SuccessResponse<CouponResponse>({ data: { coupon } });
  }


  @Auth([RoleEnum.superAdmin])
  @Delete(':couponId')
  async hardDelete(
    @Param() params: CouponParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse> {
    await this.couponService.hardDelete(params.couponId, user);
    return SuccessResponse();
  }

  @Get()
  async findAll(
    @Query() query: GetAllDto,
  ): Promise<IResponse<GetAllResponse<ICoupon>>> {
    const result = await this.couponService.findAll(query);
    return SuccessResponse<GetAllResponse<ICoupon>>({ data: { result } });
  }

  @Auth([RoleEnum.superAdmin])
  @Get('/archive')
  async findAllArchives(
    @Query() query: GetAllDto,
  ): Promise<IResponse<GetAllResponse<ICoupon>>> {
    const result = await this.couponService.findAll(query, true);
    return SuccessResponse<GetAllResponse<ICoupon>>({ data: { result } });
  }

  @Get(':couponId')
  async findOne(
    @Param() params: CouponParamsDto,
  ): Promise<IResponse<CouponResponse>> {
    const coupon = await this.couponService.findOne(params.couponId);
    return SuccessResponse<CouponResponse>({ data: { coupon } });
  }

  @Auth([RoleEnum.superAdmin])
  @Get(':couponId/archive')
  async findOneArchive(
    @Param() params: CouponParamsDto,
  ): Promise<IResponse<CouponResponse>> {
    const coupon = await this.couponService.findOne(params.couponId, true);
    return SuccessResponse<CouponResponse>({ data: { coupon } });
  }
}
