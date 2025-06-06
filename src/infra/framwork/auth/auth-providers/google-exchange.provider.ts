import { AllConfigType } from '#config/config.type';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { ExchangeProvider } from './exchange.provider';
interface GoogleExchangeResponse {
    access_token: string;
    scope: string;
    token_type: string;
    id_token: string;
}

export interface GoogleUser {
    iss: string;
    sub: string;
    email: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
    aud: string;
    exp: number;
    iat: number;
}

export class GoogleExchangeProvider implements ExchangeProvider<GoogleUser> {
    constructor(private readonly configService: ConfigService<AllConfigType>) { }

    decodeUser(accessToken: string) {
        const payload = jwt.decode(accessToken);
        if (!payload || typeof payload === 'string') {
            throw new UnauthorizedException({
                error: 'Invalid id_token payload',
            });
        }

        return payload as GoogleUser;
    }
    async exchangeCode(code: string, redirectUri: string): Promise<GoogleUser> {
        const accessToken = await this.getToken(code, redirectUri);
        return this.decodeUser(accessToken);
    }

    async getToken(code: string, redirectUri: string): Promise<string> {
        const clientId = this.configService.getOrThrow('auth.google.clientID', {
            infer: true,
        });
        const clientSecret = this.configService.getOrThrow(
            'auth.google.clientSecret',
            {
                infer: true,
            }
        );

        const tokenUrl = 'https://oauth2.googleapis.com/token';

        const params = new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
        });

        const res = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });

        if (!res.ok)
            throw new UnauthorizedException({
                error: 'Failed to exchange Google code',
            });
        const data = (await res.json()) as GoogleExchangeResponse;
        return data.id_token;
    }
}
