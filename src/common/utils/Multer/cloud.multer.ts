import { memoryStorage } from "multer";
import type {Request} from 'express'
import { BadRequestException } from "@nestjs/common";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";


export const cloudFileUpload = ({ Validation = [], fileSize = 2}
    :{ Validation:string[],fileSize?:number}):MulterOptions => {
    return {
            storage:memoryStorage(),
            fileFilter(req:Request,file:Express.Multer.File, callback:Function){
                if (Validation.includes(file.mimetype)) {
                    return callback(null , true)
                }
                return callback(new BadRequestException('Invalid File Format'))
            },
            limits:{
                fileSize:fileSize * 1024 * 1024
            }
    }
}