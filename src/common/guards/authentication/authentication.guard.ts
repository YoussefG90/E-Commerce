import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tokenName } from 'src/common/decorators';
import { TokenEnum } from 'src/common/enums';
import { TokenService } from 'src/common/Services';

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
    switch (context.getType()) {
      case "http":
          const httpCtx = context.switchToHttp()
          req = httpCtx.getRequest()
          authorization = req.headers.authorization
        break;
      // case "rpc":
      //     const rpcCtx = context.switchToRpc()

      //   break;
      // case "ws":
      //     const wsCtx = context.switchToWs()

      //   break;

      default:
        break;
    }
    const {decoded , user} = await this.tokenService.decodedToken({authorization,tokenType})
    req.credentials = { decoded , user}
    return true;
  }
}
