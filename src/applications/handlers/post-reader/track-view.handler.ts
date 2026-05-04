import { TrackViewCommand } from '#applications/commands/post-reader/track-view.command';
import { PostReaderRepository } from '#domain/repository/post-reader.repository';
import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { POST_READER_REPOSITORY } from '#shared/constantes/inject-token';
import { PostReader } from '#domain/entities/post-reader.entity';

@CommandHandler(TrackViewCommand)
export class TrackViewHandler
    implements ICommandHandler<TrackViewCommand, { count: number; isNew: boolean }>
{
    constructor(
        @Inject(POST_READER_REPOSITORY)
        private readonly readerRepository: PostReaderRepository
    ) {}

    async execute(command: TrackViewCommand) {
        const reader = new PostReader();
        reader.postId = command.postId;
        reader.readerId = command.readerId;
        reader.ip = command.ip;
        reader.userAgent = command.userAgent;
        reader.userId = command.userId;

        const isNew = await this.readerRepository.track(reader);
        const count = await this.readerRepository.countByPost(command.postId);
        return { count, isNew };
    }
}
