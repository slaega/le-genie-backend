import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PostRepository } from '#domain/repository/post.repository';
import { POST_REPOSITORY } from '#shared/constantes/inject-token';
import { PostStatus } from '#shared/enums/post-status.enum';

/**
 * SchedulerService — runs every minute and auto-publishes posts whose
 * `scheduledAt` is now in the past and whose status is still DRAFT.
 *
 * This is intentionally a simple pull-based scheduler; no queue needed
 * for the volumes expected by this platform.
 */
@Injectable()
export class SchedulerService {
    private readonly logger = new Logger(SchedulerService.name);

    constructor(
        @Inject(POST_REPOSITORY)
        private readonly postRepository: PostRepository
    ) {}

    @Cron(CronExpression.EVERY_MINUTE)
    async publishScheduledPosts(): Promise<void> {
        const posts = await this.postRepository.getScheduledToPublish();
        if (!posts.length) return;

        this.logger.log(`Publishing ${posts.length} scheduled post(s)…`);

        await Promise.allSettled(
            posts.map(async (post) => {
                try {
                    post.status = PostStatus.PUBLISHED;
                    post.scheduledAt = null; // clear so it won't re-trigger
                    await this.postRepository.updatePost(post.id, post);
                    this.logger.log(`Published post ${post.id} — "${post.title}"`);
                } catch (err) {
                    this.logger.error(
                        `Failed to publish post ${post.id}: ${(err as Error).message}`
                    );
                }
            })
        );
    }
}
