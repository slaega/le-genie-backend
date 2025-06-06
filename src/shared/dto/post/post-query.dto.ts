import { Transform } from 'class-transformer';
import { IsBooleanString, IsNumberString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PostQueryDto {
    @ApiPropertyOptional({
        type: 'string',
        default: 'cl7kg4rpz000051vgkwhle9rv',
    })
    @IsNumberString()
    @IsOptional()
    page?: string;

    @ApiPropertyOptional({ type: 'string', default: '10' })
    @IsOptional()
    limit?: string;

    @ApiPropertyOptional({ type: 'string', default: '10' })
    @IsOptional()
    @Transform(({ value }: { value: string }) => value.split(','))
    tags?: string[];

    @ApiPropertyOptional({ type: 'string', default: 'recent' })
    @IsOptional()
    sort?: 'recent' | 'popular';

    @ApiPropertyOptional({ type: 'boolean', default: 'recent' })
    @IsOptional()
    @IsBooleanString()
    me?: string;
}
