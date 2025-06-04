import { ApiResponseProperty } from '@nestjs/swagger';

export class PostResponseDto {
    @ApiResponseProperty()
    id: string;
    @ApiResponseProperty()
    title: string;
    @ApiResponseProperty()
    content: string;
    @ApiResponseProperty()
    status: string;
    @ApiResponseProperty()
    contributors: any[];
    @ApiResponseProperty()
    postTags: any[];
    @ApiResponseProperty()
    createdAt: Date;
    @ApiResponseProperty()
    updatedAt: Date;
}
