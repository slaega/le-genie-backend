import { PostResponseDto } from './post-response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class PostPaginationResponseDto {
    @ApiProperty({ type: [PostResponseDto] })
    items: PostResponseDto[];
    @ApiProperty()
    total: number;
    @ApiProperty()
    page: number;
    @ApiProperty()
    limit: number;
}
