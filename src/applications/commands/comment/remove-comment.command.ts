export class RemoveCommentCommand {
    constructor(
        public postId: string,
        public commentId: string,
        public authId: string
    ) {}
}
