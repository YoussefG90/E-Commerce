import { PartialType } from '@nestjs/mapped-types';
import { CreateCartDto } from './create-cart.dto';
import { Types } from 'mongoose';
import { Validate } from 'class-validator';
import {MongoDBIds} from '../../../common/decorators/match.decorator'

export class UpdateCartDto extends PartialType(CreateCartDto) {}
export class RemoveItemsFromCartDto {
    @Validate(MongoDBIds)
    productIds:Types.ObjectId[]

}

