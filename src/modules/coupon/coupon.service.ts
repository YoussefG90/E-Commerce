import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import type { CouponDocument, CouponReposirotry, UserDocument } from 'src/DB';
import { CloudinaryService } from 'src/common/utils/Multer';
import { FolderEnum } from 'src/common';
import { Types } from 'mongoose';


@Injectable()
export class CouponService {
  constructor(private readonly couponReposirotry:CouponReposirotry,
              private readonly cloudinaryService:CloudinaryService
  ){}
  async create(createCouponDto: CreateCouponDto,user:UserDocument,file:Express.Multer.File
):Promise<CouponDocument> {
    const checkDuplicated = await this.couponReposirotry.findOne({
      filter:{name:createCouponDto.name,paranoId:false}})
    if (checkDuplicated) {
      throw new ConflictException("Duplicated Coupon Name")
    }
    const uploadResult = await this.cloudinaryService.uploadFile(file, `${FolderEnum.Coupon}`);
    const image = (uploadResult && (uploadResult.secure_url ?? (uploadResult as any).url)) ?? '';
    const [coupon] = await this.couponReposirotry.create({
      data:[{image,createdBy:user._id,...createCouponDto}]
    })
    if (!coupon) {
      throw new BadRequestException("Fail To Create Coupon")
    }
    return coupon;
  }

    async update(
    couponId: Types.ObjectId,
    updateCouponDto: UpdateCouponDto,
    user: UserDocument,
  ): Promise<CouponDocument> {
    if (
      updateCouponDto.name &&
      (await this.couponReposirotry.findOne({
        filter: { name: updateCouponDto.name, _id: { $ne: couponId } },
      }))
    ) {
      throw new ConflictException('Coupon Already Exists');
    }
    if (
      updateCouponDto.startDate &&
      updateCouponDto.endDate &&
      updateCouponDto.startDate >= updateCouponDto.endDate
    ) {
      throw new BadRequestException('End date must be after start date');
    }
    const coupon = await this.couponReposirotry.findOneAndUpdate({
      filter: { _id: couponId },
      update: { ...updateCouponDto, updatedBy: user._id },
    });
    if (!coupon) {
      throw new NotFoundException('Fail to update Coupon');
    }
    return coupon;
  }

   async updateAttachment(
    couponId: Types.ObjectId,
    file: Express.Multer.File,
    user: UserDocument,
  ): Promise<CouponDocument> {
    const coupon = await this.couponReposirotry.findOne({
      filter: { _id: couponId },
    });
    if (!coupon) throw new NotFoundException('Fail to update Coupon');
    const upload = await this.cloudinaryService.uploadFile(file, `${FolderEnum.Coupon}`);
    const updated = await this.couponReposirotry.findOneAndUpdate({
      filter: { _id: couponId },
      update: {
        image: upload.secure_url,
        imagePublicId: upload.public_id,
        updatedBy: user._id,
      },
    });

    if (!updated) {
      await this.cloudinaryService.deleteFile(upload.public_id);
      throw new NotFoundException('Fail to update Coupon');
    }
    return updated;
  }

  async freeze(couponId: Types.ObjectId, user: UserDocument): Promise<string> {
    const coupon = await this.couponReposirotry.findOneAndUpdate({
      filter: { _id: couponId },
      update: {
        freezedAt: new Date(),
        $unset: { restoredAt: true },
        updatedBy: user._id,
      },
      options: { new: false },
    });
    if (!coupon) throw new NotFoundException('Fail To Freeze Coupon');
    return 'Coupon freezed successfully';
  }

    async hardDelete(couponId: Types.ObjectId, user: UserDocument) {
    const coupon = await this.couponReposirotry.findOneAndDelete({
      filter: { _id: couponId, paranoId: false, freezedAt: { $exists: true } },
    });
    if (!coupon) throw new NotFoundException('Fail To HardDelete Coupon');

    if (coupon.imagePublicId) {
      await this.cloudinaryService.deleteFile(coupon.imagePublicId);
    }

    return 'HardDelete Successfully';
  }

    async restore(
    couponId: Types.ObjectId,
    user: UserDocument,
  ): Promise<CouponDocument> {
    const coupon = await this.couponReposirotry.findOneAndUpdate({
      filter: { _id: couponId, paranoId: false, freezedAt: { $exists: true } },
      update: {
        restoredAt: new Date(),
        $unset: { freezedAt: true },
        updatedBy: user._id,
      },
      options: { new: false },
    });
    if (!coupon) throw new NotFoundException('Fail To Restore Coupon');
    return coupon;
  }

 async findAll(
  data: any,
  archive = false,
): Promise<{
  docsCount: number;
  limit: number;
  pages: number;
  currentPage: number;
  result: CouponDocument[];
}> {
  const { page = 1, size = 10, search = '' } = data;

  const result = await this.couponReposirotry.paginate({
    filter: {
      ...(search
        ? {
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { slug: { $regex: search, $options: 'i' } },
            ],
          }
        : {}),
      ...(archive ? { paranoId: false, freezedAt: { $exists: true } } : {}),
    },
    page,
    size,
  });
  return {
    docsCount: result.docsCount ?? 0,
    limit: result.limit ?? size,
    pages: result.pages ?? 1,
    currentPage: result.currentPage ?? page,
    result: result.result as unknown as CouponDocument[],
  };
}


 async findOne(
  couponId: Types.ObjectId,
  archive = false,
): Promise<CouponDocument> {
  const coupon = (await this.couponReposirotry.findOne({
    filter: {
      _id: couponId,
      ...(archive ? { paranoId: false, freezedAt: { $exists: true } } : {}),
    },
  })) as CouponDocument | null;

  if (!coupon) throw new NotFoundException('Fail To Find Coupon');
  return coupon;
}

}
