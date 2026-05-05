import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { AllConfigType } from '#config/config.type';
import { ExchangeProvider } from './exchange.provider';

interface MicrosoftTokenResponse {
    access_token: string;
    id_token: string;
    token_type: string;
    scope: string;
    expires_in: number;
}

export interface MicrosoftUser {
    /** Object ID — stable unique identifier across Microsoft accounts */
    oid: string;
    sub: string;
    email?: string;
    preferred_username?: string;
    name?: string;
    picture?: string;
    [key: string]: unknown;
}

export class MicrosoftExchangeProvider
    implements ExchangeProvider<MicrosoftUser>
{
    constructor(
        private readonly configService: ConfigService<AllConfigType>
    ) {}

    decodeUser(idToken: string): MicrosoftUser {
        const payload = jwt.decode(idToken);
        if (!payload || typeof payload === 'string') {
            throw new UnauthorizedException({
                error: 'Invalid Microsoft id_token payload',
            });
        }
        return payload as MicrosoftUser;
    }

    async exchangeCode(
        code: string,
        redirectUri: string
    ): Promise<MicrosoftUser> {
        const idToken = await this.getToken(code, redirectUri);
        return this.decodeUser(idToken);
    }

    async getToken(code: string, redirectUri: string): Promise<string> {
        const clientId = this.configService.getOrThrow(
            'auth.microsoft.clientID',
            { infer: true }
        );
        const clientSecret = this.configService.getOrThrow(
            'auth.microsoft.clientSecret',
            { infer: true }
        );

        const tokenUrl =
            'https://login.microsoftonline.com/common/oauth2/v2.0/token';

        const params = new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
            scope: 'openid email profile',
        });

        const res = await fetch(tokenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString(),
        });

        if (!res.ok) {
            const err = await res.text();
            throw new UnauthorizedException({
                error: `Failed to exchange Microsoft code: ${err}`,
            });
        }

        const data = (await res.json()) as MicrosoftTokenResponse;
        return data.id_token;
    }
}
