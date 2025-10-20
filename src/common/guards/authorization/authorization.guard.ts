import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {roleName } from 'src/common/decorators';
import { RoleEnum} from 'src/common/enums';
import { TokenService } from 'src/common/Services';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private readonly tokenService:TokenService,
              private readonly reflector:Reflector
  ){}
  canActivate(
    context: ExecutionContext,
  ): boolean {
    const accessRoles:RoleEnum[] = this.reflector.getAllAndOverride<RoleEnum[]>(roleName,
            [context.getHandler(),context.getClass()])?? []
    let role:RoleEnum = RoleEnum.user
    switch (context.getType()) {
      case "http": {
        role = context.switchToHttp().getRequest().credentials.user.role
        return true;
      }
      // case "rpc":
      //     const rpcCtx = context.switchToRpc()
      //     return true;
      // case "ws":
      //     const wsCtx = context.switchToWs()
      //     return true;
      default:
        return accessRoles.includes(role);
    }
  }
}
