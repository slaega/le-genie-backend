import { ToggleLikeCommand } from '#applications/commands/like/toggle-like.command';
import { LikeRepository } from '#domain/repository/like.repository';
import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { LIKE_REPOSITORY } from '#shared/constantes/inject-token';
import { Like } from '#domain/entities/like.entity';

@CommandHandler(ToggleLikeCommand)
export class ToggleLikeHandler
    implements
        ICommandHandler<ToggleLikeCommand, { liked: boolean; count: number }>
{
    constructor(
        @Inject(LIKE_REPOSITORY)
        private readonly likeRepository: LikeRepository
    ) {}

    async execute(command: ToggleLikeCommand) {
        const like = new Like();
        like.postId = command.postId;
        like.fingerprint = command.fingerprint;
        like.ip = command.ip;
        like.userAgent = command.userAgent;
        like.userId = command.userId;

        const liked = await this.likeRepository.toggle(like);
        const count = await this.likeRepository.countByPost(command.postId);
        return { liked, count };
    }
}
