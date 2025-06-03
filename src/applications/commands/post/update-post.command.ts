import { Post } from '#domain/entities/post.entity';
import { Command } from '@nestjs/cqrs';

export class UpdatePostCommand extends Command<Post> {
    constructor(
        public readonly id: string,
        public readonly currentUserId: string,
        public readonly title?: string,
        public readonly content?: string,
        public readonly tags?: string[]
    ) {
        super();
    }
}
