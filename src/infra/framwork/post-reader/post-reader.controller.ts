import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import type { Request } from 'express';
import { TrackViewCommand } from '#applications/commands/post-reader/track-view.command';
import { GetViewCountQuery } from '#applications/query/post-reader/get-view-count.query';
import { TrackViewDto } from '#dto/post-reader/track-view.dto';
import { PostParamDto } from '#dto/post/post-param.dto';
import { OptionalJwtAuthGuard } from '../auth/guards/auth.guard';
import { Auth } from '../auth/auth.decorator';
import { AuthUser } from '../auth/auth.type';
import { buildFingerprint, extractClientIp } from '#shared/utils/fingerprint';

/**
 * Public Views API.
 * - POST /posts/:postId/views → idempotent track per reader (anonymous OK)
 * - GET  /posts/:postId/views → { count } total distinct readers
 */
@ApiTags('views')
@Controller('posts/:postId/views')
export class PostReaderController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus
    ) {}

    @UseGuards(OptionalJwtAuthGuard)
    @Post()
    @ApiOperation({ summary: 'Track a view (idempotent per reader)' })
    async track(
        @Param() param: PostParamDto,
        @Body() body: TrackViewDto,
        @Req() req: Request,
        @Auth() user?: AuthUser
    ) {
        const ip = extractClientIp(req as never);
        const userAgent = req.headers['user-agent'];
        const readerId = buildFingerprint({
            explicitId: body.readerId,
            ip,
            userAgent,
        });

        return this.commandBus.execute(
            new TrackViewCommand(
                param.postId,
                readerId,
                ip,
                userAgent,
                user?.sub
            )
        );
    }

    @Get()
    @ApiOperation({ summary: 'Get the total view count for a post' })
    async count(@Param() param: PostParamDto) {
        return this.queryBus.execute(new GetViewCountQuery(param.postId));
    }
}
