import { Module } from '@nestjs/common';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { BrandModel, BrandReposirotry } from 'src/DB';
import { CloudinaryService } from 'src/common/utils/Multer';

@Module({
  imports:[BrandModel],
  controllers: [BrandController],
  providers: [BrandService,BrandReposirotry,CloudinaryService],
})
export class BrandModule {}
