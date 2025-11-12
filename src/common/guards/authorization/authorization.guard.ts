import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
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
    switch (context.getType<string>()) {
      case "http": 
        role = context.switchToHttp().getRequest().credentials.user.role
        return true;
        
      case "graphql":
        role = GqlExecutionContext.create(context).getContext().req.credentials.user.role
        
      // case "rpc":
      //     const rpcCtx = context.switchToRpc()
      //     return true;
      case "ws":
          role = context.switchToWs().getClient().credentials.user.role
      default:
        return accessRoles.includes(role);
    }
  }
}
