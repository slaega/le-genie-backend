import { SocialProvider } from '#domain/entities/auth-provider.entity';
import { Command } from '@nestjs/cqrs';
import { AuthResponseDto } from '#dto/auth/auth-response.dto';

export class AuthenticateWithProviderCommand extends Command<AuthResponseDto> {
    constructor(
        public readonly provider: SocialProvider,
        public readonly providerUserId: string,
        public readonly email: string,
        public readonly name: string,
        public readonly avatarUrl?: string
    ) {
        super();
    }
}
