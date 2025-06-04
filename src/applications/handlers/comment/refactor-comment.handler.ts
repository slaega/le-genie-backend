import { RefactorCommentCommand } from '#applications/commands/comment/refactor-comment.command';
import { CommentRepository } from '#domain/repository/comment.repository';
import { ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { COMMENT_REPOSITORY } from '#shared/constantes/inject-token';

export class RefactorCommentHandler
    implements ICommandHandler<RefactorCommentCommand>
{
    constructor(
        @Inject(COMMENT_REPOSITORY)
        private readonly commentRepository: CommentRepository
    ) {}
    async execute(command: RefactorCommentCommand) {
        const comment = await this.commentRepository.getCommentsById(
            command.commentId
        );
        if (!comment) {
            throw new NotFoundException({
                message: 'Comment non  Found',
            });
        }
        comment.content = command.content;
        comment.refactorAt = new Date();
        return this.commentRepository.updateComment(comment.id, comment);
    }
}
