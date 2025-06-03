import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * retrieve the Jwt Payload with a decorator
 * example of a controller method:
 * @Post()
 * someMethod(@JwtPayload() payload: JwtAccessTokenPayloadType) {
 *   // do something with the payload
 * }
 */
export const Auth = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

/**
 * retrieve the Jwt Refresh Payload with a decorator
 * example of a controller method:
 * @Post()
 * someMethod(@JwtRefreshPayload() payload: JwtRefreshTokenPayloadType) {
 *   // do something with the payload
 * }
 */
export const Refresh = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

/**
 * retrieve the Jwt Refresh Payload with a decorator
 * example of a controller method:
 * @Post()
 * someMethod(@JwtRefreshPayload() payload: JwtRefreshTokenPayloadType) {
 *   // do something with the payload
 * }
 */
export const Oauth2User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
