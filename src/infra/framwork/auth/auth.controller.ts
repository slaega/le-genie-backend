import {
    Body,
    Controller,
    Get,
    Inject,
    Patch,
    Post,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { OAuthCallbackGuard } from './guards/oauth-callback.guard';
import { SocialProvider } from '#domain/entities/auth-provider.entity';
import { AuthenticateWithProviderCommand } from '#applications/commands/auth/authenticate-with-provider.command';

import { RefreshTokenCommand } from '#applications/commands/auth/refresh-token.command';
import { Auth, Oauth2User, Refresh } from './auth.decorator';
import { AuthUser, RefreshUser } from './auth.type';
import { ExchangeType } from './auth-providers/exchange-type';
import { AuthResponseDto } from '#dto/auth/auth-response.dto';
import { CreateTokenDto } from '#dto/auth/create-token.dto';
import { JwtAuthGuard, JwtRefreshGuard } from './guards/auth.guard';
import { QueryBus } from '@nestjs/cqrs';
import { GetMeQuery } from '#applications/query/auth/get-me.query';
import { UserResponseDto } from '#dto/auth/user-response.dto';
import { UserMapper } from '#domain/mappers/user/user.mapper';
import { PrismaService } from '../common/prisma/prisma.service';
import { UpdateMeDto } from '#dto/auth/update-me.dto';
import { UpdateAvatarDto } from '#dto/auth/update-avatar.dto';
import { StorageProvider } from '#domain/services/storage.provider';
import { STORAGE_PROVIDER } from '#shared/constantes/inject-token';
import { FormDataRequest } from 'nestjs-form-data';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        private readonly prisma: PrismaService,
        @Inject(STORAGE_PROVIDER)
        private readonly storage: StorageProvider
    ) {}

    @Post('token')
    @UseGuards(OAuthCallbackGuard)
    @Throttle({ default: { limit: 10, ttl: 60000 } })
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
            displayName = user.name ?? '';
            avatarUrl = user.picture ?? '';
        } else if (provider === SocialProvider.GITHUB) {
            providerUserId = String(user.id);
            email = user.email ?? undefined;
            displayName = user.name ?? user.login ?? '';
            avatarUrl = user.avatar_url ?? '';
        } else if (provider === SocialProvider.MICROSOFT) {
            // Microsoft uses `oid` as the stable unique identifier
            providerUserId = (user as any).oid ?? user.sub;
            email = user.email ?? user.preferred_username;
            displayName = user.name ?? '';
            avatarUrl = ''; // Microsoft profile photos require a separate Graph API call
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

    @UseGuards(JwtRefreshGuard)
    @Post('refresh-token')
    @Throttle({ default: { limit: 20, ttl: 60000 } })
    async refreshToken(@Refresh() user: RefreshUser): Promise<AuthResponseDto> {
        const authResponse = await this.commandBus.execute(
            new RefreshTokenCommand(user.sub, user.token)
        );
        return authResponse;
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async me(@Auth() user: AuthUser): Promise<UserResponseDto> {
        const authResponse = await this.queryBus.execute(
            new GetMeQuery(user.sub)
        );
        return UserMapper.toDto(authResponse);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('me')
    async updateMe(
        @Auth() user: AuthUser,
        @Body() dto: UpdateMeDto
    ): Promise<UserResponseDto> {
        const updatedUser = await this.prisma.user.update({
            where: { id: user.sub },
            data: {
                ...(dto.name !== undefined && { name: dto.name }),
                ...(dto.professionalRole !== undefined && { professionalRole: dto.professionalRole }),
                ...(dto.bio !== undefined && { bio: dto.bio || null }),
                ...(dto.about !== undefined && { about: dto.about || null }),
                ...(dto.website !== undefined && { website: dto.website || null }),
                ...(dto.twitterHandle !== undefined && { twitterHandle: dto.twitterHandle || null }),
                ...(dto.githubHandle !== undefined && { githubHandle: dto.githubHandle || null }),
                ...(dto.location !== undefined && { location: dto.location || null }),
            },
        });
        return UserMapper.toDto(updatedUser);
    }

    /** PATCH /auth/me/cover — upload de la photo de couverture */
    @UseGuards(JwtAuthGuard)
    @Patch('me/cover')
    @FormDataRequest()
    async updateCover(
        @Auth() user: AuthUser,
        @Body() dto: UpdateAvatarDto
    ): Promise<UserResponseDto> {
        const ext = dto.avatarFile.originalName.split('.').pop() ?? 'jpg';
        const path = `covers/${user.sub}.${ext}`;

        const storagePath = await this.storage.upload({
            path,
            file: dto.avatarFile.buffer,
            contentType: dto.avatarFile.mimetype,
        });

        const coverUrl = await this.storage.getPublicUrl(storagePath);

        const updatedUser = await this.prisma.user.update({
            where: { id: user.sub },
            data: { coverPath: coverUrl },
        });

        return UserMapper.toDto(updatedUser);
    }

    /** PATCH /auth/me/avatar — upload d'une nouvelle photo de profil */
    @UseGuards(JwtAuthGuard)
    @Patch('me/avatar')
    @FormDataRequest()
    async updateAvatar(
        @Auth() user: AuthUser,
        @Body() dto: UpdateAvatarDto
    ): Promise<UserResponseDto> {
        const ext = dto.avatarFile.originalName.split('.').pop() ?? 'jpg';
        const path = `avatars/${user.sub}.${ext}`;

        const storagePath = await this.storage.upload({
            path,
            file: dto.avatarFile.buffer,
            contentType: dto.avatarFile.mimetype,
        });

        const avatarUrl = await this.storage.getPublicUrl(storagePath);

        const updatedUser = await this.prisma.user.update({
            where: { id: user.sub },
            data: { avatarPath: avatarUrl },
        });

        return UserMapper.toDto(updatedUser);
    }
}
