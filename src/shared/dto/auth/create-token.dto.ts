import { SocialProvider } from '#domain/entities/auth-provider.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUrl } from 'class-validator';

export class CreateTokenDto {
    @ApiProperty()
    @IsNotEmpty()
    code: string;

    @ApiProperty()
    @IsNotEmpty()
    provider: SocialProvider;

    @ApiProperty()
    @IsNotEmpty()
    @IsUrl()
    callbackURL: string;
}
