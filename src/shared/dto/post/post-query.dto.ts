import { Transform } from 'class-transformer'
import { IsBooleanString, IsEnum, IsNumberString, IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { PostStatus } from '#shared/enums/post-status.enum'

export class PostQueryDto {
    @ApiPropertyOptional({ type: 'string', default: '1' })
    @IsNumberString()
    @IsOptional()
    page?: string

    @ApiPropertyOptional({ type: 'string', default: '12' })
    @IsOptional()
    limit?: string

    @ApiPropertyOptional({ type: 'string', enum: PostStatus })
    @IsEnum(PostStatus)
    @IsOptional()
    status?: PostStatus

    @ApiPropertyOptional({ type: 'string' })
    @IsOptional()
    @Transform(({ value }: { value: string }) => value.split(','))
    tags?: string[]

    @ApiPropertyOptional({ type: 'string', enum: ['recent', 'popular'] })
    @IsOptional()
    sort?: 'recent' | 'popular'

    @ApiPropertyOptional({ type: 'boolean' })
    @IsOptional()
    @IsBooleanString()
    me?: string
}
