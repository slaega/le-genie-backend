import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type { Request } from 'express';
import { ToggleLikeCommand } from '#applications/commands/like/toggle-like.command';
import { GetLikeStatsQuery } from '#applications/query/like/get-like-stats.query';
import { ToggleLikeDto } from '#dto/like/toggle-like.dto';
import { PostParamDto } from '#dto/post/post-param.dto';
import { OptionalJwtAuthGuard } from '../auth/guards/auth.guard';
import { Auth } from '../auth/auth.decorator';
import { AuthUser } from '../auth/auth.type';
import { buildFingerprint, extractClientIp } from '#shared/utils/fingerprint';

/**
 * Public Like API.
 * - POST  /posts/:postId/likes        → toggle (anonymous OK; userId captured if logged in)
 * - GET   /posts/:postId/likes        → { count, liked } for the calling fingerprint
 */
@ApiTags('likes')
@Controller('posts/:postId/likes')
export class LikeController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus
    ) {}

    @UseGuards(OptionalJwtAuthGuard)
    @Post()
    @ApiOperation({ summary: 'Toggle like (anonymous or authenticated)' })
    async toggle(
        @Param() param: PostParamDto,
        @Body() body: ToggleLikeDto,
        @Req() req: Request,
        @Auth() user?: AuthUser
    ) {
        const ip = extractClientIp(req as never);
        const userAgent = req.headers['user-agent'];
        const fingerprint = buildFingerprint({
            explicitId: body.fingerprint,
            ip,
            userAgent,
        });

        return this.commandBus.execute(
            new ToggleLikeCommand(
                param.postId,
                fingerprint,
                ip,
                userAgent,
                user?.sub
            )
        );
    }

    @Get()
    @ApiOperation({ summary: 'Get like count + isLiked flag for the caller' })
    async stats(
        @Param() param: PostParamDto,
        @Query('fingerprint') fingerprint: string | undefined,
        @Req() req: Request
    ) {
        const ip = extractClientIp(req as never);
        const userAgent = req.headers['user-agent'];
        const fp = buildFingerprint({
            explicitId: fingerprint,
            ip,
            userAgent,
        });

        return this.queryBus.execute(new GetLikeStatsQuery(param.postId, fp));
    }
}
