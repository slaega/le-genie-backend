import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import * as Bull from 'bullmq';
import { HeaderResolver, I18nModule } from 'nestjs-i18n';
import * as path from 'path';
import appConfig, { Environment } from '#config/app/app.config';
import { AllConfigType } from '#config/config.type';
// import { ThrottlerBehindProxyGuard } from '#shared/guards/throttler-behind-proxy.guard';
import { PrismaModule } from './common/prisma/prisma.module';
import authConfig from '#config/auth/auth.config';
import { MailModule } from './common/mail/mail.module';
import { LoggerModule } from './common/logger/logger.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [
                appConfig,
                authConfig,
            ],
            envFilePath: ['.env'],
        }),
        I18nModule.forRootAsync({
            useFactory: (configService: ConfigService<AllConfigType>) => ({
                fallbackLanguage: configService.getOrThrow(
                    'app.fallbackLanguage',
                    { infer: true }
                ),
                loaderOptions: {
                    path: path.join(__dirname, '/i18n/'),
                    watch: true,
                },
            }),
            resolvers: [
                {
                    use: HeaderResolver,
                    useFactory: (
                        configService: ConfigService<AllConfigType>
                    ) => {
                        const headerLanguage = configService.get(
                            'app.headerLanguage',
                            { infer: true }
                        );
                        return [headerLanguage];
                    },
                    inject: [ConfigService],
                },
            ],
            imports: [ConfigModule],
            inject: [ConfigService],
        }),
        // ThrottlerModule.forRootAsync({
        //     // eslint-disable-next-line @typescript-eslint/require-await
        //     useFactory: async (
        //         configService: ConfigType<typeof appConfig>
        //     ): Promise<ThrottlerModuleOptions> => ({
        //         throttlers: [
        //             {
        //                 ttl: configService.throttlerTtl,
        //                 limit: configService.throttlerLimit,
        //             },
        //         ],
        //     }),
        //     inject: [ConfigService],
        // }),
        MailModule,
        LoggerModule,
        PrismaModule,
        // NestjsFormDataModule.config({ isGlobal: true }),
        BullModule.forRootAsync({
            useFactory: async (
                configService: ConfigType<typeof appConfig>
            ): Promise<Bull.QueueOptions> => ({
                connection: {
                    host: configService.redis.host,
                    port: configService.redis.port,
                    username: configService.redis.username,
                    password: configService.redis.password,
                },
            }),
            inject: [ConfigService],
        }),
    ],
    providers: [
      
        // {
        //     provide: APP_GUARD,
        //     useClass: ThrottlerBehindProxyGuard,
        // },
    ],
})
export class AppModule  {
}
