export class TrackViewCommand {
    constructor(
        public readonly postId: string,
        public readonly readerId: string,
        public readonly ip?: string,
        public readonly userAgent?: string,
        public readonly userId?: string
    ) {}
}
