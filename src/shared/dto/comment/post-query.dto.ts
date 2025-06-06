import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, IsOptional } from 'class-validator';

export class CommentQueryDto {
    @ApiPropertyOptional({ type: 'string', default: '1' })
    @IsNumberString()
    @IsOptional()
    page?: string;

    @IsNumberString()
    @ApiPropertyOptional({ type: 'string', default: '5' })
    @IsOptional()
    limit?: string;
}
