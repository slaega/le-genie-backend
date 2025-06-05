import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { STORAGE_PROVIDER } from '#shared/constantes/inject-token';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from '../logger/logger.module';
import { LoggerService } from '../logger/logger.service';

@Module({
    imports: [ConfigModule, LoggerModule],
    providers: [
        {
            provide: STORAGE_PROVIDER,
            useFactory: (config: ConfigService, logger: LoggerService) =>
                new StorageService(config, logger),
            inject: [ConfigService, LoggerService],
        },
    ],
    exports: [STORAGE_PROVIDER],
})
export class StorageModule {}
