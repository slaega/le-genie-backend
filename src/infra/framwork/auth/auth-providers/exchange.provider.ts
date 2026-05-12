import { NotFoundException } from '@nestjs/common';
import { ExchangeType } from './exchange-type';

export interface ExchangeProvider<T> {
    /** Build the OAuth authorization URL to redirect the browser to. */
    getAuthorizationUrl(callbackURL: string): string;
    exchangeCode(code: string, redirectUri: string): Promise<T>;
}

export class ExchangeProviderRegistry {
    private providers: Map<
        ExchangeType['provider'],
        ExchangeProvider<ExchangeType['user']>
    > = new Map();

    register(
        provider: ExchangeProvider<ExchangeType['user']>,
        name: ExchangeType['provider']
    ) {
        this.providers.set(name, provider);
    }

    has(name: ExchangeType['provider']): boolean {
        return this.providers.has(name);
    }

    get(
        name: ExchangeType['provider']
    ): ExchangeProvider<ExchangeType['user']> {
        const provider = this.providers.get(name);
        if (!provider) {
            throw new NotFoundException(
                `OAuth provider ${name} is not configured`
            );
        }
        return provider;
    }
}
