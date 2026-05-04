import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Optional client-supplied fingerprint (e.g. a UUID stored in localStorage/cookie).
 * If absent, the API falls back to hash(IP + UserAgent).
 */
export class ToggleLikeDto {
    @ApiPropertyOptional({ description: 'Optional client-supplied fingerprint' })
    @IsOptional()
    @IsString()
    @MaxLength(128)
    fingerprint?: string;
}
