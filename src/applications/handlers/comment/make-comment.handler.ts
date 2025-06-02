import { MakeCommentCommand } from "#applications/commands/comment/make-comment.command";
import { CommentRepository } from "#domain/repository/comment.repository";
import { ICommandHandler, CommandHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { COMMENT_REPOSITORY } from "#shared/constantes/inject-token";
import { Comment } from "#domain/entities/comment.entity";

@CommandHandler(MakeCommentCommand)
export class MakeCommentHandler implements ICommandHandler<MakeCommentCommand> {
    constructor(@Inject(COMMENT_REPOSITORY) private readonly commentRepository: CommentRepository) {}
    async execute(command: MakeCommentCommand) {
        const comment = new Comment();
        comment.postId = command.postId;
        comment.content = command.content;
        comment.userId = command.authId;
        return this.commentRepository.createComment(comment);
    }
}