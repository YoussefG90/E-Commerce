import { randomUUID } from "crypto";
import type {JwtPayload} from "jsonwebtoken";
import { TokenDocument, TokenRepository, UserReposirotry, } from '../../DB';

import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { RoleEnum, SecretLevelEnum, TokenEnum } from '../enums';
import { UserDocument} from 'src/DB';
import { parseObjectId } from "../utils";
import { LoginCredentialsResponse } from "../entites";





@Injectable()
export class TokenService {
    constructor(private readonly jwtService:JwtService,
        private readonly userReposirotry:UserReposirotry,
        private readonly tokenReposirotry:TokenRepository
    ){}

generateToken = async ({
  payload,
  options = { 
    secret:process.env.ACCESS_TOKEN_USER_SECRET as string,
    expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRATION),
  }
}: {
    payload: object
    options?: JwtSignOptions;
}) => {
  return await this.jwtService.signAsync(payload, options);
};



verfiyToken = async ({  
  token,
  options = {  secret : process.env.ACCESS_TOKEN_USER_SECRET as string,}
}: {
    token: string
    options?: JwtVerifyOptions;
}): Promise<JwtPayload> => {
  return this.jwtService.verifyAsync(token, options) as unknown as JwtPayload;
};


DetectSignatureLevel = async (role:RoleEnum = RoleEnum.user):Promise<SecretLevelEnum> => {
    let signatureLevel : SecretLevelEnum = SecretLevelEnum.Bearer
    switch (role) {
      case RoleEnum.admin:
      case RoleEnum.superAdmin:
          signatureLevel = SecretLevelEnum.System
        break;
    
      default:
          signatureLevel = SecretLevelEnum.Bearer
        break;
    }
    return signatureLevel
}


getSignatures = async (
  signatureLevel : SecretLevelEnum = SecretLevelEnum.Bearer
):Promise<{accessSignature:string , refreshSignature:string}> => {
  let signatures :{accessSignature:string , refreshSignature:string} = {
    accessSignature : "", refreshSignature : ""
  }
  switch (signatureLevel) {
    case SecretLevelEnum.System:
        signatures.accessSignature = process.env.ACCESS_TOKEN_ADMIN_SECRET as string;
        signatures.refreshSignature = process.env.REFRESH_TOKEN_ADMIN_SECRET as string;
      break;
  
    default:
      signatures.accessSignature = process.env.ACCESS_TOKEN_USER_SECRET as string;
      signatures.refreshSignature = process.env.REFRESH_TOKEN_USER_SECRET as string;
      break;
  }

  return signatures
}


CreateLoginCredentials = async (user:UserDocument):Promise<LoginCredentialsResponse> => {
  const signatureLevel = await this.DetectSignatureLevel(user.role)
  const signatures = await this.getSignatures(signatureLevel)
  const jwtid = randomUUID()
    const accessToken = await this.generateToken({
      payload:{_id:user._id},
      options : {expiresIn : Number(process.env.ACCESS_TOKEN_EXPIRATION) , 
        jwtid , secret:signatures.accessSignature,}
    })
    const refreshToken = await this.generateToken({
      payload:{_id:user._id},
      
      options : {expiresIn : Number(process.env.REFRESH_TOKEN_EXPIRATION) ,
        secret : signatures.refreshSignature , jwtid}
    })

    return  {accessToken , refreshToken}
}


decodedToken = async ({
  authorization , tokenType = TokenEnum.access
} : {
  authorization:string , tokenType?:TokenEnum
}):Promise<{user:UserDocument;decoded:JwtPayload}> => {
    try {
        
  const [bearerkey , token] = authorization.split(" ")
  if (!bearerkey || !token) {
    throw new UnauthorizedException("Missing Token Parts")
  }
  const signatures = await this.getSignatures(bearerkey as SecretLevelEnum)
  const decoded = await this.verfiyToken({token , 
    options:{secret:tokenType === TokenEnum.refresh ? signatures.refreshSignature : signatures.accessSignature}})
  if (!decoded?.sub || !decoded?.iat) {
    throw new BadRequestException("InValid Payload")
  }  
  if (await this.tokenReposirotry.findOne({filter:{jti:decoded.jti}})) {
    throw new UnauthorizedException("InValid Or Old Tokens")
  }
  const user = await this.userReposirotry.findOne({filter:{_id:decoded.sub}})as UserDocument
  if (!user) {
    throw new NotFoundException("User Not Registered")
  }
  if (user.changeCredentialsTime?.getTime() || 0 > decoded.iat * 1000) {
    throw new UnauthorizedException("InValid Or Old Tokens")
  }

  return {user , decoded}
    } catch (error) {
        throw new InternalServerErrorException(error.message || "Fail To Decode Token")
    }
}


createRevokeToken = async (decoded:JwtPayload):Promise<TokenDocument> => {
  const [result] = (await this.tokenReposirotry.create({data:[{
             jti:decoded.jti as string,
             expiresAt:new Date((decoded.iat as number) + Number(process.env.REFRESH_TOKEN_EXPIRATION)),
             createdBy: parseObjectId(decoded.sub as string)
    }]})) || []
  if (!result) {
  throw new BadRequestException("Fail To Revoke Token")
  }
    return result
}
}
