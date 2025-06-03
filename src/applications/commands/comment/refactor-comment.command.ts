export class RefactorCommentCommand {
    constructor(
        public postId: string,
        public commentId: string,
        public content: string,
        public authId: string
    ) {}
}
