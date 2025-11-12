import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tokenName } from 'src/common/decorators';
import { TokenEnum } from 'src/common/enums';
import { TokenService } from 'src/common/Services';
import { getSocketAuth } from 'src/common/utils/socket';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private readonly tokenService:TokenService,
              private readonly reflector:Reflector
  ){}
  async canActivate(
    context: ExecutionContext,
  ):Promise<boolean> {
    const tokenType:TokenEnum = this.reflector.getAllAndOverride<TokenEnum>(tokenName,
        [context.getHandler(),context.getClass()])?? TokenEnum.access

    let req:any
    let authorization:string = ""
    switch (context.getType<string>()) {
      case "http":
          const httpCtx = context.switchToHttp()
          req = httpCtx.getRequest()
          authorization = req.headers.authorization
        break;
      // case "rpc":
      //     const rpcCtx = context.switchToRpc()

      //   break;
      case "ws":
          const wsCtx = context.switchToWs()
          req = wsCtx.getClient()
          authorization = getSocketAuth(req)
          break;
      case "graphql":
          req = GqlExecutionContext.create(context).getContext().req
          authorization = req.headers.authorization    
      default:
        break;
    }
    if (!authorization) {
      return false
    }
    const {decoded , user} = await this.tokenService.decodedToken({authorization,tokenType})
    req.credentials = { decoded , user}
    return true;
  }
}
