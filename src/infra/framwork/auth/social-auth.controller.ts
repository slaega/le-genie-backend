import {
    Controller,
    Get,
    Inject,
    NotFoundException,
    Param,
    Query,
    Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { AllConfigType } from '#config/config.type';
import { AuthenticateWithProviderCommand } from '#applications/commands/auth/authenticate-with-provider.command';
import { AuthResponseDto } from '#dto/auth/auth-response.dto';
import { SocialProvider } from '#domain/entities/auth-provider.entity';
import { ExchangeProviderRegistry } from './auth-providers/exchange.provider';
import { ExchangeType } from './auth-providers/exchange-type';
import { GithubUser } from './auth-providers/github-exchange.provider';
import { GoogleUser } from './auth-providers/google-exchange.provider';
import { MicrosoftUser } from './auth-providers/microsoft-exchange.provider';

// Maps URL slug (lowercase) → internal provider key
const SLUG_TO_PROVIDER = {
    github: SocialProvider.GITHUB,
    google: SocialProvider.GOOGLE,
    microsoft: SocialProvider.MICROSOFT,
} as const;

type ProviderSlug = keyof typeof SLUG_TO_PROVIDER;

/**
 * Handles the browser-redirect OAuth flow.
 *
 *   GET /auth/{github|google|microsoft}          → 302 to provider
 *   GET /auth/{github|google|microsoft}/callback  → exchange code,
 *                                                   set httpOnly cookies,
 *                                                   302 to frontend /
 *
 * The browser only ever sees Next.js (port 3000). NestJS (port 3030)
 * is hidden behind the /api/* proxy rewrite in next.config.ts.
 */
@Controller('auth')
export class SocialAuthController {
    private readonly frontendDomain: string;

    constructor(
        private readonly commandBus: CommandBus,
        private readonly configService: ConfigService<AllConfigType>,
        @Inject(ExchangeProviderRegistry)
        private readonly registry: ExchangeProviderRegistry
    ) {
        this.frontendDomain =
            configService.get('app.frontendDomain', { infer: true }) ??
            'http://localhost:3000';
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    private callbackURL(slug: ProviderSlug): string {
        return `${this.frontendDomain}/api/auth/${slug}/callback`;
    }

    private extractUser(
        oauthUser: ExchangeType['user'],
        providerKey: ExchangeType['provider']
    ): {
        providerUserId: string;
        email: string | undefined;
        displayName: string;
        avatarUrl: string;
    } {
        if (providerKey === SocialProvider.GOOGLE) {
            const u = oauthUser as GoogleUser;
            return {
                providerUserId: u.sub,
                email: u.email,
                displayName: u.name ?? '',
                avatarUrl: u.picture ?? '',
            };
        }

        if (providerKey === SocialProvider.GITHUB) {
            const u = oauthUser as GithubUser;
            return {
                providerUserId: String(u.id),
                email: u.email ?? undefined,
                displayName: u.name ?? u.login ?? '',
                avatarUrl: u.avatar_url ?? '',
            };
        }

        // Microsoft
        const u = oauthUser as MicrosoftUser;
        return {
            providerUserId: (u.oid as string) ?? u.sub,
            email: u.email ?? u.preferred_username,
            displayName: u.name ?? '',
            avatarUrl: '',
        };
    }

    // ─── Routes ────────────────────────────────────────────────────────────────

    /** Step 1 — redirect browser to the OAuth provider */
    @Get(':provider')
    initiate(@Param('provider') slug: string, @Res() res: Response): void {
        const providerKey = SLUG_TO_PROVIDER[slug as ProviderSlug];
        if (!providerKey)
            throw new NotFoundException(`Unknown provider: ${slug}`);

        const url = this.registry
            .get(providerKey)
            .getAuthorizationUrl(this.callbackURL(slug as ProviderSlug));
        res.redirect(url);
    }

    /** Step 2 — provider redirects back with ?code=…, exchange + set cookies */
    @Get(':provider/callback')
    async callback(
        @Param('provider') slug: string,
        @Query('code') code: string,
        @Query('error') error: string,
        @Res() res: Response
    ): Promise<void> {
        const signInUrl = `${this.frontendDomain}/auth/sign-in`;

        if (error || !code) {
            res.redirect(`${signInUrl}?error=oauth_cancelled`);
            return;
        }

        const providerKey = SLUG_TO_PROVIDER[slug as ProviderSlug];
        if (!providerKey) {
            res.redirect(`${signInUrl}?error=oauth_failed`);
            return;
        }

        try {
            const oauthUser = await this.registry
                .get(providerKey)
                .exchangeCode(code, this.callbackURL(slug as ProviderSlug));

            const { providerUserId, email, displayName, avatarUrl } =
                this.extractUser(oauthUser, providerKey);

            const auth = await this.commandBus.execute<
                AuthenticateWithProviderCommand,
                AuthResponseDto
            >(
                new AuthenticateWithProviderCommand(
                    providerKey,
                    providerUserId,
                    email,
                    displayName,
                    avatarUrl
                )
            );

            const secure =
                this.configService.get('app.nodeEnv', { infer: true }) ===
                'production';

            res.cookie('access_token', auth.accessToken, {
                httpOnly: true,
                secure,
                sameSite: 'lax',
                path: '/',
                maxAge: 15 * 60 * 1000, // 15 min in ms
            });
            res.cookie('refresh_token', auth.refreshToken, {
                httpOnly: true,
                secure,
                sameSite: 'lax',
                path: '/',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
            });
            res.redirect(this.frontendDomain);
        } catch {
            res.redirect(`${signInUrl}?error=oauth_failed`);
        }
    }
}
