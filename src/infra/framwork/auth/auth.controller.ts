import {
    Body,
    Controller,
    Post,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { OAuthCallbackGuard } from './guards/oauth-callback.guard';
import { SocialProvider } from '#domain/entities/auth-provider.entity';
import { AuthenticateWithProviderCommand } from '#applications/commands/auth/authenticate-with-provider.command';

import { RefreshTokenCommand } from '#applications/commands/auth/refresh-token.command';
import { Oauth2User, Refresh } from './auth.decorator';
import { RefreshUser } from './auth.type';
import { ExchangeType } from './auth-providers/exchange-type';
import { AuthResponseDto } from '#dto/auth/auth-response.dto';
import { CreateTokenDto } from '#dto/auth/create-token.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly commandBus: CommandBus) {}

    @Post('token')
    @UseGuards(OAuthCallbackGuard)
    async oauthCallback(
        @Oauth2User() oauthUser: ExchangeType,
        @Body() _body: CreateTokenDto
    ): Promise<AuthResponseDto> {
        const { provider, user } = oauthUser;

        let providerUserId: string;
        let email: string | undefined;
        let displayName = '';
        let avatarUrl = '';

        if (provider === SocialProvider.GOOGLE) {
            providerUserId = user.sub;
            email = user.email;
            displayName = user.name;
            avatarUrl = user.picture;
        } else if (provider === SocialProvider.GITHUB) {
            providerUserId = String(user.id);
            email = user.email;
            displayName = user.name;
            avatarUrl = user.avatar_url;
        } else {
            throw new UnauthorizedException({
                message: 'Unsupported provider',
            });
        }
        const authResponse = await this.commandBus.execute(
            new AuthenticateWithProviderCommand(
                provider,
                providerUserId,
                email,
                displayName,
                avatarUrl
            )
        );

        return authResponse;
    }

    @Post('refresh-token')
    async refreshToken(@Refresh() user: RefreshUser): Promise<AuthResponseDto> {
        const authResponse = await this.commandBus.execute(
            new RefreshTokenCommand(user.userId, user.token)
        );
        return authResponse;
    }
}
