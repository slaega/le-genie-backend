import { PostStatus } from '#shared/enums/post-status.enum'
import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsOptional, IsString } from 'class-validator'
import {
    HasMimeType,
    IsFile,
    MaxFileSize,
    MemoryStoredFile,
} from 'nestjs-form-data'

export class UpdatePostDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    title?: string

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    content?: string

    @ApiProperty({ enum: PostStatus, required: false })
    @IsEnum(PostStatus)
    @IsOptional()
    status?: PostStatus

    @ApiProperty({ type: 'string', format: 'binary', required: false })
    @IsOptional()
    @IsFile()
    @MaxFileSize(5 * 1024 * 1024)
    @HasMimeType(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
    imageFile?: MemoryStoredFile
}
