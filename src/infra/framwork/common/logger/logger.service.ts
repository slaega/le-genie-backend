import { ConsoleLogger, Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class LoggerService extends ConsoleLogger {
    readonly contextName: string;

    constructor(readonly logger: PinoLogger) {
        super();
        this.contextName = 'LoggerService';
    }

    setContext(name: string) {
        this.logger.setContext(name);
    }

    trace(message: any, context?: string, ...args: any[]) {
        if (context) {
            this.logger.trace(
                { [this.contextName]: context },
                message,
                ...args
            );
        } else {
            this.logger.trace(message, ...args);
        }
    }

    debug(message: any, context?: string, ...args: any[]) {
        if (context) {
            this.logger.debug(
                { [this.contextName]: context },
                message,
                ...args
            );
        } else {
            this.logger.debug(message, ...args);
        }
    }

    info(message: any, context?: string, ...args: any[]) {
        if (context) {
            this.logger.info({ [this.contextName]: context }, message, ...args);
        } else {
            this.logger.info(message, ...args);
        }
    }

    warn(message: any, context?: string, ...args: any[]) {
        if (context) {
            this.logger.warn({ [this.contextName]: context }, message, ...args);
        } else {
            this.logger.warn(message, ...args);
        }
    }

    error(message: any, trace?: string, context?: string, ...args: any[]) {
        if (context) {
            this.logger.error(
                {
                    [this.contextName]: context,
                    trace: trace ?? new Error().stack,
                },
                message,
                ...args
            );
        } else if (trace) {
            this.logger.error({ trace }, message, ...args);
        } else {
            this.logger.error(
                {
                    [this.contextName]: LoggerService.name,
                    trace: trace ?? new Error().stack,
                },
                message,
                ...args
            );
        }
    }
}
