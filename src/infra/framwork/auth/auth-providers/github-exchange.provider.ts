import { AllConfigType } from '#config/config.type';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExchangeProvider } from './exchange.provider';
interface GithubExchangeResponse {
    access_token: string;
    scope: string;
    token_type: string;
}
export interface GithubUser {
    id: number;
    login: string;
    email: string | null;
    name: string | null;
    avatar_url: string;
    [key: string]: any;
}
interface GithubEmail {
    email: string;
    primary: boolean;
    verified: boolean;
}
export class GithubExchangeProvider implements ExchangeProvider<GithubUser> {
    constructor(private readonly configService: ConfigService<AllConfigType>) { }
    async getUser(accessToken: string) {
        console.log('accessToken +++', accessToken);
        const response = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });
        console.log('response.ok', response.ok);
        if (!response.ok) {
            throw new UnauthorizedException({
                error: `GitHub API error: ${response.status} ${response.statusText}`,
            });
        }

        const user: GithubUser = (await response.json()) as GithubUser;

        if (!user.email) {
            const emailsResponse = await fetch(
                'https://api.github.com/user/emails',
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        Accept: 'application/vnd.github.v3+json',
                    },
                }
            );
            if (!emailsResponse.ok) {
                throw new UnauthorizedException({
                    error: `GitHub API error: ${emailsResponse.status} ${emailsResponse.statusText}`,
                });
            }

            const emails = (await emailsResponse.json()) as GithubEmail[];
            const primaryEmail = emails.find(
                (e) => e.primary === true && e.verified === true
            );
            if (primaryEmail) {
                user.email = primaryEmail.email;
            }
        }

        return user;
    }
    async exchangeCode(code: string, redirectUri: string): Promise<GithubUser> {
        const accessToken = await this.getToken(code, redirectUri);
        return await this.getUser(accessToken);
    }

    async getToken(code: string, redirectUri: string): Promise<string> {
        const clientId = this.configService.getOrThrow('auth.github.clientID', {
            infer: true,
        });
        const clientSecret = this.configService.getOrThrow(
            'auth.github.clientSecret',
            {
                infer: true,
            }
        );

        const tokenUrl = 'https://github.com/login/oauth/access_token';
        console.log('######', code, redirectUri, clientId, clientSecret);
        // const params = new URLSearchParams({
        //     client_id: clientId,
        //     client_secret: clientSecret,
        //     code,
        //     redirect_uri: redirectUri,
        // });

        const res = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code,
                redirect_uri: redirectUri,
            }),
        });

        if (!res.ok) {
            console.log('######', res);
            throw new UnauthorizedException({
                error: 'Failed to exchange GitHub code',
            });
        }

        const data = (await res.json()) as GithubExchangeResponse;
        return data.access_token;
    }
}
