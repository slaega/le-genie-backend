import { Post } from '#domain/entities/post.entity';
import { Command } from '@nestjs/cqrs';
import { PostStatus } from '#shared/enums/post-status.enum';
import { FileI } from '#shared/file.interface';
export class UpdatePostCommand extends Command<Post> {
    public id: string;
    public currentUserId: string;
    public title?: string;
    public content?: string;
    public status?: PostStatus;
    public imageFile?: FileI;
}
