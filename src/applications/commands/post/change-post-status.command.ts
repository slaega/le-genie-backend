import { PostStatus } from '#shared/enums/post-status.enum';

export class ChangePostStatusCommand {
    constructor(
        public readonly postId: string,
        public readonly status: PostStatus
    ) {}
}
