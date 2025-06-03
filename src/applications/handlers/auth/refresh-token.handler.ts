import { ICommandHandler } from '@nestjs/cqrs';
import { RefreshTokenCommand } from '#applications/commands/auth/refresh-token.command';
import { Inject } from '@nestjs/common';
import { RefreshTokenRepository } from '#domain/repository/refresh-token.repository';
import { REFRESH_TOKEN_REPOSITORY } from '#shared/constantes/inject-token';
import { USER_REPOSITORY } from '#shared/constantes/inject-token';
import { UserPrismaRepository } from '#infra/percistences/prisma/user.repository';
import { TokenService } from '#infra/dependencies/token.service';
import { nanoid } from 'nanoid';
import { AuthenticationResult } from './authenticate-with-provider.handler';
import { RefreshToken } from '#domain/entities/refresh-token.entity';

export class RefreshTokenHandler
    implements ICommandHandler<RefreshTokenCommand>
{
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserPrismaRepository,
        @Inject(REFRESH_TOKEN_REPOSITORY)
        private readonly refreshTokenRepository: RefreshTokenRepository,
        private readonly tokenService: TokenService
    ) {}

    public async execute(command: RefreshTokenCommand) {
        const user = await this.userRepository.getUserById(command.userId);
        if (!user) {
            throw new Error('User not found');
        }
        await this.refreshTokenRepository.removeRefreshToken(
            command.userId,
            command.token
        );
        const { accessToken, refreshToken } = this.tokenService.generateTokens(
            user.id,
            user.email,
            nanoid(50)
        );
        const newRefresh = new RefreshToken();
        newRefresh.userId = user.id;
        newRefresh.token = refreshToken;
        await this.refreshTokenRepository.createRefreshToken(newRefresh);
        return new AuthenticationResult(accessToken, refreshToken);
    }
}
