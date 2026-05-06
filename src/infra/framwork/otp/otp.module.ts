import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';
import { PrismaModule } from '../common/prisma/prisma.module';
import { PrismaService } from '../common/prisma/prisma.service';
import { MailerModule } from '../mailer/mailer.module';
import { TokenService } from '#infra/dependencies/token.service';
import { REFRESH_TOKEN_REPOSITORY } from '#shared/constantes/inject-token';
import { RefreshTokenPrismaRepository } from '#infra/persistences/prisma/refresh.repository';

@Module({
    imports: [
        PrismaModule,
        MailerModule,
        ConfigModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get('auth.accessTokenJwtSecret'),
                signOptions: {
                    expiresIn:
                        config.get('auth.accessTokenJwtExpiresIn') ?? '15m',
                },
            }),
        }),
    ],
    controllers: [OtpController],
    providers: [
        OtpService,
        TokenService,
        {
            provide: REFRESH_TOKEN_REPOSITORY,
            inject: [PrismaService],
            useFactory: (prisma: PrismaService) =>
                new RefreshTokenPrismaRepository(prisma),
        },
    ],
})
export class OtpModule {}
