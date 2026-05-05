import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PostRepository } from '#domain/repository/post.repository';
import { POST_REPOSITORY, MAILER_SERVICE } from '#shared/constantes/inject-token';
import { PostStatus } from '#shared/enums/post-status.enum';
import { PrismaService } from '../common/prisma/prisma.service';
import { MailerService } from '../mailer/mailer.service';

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
        private readonly postRepository: PostRepository,
        private readonly prisma: PrismaService,
        @Inject(MAILER_SERVICE)
        private readonly mailerService: MailerService
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

                    // Notify followers of the post author
                    const authorId =
                        post.contributors?.[0]?.userId ??
                        (post as any).authorId;

                    if (authorId) {
                        await this.notifyFollowers(
                            post.id,
                            post.title,
                            authorId
                        ).catch((err: Error) =>
                            this.logger.error(
                                `Failed to notify followers for post ${post.id}: ${err.message}`
                            )
                        );
                    }
                } catch (err) {
                    this.logger.error(
                        `Failed to publish post ${post.id}: ${(err as Error).message}`
                    );
                }
            })
        );
    }

    /**
     * Weekly digest — every Monday at 08:00.
     * Sends the 10 most recent published posts to all subscribers.
     */
    @Cron('0 8 * * 1')
    async sendWeeklyDigest(): Promise<void> {
        this.logger.log('Sending weekly digest…');

        const appUrl =
            process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

        const [posts, subscribers] = await Promise.all([
            this.prisma.post.findMany({
                where: {
                    status: 'PUBLISHED',
                    publishedAt: {
                        gte: new Date(Date.now() - 7 * 24 * 3600 * 1000),
                    },
                },
                include: {
                    contributors: { include: { user: true } },
                },
                take: 10,
            }),
            this.prisma.subscriber.findMany({ select: { email: true } }),
        ]);

        if (!posts.length) {
            this.logger.log('No posts published this week — skipping digest.');
            return;
        }

        if (!subscribers.length) {
            this.logger.log('No subscribers — skipping digest.');
            return;
        }

        const digestPosts = posts.map((post) => {
            const authorName =
                post.contributors?.[0]?.user?.name ??
                post.contributors?.[0]?.user?.email ??
                'Auteur inconnu';
            return {
                title: post.title ?? 'Sans titre',
                url: `${appUrl}/post/${post.id}`,
                authorName,
                readingTime: (post as any).readingTime ?? 0,
            };
        });

        const to = subscribers.map((s) => s.email);

        await this.mailerService
            .sendWeeklyDigest({ posts: digestPosts, to })
            .catch((err: Error) =>
                this.logger.error(
                    `Failed to send weekly digest: ${err.message}`
                )
            );

        this.logger.log(
            `Weekly digest sent to ${to.length} subscriber(s) — ${posts.length} post(s) featured.`
        );
    }

    // ---------------------------------------------------------------------------
    // Private helpers
    // ---------------------------------------------------------------------------

    private async notifyFollowers(
        postId: string,
        postTitle: string,
        authorId: string
    ): Promise<void> {
        const appUrl =
            process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
        const postUrl = `${appUrl}/post/${postId}`;

        const [author, followerRows] = await Promise.all([
            this.prisma.user.findUnique({ where: { id: authorId }, select: { name: true } }),
            this.prisma.follow.findMany({
                where: { authorId },
                include: { follower: { select: { email: true } } },
            }),
        ]);

        if (!followerRows.length) return;

        const authorName = author?.name ?? 'Un auteur';
        const to = followerRows.map((r) => r.follower.email);

        await this.mailerService.sendNewPostNotification({
            authorName,
            postTitle: postTitle ?? 'Nouveau post',
            postUrl,
            to,
        });
    }
}
