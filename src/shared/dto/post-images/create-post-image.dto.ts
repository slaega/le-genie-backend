import { ApiProperty } from '@nestjs/swagger';
import {
    HasMimeType,
    IsFile,
    MaxFileSize,
    MemoryStoredFile,
} from 'nestjs-form-data';
export class CreatePostImageDto {
    @ApiProperty({
        type: 'string',
        format: 'binary',
    })
    @IsFile()
    @MaxFileSize(5 * 1024 * 1024)
    @HasMimeType(['image/jpeg', 'image/png'])
    imageFile: MemoryStoredFile;
}
