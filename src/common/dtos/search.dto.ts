import { Field, InputType } from "@nestjs/graphql"
import { Type } from "class-transformer"
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator"

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

@InputType()
export class GetAllGraphDto {
    @Field(() => Number,{nullable:true})
    @IsOptional()
    @IsInt()
    @IsNumber()
    @IsPositive()
    page?:number
    @Field(() => Number,{nullable:true})
    @IsOptional()
    @IsNumber()
    @IsPositive()
    size?:number
    @Field(() => String,{nullable:true})
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    search?:string
}