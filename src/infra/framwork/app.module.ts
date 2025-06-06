import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService, ConfigType } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { HeaderResolver, I18nModule } from 'nestjs-i18n';
import * as path from 'path';
import appConfig from '#config/app/app.config';
import { AllConfigType } from '#config/config.type';
import { PrismaModule } from './common/prisma/prisma.module';
import authConfig from '#config/auth/auth.config';
import { LoggerModule } from './common/logger/logger.module';
import { ThrottlerBehindProxyGuard } from '#shared/utils/guards/throttler-behind-proxy.guard';
import storageConfig from '#config/storage/storage.config';
import { AuthModule } from './auth/auth.module';
import { CommentModule } from './comment/comment.module';
import { PostModule } from './post/post.module';
import { ContributorModule } from './contributor/contributor.module';
import { InvitationModule } from './invitation/invitation.module';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { PostImageModule } from './post-image/post-images.module';
@Module({
    imports: [
        AuthModule,
        CommentModule,
        PostModule,
        ContributorModule,
        PostImageModule,
        InvitationModule,

        ConfigModule.forRoot({
            isGlobal: true,
            load: [appConfig, authConfig, storageConfig],
            envFilePath: ['.env'],
        }),
        I18nModule.forRootAsync({
            useFactory: (configService: ConfigService<AllConfigType>) => ({
                fallbackLanguage: configService.getOrThrow(
                    'app.fallbackLanguage',
                    {
                        infer: true,
                    }
                ),
                loaderOptions: {
                    path: path.join(process.cwd(), 'assets', 'i18n'),
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
                            {
                                infer: true,
                            }
                        );
                        return [headerLanguage];
                    },
                    inject: [ConfigService],
                },
            ],
            imports: [ConfigModule],
            inject: [ConfigService],
        }),
        ThrottlerModule.forRootAsync({
            useFactory: async (
                configService: ConfigType<typeof appConfig>
            ): Promise<ThrottlerModuleOptions> =>
                Promise.resolve({
                    throttlers: [
                        {
                            ttl: Number(configService.throttlerTtl),
                            limit: Number(configService.throttlerLimit),
                        },
                    ],
                }),
            inject: [ConfigService],
        }),
        LoggerModule,
        PrismaModule,
        NestjsFormDataModule.config({ isGlobal: true }),
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerBehindProxyGuard,
        },
    ],
})
export class AppModule {}
