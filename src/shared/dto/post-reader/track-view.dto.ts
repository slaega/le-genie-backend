import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Optional client-supplied reader id (e.g. a UUID stored in localStorage/cookie).
 * If absent, the API falls back to hash(IP + UserAgent).
 */
export class TrackViewDto {
    @ApiPropertyOptional({ description: 'Optional client-supplied reader id' })
    @IsOptional()
    @IsString()
    @MaxLength(128)
    readerId?: string;
}
