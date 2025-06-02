import { Global, Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { stdTimeFunctions } from 'pino';
import * as uuid from 'uuid';

import * as requestIp from 'request-ip';
import { Environment } from '#config/app/app.config';
import { LoggerService } from './logger.service';
declare module 'http' {
    interface IncomingMessage {
        requestId: string;
    }
}

@Global()
@Module({
    imports: [
        PinoLoggerModule.forRoot({
            pinoHttp: {
                name: 'Focus User Service Logger',
                level:
                    process.env.NODE_ENV !== Environment.Production
                        ? 'debug'
                        : 'info',
                genReqId: (req) => req.requestId || uuid.v4(),
                formatters: { bindings: () => ({}) },
                timestamp: stdTimeFunctions.unixTime,
                transport:
                    process.env.NODE_ENV !== Environment.Production
                        ? { target: 'pino-pretty' }
                        : undefined,
                serializers: {
                    req: (req) => ({
                        id: req.id,
                        method: req.method,
                        path: req.url.split('?')[0],
                        headers: {
                            host: req.headers.host,
                            'user-agent': req.headers['user-agent'],
                            referer: req.headers.referer,
                            ip: requestIp.getClientIp(req),
                        },
                    }),
                    res: (res) => ({
                        statusCode: res.statusCode,
                        headers: {
                            'x-ratelimit-limit':
                                res.headers['x-ratelimit-limit'],
                            'x-ratelimit-remaining':
                                res.headers['x-ratelimit-remaining'],
                            'x-ratelimit-reset':
                                res.headers['x-ratelimit-reset'],
                        },
                    }),
                },
            },
            exclude:['/healthcheck']
        }),
    ],
    providers: [LoggerService],
    exports: [LoggerService],
})
export class LoggerModule {}
