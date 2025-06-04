import { PostStatus } from '#shared/enums/post-status.enum';
import { Command } from '@nestjs/cqrs';
import { Post } from '#domain/entities/post.entity';

export class ChangePostStatusCommand extends Command<Post> {
    constructor(
        public readonly postId: string,
        public readonly status: PostStatus,
        public readonly authId: string,
    ) {
        super();
    }
}
