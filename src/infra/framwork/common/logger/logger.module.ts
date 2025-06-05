import { Global, Module, RequestMethod } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { stdTimeFunctions } from 'pino';
import * as uuid from 'uuid';

import * as requestIp from 'request-ip';
import { Environment } from '#config/app/app.config';
import { LoggerService } from './logger.service';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '#config/app/app-config.type';
import { Request, Response } from 'express';
declare module 'http' {
    interface IncomingMessage {
        requestId: string;
    }
}

@Global()
@Module({
    imports: [
        PinoLoggerModule.forRootAsync({
            useFactory: (config: ConfigService<AppConfig>) => ({
                pinoHttp: {
                    name: 'Legenie Logger',
                    level:
                        config.get('nodeEnv', { infer: true }) !==
                        Environment.Production
                            ? 'debug'
                            : 'info',
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
                    genReqId: (req) => req.requestId || uuid.v4(),
                    formatters: { bindings: () => ({}) },
                    timestamp: stdTimeFunctions.unixTime,
                    transport:
                        config.get('nodeEnv', { infer: true }) !==
                        Environment.Production
                            ? { target: 'pino-pretty' }
                            : undefined,
                    serializers: {
                        req: (req: Request & { requestId: string }) => ({
                            id: req.id,
                            method: req.method,
                            path: req.url.split('?')[0],
                            headers: {
                                host: req.headers.host,
                                'user-agent': req.headers['user-agent'],
                                referer: req.headers.referer,
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
                                ip: requestIp.getClientIp(req),
                            },
                        }),
                        res: (res: Response & { [key: string]: any }) => ({
                            statusCode: res.statusCode,
                            headers: {
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                                'x-ratelimit-limit':
                                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                                    res.headers['x-ratelimit-limit'],
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                                'x-ratelimit-remaining':
                                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                                    res.headers['x-ratelimit-remaining'],
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                                'x-ratelimit-reset':
                                    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                                    res.headers['x-ratelimit-reset'],
                            },
                        }),
                    },
                },
                exclude: [{ path: 'healthcheck', method: RequestMethod.ALL }],
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [LoggerService],
    exports: [LoggerService],
})
export class LoggerModule {}
