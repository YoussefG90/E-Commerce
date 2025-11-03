import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { BrandModel, BrandReposirotry, CategoryModel, ProductModel, ProductReposirotry } from 'src/DB';
import { CloudinaryService } from 'src/common/utils/Multer';
import { CategoryReposirotry } from 'src/DB/Repository/Category.Repository';

@Module({
  imports:[CategoryModel,BrandModel,ProductModel],
  controllers: [ProductController],
  providers: [ProductService,BrandReposirotry,CategoryReposirotry,CloudinaryService,ProductReposirotry],
})
export class ProductModule {}
