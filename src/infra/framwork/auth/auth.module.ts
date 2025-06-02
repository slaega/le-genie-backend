// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { TokenService } from '../../dependencies/token.service';

// Passport strategies (register them as providers)
import { GithubStrategy } from './strategies/github.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { AuthenticateWithProviderHandler } from '#applications/handlers/auth/authenticate-with-provider.handler';
import {
  AUTH_PROVIDER_REPOSITORY,
  USER_REPOSITORY,
} from '#shared/constantes/inject-token';
import { UserPrismaRepository } from '#infra/percistences/prisma/user.repository';
import { PrismaService } from '../common/prisma/prisma.service';
import { AuthProviderPrismaRepository } from '#infra/percistences/prisma/auth-provider.repository';
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
      useFactory: (prisma: PrismaService) => new UserPrismaRepository(prisma),
    },
    {
      provide: AUTH_PROVIDER_REPOSITORY,
      inject: [PrismaService],
      useFactory: (prisma: PrismaService) =>
        new AuthProviderPrismaRepository(prisma),
    },
    PrismaService,
    GithubStrategy,
    GoogleStrategy,
  ],
})
export class AuthModule {}
