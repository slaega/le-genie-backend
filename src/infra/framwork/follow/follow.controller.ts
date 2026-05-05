import {
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Inject,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FollowRepository } from '#domain/repository/follow.repository';
import { FOLLOW_REPOSITORY } from '#shared/constantes/inject-token';
import {
    JwtAuthGuard,
    OptionalJwtAuthGuard,
} from '../auth/guards/auth.guard';
import { Auth } from '../auth/auth.decorator';
import { AuthUser } from '../auth/auth.type';

@ApiTags('follow')
@Controller('users/:authorId')
export class FollowController {
    constructor(
        @Inject(FOLLOW_REPOSITORY)
        private readonly followRepo: FollowRepository
    ) {}

    @UseGuards(JwtAuthGuard)
    @Post('follow')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Follow an author' })
    async follow(
        @Param('authorId') authorId: string,
        @Auth() user: AuthUser
    ): Promise<void> {
        await this.followRepo.follow(user.sub, authorId);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('follow')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Unfollow an author' })
    async unfollow(
        @Param('authorId') authorId: string,
        @Auth() user: AuthUser
    ): Promise<void> {
        await this.followRepo.unfollow(user.sub, authorId);
    }

    @UseGuards(OptionalJwtAuthGuard)
    @Get('follow/status')
    @ApiOperation({ summary: 'Get follow status and follower count for an author' })
    async status(
        @Param('authorId') authorId: string,
        @Auth() user: AuthUser | null
    ): Promise<{ following: boolean; followersCount: number }> {
        const [following, followersCount] = await Promise.all([
            user ? this.followRepo.isFollowing(user.sub, authorId) : Promise.resolve(false),
            this.followRepo.getFollowersCount(authorId),
        ]);
        return { following, followersCount };
    }
}
