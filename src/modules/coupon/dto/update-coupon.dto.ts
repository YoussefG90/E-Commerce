import { IsMongoId} from 'class-validator';
import { Types } from 'mongoose';
import { PartialType } from '@nestjs/mapped-types';
import { CreateCouponDto } from './create-coupon.dto';

export class UpdateCouponDto extends PartialType(CreateCouponDto) {}

export class CouponParamsDto {
  @IsMongoId()
  couponId: Types.ObjectId;
}
