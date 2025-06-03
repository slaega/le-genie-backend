export class CancelInvitationCommand {
    constructor(
        public readonly invitationId: string,
        public readonly authId: string
    ) {}
}
