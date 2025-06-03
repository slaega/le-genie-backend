export class CreatePostTagsCommand {
    constructor(
        public readonly postId: string,
        public readonly name: string,
        public readonly authId: string
    ) {}
}
