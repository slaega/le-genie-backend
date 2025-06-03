// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { TokenService } from '../../dependencies/token.service';

// Passport strategies (register them as providers);
import { AuthenticateWithProviderHandler } from '#applications/handlers/auth/authenticate-with-provider.handler';
import {
    AUTH_PROVIDER_REPOSITORY,
    REFRESH_TOKEN_REPOSITORY,
    USER_REPOSITORY,
} from '#shared/constantes/inject-token';
import { UserPrismaRepository } from '#infra/percistences/prisma/user.repository';
import { PrismaService } from '../common/prisma/prisma.service';
import { AuthProviderPrismaRepository } from '#infra/percistences/prisma/auth-provider.repository';
import { JwtStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { RefreshTokenPrismaRepository } from '#infra/percistences/prisma/refresh.repository';
@Module({
    imports: [
        CqrsModule,
        PassportModule.register({ session: false }),
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '1h' },
        }),
    ],
    controllers: [AuthController],
    providers: [
        // Command handler
        AuthenticateWithProviderHandler,
        // Services
        TokenService,
        // Repository & Prisma
        {
            provide: USER_REPOSITORY,
            inject: [PrismaService],
            useFactory: (prisma: PrismaService) =>
                new UserPrismaRepository(prisma),
        },
        {
            provide: AUTH_PROVIDER_REPOSITORY,
            inject: [PrismaService],
            useFactory: (prisma: PrismaService) =>
                new AuthProviderPrismaRepository(prisma),
        },
        {
            provide: REFRESH_TOKEN_REPOSITORY,
            inject: [PrismaService],
            useFactory: (prisma: PrismaService) =>
                new RefreshTokenPrismaRepository(prisma),
        },
        AuthenticateWithProviderHandler,
        PrismaService,
        JwtStrategy,
        JwtRefreshStrategy,
    ],
    exports: [USER_REPOSITORY, AUTH_PROVIDER_REPOSITORY],
})
export class AuthModule {}
