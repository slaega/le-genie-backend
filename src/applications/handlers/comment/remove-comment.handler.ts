import { RemoveCommentCommand } from '#applications/commands/comment/remove-comment.command';
import { CommentRepository } from '#domain/repository/comment.repository';
import { ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { COMMENT_REPOSITORY } from '#shared/constantes/inject-token';

export class RemoveCommentHandler
    implements ICommandHandler<RemoveCommentCommand>
{
    constructor(
        @Inject(COMMENT_REPOSITORY)
        private readonly commentRepository: CommentRepository
    ) {}
    async execute(command: RemoveCommentCommand) {
        return this.commentRepository.removeComment(command.commentId);
    }
}
