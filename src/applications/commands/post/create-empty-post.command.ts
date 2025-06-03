import { Post } from '#domain/entities/post.entity';
import { Command } from '@nestjs/cqrs';

export class CreateEmptyPostCommand extends Command<Post> {
    constructor(public readonly userId: string) {
        super();
    }
}
