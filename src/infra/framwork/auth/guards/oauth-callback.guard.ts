/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import {
    ExchangeProvider,
    ExchangeProviderRegistry,
} from '../auth-providers/exchange.provider';
import { ExchangeType } from '../auth-providers/exchange-type';
import { CreateTokenDto } from '#dto/auth/create-token.dto';

@Injectable()
export class OAuthCallbackGuard implements CanActivate {
    constructor(
        @Inject(ExchangeProviderRegistry)
        private readonly exchangeProviderRegistry: ExchangeProviderRegistry
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { code, provider, callbackURL } = request.body as CreateTokenDto;
        if (!code || !provider || !callbackURL) {
            throw new UnauthorizedException({
                error: 'Missing code or provider or callbackURL',
            });
        }

        let exchangeProvider: ExchangeProvider<ExchangeType['user']>;
        try {
            exchangeProvider = this.exchangeProviderRegistry.get(
                provider as ExchangeType['provider']
            );
        } catch {
            throw new UnauthorizedException({
                error: `Unknown provider: ${provider}`,
            });
        }

        try {
            const user = await exchangeProvider.exchangeCode(code, callbackURL);
            console.log(user);
            // Attach user to request for downstream use
            request.oauth = {
                user,
                provider,
            };
            return true;
        } catch (err) {
            console.log('######', err);
            let message = 'Failed to exchange code';
            if (err instanceof Error) {
                message += ': ' + err.message;
            }
            throw new UnauthorizedException({ error: message });
        }
    }
}
