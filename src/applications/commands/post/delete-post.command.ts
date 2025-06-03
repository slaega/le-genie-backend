export class DeletePostCommand {
    constructor(
        public readonly id: string,
        public readonly userId: string
    ) {}
}
