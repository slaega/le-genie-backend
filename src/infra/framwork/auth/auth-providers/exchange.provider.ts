import { UnauthorizedException } from '@nestjs/common';
import { ExchangeType } from './exchange-type';

export interface ExchangeProvider<T> {
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

    get(
        name: ExchangeType['provider']
    ): ExchangeProvider<ExchangeType['user']> {
        const provider = this.providers.get(name);
        if (!provider) {
            throw new UnauthorizedException({
                error: `Provider ${name} not found`,
            });
        }
        return provider;
    }
}
