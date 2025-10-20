
import { applyDecorators, UseGuards } from '@nestjs/common';
import { RoleEnum, TokenEnum } from '../enums';
import { Token } from './token.decorator';
import { Roles } from './roles.decorator';
import { AuthenticationGuard } from '../guards/authentication/authentication.guard';
import { AuthorizationGuard } from '../guards/authorization/authorization.guard';

export function Auth(roles:RoleEnum[],type:TokenEnum = TokenEnum.access) {
  return applyDecorators(
        Token(type),
        Roles(roles),
        UseGuards(AuthenticationGuard,AuthorizationGuard)
  );
}
