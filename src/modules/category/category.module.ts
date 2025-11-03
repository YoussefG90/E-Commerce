import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { BrandModel, BrandReposirotry, CategoryModel } from 'src/DB';
import { CategoryReposirotry } from 'src/DB/Repository/Category.Repository';
import { CloudinaryService } from 'src/common/utils/Multer';

@Module({
  imports:[CategoryModel,BrandModel],
  controllers: [CategoryController],
  providers: [CategoryService,BrandReposirotry,CategoryReposirotry,CloudinaryService],
})
export class CategoryModule {}
