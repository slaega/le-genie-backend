import { AuthResponseDto } from '#dto/auth/auth-response.dto';
import { Command } from '@nestjs/cqrs';

export class RefreshTokenCommand extends Command<AuthResponseDto> {
    constructor(
        public readonly userId: string,
        public readonly token: string
    ) {
        super();
    }
}
