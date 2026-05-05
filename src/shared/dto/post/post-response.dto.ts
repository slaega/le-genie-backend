import { ApiResponseProperty } from '@nestjs/swagger';
import { PostStatus } from '#shared/enums/post-status.enum';

export class PostResponseDto {
    @ApiResponseProperty()
    id: string;

    @ApiResponseProperty()
    title: string;

    @ApiResponseProperty()
    imagePath: string | null;

    @ApiResponseProperty()
    content: Record<string, unknown>;

    @ApiResponseProperty({ enum: PostStatus })
    status: PostStatus;

    @ApiResponseProperty()
    contributors: unknown[];

    @ApiResponseProperty()
    postTags: unknown[];

    @ApiResponseProperty()
    scheduledAt: Date | null;

    @ApiResponseProperty()
    readingTime: number;

    @ApiResponseProperty()
    commentsCount: number;

    @ApiResponseProperty()
    createdAt: Date;

    @ApiResponseProperty()
    updatedAt: Date;
}
