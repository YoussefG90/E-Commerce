import { Type } from "class-transformer"
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator"

export class GetAllDto {
    @Type(()=>Number)
    @IsOptional()
    @IsNumber()
    @IsPositive()
    page:number
    @Type(()=>Number)
    @IsOptional()
    @IsNumber()
    @IsPositive()
    size:number
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    search:string
}