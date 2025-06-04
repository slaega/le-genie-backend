import { AuthenticateWithProviderCommand } from '#applications/commands/auth/authenticate-with-provider.command';
import { AuthProviderRepository } from '#domain/repository/auth-provider.repository';
import { UserRepository } from '#domain/repository/user.repository';
import { TokenService } from '#infra/dependencies/token.service';
import {
    AUTH_PROVIDER_REPOSITORY,
    REFRESH_TOKEN_REPOSITORY,
    USER_REPOSITORY,
} from '#shared/constantes/inject-token';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { User } from '#domain/entities/user.entity';
import { AuthProvider } from '#domain/entities/auth-provider.entity';
import { nanoid } from 'nanoid';
import { RefreshTokenRepository } from '#domain/repository/refresh-token.repository';
import { RefreshToken } from '#domain/entities/refresh-token.entity';
import { AuthResponseDto } from '#dto/auth/auth-response.dto';

export class AuthenticationResult {
    constructor(
        public readonly accessToken: string,
        public readonly refreshToken?: string
    ) {}
}

@CommandHandler(AuthenticateWithProviderCommand)
export class AuthenticateWithProviderHandler
    implements ICommandHandler<AuthenticateWithProviderCommand>
{
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: UserRepository,
        @Inject(AUTH_PROVIDER_REPOSITORY)
        private readonly authProviderRepository: AuthProviderRepository,
        @Inject(REFRESH_TOKEN_REPOSITORY)
        private readonly refreshTokenRepository: RefreshTokenRepository,
        private readonly tokenService: TokenService
    ) {}

    async execute(
        command: AuthenticateWithProviderCommand
    ): Promise<AuthResponseDto> {
        let user = await this.userRepository.getUserByEmail(command.email);
        if (!user) {
            const newUser = new User();
            newUser.email = command.email;
            newUser.name = command.name;
            newUser.avatarPath = command.avatarUrl;
            const created = await this.userRepository.createUser(newUser);
            user = created;
        }
        if (
            user.authProviders?.some(
                (authProvider) => authProvider.provider === command.provider
            )
        ) {
            const authProvider = new AuthProvider();
            authProvider.userId = user.id;
            authProvider.provider = command.provider;
            authProvider.providerUserId = command.providerUserId;
            await this.authProviderRepository.linkAuthProviderToUser(
                authProvider
            );
        }
        const { accessToken, refreshToken } = this.tokenService.generateTokens(
            user.id,
            user.email,
            nanoid(50)
        );
        const newRefresh = new RefreshToken();
        newRefresh.userId = user.id;
        newRefresh.token = refreshToken;
        await this.refreshTokenRepository.createRefreshToken(newRefresh);

        const authResponse = new AuthResponseDto();
        authResponse.accessToken = accessToken;
        authResponse.refreshToken = refreshToken;
        return authResponse;
    }
}
