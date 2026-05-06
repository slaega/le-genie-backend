import { MakeCommentCommand } from '#applications/commands/comment/make-comment.command';
import { CommentRepository } from '#domain/repository/comment.repository';
import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { COMMENT_REPOSITORY, MAILER_SERVICE } from '#shared/constantes/inject-token';
import { Comment } from '#domain/entities/comment.entity';
import { PrismaService } from '#infra/framwork/common/prisma/prisma.service';
import { MailerService } from '#infra/framwork/mailer/mailer.service';

@CommandHandler(MakeCommentCommand)
export class MakeCommentHandler implements ICommandHandler<MakeCommentCommand> {
    private readonly logger = new Logger(MakeCommentHandler.name);

    constructor(
        @Inject(COMMENT_REPOSITORY)
        private readonly commentRepository: CommentRepository,
        private readonly prisma: PrismaService,
        @Inject(MAILER_SERVICE)
        private readonly mailerService: MailerService
    ) {}

    async execute(command: MakeCommentCommand) {
        const comment = new Comment();
        comment.postId = command.postId;
        comment.content = command.content;
        comment.userId = command.authId;

        const created = await this.commentRepository.createComment(comment);

        // Notify the post owner asynchronously (fire-and-forget)
        this.notifyPostOwner(command).catch((err: Error) =>
            this.logger.error(`Failed to notify post owner: ${err.message}`)
        );

        return created;
    }

    private async notifyPostOwner(command: MakeCommentCommand): Promise<void> {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

        // Fetch post + owner + commenter in parallel
        const [post, commenter] = await Promise.all([
            this.prisma.post.findUnique({
                where: { id: command.postId },
                include: {
                    contributors: {
                        where: { owner: true },
                        include: { user: { select: { id: true, name: true, email: true } } },
                        take: 1,
                    },
                },
            }),
            this.prisma.user.findUnique({
                where: { id: command.authId },
                select: { id: true, name: true },
            }),
        ]);

        if (!post || !commenter) return;

        const owner = post.contributors[0]?.user;
        if (!owner) return;

        // Don't notify if the owner is commenting on their own post
        if (owner.id === command.authId) return;

        const postTitle = post.title ?? 'Sans titre';
        const postUrl = `${appUrl}/post/${command.postId}`;

        // ── In-app notification ───────────────────────────────────────────────
        await this.prisma.notification
            .create({
                data: {
                    userId: owner.id,
                    type: 'NEW_COMMENT',
                    title: `${commenter.name} a commenté votre article`,
                    body: postTitle,
                    postId: command.postId,
                },
            })
            .catch((err: Error) =>
                this.logger.error(`Failed to create in-app notification: ${err.message}`)
            );

        // ── Email notification ────────────────────────────────────────────────
        await this.mailerService.sendCommentNotification({
            postOwnerEmail: owner.email,
            postOwnerName: owner.name,
            commenterName: commenter.name,
            postTitle,
            postUrl,
        });
    }
}
