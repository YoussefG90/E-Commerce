
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const User = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    let req:any 
       switch (context.getType<string>()) {
      case "http":
          req = context.switchToHttp().getRequest()
        break;
      // case "rpc":
      //     const rpcCtx = context.switchToRpc()

      //   break;
      case "ws":
          req = context.switchToWs().getClient().credentials.user
        break;
      case "graphql":
          req = GqlExecutionContext.create(context).getContext().req.credentials.user
      default:
        break;
    }
    return req.credentials.user
  },
);
