import { PostStatus } from '#shared/enums/post-status.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import {
    HasMimeType,
    IsFile,
    MaxFileSize,
    MemoryStoredFile,
} from 'nestjs-form-data';
export class UpdatePostDto {
    @ApiProperty()
    @IsString()
    title: string;
    @ApiProperty()
    @IsString()
    content: string;

    @ApiProperty()
    @IsString()
    @IsEnum(PostStatus)
    status: PostStatus;

    @ApiProperty({
        type: 'string',
        format: 'binary',
    })
    @IsOptional()
    @IsFile()
    @MaxFileSize(5 * 1024 * 1024)
    @HasMimeType(['image/jpeg', 'image/png'])
    imageFile?: MemoryStoredFile;
}
