/**
 * retrieve the Jwt Payload with a decorator
 * example of a controller method:
 * @Post()
 * someMethod(@JwtPayload() payload: JwtAccessTokenPayloadType) {
 *   // do something with the payload
 * }
 */
export type AuthUser = {
    sub: string;
    email: string;
};

/**
 * retrieve the Jwt Refresh Payload with a decorator
 * example of a controller method:
 * @Post()
 * someMethod(@JwtRefreshPayload() payload: JwtRefreshTokenPayloadType) {
 *   // do something with the payload
 * }
 */
export type RefreshUser = {
    sub: string;
    token: string;
};
