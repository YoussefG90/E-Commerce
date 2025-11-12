import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { type RedisClientType } from 'redis';
import { Inject } from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { TTLNAME } from './decorators';

@Injectable()
export class RedisCacheInterceptor implements NestInterceptor {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: RedisClientType , private readonly reflector:Reflector) {}
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const expire = this.reflector.getAllAndOverride<number>(TTLNAME,[context.getClass(),context.getHandler()]) ?? 10
    const request = context.switchToHttp().getRequest();
    const key = `cache:${request.url}`;
    const cached = await this.redis.get(key);
    if (cached) {
      console.log(`✅ Cache hit for ${key}`);
      return of(JSON.parse(cached));
    }
    return next.handle().pipe(
      tap(async (data) => {
        await this.redis.set(key, JSON.stringify(data), { EX: expire });
        console.log(`💾 Cache set for ${key}`);
      }),
    );
  }
}