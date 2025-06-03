export class MakeCommentCommand {
    constructor(
        public postId: string,
        public content: string,
        public authId: string
    ) {}
}
