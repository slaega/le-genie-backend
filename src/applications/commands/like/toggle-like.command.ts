export class ToggleLikeCommand {
    constructor(
        public readonly postId: string,
        public readonly fingerprint: string,
        public readonly ip?: string,
        public readonly userAgent?: string,
        public readonly userId?: string
    ) {}
}
