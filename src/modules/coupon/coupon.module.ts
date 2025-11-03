import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { CouponModel, CouponReposirotry } from 'src/DB';
import { CloudinaryService } from 'src/common/utils/Multer';

@Module({
  imports:[CouponModel],
  controllers: [CouponController],
  providers: [CouponService,CloudinaryService,CouponReposirotry],
})
export class CouponModule {}
