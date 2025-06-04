import { PostStatus } from '#shared/enums/post-status.enum';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdatePostStatusDto {
    @IsString()
    @IsEnum(PostStatus)
    @IsNotEmpty()
    status: PostStatus;
}
