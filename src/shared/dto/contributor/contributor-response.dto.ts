import { UserResponseDto } from '#dto/auth/user-response.dto';
import { ApiResponseProperty } from '@nestjs/swagger';

export class ContributorResponseDto {
    @ApiResponseProperty()
    id: string;
    @ApiResponseProperty()
    postId: string;
    @ApiResponseProperty()
    userId: string;
    @ApiResponseProperty()
    owner: boolean;
    @ApiResponseProperty({ type: UserResponseDto })
    user: UserResponseDto;
}
