import { UserResponseDto } from '#dto/auth/user-response.dto';
import { ApiResponseProperty } from '@nestjs/swagger';

export class CommentResponseDto {
    @ApiResponseProperty()
    id: string;
    @ApiResponseProperty()
    content: string;
    @ApiResponseProperty()
    @ApiResponseProperty()
    refactorAt: Date;
    @ApiResponseProperty()
    postId: string;
    @ApiResponseProperty()
    userId: string;
    @ApiResponseProperty()
    createdAt: Date;
    @ApiResponseProperty()
    updatedAt: Date;
    @ApiResponseProperty()
    user: UserResponseDto;
}
