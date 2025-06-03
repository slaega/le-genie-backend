export class SendInvitationCommand {
    constructor(
        public readonly postId: string,
        public readonly email: string,
        public readonly authId: string
    ) {}
}
