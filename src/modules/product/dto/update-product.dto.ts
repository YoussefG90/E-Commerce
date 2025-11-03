import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsArray, IsMongoId,  IsOptional} from "class-validator";
import { Types } from "mongoose";
import { ContainField} from 'src/common';



@ContainField([])
export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class UpdateProductAttachmentDto  {
    @IsOptional()
    @IsArray()
    removedAttachment?:string[]
}


export class ProductParamsDto {
    @IsMongoId()
    productId:Types.ObjectId
}

