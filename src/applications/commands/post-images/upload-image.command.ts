export class UploadImageCommand {
    constructor(
        public readonly postId: string,
        public readonly image: File
    ) {}
}
