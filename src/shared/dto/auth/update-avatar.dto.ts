import {
    HasMimeType,
    IsFile,
    MaxFileSize,
    MemoryStoredFile,
} from 'nestjs-form-data';

export class UpdateAvatarDto {
    @IsFile()
    @MaxFileSize(3 * 1024 * 1024) // 3 MB
    @HasMimeType(['image/jpeg', 'image/png', 'image/webp'])
    avatarFile: MemoryStoredFile;
}
