export class RefreshTokenCommand {
    constructor(
        public readonly userId: string,
        public readonly token: string
    ) {}
}
