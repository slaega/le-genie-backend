import { RemoveCommentCommand } from '#applications/commands/comment/remove-comment.command';
import { CommentRepository } from '#domain/repository/comment.repository';
import { ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { COMMENT_REPOSITORY } from '#shared/constantes/inject-token';
import { CommandHandler } from '@nestjs/cqrs';
@CommandHandler(RemoveCommentCommand)
export class RemoveCommentHandler
    implements ICommandHandler<RemoveCommentCommand>
{
    constructor(
        @Inject(COMMENT_REPOSITORY)
        private readonly commentRepository: CommentRepository
    ) {}
    async execute(command: RemoveCommentCommand) {
        const comment = await this.commentRepository.getCommentsById(
            command.commentId
        );
        if (!comment) {
            throw new NotFoundException({
                message: 'Comment non  Found',
            });
        }
        return this.commentRepository.removeComment(command.commentId);
    }
}
